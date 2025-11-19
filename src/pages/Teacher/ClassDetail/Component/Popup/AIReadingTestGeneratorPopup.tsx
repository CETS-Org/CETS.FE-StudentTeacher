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

  // Editable states for passage and questions
  const [editablePassage, setEditablePassage] = useState<string>("");
  const [editableQuestions, setEditableQuestions] = useState<any[]>([]);

  // Assignment details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  
  // Scoring & Timing settings
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(undefined);
  const [maxAttempts, setMaxAttempts] = useState(1);
  
  // Grading settings
  const [isAutoGradable, setIsAutoGradable] = useState(true);
  
  // Answer visibility settings
  const [answerVisibility, setAnswerVisibility] = useState<"immediately" | "after_due_date" | "never">("after_due_date");
  
  // Question display settings
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);

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
    setEditablePassage("");
    setEditableQuestions([]);
    setTitle("");
    setDescription("");
    setDueDate("");
    setTimeLimitMinutes(undefined);
    setMaxAttempts(1);
    setIsAutoGradable(true);
    setAnswerVisibility("after_due_date");
    setAllowBackNavigation(true);
    setShowProgress(true);
    setShowQuestionNumbers(true);
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
      
      // Set editable states
      setEditablePassage(formatted.passage || "");
      const quizQuestions = convertToQuizQuestions(formatted.questions, isAutoGradable);
      setEditableQuestions(quizQuestions);

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

      // Use editable questions and passage
      const quizQuestions = editableQuestions;

      // Calculate total points from editable questions
      const totalPoints = editableQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

      // Use editable passage
      const readingPassage = editablePassage || 
        "Reading passage will be available soon. Please contact your teacher if you see this message.";

      // Create question data with reading passage (matching AdvancedAssignment format)
      const questionData = {
        version: "1.0",
        readingPassage: readingPassage,
        questions: quizQuestions,
        settings: {
          // Timing
          ...(timeLimitMinutes !== undefined && { timeLimitMinutes }),
          
          // Grading
          isAutoGradable: isAutoGradable,
          totalPoints: totalPoints,
          
          // Answer visibility
          showAnswersAfterSubmission: answerVisibility === "immediately",
          showAnswersAfterDueDate: answerVisibility === "after_due_date",
          
          // Display settings
          allowBackNavigation: allowBackNavigation,
          showProgress: showProgress,
          showQuestionNumbers: showQuestionNumbers,
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
        dueAt: new Date(dueDate).toISOString(),
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

                {/* Reading Passage - Editable */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Reading Passage (Editable)
                  </h4>
                  <textarea
                    value={editablePassage}
                    onChange={(e) => setEditablePassage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    rows={10}
                    placeholder="Enter reading passage..."
                  />
                </div>

                {/* Questions - Editable */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Questions ({editableQuestions.length}) - {editableQuestions.reduce((sum, q) => sum + (q.points || 0), 0)} points total (Editable)
                  </h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editableQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="bg-white border rounded-lg p-4">
                        {/* Question Text */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Question {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...editableQuestions];
                              updated[idx] = { ...updated[idx], question: e.target.value };
                              setEditableQuestions(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        {/* Points */}
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => {
                              const updated = [...editableQuestions];
                              updated[idx] = { ...updated[idx], points: parseInt(e.target.value) || 1 };
                              setEditableQuestions(updated);
                            }}
                            min="1"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        {/* Type Display */}
                        <p className="text-xs text-gray-500 mb-2">Type: {q.type?.replace(/_/g, ' ')}</p>

                        {/* Options for Multiple Choice / True False */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Options:</label>
                            {q.options.map((opt: any, optIdx: number) => (
                              <div key={opt.id || optIdx} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600 w-6">{opt.label}.</span>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => {
                                    const updated = [...editableQuestions];
                                    const newOptions = [...updated[idx].options];
                                    newOptions[optIdx] = { ...newOptions[optIdx], text: e.target.value };
                                    updated[idx] = { ...updated[idx], options: newOptions };
                                    setEditableQuestions(updated);
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <input
                                  type="radio"
                                  name={`correct-${idx}`}
                                  checked={q.correctAnswer === opt.id}
                                  onChange={() => {
                                    const updated = [...editableQuestions];
                                    updated[idx] = { ...updated[idx], correctAnswer: opt.id };
                                    setEditableQuestions(updated);
                                  }}
                                  className="h-4 w-4 text-primary-600"
                                  title="Mark as correct"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fill in the Blank */}
                        {q.type === 'fill_in_the_blank' && q.blanks && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Correct Answers:</label>
                            {q.blanks.map((blank: any, blankIdx: number) => (
                              <div key={blank.id || blankIdx}>
                                <input
                                  type="text"
                                  value={blank.correctAnswers?.[0] || ''}
                                  onChange={(e) => {
                                    const updated = [...editableQuestions];
                                    const newBlanks = [...updated[idx].blanks];
                                    newBlanks[blankIdx] = {
                                      ...newBlanks[blankIdx],
                                      correctAnswers: [e.target.value]
                                    };
                                    updated[idx] = { ...updated[idx], blanks: newBlanks };
                                    setEditableQuestions(updated);
                                  }}
                                  placeholder="Correct answer"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short Answer */}
                        {q.type === 'short_answer' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expected Answer:</label>
                            <textarea
                              value={q.correctAnswer || ''}
                              onChange={(e) => {
                                const updated = [...editableQuestions];
                                updated[idx] = { ...updated[idx], correctAnswer: e.target.value };
                                setEditableQuestions(updated);
                              }}
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            const updated = editableQuestions.filter((_, i) => i !== idx);
                            setEditableQuestions(updated);
                          }}
                          className="mt-3 text-xs text-red-600 hover:text-red-800"
                        >
                          🗑️ Delete Question
                        </button>
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
                        
                        {/* Scoring & Timing */}
                        <div className="border-t pt-3 mt-3">
                          <h5 className="font-medium text-gray-900 mb-2">⏱️ Scoring & Timing</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Limit (minutes)
                              </label>
                              <input
                                type="number"
                                value={timeLimitMinutes || ""}
                                onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="No time limit"
                                min="1"
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Leave empty for no time limit. Students will auto-submit when time expires.
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Attempts
                              </label>
                              <input
                                type="number"
                                value={maxAttempts}
                                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                                min="1"
                                max="10"
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Number of times students can attempt this assignment.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Grading Settings */}
                        <div className="border-t pt-3 mt-3">
                          <h5 className="font-medium text-gray-900 mb-2">📝 Grading Settings</h5>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="autoGradable"
                              checked={isAutoGradable}
                              onChange={(e) => setIsAutoGradable(e.target.checked)}
                              disabled={loading}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="autoGradable" className="ml-2 text-sm text-gray-700">
                              Enable automatic grading
                            </label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">
                            Multiple choice and fill-in-the-blank questions will be graded automatically.
                          </p>
                        </div>

                        {/* Answer Visibility */}
                        <div className="border-t pt-3 mt-3">
                          <h5 className="font-medium text-gray-900 mb-2">👁️ Answer Visibility</h5>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="answerVisibility"
                                value="immediately"
                                checked={answerVisibility === "immediately"}
                                onChange={(e) => setAnswerVisibility(e.target.value as any)}
                                disabled={loading}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Show answers immediately after submission
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="answerVisibility"
                                value="after_due_date"
                                checked={answerVisibility === "after_due_date"}
                                onChange={(e) => setAnswerVisibility(e.target.value as any)}
                                disabled={loading}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Show answers after due date
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="answerVisibility"
                                value="never"
                                checked={answerVisibility === "never"}
                                onChange={(e) => setAnswerVisibility(e.target.value as any)}
                                disabled={loading}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Never show answers
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Display Settings */}
                        <div className="border-t pt-3 mt-3">
                          <h5 className="font-medium text-gray-900 mb-2">🎨 Display Settings</h5>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={allowBackNavigation}
                                onChange={(e) => setAllowBackNavigation(e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Allow back navigation between questions
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={showProgress}
                                onChange={(e) => setShowProgress(e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Show progress indicator
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={showQuestionNumbers}
                                onChange={(e) => setShowQuestionNumbers(e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Show question numbers
                              </span>
                            </label>
                          </div>
                        </div>

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

