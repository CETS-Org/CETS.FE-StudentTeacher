import { useState, useEffect, useMemo, Fragment } from "react";
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
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { getTeacherId } from "@/lib/utils";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Plus, 
  Trash2, 
  GripVertical,
  FileText,
  Upload,
  Eye,
  Settings,
  CheckCircle,
  Headphones,
  BookOpen,
  PenTool,
  MessageSquare,
  FileSpreadsheet,
  Save
} from "lucide-react";
import BasicInformationStep from "./steps/BasicInformationStep";
import QuestionsStep from "./steps/QuestionsStep";
import SettingsStep from "./steps/SettingsStep";
import PreviewStep from "./steps/PreviewStep";
import { api, endpoint } from "@/api/api";

// Types
export type QuestionType = 
  | "multiple_choice" 
  | "true_false" 
  | "fill_in_the_blank" 
  | "short_answer" 
  | "matching"
  | "essay";

export type SkillType = "Listening" | "Reading" | "Writing" | "Speaking" | "Grammar" | "Vocabulary" | "Other";

export interface Question {
  id: string;
  type: QuestionType;
  order: number;
  question: string;
  points: number;
  options?: QuestionOption[];
  correctAnswer?: any;
  explanation?: string;
  audioTimestamp?: string;
  reference?: string;
  shuffleOptions?: boolean;
  blanks?: FillInTheBlank[];
  matching?: MatchingData;
  maxLength?: number;
  keywords?: string[];
  requiresManualGrading?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface FillInTheBlank {
  id: string;
  position: number;
  correctAnswers: string[];
  caseSensitive: boolean;
}

export interface MatchingData {
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  correctMatches: MatchingPair[];
  shuffleRightColumn: boolean;
}

export interface MatchingItem {
  id: string;
  text: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface AssignmentQuestionData {
  version: string;
  questions: Question[];
  settings?: {
    shuffleQuestions: boolean;
    allowBackNavigation: boolean;
    showProgress: boolean;
    showQuestionNumbers: boolean;
  };
  media?: {
    audioUrl?: string;
    videoUrl?: string;
    images?: Array<{ url: string; questionId: string }>;
  };
  readingPassage?: string;
}

export interface Skill {
  lookUpId: string;
  code: string;
  name: string;
  isActive: boolean;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (assignmentData: {
    title: string;
    description: string;
    dueDate: string;
    skillID: string | null;
    assignmentType: string;
    totalPoints: number;
    timeLimitMinutes?: number;
    maxAttempts: number;
    isAutoGradable: boolean;
    showAnswersAfterSubmission: boolean;
    showAnswersAfterDueDate: boolean;
    questionData: AssignmentQuestionData | null;
    files: File[];
  }) => void;
  classMeetingId?: string;
};

type Step = "basic" | "questions" | "settings" | "preview";

export default function AdvancedAssignmentPopup({
  open,
  onOpenChange,
  onSubmit,
  classMeetingId,
}: Props) {
  const { toasts, hideToast, success, error: showError } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const steps: Step[] = ["basic", "questions", "settings", "preview"];
  
  // Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] = useState("Homework");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  // Settings
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(undefined);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [isAutoGradable, setIsAutoGradable] = useState(true);
  const [showAnswersAfterSubmission, setShowAnswersAfterSubmission] = useState(false);
  const [showAnswersAfterDueDate, setShowAnswersAfterDueDate] = useState(true);
  
  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load skills on mount
  useEffect(() => {
    if (open) {
      loadSkills();
      resetForm();
    }
  }, [open]);

  // Calculate total points from questions
  useEffect(() => {
    const total = questions.reduce((sum, q) => sum + q.points, 0);
    setTotalPoints(total);
  }, [questions]);

  const loadSkills = async () => {
    try {
      setLoadingSkills(true);
      const response = await api.get(`${endpoint.coreLookup}/type/code/CourseSkill`);
      setSkills(response.data || []);
    } catch (err) {
      console.error("Error loading skills:", err);
      showError("Failed to load skills");
    } finally {
      setLoadingSkills(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setSelectedSkillId(null);
    setAssignmentType("Homework");
    setQuestions([]);
    setTotalPoints(0);
    setTimeLimitMinutes(undefined);
    setMaxAttempts(1);
    setIsAutoGradable(true);
    setShowAnswersAfterSubmission(false);
    setShowAnswersAfterDueDate(true);
    setFiles([]);
    setError(null);
    setCurrentStep("basic");
  };

  const handleAddQuestion = (question: Question) => {
    const newQuestion = {
      ...question,
      id: question.id || `q-${Date.now()}-${Math.random()}`,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updatedQuestion } : q
    ));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id).map((q, idx) => ({
      ...q,
      order: idx + 1
    })));
  };

