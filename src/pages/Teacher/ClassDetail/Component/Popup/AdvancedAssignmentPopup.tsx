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
import Input from "@/components/ui/input";
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
import { createSpeakingAssignment, createQuizAssignment, createAssignment, uploadJsonToPresignedUrl, uploadToPresignedUrl } from "@/api";
import { updateAssignment, getQuestionJsonUploadUrl, getQuestionDataUrl, getAudioUploadUrl } from "@/api/assignments.api";
import { config } from "@/lib/config";

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
    // Timing & grading
    timeLimitMinutes?: number;
    isAutoGradable?: boolean;
    totalPoints?: number;

    // Answer visibility
    showAnswersAfterSubmission?: boolean;
    showAnswersAfterDueDate?: boolean;

    // Speaking-specific
    allowMultipleRecordings?: boolean;
    maxRecordings?: number;
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
    dueAt: string;
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

interface BuildQuestionDataArgs {
  questions: Question[];
  audioFileUrls?: Map<File, string>;
  timeLimitMinutes?: number;
  isAutoGradable: boolean;
  answerVisibility: "immediately" | "after_due_date" | "never";
}

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
  // Always allow multiple recordings, default to 3
  const allowMultipleRecordings = true;
  const [maxRecordings, setMaxRecordings] = useState(3);
  
  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [originalQuestionJson, setOriginalQuestionJson] = useState<string | null>(null);
  const [initialQuestionUrl, setInitialQuestionUrl] = useState<string | null>(null);
  
  // Draft dialog state
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState<any>(null);
  
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
      setInitialQuestionUrl(editAssignment.questionUrl || null);
      
      // Load question data if it's a Quiz or Speaking assignment
      if ((type === "Quiz" || type === "Speaking") && editAssignment.questionUrl) {
        try {
          // Get presigned URL for question data
          const questionUrlResponse = await getQuestionDataUrl(editAssignment.assignmentId);
          const presignedUrl = questionUrlResponse.data.questionDataUrl;
          
          const questionResponse = await fetch(presignedUrl);
          
          if (!questionResponse.ok) {
            throw new Error(`Failed to fetch question data: ${questionResponse.status} ${questionResponse.statusText}`);
          }
          
          const questionData = await questionResponse.json();
          
          let formattedQuestions: Question[] = [];
          
          // Set questions - ensure they're properly formatted
          if (questionData.questions && Array.isArray(questionData.questions)) {
            // Ensure all questions have required fields
            formattedQuestions = questionData.questions.map((q: any) => ({
              ...q,
              id: q.id || `q-${Date.now()}-${q.order}`,
              type: q.type || "multiple_choice",
              order: q.order || 0,
              question: q.question || "",
              points: q.points || 0,
            }));
            setQuestions(formattedQuestions);
          } else {
            console.warn("No questions found in question data:", questionData);
            setQuestions([]);
          }
          
          // Set settings
          if (questionData.settings) {
            if (questionData.settings.totalPoints !== undefined) {
              setTotalPoints(questionData.settings.totalPoints);
            }
            if (questionData.settings.timeLimitMinutes !== undefined) {
              setTimeLimitMinutes(questionData.settings.timeLimitMinutes);
            }
            if (questionData.settings.isAutoGradable !== undefined) {
              setIsAutoGradable(questionData.settings.isAutoGradable);
            }
            const derivedVisibility = deriveAnswerVisibility(questionData.settings);
            setAnswerVisibility(derivedVisibility);
            if (questionData.settings.allowBackNavigation !== undefined) {
              setAllowBackNavigation(questionData.settings.allowBackNavigation);
            }
            if (questionData.settings.showProgress !== undefined) {
              setShowProgress(questionData.settings.showProgress);
            }
            if (questionData.settings.showQuestionNumbers !== undefined) {
              setShowQuestionNumbers(questionData.settings.showQuestionNumbers);
            }
            if (questionData.settings.maxRecordings !== undefined) {
              setMaxRecordings(questionData.settings.maxRecordings);
            }

            const existingPayload = buildQuestionDataPayload({
              questions: formattedQuestions,
              audioFileUrls: undefined,
              timeLimitMinutes: questionData.settings.timeLimitMinutes,
              isAutoGradable: questionData.settings.isAutoGradable ?? true,
              answerVisibility: derivedVisibility,
            });

            if (existingPayload) {
              setOriginalQuestionJson(serializeQuestionData(existingPayload));
            } else {
              setOriginalQuestionJson(null);
            }
          } else {
            setOriginalQuestionJson(null);
          }
        } catch (err) {
          console.error("Error loading question data:", err);
          showError(`Failed to load assignment questions: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error("Error loading assignment for edit:", err);
      showError("Failed to load assignment data");
    }
  }, [editAssignment, showError]);
  
  // Load draft from localStorage
  const loadDraftFromLocalStorage = useCallback(() => {
    try {
      const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        
        // Show dialog instead of alert
        setPendingDraftData(draftData);
        setShowDraftDialog(true);
        return true;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
    return false;
  }, [classMeetingId]);

  // Load draft data into form
  const loadDraftData = useCallback((draftData: any) => {
    setTitle(draftData.title || "");
    setDescription(draftData.description || "");
    setDueDate(draftData.dueDate || "");
    setSelectedSkillId(draftData.selectedSkillId || null);
    setAssignmentType(draftData.assignmentType || "Homework");
    setQuestions(draftData.questions || []);
    setTotalPoints(draftData.totalPoints || 10);
    setTimeLimitMinutes(draftData.timeLimitMinutes);
    setMaxAttempts(draftData.maxAttempts || 1);
    setIsAutoGradable(draftData.isAutoGradable !== undefined ? draftData.isAutoGradable : true);
    setAnswerVisibility(draftData.answerVisibility || "after_due_date");
    setAllowBackNavigation(draftData.allowBackNavigation !== undefined ? draftData.allowBackNavigation : true);
    setShowProgress(draftData.showProgress !== undefined ? draftData.showProgress : true);
    setShowQuestionNumbers(draftData.showQuestionNumbers !== undefined ? draftData.showQuestionNumbers : true);
    setAutoSubmit(draftData.autoSubmit || false);
    setMaxRecordings(draftData.maxRecordings || 3);
    
    success("Draft loaded successfully!");
  }, [success]);

  // Load skills and assignment data on mount
  useEffect(() => {
    if (open) {
      loadSkills();
      if (editAssignment) {
        // Load assignment data for editing
        loadAssignmentForEdit();
      } else {
        // Try to load draft first, if not found or declined, reset form
        const draftLoaded = loadDraftFromLocalStorage();
        if (!draftLoaded) {
          resetForm();
        }
      }
    }
  }, [open, editAssignment, loadAssignmentForEdit, loadDraftFromLocalStorage]);

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
    setAutoSubmit(false);
    setMaxRecordings(3);
    setFiles([]);
    setError(null);
    setCurrentStep("basic");
    setOriginalQuestionJson(null);
    setInitialQuestionUrl(null);
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
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const merged = { ...q, ...updatedQuestion };
        
        // Clean up audio fields: remove them if explicitly set to empty/null
        // Check if audio fields were explicitly set in updatedQuestion
        if ('_audioFile' in updatedQuestion) {
          if ((updatedQuestion as any)._audioFile === null || (updatedQuestion as any)._audioFile === undefined) {
            delete (merged as any)._audioFile;
          }
        }
        
        if ('_audioUrl' in updatedQuestion) {
          const audioUrlValue = (updatedQuestion as any)._audioUrl;
          // If _audioUrl is explicitly set to empty string or null, remove it
          if (audioUrlValue === "" || audioUrlValue === null || audioUrlValue === undefined) {
            delete (merged as any)._audioUrl;
          }
        }
        
        // If reference is set to empty string and we're removing audio, clear it
        if ('reference' in updatedQuestion && updatedQuestion.reference === "" && 
            !(merged as any)._audioFile && !(merged as any)._audioUrl) {
          merged.reference = "";
        }
        
        // Clean up passage field: if _passage was in original question but not in updatedQuestion,
        // it means user wants to remove it
        if ((q as any)._passage && !('_passage' in updatedQuestion)) {
          // If original question had _passage but updatedQuestion doesn't have it,
          // it means user deleted it, so remove it from merged
          delete (merged as any)._passage;
        } else if ('_passage' in updatedQuestion && (updatedQuestion as any)._passage === undefined) {
          // If _passage is explicitly set to undefined in updatedQuestion, remove it
          delete (merged as any)._passage;
        }
        
        return merged;
      }
      return q;
    }));
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

  // Helper function to normalize audio URL (convert filePath to full URL if needed)
  const normalizeAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Convert filePath to full URL
    return `${config.storagePublicUrl}${url.startsWith('/') ? url : '/' + url}`;
  };

  const deriveAnswerVisibility = (
    settings?: AssignmentQuestionData["settings"]
  ): "immediately" | "after_due_date" | "never" => {
    if (!settings) return "after_due_date";
    if (settings.showAnswersAfterSubmission) return "immediately";
    if (settings.showAnswersAfterDueDate) return "after_due_date";
    return "never";
  };

  const buildQuestionDataPayload = ({
    questions: sourceQuestions,
    audioFileUrls,
    timeLimitMinutes: timeLimit,
    isAutoGradable: autoGradable,
    answerVisibility,
  }: BuildQuestionDataArgs): AssignmentQuestionData | null => {
    if (sourceQuestions.length === 0) return null;

    const sortedQuestions = [...sourceQuestions].sort((a, b) => a.order - b.order);

    let readingPassage: string | undefined;
    let audioUrl: string | undefined;

    const passageCounts = new Map<string, number>();
    const audioCounts = new Map<string, number>();

    const processedQuestions = sortedQuestions.map((q) => {
      const question = { ...q };

      if ((question as any)._audioFile && audioFileUrls) {
        const uploadedUrl = audioFileUrls.get((question as any)._audioFile);
        if (uploadedUrl) {
          (question as any)._audioUrl = uploadedUrl;
          question.reference = uploadedUrl;
        }
      } else {
        const existingAudio = (question as any)._audioUrl || question.reference;
        if (existingAudio) {
          const normalizedAudio = normalizeAudioUrl(existingAudio);
          if (normalizedAudio) {
            (question as any)._audioUrl = normalizedAudio;
            question.reference = normalizedAudio;
          }
        }
      }

      const passage = (question as any)._passage;
      const audio = (question as any)._audioUrl || question.reference;

      if (passage && passage.trim()) {
        passageCounts.set(passage.trim(), (passageCounts.get(passage.trim()) || 0) + 1);
      }
      if (audio) {
        audioCounts.set(audio, (audioCounts.get(audio) || 0) + 1);
      }

      const { _audioFile, ...cleanedQ } = question as any;
      if (!cleanedQ._passage || !cleanedQ._passage.trim()) {
        delete cleanedQ._passage;
      }
      return cleanedQ;
    });

    if (passageCounts.size > 0) {
      readingPassage = Array.from(passageCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    }
    if (audioCounts.size > 0) {
      const mostCommonAudio = Array.from(audioCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
      audioUrl = normalizeAudioUrl(mostCommonAudio);
    }

    return {
      version: "1.0",
      questions: processedQuestions,
      settings: {
        ...(timeLimit !== undefined && { timeLimitMinutes: timeLimit }),
        isAutoGradable: autoGradable,
        showAnswersAfterSubmission: answerVisibility === "immediately",
        showAnswersAfterDueDate: answerVisibility === "after_due_date",
      },
      ...(readingPassage && { readingPassage }),
      ...(audioUrl && {
        media: {
          audioUrl,
        },
      }),
    };
  };

  const generateQuestionData = (audioFileUrls?: Map<File, string>): AssignmentQuestionData | null =>
    buildQuestionDataPayload({
      questions,
      audioFileUrls,
      timeLimitMinutes,
      isAutoGradable,
      answerVisibility,
    });

  const serializeQuestionData = (data: AssignmentQuestionData): string => {
    const normalizedQuestions = data.questions.map((question) => {
      const normalized = { ...question };
      if (normalized.reference) {
        normalized.reference = normalizeAudioUrl(normalized.reference) || normalized.reference;
      }
      return normalized;
    });

    const normalizedMedia = data.media
      ? {
          ...data.media,
          ...(data.media.audioUrl && {
            audioUrl: normalizeAudioUrl(data.media.audioUrl) || data.media.audioUrl,
          }),
        }
      : undefined;

    const payload: Record<string, unknown> = {
      version: data.version,
      questions: normalizedQuestions,
      settings: data.settings,
    };

    if (data.readingPassage) {
      payload.readingPassage = data.readingPassage;
    }

    if (normalizedMedia) {
      payload.media = normalizedMedia;
    }

    return JSON.stringify(payload);
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
            dueAt: new Date(dueDate).toISOString(),
            skillID: selectedSkillId || null,
            assignmentType: assignmentType,
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
          
          // Clear draft from localStorage on successful submission
          const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
          localStorage.removeItem(draftKey);
          
          onOpenChange(false);
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueAt: new Date(dueDate).toISOString(),
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
          dueAt: new Date(dueDate).toISOString(),
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
          
          // Clear draft from localStorage on successful submission
          const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
          localStorage.removeItem(draftKey);
          
          onOpenChange(false);
          // Trigger refresh by calling onSubmit callback
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueAt: new Date(dueDate).toISOString(),
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

        // Collect unique audio files from questions
        const audioFiles = new Set<File>();
        for (const q of questions) {
          if ((q as any)._audioFile) {
            audioFiles.add((q as any)._audioFile);
          }
        }

        // Upload audio files and get URLs
        const audioFileUrls = new Map<File, string>();
        if (audioFiles.size > 0) {
          try {
            for (const audioFile of audioFiles) {
              // Get presigned URL for audio upload using the new API
              const fileName = audioFile.name;
              const audioUrlResponse = await getAudioUploadUrl(fileName);
              const audioUrlData = audioUrlResponse.data;

              if (audioUrlData && typeof audioUrlData === 'object' && 'uploadUrl' in audioUrlData && 'publicUrl' in audioUrlData) {
                const { uploadUrl, publicUrl } = audioUrlData as { uploadUrl: string; publicUrl: string };
                
                // Upload audio file to presigned URL
                const uploadResponse = await uploadToPresignedUrl(uploadUrl, audioFile, audioFile.type || "audio/mpeg");
                
                if (!uploadResponse.ok) {
                  throw new Error(`Audio file upload failed: ${uploadResponse.status}`);
                }

                // Use the publicUrl directly from API response
                audioFileUrls.set(audioFile, publicUrl);
              } else {
                throw new Error("Failed to get upload URL for audio file");
              }
            }
          } catch (error) {
            console.error("Error uploading audio files:", error);
            showError("Failed to upload audio files. Please try again.");
            return;
          }
        }

        const questionData = generateQuestionData(audioFileUrls);
        if (!questionData) {
          showError("Failed to generate question data");
          return;
        }

        // Serialize question data to JSON string
        const questionJson = serializeQuestionData(questionData);

        if (isEditMode) {
          // Update existing quiz assignment
          if (!editAssignment?.assignmentId) {
            showError("Assignment ID is missing");
            return;
          }
          
          // Generate updated question JSON with normalized URLs
          const updatedQuestionJson = questionJson;

          const questionJsonChanged = !originalQuestionJson || updatedQuestionJson !== originalQuestionJson;

          let newQuestionFilePath: string | null = null;

          if (questionJsonChanged) {
            const jsonFileName = `quiz-assignment-${editAssignment.assignmentId}.json`;
            const uploadUrlResponse = await getQuestionJsonUploadUrl(jsonFileName);
            const uploadUrlData = uploadUrlResponse.data;

            if (
              uploadUrlData &&
              typeof uploadUrlData === "object" &&
              "uploadUrl" in uploadUrlData &&
              "filePath" in uploadUrlData
            ) {
              const { uploadUrl, filePath } = uploadUrlData as { uploadUrl: string; filePath: string };

              const jsonUploadResponse = await uploadJsonToPresignedUrl(uploadUrl, updatedQuestionJson);

              if (!jsonUploadResponse.ok) {
                throw new Error(`JSON upload failed with status: ${jsonUploadResponse.status}`);
              }

              newQuestionFilePath = filePath;
            }
          }
          
          // Update basic assignment info with new question file path
          const updateData: any = {
            id: editAssignment.assignmentId,
            title,
            description: description || "",
            dueAt: new Date(dueDate).toISOString(),
            skillID: selectedSkillId || null,
            assignmentType: assignmentType,
          };
          
          // Include question file path: prefer newly uploaded path, otherwise keep original.
          const questionUrlToPersist = newQuestionFilePath || initialQuestionUrl;
          if (questionUrlToPersist) {
            updateData.questionUrl = questionUrlToPersist;
          }
          
          await updateAssignment(editAssignment.assignmentId, updateData);
          
          success("Quiz assignment updated successfully!");
          
          // Clear draft from localStorage on successful submission
          const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
          localStorage.removeItem(draftKey);
          
          onOpenChange(false);
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueAt: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: questionData,
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
          dueAt: new Date(dueDate).toISOString(),
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
          
          // Clear draft from localStorage on successful submission
          const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
          localStorage.removeItem(draftKey);
          
          onOpenChange(false);
          // Trigger refresh by calling onSubmit callback
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueAt: new Date(dueDate).toISOString(),
              skillID: selectedSkillId,
              assignmentType,
              totalPoints,
              timeLimitMinutes,
              maxAttempts,
              isAutoGradable,
              answerVisibility,
              questionData: questionData,
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
            ...(timeLimitMinutes !== undefined && { timeLimitMinutes }),
            maxRetries: timeLimitMinutes ? Math.floor(timeLimitMinutes * 60 / questions.length) : undefined,
            allowMultipleRecordings,
            maxRecordings,
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
            dueAt: new Date(dueDate).toISOString(),
            skillID: selectedSkillId || null,
            assignmentType: assignmentType,
          };
          
          await updateAssignment(editAssignment.assignmentId, updateData);
          
          // Note: Question data update for Speaking assignments requires backend support
          // For now, we'll just update the basic info
          // TODO: Implement question JSON update when backend supports it
          success("Speaking assignment updated successfully! (Note: Question data update requires backend support)");
          
          // Clear draft from localStorage on successful submission
          const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
          localStorage.removeItem(draftKey);
          
          onOpenChange(false);
          if (onSubmit) {
            onSubmit({
              title,
              description: description || "",
              dueAt: new Date(dueDate).toISOString(),
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
                  ...(timeLimitMinutes !== undefined && { timeLimitMinutes }),
                  allowMultipleRecordings,
                  maxRecordings,
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
          dueAt: new Date(dueDate).toISOString(),
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
            
            // Clear draft from localStorage on successful submission
            const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
            localStorage.removeItem(draftKey);
            
            onOpenChange(false);
            // Trigger refresh by calling onSubmit callback
            if (onSubmit) {
              onSubmit({
                title,
                description: description || "",
                dueAt: new Date(dueDate).toISOString(),
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

  // Auto-save draft function (used by both manual and auto-save)
  const saveDraftToLocalStorage = useCallback(() => {
    try {
      // Save all assignment data to localStorage
      const draftData = {
        title,
        description,
        dueDate,
        selectedSkillId,
        assignmentType,
        questions,
        totalPoints,
        timeLimitMinutes,
        maxAttempts,
        isAutoGradable,
        answerVisibility,
        allowBackNavigation,
        showProgress,
        showQuestionNumbers,
        autoSubmit,
        allowMultipleRecordings,
        maxRecordings,
        classMeetingId,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage with a unique key
      const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      return true;
    } catch (error) {
      console.error("Error saving draft:", error);
      return false;
    }
  }, [title, description, dueDate, selectedSkillId, assignmentType, questions, totalPoints, timeLimitMinutes, maxAttempts, isAutoGradable, answerVisibility, allowBackNavigation, showProgress, showQuestionNumbers, autoSubmit, maxRecordings, classMeetingId]);

  const handleSaveDraft = async () => {
    const saved = saveDraftToLocalStorage();
    if (saved) {
      success("Assignment saved as draft!");
    } else {
      showError("Failed to save draft. Please try again.");
    }
    
    // Original speaking assignment handling (keeping for reference, but draft is already saved above)
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
            allowMultipleRecordings,
            maxRecordings,
            ...(timeLimitMinutes !== undefined && { timeLimitMinutes }),
          },
          media: {
            images: [],
          },
        };
        
        const speakingAssignmentData = {
          classMeetingId: classMeetingId || "",
          teacherId,
          title,
          description,
          dueAt: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
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
        dueAt: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
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
              onImportQuestions={handleImportQuestions}
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
              isSpeakingAssignment={selectedSkill?.name === "Speaking"}
              maxRecordings={maxRecordings}
              onMaxRecordingsChange={setMaxRecordings}
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

    {/* Draft Confirmation Dialog */}
    <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Load Saved Draft?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {pendingDraftData && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Found a saved draft from <strong>{new Date(pendingDraftData.savedAt).toLocaleString()}</strong>.
              </p>
              <p className="text-sm text-gray-600">
                Would you like to continue from where you left off?
              </p>
              {pendingDraftData.title && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Draft Title:</p>
                  <p className="text-sm text-blue-700">{pendingDraftData.title}</p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              // User declined to load draft, clear it
              if (pendingDraftData) {
                const draftKey = `assignment_draft_${classMeetingId || 'new'}`;
                localStorage.removeItem(draftKey);
              }
              setShowDraftDialog(false);
              setPendingDraftData(null);
            }}
          >
            Start Fresh
          </Button>
          <Button
            onClick={() => {
              if (pendingDraftData) {
                loadDraftData(pendingDraftData);
                setShowDraftDialog(false);
                setPendingDraftData(null);
              }
            }}
          >
            Continue Editing
          </Button>
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

    </>
  );
}

