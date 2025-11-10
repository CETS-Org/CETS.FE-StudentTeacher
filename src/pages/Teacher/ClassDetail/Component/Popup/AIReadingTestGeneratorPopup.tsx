import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { getTeacherId } from "@/lib/utils";
import {
  Sparkles,
  Download,
  FileText,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { generateReadingTest } from "@/api/aiReadingTest.api";
import {
  parseReadingTestContent,
  createReadingTestDocument,
  createSeparateDocuments,
} from "@/utils/readingTestParser";
import type { ParsedReadingTest } from "@/utils/readingTestParser";
import {
  formatReadingTestWithGemini,
  convertToQuizQuestions,
} from "@/utils/geminiFormatter";
import type { FormattedReadingTest } from "@/utils/geminiFormatter";
import { createQuizAssignment, uploadJsonToPresignedUrl } from "@/api";
import { api, endpoint } from "@/api/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classMeetingId?: string;
  onSubmit?: () => void;
};

type Step = "input" | "preview" | "options";

export default function AIReadingTestGeneratorPopup({
  open,
  onOpenChange,
  classMeetingId,
  onSubmit,
}: Props) {
  const { toasts, hideToast, success, error: showError } = useToast();

  const [topic, setTopic] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [parsedTest, setParsedTest] = useState<ParsedReadingTest | null>(null);
  const [formattedTest, setFormattedTest] = useState<FormattedReadingTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Assignment details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadSkills();
    } else {
      resetForm();
    }
  }, [open]);

  const loadSkills = async () => {
    try {
      const response = await api.get(`${endpoint.coreLookup}/type/code/CourseSkill`);
      const skillsData = response.data || [];
      setSkills(skillsData);
      
      // Auto-select Reading skill
      const readingSkill = skillsData.find((s: any) => s.name === "Reading");
      if (readingSkill) {
        setSelectedSkillId(readingSkill.lookUpId);
      }
    } catch (err) {
      console.error("Error loading skills:", err);
    }
  };

  const resetForm = () => {
    setTopic("");
    setCurrentStep("input");
    setLoading(false);
    setGeneratedContent(null);
    setParsedTest(null);
    setFormattedTest(null);
    setError(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    // Keep selectedSkillId as it's auto-selected
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Generate reading test from AI
      const response = await generateReadingTest(topic);

      if (!response.success) {
        throw new Error("Failed to generate reading test");
      }

      setGeneratedContent(response.generated_content);

      // Step 2: Format with Gemini (with fallback to manual parsing)
      const formatted = await formatReadingTestWithGemini(
        response.generated_content,
        topic
      );
      setFormattedTest(formatted);

      // Also parse for Word document export
      const parsed = parseReadingTestContent(response.generated_content);
      setParsedTest(parsed);

      // Auto-fill assignment title
      setTitle(`Reading Test: ${topic}`);
      setDescription(`AI-generated reading comprehension test on the topic: ${topic}`);

      setCurrentStep("preview");
      success("Reading test generated and formatted successfully!");
    } catch (err: any) {
      console.error("Error generating reading test:", err);
      showError(err?.message || "Failed to generate reading test");
      setError(err?.message || "Failed to generate reading test");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCombined = async () => {
    if (!parsedTest) return;

    try {
      setLoading(true);
      const blob = await createReadingTestDocument(topic, parsedTest);

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reading-test-${topic.replace(/\s+/g, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success("Document downloaded successfully!");
    } catch (err: any) {
      console.error("Error creating document:", err);
      showError("Failed to create document");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSeparate = async () => {
    if (!parsedTest) return;

    try {
      setLoading(true);
      const { passageBlob, questionsBlob } = await createSeparateDocuments(topic, parsedTest);

      // Download passage
      let url = URL.createObjectURL(passageBlob);
      let a = document.createElement("a");
      a.href = url;
      a.download = `reading-passage-${topic.replace(/\s+/g, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Download questions
      url = URL.createObjectURL(questionsBlob);
      a = document.createElement("a");
      a.href = url;
      a.download = `reading-questions-${topic.replace(/\s+/g, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success("Documents downloaded successfully!");
    } catch (err: any) {
      console.error("Error creating documents:", err);
      showError("Failed to create documents");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!formattedTest || !classMeetingId) {
      showError("Missing required data");
      return;
    }

    if (!title.trim()) {
      setError("Please enter assignment title");
      return;
    }

    if (!dueDate) {
      setError("Please select due date");
      return;
    }

    // Validate due date is in the future
    const selectedDate = new Date(dueDate);
    const now = new Date();
    if (selectedDate <= now) {
      setError("Due date must be in the future");
      return;
    }

    const teacherId = getTeacherId();
    if (!teacherId) {
      showError("Teacher ID not found");
      return;
    }

    if (!selectedSkillId) {
      showError("Reading skill not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert formatted questions to quiz format
      const quizQuestions = convertToQuizQuestions(formattedTest.questions);

      // Calculate total points
      const totalPoints = formattedTest.questions.reduce((sum, q) => sum + q.points, 0);

      // Use passage even if empty (fallback to default message)
      const readingPassage = formattedTest.passage || 
        "Reading passage will be available soon. Please contact your teacher if you see this message.";

      // Create question data with reading passage
      const questionData = {
        version: "1.0",
        readingPassage: readingPassage,
        questions: quizQuestions,
        settings: {
          shuffleQuestions: false,
          allowBackNavigation: true,
          showProgress: true,
          showQuestionNumbers: true,
        },
      };

      // Debug log to verify data
      console.log("=== AI Reading Test Assignment Data ===");
      console.log("Reading Passage Length:", readingPassage.length);
      console.log("Questions Count:", quizQuestions.length);
      console.log("Total Points:", totalPoints);
      console.log("Question Data:", questionData);
      console.log("=======================================");

      // Serialize question data to JSON string
      const questionJson = JSON.stringify(questionData);

      // Create quiz assignment
      const quizAssignmentData = {
        classMeetingId: classMeetingId,
        teacherId,
        title,
        description: description || undefined,
        dueDate: new Date(dueDate).toISOString(),
        questionJson,
        skillID: selectedSkillId,
      };

      const response = await createQuizAssignment(quizAssignmentData);
      const responseData = response.data;

      if (
        responseData &&
        typeof responseData === "object" &&
        "uploadUrl" in responseData &&
        "questionJson" in responseData
      ) {
        const typedResponse = responseData as unknown as {
          id: string;
          uploadUrl: string;
          questionJson: string;
        };

        // Upload JSON to presigned URL
        const jsonUploadResponse = await uploadJsonToPresignedUrl(
          typedResponse.uploadUrl,
          typedResponse.questionJson
        );

        if (!jsonUploadResponse.ok) {
          throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
        }

        success("Reading Quiz assignment created successfully!");
        onOpenChange(false);
        if (onSubmit) {
          onSubmit();
        }
      }
    } catch (err: any) {
      console.error("Error creating assignment:", err);
      showError(err?.message || "Failed to create assignment");
      setError(err?.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          size="xl"
          className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-600" />
              AI Reading Test Generator
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Input Topic */}
            {currentStep === "input" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Enter a topic for the reading test
                  </h3>
                  <Input
                    label="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., technology, environment, education..."
                    disabled={loading}
                    className="w-full"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    The AI will generate a reading passage and comprehension questions
                    based on this topic.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    <li>Enter a topic you want to create a reading test about</li>
                    <li>AI will generate a reading passage and questions</li>
                    <li>Preview and edit the generated content</li>
                    <li>Download as Word document or create assignment directly</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Preview Generated Content */}
            {currentStep === "preview" && formattedTest && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Preview Generated Test</h3>
                  <p className="text-sm text-gray-600">
                    This will be created as a <span className="font-semibold text-primary-600">Reading Quiz</span> assignment. 
                    Answers are hidden from students and will be used for auto-grading.
                  </p>
                </div>

                {/* Reading Passage */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Reading Passage
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {formattedTest.passage}
                  </div>
                </div>

                {/* Questions (without answers in preview) */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Questions ({formattedTest.questions.length}) - {formattedTest.questions.reduce((sum, q) => sum + q.points, 0)} points total
                  </h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {formattedTest.questions.map((q, idx) => (
                      <div key={idx} className="text-sm border-b pb-3 last:border-0">
                        <p className="font-medium text-gray-900 mb-1">
                          {idx + 1}. {q.question} <span className="text-xs text-gray-500">({q.points} pts)</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-2">Type: {q.type.replace(/_/g, ' ')}</p>
                        {q.options && q.options.length > 0 && (
                          <ul className="ml-4 space-y-1 text-gray-600">
                            {q.options.map((opt, optIdx) => (
                              <li key={optIdx}>{String.fromCharCode(65 + optIdx)}. {opt}</li>
                            ))}
                          </ul>
                        )}
                        <p className="mt-2 text-xs text-green-600 italic">
                          ✓ Correct answer is stored (hidden from students)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-900">What would you like to do?</h4>
                  
                  {/* Download Options */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">
                      📄 Download Word documents (includes answers for teacher reference)
                    </p>
                    <Button
                      variant="secondary"
                      onClick={handleDownloadCombined}
                      disabled={loading}
                      iconLeft={<Download className="w-4 h-4" />}
                      className="w-full justify-start"
                    >
                      Download as Single Document (Passage + Questions)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDownloadSeparate}
                      disabled={loading}
                      iconLeft={<Download className="w-4 h-4" />}
                      className="w-full justify-start"
                    >
                      Download as Separate Documents (2 files)
                    </Button>
                  </div>

                  {/* Create Assignment */}
                  {classMeetingId && (
                    <div className="border-t pt-4 mt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs text-blue-800">
                          🎯 <span className="font-semibold">Creating Reading Quiz Assignment:</span> This will create a quiz with the reading passage and questions. 
                          Answers are automatically saved for grading but hidden from students.
                        </p>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Create Quiz Assignment:
                      </h4>
                      <div className="space-y-3">
                        <Input
                          label="Assignment Title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter assignment title"
                          disabled={loading}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter assignment description"
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={2}
                          />
                        </div>
                        <Input
                          label="Due Date"
                          type="datetime-local"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={getMinDateTime()}
                          disabled={loading}
                        />
                        <Button
                          onClick={handleCreateAssignment}
                          disabled={loading}
                          iconLeft={
                            loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )
                          }
                          className="w-full"
                        >
                          {loading ? "Creating Assignment..." : "Create Assignment"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="flex justify-between">
            {currentStep === "preview" && (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep("input")}
                disabled={loading}
              >
                Back to Input
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {currentStep === "input" && (
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  iconLeft={
                    loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )
                  }
                >
                  {loading ? "Generating..." : "Generate Test"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      {toasts.length > 0 &&
        createPortal(
          <>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => hideToast(toast.id)}
                duration={3000}
              />
            ))}
          </>,
          document.body
        )}
    </>
  );
}

