import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
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
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-sm flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Input Topic */}
            {currentStep === "input" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-secondary-100 to-blue-50 border-2 border-secondary-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Generate Reading Test
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Let AI create a reading passage and questions for you
                      </p>
                    </div>
                  </div>
                  
                  <Input
                    label="Topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., technology, environment, education, history..."
                    disabled={loading}
                    className="w-full bg-white"
                  />
                  <p className="mt-3 text-sm text-gray-600">
                    Enter a topic and our AI will generate a comprehensive reading passage with comprehension questions.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    How it works
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">1.</span>
                      <p className="text-sm text-gray-700">Enter a topic for your reading test</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">2.</span>
                      <p className="text-sm text-gray-700">AI generates passage and questions</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">3.</span>
                      <p className="text-sm text-gray-700">Preview and edit the content</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">4.</span>
                      <p className="text-sm text-gray-700">Download or create assignment</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preview Generated Content */}
            {currentStep === "preview" && formattedTest && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Generated Test</h3>
                  <p className="text-sm text-gray-700">
                    This will be created as a <span className="font-semibold text-green-700">Reading Quiz</span> assignment. 
                    Answers are hidden from students and will be used for auto-grading.
                  </p>
                </div>

                {/* Reading Passage - Editable */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Reading Passage (Editable)
                  </h4>
                  <textarea
                    value={editablePassage}
                    onChange={(e) => setEditablePassage(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm resize-none"
                    rows={18}
                    placeholder="Enter reading passage..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {editablePassage.length} characters
                  </p>
                </div>

                {/* Questions - Editable */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{editableQuestions.length}</span>
                      </div>
                      Questions ({editableQuestions.length}) - {editableQuestions.reduce((sum, q) => sum + (q.points || 0), 0).toFixed(2)} points total
                    </h4>
                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      Editable
                    </span>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {editableQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="bg-white border-2 border-purple-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                              {q.type?.replace(/_/g, ' ').toUpperCase() || 'MULTIPLE CHOICE'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-600">Points:</label>
                            <input
                              type="number"
                              value={q.points}
                              onChange={(e) => {
                                const updated = [...editableQuestions];
                                updated[idx] = { ...updated[idx], points: parseInt(e.target.value) || 1 };
                                setEditableQuestions(updated);
                              }}
                              min="1"
                              className="w-16 px-2 py-1 border-2 border-purple-200 rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Question Text
                          </label>
                          <textarea
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...editableQuestions];
                              updated[idx] = { ...updated[idx], question: e.target.value };
                              setEditableQuestions(updated);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </div>

                        {/* Options for Multiple Choice / True False */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-900">Answer Options:</label>
                            {q.options.map((opt: any, optIdx: number) => (
                              <div key={opt.id || optIdx} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                q.correctAnswer === opt.id 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-gray-50 border-gray-200 hover:border-purple-200'
                              }`}>
                                <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg ${
                                  q.correctAnswer === opt.id 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-300 text-gray-700'
                                }`}>
                                  {opt.label}
                                </span>
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
                                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editableQuestions];
                                    updated[idx] = { ...updated[idx], correctAnswer: opt.id };
                                    setEditableQuestions(updated);
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    q.correctAnswer === opt.id
                                      ? 'bg-green-500 border-green-600'
                                      : 'bg-white border-gray-300 hover:border-green-400'
                                  }`}
                                  title="Mark as correct answer"
                                >
                                  {q.correctAnswer === opt.id && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fill in the Blank */}
                        {q.type === 'fill_in_the_blank' && (
                          <div className="mt-3">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Correct Answer:</label>
                            <input
                              type="text"
                              value={q.correctAnswer || ''}
                              onChange={(e) => {
                                const updated = [...editableQuestions];
                                updated[idx] = { ...updated[idx], correctAnswer: e.target.value };
                                setEditableQuestions(updated);
                              }}
                              placeholder="Enter the correct answer"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            />
                          </div>
                        )}

                        {/* Short Answer */}
                        {q.type === 'short_answer' && (
                          <div className="mt-3">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Expected Answer:</label>
                            <textarea
                              value={q.correctAnswer || ''}
                              onChange={(e) => {
                                const updated = [...editableQuestions];
                                updated[idx] = { ...updated[idx], correctAnswer: e.target.value };
                                setEditableQuestions(updated);
                              }}
                              rows={3}
                              placeholder="Enter expected answer or keywords"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                            />
                          </div>
                        )}

                        {/* Delete Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              const updated = editableQuestions.filter((_, i) => i !== idx);
                              setEditableQuestions(updated);
                            }}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Delete Question
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options Section */}
                <div className="space-y-6 border-t-2 border-gray-200 pt-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Download className="w-5 h-5 text-amber-600" />
                      Download Options
                    </h4>
                    <p className="text-sm text-gray-700 mb-4">
                      Download Word documents with answers included for teacher reference
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        onClick={handleDownloadCombined}
                        disabled={loading}
                        iconLeft={<Download className="w-4 h-4" />}
                        className="w-full justify-center bg-white hover:bg-amber-50 border-2 border-amber-200 !text-black"
                      >
                        Single Document
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleDownloadSeparate}
                        disabled={loading}
                        iconLeft={<Download className="w-4 h-4" />}
                        className="w-full justify-center bg-white hover:bg-amber-50 border-2 border-amber-200 !text-black"
                      >
                        Separate Files
                      </Button>
                    </div>
                  </div>

                  {/* Create Assignment */}
                  {classMeetingId && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
                      <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-green-900 mb-1">
                              Creating Reading Quiz Assignment
                            </p>
                            <p className="text-xs text-green-700">
                              This will create a quiz with the reading passage and questions. Answers are automatically saved for grading but hidden from students.
                            </p>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">
                        Assignment Details
                      </h4>
                      <div className="space-y-3">
                        <Input
                          label="Assignment Title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter assignment title"
                          disabled={loading}
                          className="bg-white"
                        />
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Description <span className="text-gray-500 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter assignment description"
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white resize-none"
                            rows={3}
                          />
                        </div>
                        <Input
                          label="Due Date"
                          type="datetime-local"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={getMinDateTime()}
                          disabled={loading}
                          className="bg-white"
                        />
                        
                        {/* Scoring & Timing */}
                        <div className="border-t-2 border-gray-200 pt-4 mt-4">
                          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            Scoring & Timing
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Time Limit (minutes)
                              </label>
                              <input
                                type="number"
                                value={timeLimitMinutes || ""}
                                onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="No time limit"
                                min="1"
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                              />
                              <p className="mt-2 text-xs text-gray-600">
                                Leave empty for no time limit. Students will auto-submit when time expires.
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Maximum Attempts
                              </label>
                              <input
                                type="number"
                                value={maxAttempts}
                                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                                min="1"
                                max="10"
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                              />
                              <p className="mt-2 text-xs text-gray-600">
                                Number of times students can attempt this assignment.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Answer Visibility */}
                        <div className="border-t-2 border-gray-200 pt-4 mt-4">
                          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            Answer Visibility
                          </h5>
                          <div className="space-y-3">
                            <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              answerVisibility === "immediately" 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-green-200'
                            }`}>
                              <input
                                type="radio"
                                name="answerVisibility"
                                value="immediately"
                                checked={answerVisibility === "immediately"}
                                onChange={(e) => setAnswerVisibility(e.target.value as any)}
                                disabled={loading}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                Show answers immediately after submission
                              </span>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              answerVisibility === "after_due_date" 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-green-200'
                            }`}>
                              <input
                                type="radio"
                                name="answerVisibility"
                                value="after_due_date"
                                checked={answerVisibility === "after_due_date"}
                                onChange={(e) => setAnswerVisibility(e.target.value as any)}
                                disabled={loading}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                Show answers after due date
                              </span>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              answerVisibility === "never" 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200 hover:border-green-200'
                            }`}>
                              <input
                                type="radio"
                                name="answerVisibility"
                                value="never"
                                checked={answerVisibility === "never"}
                                onChange={(e) => setAnswerVisibility(e.target.value as any)}
                                disabled={loading}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                Never show answers
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
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
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
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
          duration={3000}
        />
      ))}
    </>
  );
}