  const handleReorderQuestions = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, moved);
    setQuestions(newQuestions.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleImportQuestions = (importedQuestions: Question[]) => {
    const newQuestions = importedQuestions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
      order: questions.length + idx + 1,
    }));
    setQuestions([...questions, ...newQuestions]);
  };

  const generateQuestionData = (): AssignmentQuestionData | null => {
    if (questions.length === 0) return null;
    
    return {
      version: "1.0",
      questions: questions.sort((a, b) => a.order - b.order),
      settings: {
        shuffleQuestions: false,
        allowBackNavigation: true,
        showProgress: true,
        showQuestionNumbers: true,
      },
    };
  };

  const validateStep = (step: Step): boolean => {
    setError(null);
    
    switch (step) {
      case "basic":
        if (!title.trim()) {
          setError("Title is required");
          return false;
        }
        if (!dueDate) {
          setError("Due date is required");
          return false;
        }
        // Validate due date is not in the past
        const selectedDate = new Date(dueDate);
        const now = new Date();
        if (selectedDate <= now) {
          setError("Due date must be in the future");
          return false;
        }
        if (!selectedSkillId) {
          setError("Please select a skill");
          return false;
        }
        return true;
        
      case "questions":
        if (questions.length === 0) {
          setError("Please add at least one question");
          return false;
        }
        // Validate each question
        for (const q of questions) {
          if (!q.question.trim()) {
            setError(`Question ${q.order} is missing text`);
            return false;
          }
          if (q.points <= 0) {
            setError(`Question ${q.order} must have points > 0`);
            return false;
          }
          if (q.type === "multiple_choice") {
            if (!q.options) {
              setError(`Question ${q.order} (Multiple Choice) needs at least 2 options`);
              return false;
            }
            if (q.options.length < 2) {
              setError(`Question ${q.order} (Multiple Choice) needs at least 2 options`);
              return false;
            }
            if (!q.correctAnswer) {
              setError(`Question ${q.order} (Multiple Choice) needs a correct answer`);
              return false;
            }
          }
        }
        return true;
        
      case "settings":
        if (totalPoints <= 0) {
          setError("Total points must be greater than 0");
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    if (!validateStep("preview")) return;
    
    const questionData = generateQuestionData();
    
    onSubmit({
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      skillID: selectedSkillId,
      assignmentType,
      totalPoints,
      timeLimitMinutes,
      maxAttempts,
      isAutoGradable,
      showAnswersAfterSubmission,
      showAnswersAfterDueDate,
      questionData,
      files,
    });
    
    onOpenChange(false);
    resetForm();
  };

  const handleSaveDraft = () => {
    const questionData = generateQuestionData();
    
    onSubmit({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      skillID: selectedSkillId,
      assignmentType,
      totalPoints,
      timeLimitMinutes,
      maxAttempts,
      isAutoGradable,
      showAnswersAfterSubmission,
      showAnswersAfterDueDate,
      questionData,
      files,
    });
    
    success("Assignment saved as draft!");
    onOpenChange(false);
    resetForm();
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case "basic": return "Basic Information";
      case "questions": return "Questions";
      case "settings": return "Settings";
      case "preview": return "Preview";
      default: return "";
    }
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case "basic": return <FileText className="w-5 h-5" />;
      case "questions": return <PenTool className="w-5 h-5" />;
      case "settings": return <Settings className="w-5 h-5" />;
      case "preview": return <Eye className="w-5 h-5" />;
      default: return null;
    }
  };

  const selectedSkill = skills.find(s => s.lookUpId === selectedSkillId);

  // Get minimum datetime for due date (current time)
  const getMinDateTime = (): string => {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Assignment</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center mb-4 mt-4 px-6">
          {steps.map((step, index) => (
            <Fragment key={step}>
              <div className="flex flex-col items-center flex-1 basis-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    steps.indexOf(currentStep) >= index
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-neutral-300 text-neutral-400"
                  }`}
                >
                  {getStepIcon(step)}
                </div>
                <span className={`text-xs mt-2 text-center ${
                  steps.indexOf(currentStep) >= index
                    ? "text-primary-600 font-medium"
                    : "text-neutral-400"
                }`}>
                  {getStepTitle(step)}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    steps.indexOf(currentStep) > index
                      ? "bg-primary-600"
                      : "bg-neutral-200"
                  }`}
                />
              )}
            </Fragment>
          ))}
        </div>

        <DialogBody className="flex-1 overflow-y-auto min-h-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === "basic" && (
            <BasicInformationStep
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              selectedSkillId={selectedSkillId}
              onSkillChange={setSelectedSkillId}
              assignmentType={assignmentType}
              onAssignmentTypeChange={setAssignmentType}
              skills={skills}
              loadingSkills={loadingSkills}
              files={files}
              onFilesChange={setFiles}
              getMinDateTime={getMinDateTime}
            />
          )}

          {/* Step 2: Questions */}
          {currentStep === "questions" && (
            <QuestionsStep
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestions={handleReorderQuestions}
              selectedSkill={selectedSkill}
              totalPoints={totalPoints}
            />
          )}

          {/* Step 3: Settings */}
          {currentStep === "settings" && (
            <SettingsStep
              totalPoints={totalPoints}
              onTotalPointsChange={setTotalPoints}
              timeLimitMinutes={timeLimitMinutes}
              onTimeLimitChange={setTimeLimitMinutes}
              maxAttempts={maxAttempts}
              onMaxAttemptsChange={setMaxAttempts}
              isAutoGradable={isAutoGradable}
              onAutoGradableChange={setIsAutoGradable}
              showAnswersAfterSubmission={showAnswersAfterSubmission}
              onShowAnswersAfterSubmissionChange={setShowAnswersAfterSubmission}
              showAnswersAfterDueDate={showAnswersAfterDueDate}
              onShowAnswersAfterDueDateChange={setShowAnswersAfterDueDate}
            />
          )}

          {/* Step 4: Preview */}
          {currentStep === "preview" && (
            <PreviewStep
              title={title}
              description={description}
              dueDate={dueDate}
              selectedSkill={selectedSkill}
              assignmentType={assignmentType}
              questions={questions}
              totalPoints={totalPoints}
              timeLimitMinutes={timeLimitMinutes}
              maxAttempts={maxAttempts}
              isAutoGradable={isAutoGradable}
              showAnswersAfterSubmission={showAnswersAfterSubmission}
              showAnswersAfterDueDate={showAnswersAfterDueDate}
            />
          )}
        </DialogBody>

        <DialogFooter className="flex justify-between px-0 pb-6">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              iconLeft={<Save className="w-4 h-4" />}
            >
              Save as Draft
            </Button>
          </div>
          <div className="flex gap-2 pr-4">
            {currentStep !== "basic" && (
              <Button
                variant="secondary"
                onClick={handlePrevious}
                iconLeft={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
            )}
            {currentStep !== "preview" ? (
              <Button
                onClick={handleNext}
                iconRight={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} iconLeft={<CheckCircle className="w-4 h-4" />}>
                Create Assignment
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

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
    </Dialog>
  );
}

