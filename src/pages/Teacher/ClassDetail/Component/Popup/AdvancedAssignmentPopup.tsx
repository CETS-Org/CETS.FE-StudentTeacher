import { useState, useEffect, useMemo, useCallback, Fragment, useRef } from "react";
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
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
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
import { createSpeakingAssignment, createQuizAssignment, createAssignment, uploadJsonToPresignedUrl, uploadToPresignedUrl } from "@/api";
import { updateAssignment, getQuestionJsonUploadUrl, deleteAssignment } from "@/api/assignments.api";

// Types
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_the_blank"
  | "short_answer"
  | "matching"
  | "essay"
  | "speaking";

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
  // Speaking-specific fields
  maxDuration?: number; // Maximum recording duration in seconds
  instructions?: string; // Additional instructions for student
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
    answerVisibility: "immediately" | "after_due_date" | "never";
    questionData: AssignmentQuestionData | null;
    files: File[];
  }) => void;
  classMeetingId?: string;
  editAssignment?: {
    assignmentId: string;
    title: string;
    description: string | null;
    dueDate: string;
    skillID?: string | null;
    assignmentType?: string;
    questionUrl?: string | null;
  };
};

type Step = "basic" | "questions" | "settings" | "preview";

export default function AdvancedAssignmentPopup({
  open,
  onOpenChange,
  onSubmit,
  classMeetingId,
  editAssignment,
}: Props) {
  const { toasts, hideToast, success, error: showError } = useToast();
  
  // Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] = useState("Homework");
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  // Steps depend on assignment type: Homework only needs basic, Quiz needs questions
  const steps = useMemo<Step[]>(() => {
    if (assignmentType === "Quiz") {
      return ["basic", "questions", "settings", "preview"];
    }
    return ["basic", "settings", "preview"];
  }, [assignmentType]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  // Settings
  const [totalPoints, setTotalPoints] = useState(10); // Default 10 for homework assignments
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(undefined);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [isAutoGradable, setIsAutoGradable] = useState(true);
  const [answerVisibility, setAnswerVisibility] = useState<"immediately" | "after_due_date" | "never">("after_due_date");
  // Question display settings
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(false);
  
  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const assignmentIdToDeleteRef = useRef<string | null>(null);
  
  // Find the selected skill object
  const selectedSkill = skills.find(s => s.lookUpId === selectedSkillId);

  // Load assignment data for editing
  const loadAssignmentForEdit = useCallback(async () => {
    if (!editAssignment) return;
    
    try {
      // Set basic info
      setTitle(editAssignment.title);
      setDescription(editAssignment.description || "");
      setSelectedSkillId(editAssignment.skillID || null);
      
      // Set due date in datetime-local format
      if (editAssignment.dueDate) {
        const date = new Date(editAssignment.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      }
      
      // Determine assignment type
      const type = editAssignment.assignmentType || (editAssignment.questionUrl ? "Quiz" : "Homework");
      setAssignmentType(type);
      
      // Load question data if it's a Quiz or Speaking assignment
      if ((type === "Quiz" || type === "Speaking") && editAssignment.questionUrl) {
        try {
          console.log("Loading question data from URL:", editAssignment.questionUrl);
          const questionResponse = await fetch(editAssignment.questionUrl);
          
          if (!questionResponse.ok) {
            throw new Error(`Failed to fetch question data: ${questionResponse.status} ${questionResponse.statusText}`);
          }
          
          const questionData = await questionResponse.json();
          console.log("Loaded question data:", questionData);
          
          // Set questions - ensure they're properly formatted
          if (questionData.questions && Array.isArray(questionData.questions)) {
            // Ensure all questions have required fields
            const formattedQuestions = questionData.questions.map((q: any) => ({
              ...q,
              id: q.id || `q-${Date.now()}-${q.order}`,
              type: q.type || "multiple_choice",
              order: q.order || 0,
              question: q.question || "",
              points: q.points || 0,
            }));
            console.log("Setting questions:", formattedQuestions);
            setQuestions(formattedQuestions);
          } else {
            console.warn("No questions found in question data:", questionData);
          }
          
          // Set settings
          if (questionData.settings) {
            if (questionData.settings.totalPoints !== undefined) {
              setTotalPoints(questionData.settings.totalPoints);
            }
            if (questionData.settings.timeLimitMinutes !== undefined) {
              setTimeLimitMinutes(questionData.settings.timeLimitMinutes);
            }
            if (questionData.settings.maxAttempts !== undefined) {
              setMaxAttempts(questionData.settings.maxAttempts);
            }
            if (questionData.settings.isAutoGradable !== undefined) {
              setIsAutoGradable(questionData.settings.isAutoGradable);
            }
            if (questionData.settings.answerVisibility) {
              setAnswerVisibility(questionData.settings.answerVisibility);
            }
            if (questionData.settings.allowBackNavigation !== undefined) {
              setAllowBackNavigation(questionData.settings.allowBackNavigation);
            }
            if (questionData.settings.showProgress !== undefined) {
              setShowProgress(questionData.settings.showProgress);
            }
            if (questionData.settings.showQuestionNumbers !== undefined) {
              setShowQuestionNumbers(questionData.settings.showQuestionNumbers);
            }
            if (questionData.settings.autoSubmit !== undefined) {
              setAutoSubmit(questionData.settings.autoSubmit);
            }
          }
        } catch (err) {
          console.error("Error loading question data:", err);
          showError(`Failed to load assignment questions: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } else {
        console.log("Not loading question data - type:", type, "questionUrl:", editAssignment.questionUrl);
      }
    } catch (err) {
      console.error("Error loading assignment for edit:", err);
      showError("Failed to load assignment data");
    }
  }, [editAssignment, showError]);
  
  // Load skills and assignment data on mount
  useEffect(() => {
    if (open) {
      loadSkills();
      if (editAssignment) {
        // Load assignment data for editing
        loadAssignmentForEdit();
      } else {
        resetForm();
      }
    }
  }, [open, editAssignment, loadAssignmentForEdit]);

  // Calculate total points from questions (only for Quiz assignments)
  useEffect(() => {
    if (assignmentType === "Quiz") {
      const total = questions.reduce((sum, q) => sum + q.points, 0);
      setTotalPoints(total);
    }
    // For Homework, totalPoints can be set manually, so we don't auto-calculate
  }, [questions, assignmentType]);

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
    setTotalPoints(10); // Default 10 for homework assignments
    setTimeLimitMinutes(undefined);
    setMaxAttempts(1);
    setIsAutoGradable(true);
    setAnswerVisibility("after_due_date");
    setAllowBackNavigation(true);
    setShowProgress(true);
    setShowQuestionNumbers(true);
    setAutoSubmit(true);
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
        allowBackNavigation,
        showProgress,
        showQuestionNumbers,
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
          
          if (q.type === "speaking") {
            if (!q.instructions) {
              setError(`Question ${q.order} (Speaking) needs instructions for students`);
              return false;
            }
            if (!q.maxDuration || q.maxDuration <= 0) {
              setError(`Question ${q.order} (Speaking) needs a valid maximum duration`);
              return false;
            }
            // Validate audio timestamp format if provided
            if (q.audioTimestamp && q.audioTimestamp !== "-1") {
              const timestampRegex = /^\d{1,2}:\d{2}$/;
              if (!timestampRegex.test(q.audioTimestamp)) {
                setError(`Question ${q.order} (Speaking) has invalid audio timestamp format. Use MM:SS format`);
                return false;
              }
            }
          }
        }
        return true;
        
      case "settings":
        // Only validate totalPoints for Quiz assignments
        if (assignmentType === "Quiz" && totalPoints <= 0) {
          setError("Total points must be greater than 0");
          return false;
        }
        // For Homework, totalPoints is optional (can be 0 or set manually)
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

  const handleDelete = async () => {

    const assignmentIdToDelete = assignmentIdToDeleteRef.current;
    
    if (!assignmentIdToDelete) {
      console.error("Assignment ID is missing. editAssignment:", editAssignment);
      showError("Assignment ID is missing");
      setShowDeleteConfirm(false);
      assignmentIdToDeleteRef.current = null;
      return;
    }

    try {
      await deleteAssignment(assignmentIdToDelete);
      success("Assignment deleted successfully!");
      setShowDeleteConfirm(false);
      assignmentIdToDeleteRef.current = null;
      onOpenChange(false);
      if (onSubmit) {
        // Trigger refresh by calling onSubmit with empty data
        onSubmit({
          title: "",
          description: "",
          dueDate: new Date().toISOString(),
          skillID: null,
          assignmentType: "",
          totalPoints: 0,
          timeLimitMinutes: undefined,
          maxAttempts: 1,
          isAutoGradable: false,
          answerVisibility: "never",
          questionData: null,
          files: [],
        });
      }
    } catch (err: any) {
      console.error("Error deleting assignment:", err);
      showError(err?.response?.data?.message || err?.message || "Failed to delete assignment");
      setShowDeleteConfirm(false);
      assignmentIdToDeleteRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("preview")) return;
    
    const teacherId = getTeacherId();
    if (!teacherId) {
      showError("Teacher ID not found");
      return;
    }

    if (!classMeetingId) {
      showError("Class meeting ID is missing");
      return;
    }

    // Check if this is edit mode
    const isEditMode = !!editAssignment;
    
    // Check if this is a speaking assignment
    const isSpeakingAssignment = selectedSkill?.name === "Speaking";
    
    // Handle Homework assignment (file upload)
    if (assignmentType === "Homework") {
      try {
        if (isEditMode) {
          // Update existing assignment
          if (!editAssignment?.assignmentId) {
            showError("Assignment ID is missing");
            return;
          }
          
          const updateData: any = {
            id: editAssignment.assignmentId,
            title,
            description: description || "",
            dueDate: new Date(dueDate).toISOString(),
            skillID: selectedSkillId || null,
          };
          
          // If new file is uploaded, include file info
          if (files.length > 0) {
            const file = files[0];
            updateData.contentType = file.type;
            updateData.fileName = file.name.replace(/\.[^/.]+$/, "");
            
            const response = await updateAssignment(editAssignment.assignmentId, updateData);
            const responseData = response.data;
            
            if (responseData && typeof responseData === 'object' && 'uploadUrl' in responseData) {
              const typedResponse = responseData as unknown as {
                id: string;
                uploadUrl: string;
                filePath: string;
              };
              
              // Upload file to presigned URL
              const uploadResponse = await uploadToPresignedUrl(typedResponse.uploadUrl, file, file.type);
              
              if (!uploadResponse.ok) {
                throw new Error(`File upload failed with status: ${uploadResponse.status}`);
              }
            }
          } else {
            // No new file, just update metadata
            await updateAssignment(editAssignment.assignmentId, updateData);
          }
          
          success("Homework assignment updated successfully!");
          onOpenChange(false);
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueDate: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: null,
              files: [],
            });
          }
          return;
        }
        
        // Create new assignment
        if (files.length === 0) {
          showError("Please upload at least one file for homework assignment");
          return;
        }

        // For homework, upload the first file
        const file = files[0];
        const assignmentData = {
          classMeetingId: classMeetingId,
          teacherId,
          title,
          description: description || "",
          dueDate: new Date(dueDate).toISOString(),
          skillID: selectedSkillId || null,
          contentType: file.type,
          fileName: file.name.replace(/\.[^/.]+$/, ""),
        };

        const response = await createAssignment(assignmentData);
        const responseData = response.data;

        if (responseData && typeof responseData === 'object' && 'uploadUrl' in responseData) {
          const typedResponse = responseData as unknown as {
            id: string;
            uploadUrl: string;
            filePath: string;
          };

          // Upload file to presigned URL
          const uploadResponse = await uploadToPresignedUrl(typedResponse.uploadUrl, file, file.type);
          
          if (!uploadResponse.ok) {
            throw new Error(`File upload failed with status: ${uploadResponse.status}`);
          }

          success("Homework assignment created successfully!");
          onOpenChange(false);
          // Trigger refresh by calling onSubmit callback
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueDate: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: null,
              files: [],
            });
          }
          return;
        }
      } catch (error) {
        console.error("Error creating homework assignment:", error);
        showError("Failed to create homework assignment");
        return;
      }
    }
    // Handle Quiz assignment (questions)
    else if (assignmentType === "Quiz") {
      try {
        if (questions.length === 0) {
          showError("Please add at least one question for quiz assignment");
          return;
        }

        const questionData = generateQuestionData();
        if (!questionData) {
          showError("Failed to generate question data");
          return;
        }

        // Serialize question data to JSON string
        const questionJson = JSON.stringify({
          version: questionData.version,
          questions: questionData.questions,
          settings: questionData.settings,
        });

        if (isEditMode) {
          // Update existing quiz assignment
          if (!editAssignment?.assignmentId) {
            showError("Assignment ID is missing");
            return;
          }
          
          // Generate updated question JSON
          const updatedQuestionJson = JSON.stringify(questionData);
          
          // Get presigned URL for uploading updated JSON (without creating an assignment)
          const jsonFileName = `quiz-assignment-${editAssignment.assignmentId}.json`;
          const uploadUrlResponse = await getQuestionJsonUploadUrl(jsonFileName);
          const uploadUrlData = uploadUrlResponse.data;
          
          let newQuestionFilePath: string | null = null;
          
          if (uploadUrlData && typeof uploadUrlData === 'object' && 'uploadUrl' in uploadUrlData && 'filePath' in uploadUrlData) {
            const { uploadUrl, filePath } = uploadUrlData as { uploadUrl: string; filePath: string };
            
            // Upload updated JSON to presigned URL
            const jsonUploadResponse = await uploadJsonToPresignedUrl(uploadUrl, updatedQuestionJson);
            
            if (!jsonUploadResponse.ok) {
              throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
            }
            
            // Get the file path from the response
            newQuestionFilePath = filePath;
          }
          
          // Update basic assignment info with new question file path
          const updateData: any = {
            id: editAssignment.assignmentId,
            title,
            description: description || "",
            dueDate: new Date(dueDate).toISOString(),
          };
          
          // Include question file path if we have it
          if (newQuestionFilePath) {
            updateData.questionUrl = newQuestionFilePath;
          }
          
          await updateAssignment(editAssignment.assignmentId, updateData);
          
          success("Quiz assignment updated successfully!");
          onOpenChange(false);
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueDate: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: generateQuestionData(),
              files: [],
            });
          }
          return;
        }

        // Create new quiz assignment
        const quizAssignmentData = {
          classMeetingId: classMeetingId,
          teacherId,
          title,
          description: description || undefined,
          dueDate: new Date(dueDate).toISOString(),
          questionJson,
          skillID: selectedSkillId || undefined,
        };

        const response = await createQuizAssignment(quizAssignmentData);
        const responseData = response.data;

        if (responseData && typeof responseData === 'object' && 'uploadUrl' in responseData && 'questionJson' in responseData) {
          const typedResponse = responseData as unknown as {
            id: string;
            uploadUrl: string;
            questionJson: string;
          };

          // Upload JSON to presigned URL
          const jsonUploadResponse = await uploadJsonToPresignedUrl(typedResponse.uploadUrl, typedResponse.questionJson);
          
          if (!jsonUploadResponse.ok) {
            throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
          }

          success("Quiz assignment created successfully!");
          onOpenChange(false);
          // Trigger refresh by calling onSubmit callback
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueDate: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: generateQuestionData(),
              files: [],
            });
          }
          return;
        }
      } catch (error) {
        console.error("Error creating quiz assignment:", error);
        showError("Failed to create quiz assignment");
        return;
      }
    }
    // Handle Speaking assignment
    else if (isSpeakingAssignment && questions.length > 0) {
      try {
        // Serialize question data to JSON string
        const questionData = {
          version: "1.0",
          questions: questions.map(q => ({
            id: q.id,
            order: q.order,
            question: q.question,
            points: q.points,
            audioTimestamp: q.audioTimestamp && q.audioTimestamp !== "-1" ? q.audioTimestamp : undefined,
            maxDuration: q.maxDuration,
            instructions: q.instructions,
          })),
          settings: {
            allowBackNavigation,
            showProgress,
            showQuestionNumbers,
            autoSubmit,
            maxRetries: timeLimitMinutes ? Math.floor(timeLimitMinutes * 60 / questions.length) : undefined,
          },
          media: {
            images: [],
          },
        };
        
        if (isEditMode) {
          // Update existing speaking assignment
          if (!editAssignment?.assignmentId) {
            showError("Assignment ID is missing");
            return;
          }
          
          // Update basic assignment info
          const updateData: any = {
            id: editAssignment.assignmentId,
            title,
            description: description || "",
            dueDate: new Date(dueDate).toISOString(),
          };
          
          await updateAssignment(editAssignment.assignmentId, updateData);
          
          // Note: Question data update for Speaking assignments requires backend support
          // For now, we'll just update the basic info
          // TODO: Implement question JSON update when backend supports it
          success("Speaking assignment updated successfully! (Note: Question data update requires backend support)");
          onOpenChange(false);
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueDate: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: {
                version: "1.0",
                questions: questions.map(q => ({
                  id: q.id,
                  type: q.type,
                  order: q.order,
                  question: q.question,
                  points: q.points,
                  audioTimestamp: q.audioTimestamp,
                  maxDuration: q.maxDuration,
                  instructions: q.instructions,
                })),
                settings: {
                  shuffleQuestions: false,
                  allowBackNavigation,
                  showProgress,
                  showQuestionNumbers,
                },
                media: questionData.media,
              },
              files: [],
            });
          }
          return;
        }
        
        // Create new speaking assignment
        const speakingAssignmentData = {
          classMeetingId: classMeetingId || "",
          teacherId,
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          questionJson: JSON.stringify(questionData), // Serialize to JSON string
          skillID: selectedSkillId || undefined,
        };
        
        // Create speaking assignment and get presigned URL for JSON upload
        const response = await createSpeakingAssignment(speakingAssignmentData);
        
        // Extract data from axios response
        const responseData = response.data;
        
        // Check if response has upload properties
        if (responseData && typeof responseData === 'object' && 'uploadUrl' in responseData && 'questionJson' in responseData) {
          // Type assertion to access the properties
          const typedResponse = responseData as unknown as {
            id: string;
            uploadUrl: string;
            questionJson: string;
          };
          
          try {
            // Validate the response data
            if (!typedResponse.uploadUrl || !typedResponse.questionJson) {
              throw new Error("Invalid response: missing upload URL or JSON data");
            }
            
            // Upload JSON directly to cloud storage using the presigned URL
            const jsonUploadResponse = await uploadJsonToPresignedUrl(typedResponse.uploadUrl, typedResponse.questionJson);
            
            if (!jsonUploadResponse.ok) {
              throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
            }
            
            success("Speaking assignment created successfully!");
            onOpenChange(false);
            // Trigger refresh by calling onSubmit callback
            if (onSubmit) {
              onSubmit({
                title,
                description: description || "",
                dueDate: new Date(dueDate).toISOString(),
                skillID: selectedSkillId,
                assignmentType,
                totalPoints,
                timeLimitMinutes,
                maxAttempts,
                isAutoGradable,
                answerVisibility,
                questionData: generateQuestionData(),
                files: [],
              });
            }
            return;
          } catch (error) {
            console.error("Error creating speaking assignment:", error);
            showError("Failed to create speaking assignment");
            return;
          }
        }
      } catch (error) {
        console.error("Error creating speaking assignment:", error);
        showError("Failed to create speaking assignment");
        return;
      }
    }
    resetForm();
  };

  const handleSaveDraft = async () => {
    const questionData = generateQuestionData();
    
    // Check if this is a speaking assignment
    const isSpeakingAssignment = selectedSkill?.name === "Speaking";
    
    if (isSpeakingAssignment && questions.length > 0) {
      try {
        // Create speaking assignment data
        const teacherId = getTeacherId();
        if (!teacherId) {
          showError("Teacher ID not found");
          return;
        }
        
        // Serialize question data to JSON string
        const questionData = {
          version: "1.0",
          questions: questions.map(q => ({
            id: q.id,
            order: q.order,
            question: q.question,
            points: q.points,
            audioTimestamp: q.audioTimestamp && q.audioTimestamp !== "-1" ? q.audioTimestamp : undefined,
            maxDuration: q.maxDuration,
            instructions: q.instructions,
          })),
          settings: {
            allowBackNavigation,
            showProgress,
            showQuestionNumbers,
            autoSubmit,
            maxRetries: timeLimitMinutes ? Math.floor(timeLimitMinutes * 60 / questions.length) : undefined,
          },
          media: {
            audioUrl: undefined,
            videoUrl: undefined,
            images: [],
          },
        };
        
        const speakingAssignmentData = {
          classMeetingId: classMeetingId || "",
          teacherId,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
          questionJson: JSON.stringify(questionData), // Serialize to JSON string
          skillID: selectedSkillId || undefined,
        };
        
        // Create speaking assignment and get presigned URL for JSON upload
        const response = await createSpeakingAssignment(speakingAssignmentData);
        
        // Extract data from axios response
        const responseData = response.data;
        
        // Check if response has upload properties
        if (responseData && typeof responseData === 'object' && 'uploadUrl' in responseData && 'questionJson' in responseData) {
          // Type assertion to access the properties
          const typedResponse = responseData as unknown as {
            id: string;
            uploadUrl: string;
            questionJson: string;
          };
          
          try {
            // Validate the response data
            if (!typedResponse.uploadUrl || !typedResponse.questionJson) {
              throw new Error("Invalid response: missing upload URL or JSON data");
            }
            
            // Upload JSON directly to cloud storage using the presigned URL
            const jsonUploadResponse = await uploadJsonToPresignedUrl(typedResponse.uploadUrl, typedResponse.questionJson);
            
            if (!jsonUploadResponse.ok) {
              throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
            }
            
            success("Speaking assignment saved as draft!");
          } catch (error) {
            console.error("Error saving speaking assignment draft:", error);
            showError("Failed to save speaking assignment draft");
            return;
          }
        }
      } catch (error) {
        console.error("Error saving speaking assignment draft:", error);
        showError("Failed to save speaking assignment draft");
        return;
      }
    } else {
      // Regular assignment submission
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
        answerVisibility,
        questionData,
        files,
      });
      
      success("Assignment saved as draft!");
    }
    
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editAssignment ? "Edit Assignment" : "Create Assignment"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto min-h-0">
          {/* Progress Steps */}
          <div className="flex items-center mb-4 mt-4">
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

          {/* Step 2: Questions - Only for Quiz */}
          {currentStep === "questions" && assignmentType === "Quiz" && (
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
              assignmentType={assignmentType}
              timeLimitMinutes={timeLimitMinutes}
              onTimeLimitChange={setTimeLimitMinutes}
              maxAttempts={maxAttempts}
              onMaxAttemptsChange={setMaxAttempts}
              isAutoGradable={isAutoGradable}
              onAutoGradableChange={setIsAutoGradable}
              answerVisibility={answerVisibility}
              onAnswerVisibilityChange={setAnswerVisibility}
              allowBackNavigation={allowBackNavigation}
              onAllowBackNavigationChange={setAllowBackNavigation}
              showProgress={showProgress}
              onShowProgressChange={setShowProgress}
              showQuestionNumbers={showQuestionNumbers}
              onShowQuestionNumbersChange={setShowQuestionNumbers}
              autoSubmit={autoSubmit}
              onAutoSubmitChange={setAutoSubmit}
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
              answerVisibility={answerVisibility}
            />
          )}
        </DialogBody>

        <DialogFooter className="flex justify-between px-0 pb-6">
          <div className="flex gap-2">
            {editAssignment && (
              <Button
                variant="danger"
                onClick={() => {
                  // Capture assignmentId when delete button is clicked
                  const assignmentId = editAssignment?.assignmentId || (editAssignment as any)?.id;
                  if (assignmentId) {
                    assignmentIdToDeleteRef.current = assignmentId;
                    setShowDeleteConfirm(true);
                  } else {
                    console.error("Cannot delete: assignmentId is missing", editAssignment);
                    showError("Cannot delete: Assignment ID is missing");
                  }
                }}
                iconLeft={<Trash2 className="w-4 h-4" />}
              >
                Delete Assignment
              </Button>
            )}
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
                {editAssignment ? "Update Assignment" : "Create Assignment"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

    </Dialog>

    {/* Toast Notifications - Rendered outside Dialog to appear above it */}
    {toasts.length > 0 && createPortal(
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

    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          assignmentIdToDeleteRef.current = null;
        }}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${editAssignment?.title || 'this assignment'}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    )}
    </>
  );
}

