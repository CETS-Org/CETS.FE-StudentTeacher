import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Send,
  ArrowLeft,
  Headphones,
  BookOpen,
  PenTool,
  MessageSquare,
  Play,
  Pause,
  Mic,
  FileText,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { api, apiClient } from "@/api";
import { getQuestionDataUrl } from "@/api/assignments.api";
import { getStudentId } from "@/lib/utils";
import { config } from "@/lib/config";
import type { Question, AssignmentQuestionData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import { submitSpeakingAssignment, validateSpeakingSubmission } from "./components/SpeakingAssignmentSubmission";

// Refactored hooks
import { useAssignmentTimer } from "./hooks/useAssignmentTimer";
import { useQuestionAudio } from "./hooks/useQuestionAudio";
import { useAutoSave } from "./hooks/useAutoSave";

// Refactored components
import AssignmentHeader from "./components/AssignmentHeader";
import ProgressIndicator from "./components/ProgressIndicator";
import QuestionRenderer from "./components/QuestionRenderer";
import ScoreResultDialog from "./components/ScoreResultDialog";

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  skillID: string | null;
  skillName: string | null;
  assignmentType?: string | null;
  totalPoints: number;
  timeLimitMinutes?: number;
  maxAttempts: number;
  questionDataUrl?: string;
  isAutoGradable: boolean;
  showAnswersAfterSubmission: boolean;
  showAnswersAfterDueDate: boolean;
}

interface StudentAnswer {
  questionId: string;
  answer: any;
  timestamp?: string;
}

export default function StudentAssignmentTaking() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const studentId = getStudentId();
  
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionData, setQuestionData] = useState<AssignmentQuestionData | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialTimeLimit, setInitialTimeLimit] = useState<number | null>(null); // Store initial time limit
  const [showTimeWarning, setShowTimeWarning] = useState(false); // Show warning when time is running out
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [submissionScore, setSubmissionScore] = useState<{
    score: number;
    totalPoints: number;
    earnedPoints: number;
    totalQuestions: number;
    correctAnswers: number;
    answeredQuestions: number;
  } | null>(null);
  const [showReadingPassage, setShowReadingPassage] = useState(true); // Default to showing passage
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0); // Track current passage for multi-passage reading
  const [allowMultipleRecordings, setAllowMultipleRecordings] = useState(true); // Default to true for speaking
  const [maxRecordings, setMaxRecordings] = useState(3);
  
  // Store recordings per question
  interface QuestionRecording {
    recordings: Array<{ id: string; blobUrl: string; duration: number; timestamp: Date }>;
    selectedId: string | null;
    recordingTime: number;
    currentBlobUrl: string | null;
  }
  const [questionRecordings, setQuestionRecordings] = useState<Record<string, QuestionRecording>>({});

  // Use refactored hooks
  const { timeRemaining, isTimerRunning, startTimer, stopTimer, formatTime } = useAssignmentTimer({
    timeLimitMinutes: assignment?.timeLimitMinutes,
    onTimeUp: () => {
      setShowTimeWarning(true);
      handleSubmit(true); // Force submit when time is up
    }
  });

  const { questionAudioPlaying, questionAudioRefs, toggleQuestionAudio, normalizeAudioUrl } = useQuestionAudio();

  const { lastSaved, isSaving, triggerSave } = useAutoSave({
    enabled: !submitting && !loading,
    intervalMs: 30000,
    onSave: async () => {
      // Auto-save logic will be implemented here
      console.log("Auto-saving progress...");
    }
  });

  // Load assignment data
  useEffect(() => {
    const loadAssignment = async () => {
      if (!assignmentId || !studentId) {
        setError("Missing assignment ID or student ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch assignment details
        const assignmentResponse = await api.getAssignmentById(assignmentId);
        const assignmentData = assignmentResponse.data;
        
        setAssignment({
          id: assignmentData.id,
          title: assignmentData.title,
          description: assignmentData.description || "",
          dueAt: assignmentData.dueAt,
          skillID: assignmentData.skillID,
          skillName: assignmentData.skillName,
          assignmentType: assignmentData.assignmentType || null,
          totalPoints: assignmentData.totalPoints || 0,
          timeLimitMinutes: assignmentData.timeLimitMinutes,
          maxAttempts: assignmentData.maxAttempts || 1,
          questionDataUrl: assignmentData.questionUrl,
          isAutoGradable: assignmentData.isAutoGradable || false,
          showAnswersAfterSubmission: assignmentData.showAnswersAfterSubmission || false,
          showAnswersAfterDueDate: assignmentData.showAnswersAfterDueDate || false,
        });

        // Load question data if QuestionUrl exists (quiz assignment)
        let questionDataTimeLimit: number | undefined = undefined;
        if (assignmentData.questionUrl) {
          try {
            // Normalize question URL (add base URL if needed)
            // Get presigned URL for question data
            const questionUrlResponse = await getQuestionDataUrl(assignmentId);
            const presignedUrl = questionUrlResponse.data.questionDataUrl;
            
            // Fetch question data using presigned URL
            const questionResponse = await fetch(presignedUrl);
            const questionData: AssignmentQuestionData = await questionResponse.json();
            setQuestionData(questionData);
            
            // Process questions: assign passage to questions
            // Priority: 1) question._passage, 2) question.readingPassage, 3) questionData.readingPassage
            const processedQuestions = (questionData.questions || []).map((q: any) => {
              // If question already has _passage, keep it (for multiple passages)
              if (q._passage) {
                return q;
              }
              // If question has readingPassage field, use it as _passage
              if (q.readingPassage) {
                return { ...q, _passage: q.readingPassage };
              }
              // If questionData has readingPassage at top level, assign it to question
              if (questionData.readingPassage) {
                return { ...q, _passage: questionData.readingPassage };
              }
              return q;
            });
            
            console.log("QuestionData:", {
              hasReadingPassage: !!questionData.readingPassage,
              readingPassage: questionData.readingPassage?.substring(0, 50) + "...",
              questionsCount: processedQuestions.length
            });
            console.log("Processed questions with passages:", processedQuestions.map((q: any) => ({
              id: q.id,
              hasPassage: !!(q._passage || q.readingPassage),
              passage: (q._passage || q.readingPassage || "none")?.substring(0, 50) + "..."
            })));
            
            // Log correctAnswer from JSON for verification
            console.log("Questions with correctAnswer from JSON:", processedQuestions.map((q: any) => ({
              id: q.id,
              type: q.type,
              hasCorrectAnswer: q.correctAnswer !== undefined && q.correctAnswer !== null,
              correctAnswer: q.correctAnswer,
              points: q.points
            })));
            
            setQuestions(processedQuestions);
            
            // Load settings
            if (questionData.settings) {
              if (questionData.settings.allowMultipleRecordings !== undefined) {
                setAllowMultipleRecordings(questionData.settings.allowMultipleRecordings);
              }
              if (questionData.settings.maxRecordings !== undefined) {
                setMaxRecordings(questionData.settings.maxRecordings);
              }
              // Get timeLimitMinutes from question data settings if available
              if (questionData.settings.timeLimitMinutes !== undefined) {
                questionDataTimeLimit = questionData.settings.timeLimitMinutes;
              }
            }
          } catch (err) {
            console.error("Failed to load question data:", err);
            setError("Failed to load assignment questions");
          }
        }

        // Initialize timer if time limit exists
        // Priority: question data settings > assignment-level timeLimitMinutes
        const timeLimitToUse = questionDataTimeLimit ?? assignmentData.timeLimitMinutes;
        if (timeLimitToUse) {
          const timeInSeconds = timeLimitToUse * 60;
          setInitialTimeLimit(timeInSeconds); // Store initial time limit for progress calculation
          startTimer(); // Start the timer using the hook
        }

      } catch (err: any) {
        console.error("Failed to load assignment:", err);
        setError(err.response?.data?.message || err.message || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId, studentId]);

  // Cleanup audio refs on unmount
  useEffect(() => {
    return () => {
      // Stop and cleanup all question audio players
      Object.values(questionAudioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      questionAudioRefs.current = {};
    };
  }, []);

  // Show warning when less than 5 minutes remaining
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining <= 300 && timeRemaining > 0 && !showTimeWarning) {
      setShowTimeWarning(true);
    }
  }, [timeRemaining, showTimeWarning]);
  
  // Auto-hide warning after 10 seconds
  useEffect(() => {
    if (showTimeWarning) {
      const timer = setTimeout(() => {
        setShowTimeWarning(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showTimeWarning]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const interval = setInterval(() => {
        saveAnswers();
      }, 30000); // Auto-save every 30 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [answers]);

  const saveAnswers = async () => {
    if (!assignmentId || !studentId) return;
    
    try {
      // Save answers to localStorage as backup
      localStorage.setItem(`assignment_${assignmentId}_answers`, JSON.stringify(answers));
      // lastSaved is now managed by useAutoSave hook
    } catch (err) {
      console.error("Failed to save answers:", err);
    }
  };

  const handleTimeUp = () => {
    alert("Time is up! Your assignment will be automatically submitted.");
    handleSubmit(true);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Navigate to a question by finding its index in the questions array
  const navigateToQuestion = (questionId: string) => {
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
    }
  };

  // Calculate detailed score information for display
  // Always calculate score if there are auto-gradable questions (multiple choice, true/false, fill in the blank, matching)
  const calculateDetailedScore = (forceCalculate: boolean = false) => {
    // Check if there are any auto-gradable questions (questions that don't require manual grading)
    const hasAutoGradableQuestions = questions.some(q => !q.requiresManualGrading && q.correctAnswer !== undefined && q.correctAnswer !== null);
    
    // If no auto-gradable questions and not forcing, return null
    if (!forceCalculate && !hasAutoGradableQuestions) {
      return null;
    }

    if (questions.length === 0) {
      return null;
    }

    let totalScore = 0; // Points earned by student
    let totalPoints = 0; // Total points available
    let answeredCount = 0; // Questions answered by student
    let correctCount = 0; // Questions answered correctly
    // Only count questions that don't require manual grading
    const totalQuestions = questions.filter(q => !q.requiresManualGrading).length;

    console.log('📋 Starting score calculation based on JSON format:', {
      totalQuestionsInAssignment: questions.length,
      autoGradableQuestions: totalQuestions,
      questionsWithAnswers: Object.keys(answers).length
    });

    questions.forEach((question) => {
      const questionPoints = question.points || 0;
      // Add to total points only if question doesn't require manual grading
      if (!question.requiresManualGrading) {
        totalPoints += questionPoints;
      }
      
      const studentAnswer = answers[question.id];
      // Get correctAnswer directly from question object (loaded from JSON)
      const correctAnswer = question.correctAnswer;

      // Log for debugging
      console.log(`Grading question ${question.id}:`, {
        type: question.type,
        studentAnswer,
        correctAnswer,
        hasCorrectAnswer: correctAnswer !== undefined && correctAnswer !== null
      });

      if (question.requiresManualGrading) {
        console.log(`Question ${question.id} requires manual grading, skipping`);
        return;
      }

      // Check if correctAnswer exists in JSON
      if (correctAnswer === undefined || correctAnswer === null) {
        console.warn(`Question ${question.id} does not have correctAnswer in JSON, skipping auto-grading`);
        return;
      }

      if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") {
        console.log(`Question ${question.id} has no answer from student, skipping`);
        return;
      }

      answeredCount++;
      let isCorrect = false;

      switch (question.type) {
        case "multiple_choice":
          // For multiple choice, correctAnswer should be the option ID
          isCorrect = studentAnswer === correctAnswer;
          console.log(`Question ${question.id} (multiple_choice): ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`, {
            student: studentAnswer,
            correct: correctAnswer
          });
          break;
        case "true_false":
          // For true/false, correctAnswer can be boolean or string
          const studentBool = studentAnswer === true || studentAnswer === "true" || studentAnswer === "True" || studentAnswer === "TRUE";
          const correctBool = correctAnswer === true || correctAnswer === "true" || correctAnswer === "True" || correctAnswer === "TRUE";
          isCorrect = studentBool === correctBool;
          console.log(`Question ${question.id} (true_false): ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`, {
            student: studentAnswer,
            correct: correctAnswer,
            studentBool,
            correctBool
          });
          break;
        case "fill_in_the_blank":
          // For fill in the blank, check blanks array first, then fallback to correctAnswer
          if (question.blanks && question.blanks.length > 0) {
            if (typeof studentAnswer === "string") {
              const blank = question.blanks[0];
              const normalizedStudent = blank.caseSensitive 
                ? studentAnswer.trim() 
                : studentAnswer.trim().toLowerCase();
              isCorrect = blank.correctAnswers.some(correct => {
                const normalizedCorrect = blank.caseSensitive 
                  ? correct.trim() 
                  : correct.trim().toLowerCase();
                return normalizedStudent === normalizedCorrect;
              });
            }
          } else if (correctAnswer !== undefined && correctAnswer !== null) {
            // Fallback: use correctAnswer from JSON if blanks array is not available
            const normalizedStudent = String(studentAnswer).trim().toLowerCase();
            const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
            isCorrect = normalizedStudent === normalizedCorrect;
          }
          console.log(`Question ${question.id} (fill_in_the_blank): ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`, {
            student: studentAnswer,
            correct: correctAnswer,
            hasBlanks: !!(question.blanks && question.blanks.length > 0)
          });
          break;
        case "matching":
          // For matching, use correctMatches from question.matching
          if (question.matching && question.matching.correctMatches) {
            const studentMatches = studentAnswer;
            const correctMatches = question.matching.correctMatches;
            if (typeof studentMatches === "object" && studentMatches !== null) {
              const allCorrect = correctMatches.every((correctMatch: any) => {
                return studentMatches[correctMatch.left] === correctMatch.right;
              });
              const studentMatchCount = Object.keys(studentMatches).length;
              const correctMatchCount = correctMatches.length;
              isCorrect = allCorrect && studentMatchCount === correctMatchCount;
            }
          }
          console.log(`Question ${question.id} (matching): ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}`);
          break;
        default:
          console.log(`Question ${question.id} has unsupported type: ${question.type}, skipping`);
          return;
      }

      if (isCorrect) {
        totalScore += questionPoints;
        correctCount++;
        console.log(`✓ Question ${question.id} is CORRECT! Earned ${questionPoints} points`);
      } else {
        console.log(`✗ Question ${question.id} is INCORRECT. No points earned.`);
      }
    });

    if (totalPoints > 0) {
      // Calculate score on 0-10 scale: (earned points / total points) * 10
      const percentageScore = (totalScore / totalPoints) * 10;
      const finalScore = Math.round(percentageScore * 100) / 100;
      
      console.log('📊 Detailed Score Calculation Summary:', {
        totalQuestions,
        answeredQuestions: answeredCount,
        correctAnswers: correctCount,
        earnedPoints: totalScore,
        totalPoints,
        percentage: `${((totalScore / totalPoints) * 100).toFixed(2)}%`,
        finalScore: `${finalScore}/10`
      });
      
      return {
        score: finalScore,
        totalPoints,
        earnedPoints: totalScore,
        totalQuestions,
        correctAnswers: correctCount,
        answeredQuestions: answeredCount,
      };
    }

    console.warn('⚠️ No total points available, cannot calculate score');
    return null;
  };

  // Calculate score for auto-gradable assignments (reading/listening)
  // forceCalculate: if true, calculate score even if isAutoGradable is false (for reading/listening)
  const calculateScore = (forceCalculate: boolean = false): number | null => {
   
    if (questions.length === 0) {
      console.log('No questions found, cannot calculate score');
      return null;
    }

    let totalScore = 0;
    let totalPoints = 0;
    let answeredCount = 0;
    let correctCount = 0;

    console.log('Starting score calculation...', {
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(answers).length
    });

    questions.forEach((question) => {
      const questionPoints = question.points || 0;
      // Add to total points only if question doesn't require manual grading
      if (!question.requiresManualGrading) {
        totalPoints += questionPoints;
      }
      
      const studentAnswer = answers[question.id];
      // Get correctAnswer directly from question object (loaded from JSON file)
      // Format: For multiple_choice, correctAnswer is the option ID (e.g., "opt-2-b")
      const correctAnswer = question.correctAnswer;

      // Skip if question requires manual grading
      if (question.requiresManualGrading) {
        console.log(`Question ${question.id} requires manual grading, skipping`);
        return;
      }

      // Check if correctAnswer exists in JSON
      if (correctAnswer === undefined || correctAnswer === null) {
        console.warn(`Question ${question.id} does not have correctAnswer in JSON, skipping auto-grading`);
        return;
      }

      // Skip if no answer provided
      if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") {
        console.log(`Question ${question.id} has no answer, skipping`);
        return;
      }

      answeredCount++;
      let isCorrect = false;

      switch (question.type) {
        case "multiple_choice":
          // Compare option ID
          isCorrect = studentAnswer === correctAnswer;
          console.log(`Question ${question.id} (multiple_choice): ${isCorrect ? 'CORRECT' : 'INCORRECT'}`, {
            student: studentAnswer,
            correct: correctAnswer
          });
          break;

        case "true_false":
          // Compare boolean value (handle both boolean and string)
          const studentBool = studentAnswer === true || studentAnswer === "true" || studentAnswer === "True";
          const correctBool = correctAnswer === true || correctAnswer === "true" || correctAnswer === "True";
          isCorrect = studentBool === correctBool;
          console.log(`Question ${question.id} (true_false): ${isCorrect ? 'CORRECT' : 'INCORRECT'}`, {
            student: studentAnswer,
            correct: correctAnswer
          });
          break;

        case "fill_in_the_blank":
          // Check if answer matches any of the correct answers
          if (question.blanks && question.blanks.length > 0) {
            // For fill-in-the-blank with multiple blanks, studentAnswer should be an array or object
            // For single blank, it's a string
            if (typeof studentAnswer === "string") {
              const blank = question.blanks[0];
              const normalizedStudent = blank.caseSensitive 
                ? studentAnswer.trim() 
                : studentAnswer.trim().toLowerCase();
              isCorrect = blank.correctAnswers.some(correct => {
                const normalizedCorrect = blank.caseSensitive 
                  ? correct.trim() 
                  : correct.trim().toLowerCase();
                return normalizedStudent === normalizedCorrect;
              });
            }
          } else if (correctAnswer) {
            // Fallback: compare with correctAnswer if blanks array is not available
            const normalizedStudent = String(studentAnswer).trim().toLowerCase();
            const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
            isCorrect = normalizedStudent === normalizedCorrect;
          }
          console.log(`Question ${question.id} (fill_in_the_blank): ${isCorrect ? 'CORRECT' : 'INCORRECT'}`, {
            student: studentAnswer,
            correct: correctAnswer
          });
          break;

        case "matching":
          // Compare matching pairs
          if (question.matching && question.matching.correctMatches) {
            const studentMatches = studentAnswer; // Should be an object like { leftId: rightId }
            const correctMatches = question.matching.correctMatches;
            
            if (typeof studentMatches === "object" && studentMatches !== null) {
              // Check if all correct matches are present in student answer
              const allCorrect = correctMatches.every((correctMatch: any) => {
                return studentMatches[correctMatch.left] === correctMatch.right;
              });
              
              // Also check that student didn't add extra incorrect matches
              const studentMatchCount = Object.keys(studentMatches).length;
              const correctMatchCount = correctMatches.length;
              
              isCorrect = allCorrect && studentMatchCount === correctMatchCount;
            }
          }
          console.log(`Question ${question.id} (matching): ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
          break;

        case "short_answer":
        case "essay":
        case "speaking":
          // These require manual grading, skip auto-grading
          console.log(`Question ${question.id} (${question.type}) requires manual grading, skipping`);
          return;

        default:
          // Unknown question type, skip
          console.log(`Question ${question.id} has unknown type: ${question.type}, skipping`);
          return;
      }

      if (isCorrect) {
        totalScore += questionPoints;
        correctCount++;
      }
    });

    // Calculate percentage score (0-10 scale)
    let finalScore: number | null = null;
    if (totalPoints > 0) {
      const percentageScore = (totalScore / totalPoints) * 10;
      finalScore = Math.round(percentageScore * 100) / 100; // Round to 2 decimal places
      
      console.log('Score calculation completed:', {
        totalPoints,
        totalScore,
        answeredCount,
        correctCount,
        finalScore: `${finalScore}/10`
      });
    } else {
      console.log('No points available, returning 0');
      finalScore = 0;
    }

    return finalScore;
  };

  // Convert blob URL to blob for submission
  const getAudioBlob = async (questionId?: string): Promise<Blob | null> => {
    // Import blobStorage dynamically to avoid circular dependency
    const { blobStorage, getPersistedBlob } = await import('./components/SpeakingAssignment');
    
    // If questionId is provided, get the recording for that specific question
    if (questionId && questionRecordings[questionId]) {
      const questionRec = questionRecordings[questionId];
      const selectedRecording = questionRec.recordings.find(r => r.id === questionRec.selectedId);
      if (selectedRecording) {
        // Get blob from persistent storage
        const storageKey = `${questionId}-${selectedRecording.id}`;
        const blob =
          blobStorage.get(storageKey) ||
          getPersistedBlob(questionId, selectedRecording.id);
        if (blob) {
          return blob;
        }
        // Fallback: try to fetch from URL
        try {
          const response = await fetch(selectedRecording.blobUrl);
          return await response.blob();
        } catch (err) {
          console.error('Failed to convert audio URL to blob:', err);
          return null;
        }
      }
      // Fallback to currentBlobUrl for single recording mode
      const storageKey = `${questionId}-current`;
      const blob =
        blobStorage.get(storageKey) ||
        getPersistedBlob(questionId, "current");
      if (blob) {
        return blob;
      }
      // Fallback: try to fetch from URL
      if (questionRec.currentBlobUrl) {
        try {
          const response = await fetch(questionRec.currentBlobUrl);
          return await response.blob();
        } catch (err) {
          console.error('Failed to convert audio URL to blob:', err);
          return null;
        }
      }
    }
    
    return null;
  };

  const handleSubmit = async (autoSubmit: boolean = false) => {
    // Check if speaking assignment requires audio recording
    // Check by skillName, assignmentType, or if there are speaking questions
    const isSpeakingAssignment = 
      assignment?.skillName?.toLowerCase().includes("speaking") ||
      assignment?.assignmentType?.toLowerCase() === "speaking" ||
      questions.some(q => q.type === "speaking");
    
    // Validate speaking assignment before submission (skip validation if auto-submitting due to time up)
    if (isSpeakingAssignment && !autoSubmit) {
      const validation = validateSpeakingSubmission(questions, questionRecordings, allowMultipleRecordings);
      if (!validation.isValid) {
        alert(validation.errorMessage);
        return;
      }
    }

    if (!autoSubmit) {
      setShowSubmitDialog(true);
      return;
    }

    if (!assignmentId) {
      alert("Assignment ID is missing. Please try again.");
      return;
    }

    if (!studentId) {
      alert("Student ID is missing. Please login again.");
      return;
    }

    if (!studentId) {
      alert("Student ID is missing. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare answers array
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        timestamp: new Date().toISOString(),
      }));

      // Calculate score for auto-gradable assignments (reading/listening)
      const calculatedScore = calculateScore();
      
      // Check if assignment is reading or listening
      const skillName = assignment?.skillName?.toLowerCase() || '';
      const isReading = skillName.includes('reading');
      const isListening = skillName.includes('listening');
      const isReadingOrListening = isReading || isListening;
      
      console.log('Submitting assignment:', {
        skillName: assignment?.skillName,
        isReading,
        isListening,
        calculatedScore
      });

      // Prepare submission data according to SubmitAssignmentRequest from backend controller
      const submissionData: any = {
        assignmentID: assignmentId,
        studentID: studentId,
      };

      // For reading/listening assignments, include answers as JSON file
      if (isReadingOrListening) {
        submissionData.fileName = 'answers.json';
        submissionData.contentType = 'application/json';
        
        // Include question data for grading purposes (especially for reading assignments)
        const submissionContent = {
          submittedAt: new Date().toISOString(),
          answers: answersArray,
          questions: questions, // Include question data for grading view
        };
        
        submissionData.content = JSON.stringify(submissionContent);
      } else {
        // For other assignments (writing, etc.), include fileName and content
        submissionData.fileName = 'answers.json';
        submissionData.contentType = 'application/json';
        submissionData.content = JSON.stringify(answersArray);
      }

      // Add score if calculated (for reading/listening assignments)
      // Backend expects decimal? (nullable decimal), so we send as number
      if (calculatedScore !== null && calculatedScore !== undefined) {
        submissionData.score = calculatedScore;
        console.log(`✅ Including calculated score in submission: ${calculatedScore}/10`);
      } else {
        console.log('⚠️ No score calculated (assignment may not be auto-gradable or no questions answered)');
        // For reading/listening, we should still try to calculate score even if isAutoGradable is false
        if (isReadingOrListening && questions.length > 0) {
          console.log('⚠️ Attempting to calculate score for reading/listening assignment...');
          // Force calculate score for reading/listening even if isAutoGradable is false
          const forceCalculatedScore = calculateScore(true);
          if (forceCalculatedScore !== null && forceCalculatedScore !== undefined) {
            submissionData.score = forceCalculatedScore;
            console.log(`✅ Force calculated score: ${forceCalculatedScore}/10`);
          }
        }
      }

      // Log final payload before sending
      console.log('📤 Final submission payload:', JSON.stringify(submissionData, null, 2));
      console.log('📤 Payload includes score:', 'score' in submissionData ? `Yes (${submissionData.score})` : 'No');

      // Handle speaking assignment submission separately
      if (isSpeakingAssignment) {
        // Handle speaking assignment submission using dedicated component
        await submitSpeakingAssignment({
          assignmentId,
          studentId,
          questions,
          answers,
          questionRecordings,
          allowMultipleRecordings,
          getAudioBlob,
          forceSubmit: autoSubmit, // Force submit when time is up
          onSuccess: () => {
            // Calculate detailed score for popup display (even for speaking if there are auto-gradable questions)
            const detailedScore = calculateDetailedScore(true); // Force calculate to check for any auto-gradable questions
            
            if (detailedScore) {
              setSubmissionScore(detailedScore);
              setShowScoreDialog(true);
            } else {
              alert("Assignment submitted successfully!");
              navigate(-1);
            }
          },
          onError: (errorMessage) => {
            alert(errorMessage);
          }
        });
      } else {
        // Submit via API using the correct endpoint (/api/ACAD_Submissions/submit)
        const response = await api.submitAssignment(submissionData);
        
        // If we have an uploadUrl, upload the content to Cloudflare
        if (response?.data?.uploadUrl && submissionData.content) {
          const uploadResponse = await fetch(response.data.uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': submissionData.contentType || 'application/json',
            },
            body: submissionData.content,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text().catch(() => '');
            throw new Error(`Failed to upload file to Cloudflare: ${uploadResponse.status} ${uploadResponse.statusText} ${errorText}`);
          }
          
          console.log('✅ Successfully uploaded answers file to Cloudflare R2');
        }
        
        // Check if backend returned a score in the response
        let backendScore: number | null = null;
        if (response?.data?.score !== undefined && response?.data?.score !== null) {
          backendScore = typeof response.data.score === 'number' ? response.data.score : parseFloat(response.data.score);
        }
        
        // Calculate detailed score for popup display
        // Always try to calculate score if there are auto-gradable questions
        // Check if assignment has any auto-gradable questions (multiple choice, true/false, fill in the blank, matching)
        const hasAutoGradableQuestions = questions.some(q => 
          !q.requiresManualGrading && 
          q.correctAnswer !== undefined && 
          q.correctAnswer !== null &&
          (q.type === "multiple_choice" || q.type === "true_false" || q.type === "fill_in_the_blank" || q.type === "matching")
        );
        
        // Calculate detailed score (always try if there are auto-gradable questions)
        let detailedScore = calculateDetailedScore(hasAutoGradableQuestions || assignment?.isAutoGradable || isReadingOrListening);
        
        // If backend returned a score, use it to update the detailed score
        if (backendScore !== null && detailedScore) {
          // Update the score with backend value, but keep other details from calculation
          detailedScore = {
            ...detailedScore,
            score: backendScore
          };
        } else if (backendScore !== null && !detailedScore) {
          // If backend returned score but we couldn't calculate detailed score, create a basic score object
          const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
          detailedScore = {
            score: backendScore,
            totalPoints: totalPoints || 10,
            earnedPoints: (backendScore / 10) * (totalPoints || 10),
            totalQuestions: questions.length,
            correctAnswers: Math.round((backendScore / 10) * questions.length),
            answeredQuestions: Object.keys(answers).length,
          };
        }
        
        // Show score popup if score was calculated or returned from backend
        if (detailedScore) {
          setSubmissionScore(detailedScore);
          setShowScoreDialog(true);
        } else {
          // If no score, just show success and navigate
          alert("Assignment submitted successfully!");
          navigate(-1);
        }
      }
    } catch (err: any) {
      console.error("Failed to submit assignment:", err);
      alert(err.response?.data?.message || err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    handleSubmit(true);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    saveAnswers();
    navigate(-1);
  };

  // Get audio URL for a question (helper function)
  const getQuestionAudioUrl = (question: Question): string | null => {
    const audioUrl = (question as any)._audioUrl || question.reference;
    if (!audioUrl) return null;
    // If already a full URL, return as is
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }
    // Convert filePath to full URL
    return `${config.storagePublicUrl}${audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl}`;
  };

  // Memoized callback for recording updates to prevent infinite loops
  const handleRecordingUpdateForQuestion = useCallback((questionId: string) => {
    return (data: any) => {
      setQuestionRecordings(prev => ({
        ...prev,
        [questionId]: data
      }));
    };
  }, []);

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    const questionAudioUrl = getQuestionAudioUrl(question);

    return (
      <QuestionRenderer
        question={question}
        answer={answer}
        onAnswerChange={(answer: any) => handleAnswerChange(question.id, answer)}
        skillType={assignment?.skillName || ""}
        questionRecordings={questionRecordings}
        allowMultipleRecordings={allowMultipleRecordings}
        maxRecordings={maxRecordings}
        onRecordingUpdate={handleRecordingUpdateForQuestion}
        questionAudioUrl={questionAudioUrl || undefined}
        questionAudioPlaying={questionAudioPlaying}
        toggleQuestionAudio={toggleQuestionAudio}
        normalizeAudioUrl={normalizeAudioUrl}
      />
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-neutral-600">{error || "Assignment not found"}</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Check if current question has a recording
  const currentQ = questions[currentQuestionIndex];
  const currentQuestionRec = currentQ ? questionRecordings[currentQ.id] : null;
  const hasRecording = currentQuestionRec ? (
    allowMultipleRecordings 
      ? (currentQuestionRec.selectedId && currentQuestionRec.recordings.length > 0)
      : !!currentQuestionRec.currentBlobUrl
  ) : false;

  const isSpeaking = assignment?.skillName?.toLowerCase().includes("speaking") || false;
  // If no questions and it's not a speaking assignment, show error
  if (questions.length === 0 && !isSpeaking) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">No Questions</h2>
          <p className="text-neutral-600">This assignment doesn't have any questions yet.</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Group questions by passage for reading assignments
  const groupQuestionsByPassage = () => {
    const passageGroups = new Map<string, Question[]>();
    const questionsWithoutPassage: Question[] = [];

    questions.forEach((q) => {
      // Check for passage in multiple possible fields
      const passage = (q as any)._passage || (q as any).readingPassage || null;
      if (passage && passage.trim()) {
        const passageKey = passage.trim();
        if (!passageGroups.has(passageKey)) {
          passageGroups.set(passageKey, []);
        }
        passageGroups.get(passageKey)!.push(q);
      } else {
        questionsWithoutPassage.push(q);
      }
    });

    // Convert to array sorted by first question order
    const passages = Array.from(passageGroups.entries()).map(([passage, qs]) => ({
      passage,
      questions: qs.sort((a, b) => a.order - b.order),
      firstQuestionOrder: Math.min(...qs.map(q => q.order)),
    })).sort((a, b) => a.firstQuestionOrder - b.firstQuestionOrder);

    return { passages, questionsWithoutPassage };
  };

  // Get current question and its passage group
  const getCurrentQuestionContext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return { currentQuestion: null, passage: null, passageQuestions: [], questionIndexInPassage: 0 };

    const { passages, questionsWithoutPassage } = groupQuestionsByPassage();
    
    // Find which passage this question belongs to
    for (const passageGroup of passages) {
      const indexInPassage = passageGroup.questions.findIndex(q => q.id === currentQuestion.id);
      if (indexInPassage !== -1) {
        return {
          currentQuestion,
          passage: passageGroup.passage,
          passageQuestions: passageGroup.questions,
          questionIndexInPassage: indexInPassage,
        };
      }
    }

    // Question doesn't belong to any passage
    return {
      currentQuestion,
      passage: null,
      passageQuestions: [currentQuestion],
      questionIndexInPassage: 0,
    };
  };

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const answeredCount = Object.keys(answers).length;
  const isWriting = assignment?.skillName?.toLowerCase().includes("writing") || false;
  const isReading = assignment?.skillName?.toLowerCase().includes("reading") || false;
  
  const { passages, questionsWithoutPassage } = groupQuestionsByPassage();
  const hasMultiplePassages = passages.length > 1 || (passages.length > 0 && questionsWithoutPassage.length > 0);
  const currentContext = getCurrentQuestionContext();

  // Debug logs
  console.log("Assignment info:", {
    isReading,
    skillName: assignment.skillName,
    passagesCount: passages.length,
    questionsWithoutPassageCount: questionsWithoutPassage.length,
    totalQuestions: questions.length
  });
  console.log("Passages:", passages.map(p => ({
    passage: p.passage?.substring(0, 50) + "...",
    questionsCount: p.questions.length
  })));

  return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <AssignmentHeader
          title={assignment.title}
          skillName={assignment.skillName}
          lastSaved={lastSaved}
          isSaving={isSaving}
          onBack={() => navigate(-1)}
          onSave={saveAnswers}
          onSubmit={() => handleSubmit(false)}
          canSubmit={!submitting}
        />

        {/* Time Warning Banner */}
        {showTimeWarning && timeRemaining !== null && timeRemaining < 300 && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border-2 ${
            timeRemaining < 60 
              ? "bg-red-500 text-white border-red-600 animate-pulse" 
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${timeRemaining < 60 ? "animate-bounce" : ""}`} />
              <div className="flex-1">
                <p className="font-semibold">
                  {timeRemaining < 60 
                    ? "⚠️ CRITICAL: Less than 1 minute remaining!" 
                    : "⚠️ Warning: Less than 5 minutes remaining!"}
                </p>
                <p className="text-sm mt-1 opacity-90">
                  {timeRemaining < 60 
                    ? "Your assignment will be automatically submitted when time expires. Please save your work!" 
                    : "Please make sure to save your answers. Your assignment will be automatically submitted when time expires."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeWarning(false)}
                className="text-current opacity-75 hover:opacity-100 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-full xl:max-w-screen-2xl mx-auto">
            {/* Check if reading assignment with passages - show paginated view */}
            { passages.length > 0 ? (
              // Reading Assignment with Multiple Passages - One Passage Per Page
              (() => {
                const currentPassage = passages[currentPassageIndex];
                if (!currentPassage) return null;

                const handleNextPassage = () => {
                  if (currentPassageIndex < passages.length - 1) {
                    const nextPassageIndex = currentPassageIndex + 1;
                    const nextPassage = passages[nextPassageIndex];
                    setCurrentPassageIndex(nextPassageIndex);
                    // Navigate to first question of next passage
                    if (nextPassage && nextPassage.questions.length > 0) {
                      const nextPassageFirstQuestionIndex = questions.findIndex(q => q.id === nextPassage.questions[0].id);
                      if (nextPassageFirstQuestionIndex !== -1) {
                        setCurrentQuestionIndex(nextPassageFirstQuestionIndex);
                      }
                    }
                  }
                };

                const handlePreviousPassage = () => {
                  if (currentPassageIndex > 0) {
                    const prevPassageIndex = currentPassageIndex - 1;
                    const prevPassage = passages[prevPassageIndex];
                    setCurrentPassageIndex(prevPassageIndex);
                    // Navigate to first question of previous passage
                    if (prevPassage && prevPassage.questions.length > 0) {
                      const prevPassageFirstQuestionIndex = questions.findIndex(q => q.id === prevPassage.questions[0].id);
                      if (prevPassageFirstQuestionIndex !== -1) {
                        setCurrentQuestionIndex(prevPassageFirstQuestionIndex);
                      }
                    }
                  }
                };

                return (
                  <div className="space-y-6">
                    {/* Passage and Questions Card */}
                    <Card className="p-6">
                      <div className="flex lg:flex-row flex-col gap-6">
                        {/* Left: Reading Passage */}
                        <div className="lg:w-[50%]">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-primary-800">
                              Passage {currentPassageIndex + 1} of {passages.length}
                            </h2>
                            <span className="text-sm text-neutral-600">
                              {currentPassage.questions.length} question{currentPassage.questions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {/* Reading Passage with scroll */}
                          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                            <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed text-sm">
                              {currentPassage.passage}
                            </div>
                          </div>
                        </div>

                        {/* Right: Questions for this Passage */}
                        <div className="lg:w-[50%] space-y-4">
                          {(() => {
                            // Find current question index within this passage
                            const currentQuestionInPassageIndex = currentPassage.questions.findIndex(
                              q => currentQuestion && q.id === currentQuestion.id
                            );
                            
                            // Default to first question if current question is not in this passage
                            const displayQuestionIndex = currentQuestionInPassageIndex >= 0 
                              ? currentQuestionInPassageIndex 
                              : 0;
                            
                            const displayQuestion = currentPassage.questions[displayQuestionIndex];
                            if (!displayQuestion) return null;
                            
                            const globalIndex = questions.findIndex(q => q.id === displayQuestion.id);
                            const isAnswered = answers[displayQuestion.id] !== undefined && 
                                             answers[displayQuestion.id] !== null && 
                                             answers[displayQuestion.id] !== "";
                            
                            // Handlers for navigating within passage questions
                            const handleNextQuestionInPassage = () => {
                              if (displayQuestionIndex < currentPassage.questions.length - 1) {
                                const nextQuestion = currentPassage.questions[displayQuestionIndex + 1];
                                const nextGlobalIndex = questions.findIndex(q => q.id === nextQuestion.id);
                                if (nextGlobalIndex !== -1) {
                                  setCurrentQuestionIndex(nextGlobalIndex);
                                }
                              }
                            };
                            
                            const handlePreviousQuestionInPassage = () => {
                              if (displayQuestionIndex > 0) {
                                const prevQuestion = currentPassage.questions[displayQuestionIndex - 1];
                                const prevGlobalIndex = questions.findIndex(q => q.id === prevQuestion.id);
                                if (prevGlobalIndex !== -1) {
                                  setCurrentQuestionIndex(prevGlobalIndex);
                                }
                              }
                            };
                            
                            const handleQuestionSelect = (qIndex: number) => {
                              const selectedQuestion = currentPassage.questions[qIndex];
                              const selectedGlobalIndex = questions.findIndex(q => q.id === selectedQuestion.id);
                              if (selectedGlobalIndex !== -1) {
                                setCurrentQuestionIndex(selectedGlobalIndex);
                              }
                            };
                            
                            return (
                              <div className="space-y-4">
                                {/* Current Question Display */}
                                <div className="p-4 rounded-lg border-1 border-gray-200 bg-white shadow-md bg-white">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium text-primary-600">
                                        Question {globalIndex + 1} of {questions.length}
                                        {currentPassage.questions.length > 1 && (
                                          <span className="text-neutral-500 ml-2">
                                            (Question {displayQuestionIndex + 1}/{currentPassage.questions.length} in this passage)
                                          </span>
                                        )}
                                      </span>
                                      <span className="ml-2 text-sm text-neutral-500">
                                        ({displayQuestion.points} point{displayQuestion.points !== 1 ? 's' : ''})
                                      </span>
                                    </div>
                                    {isAnswered && (
                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                        Answered
                                      </span>
                                    )}
                                  </div>

                                  <div className="mb-4">
                                    {renderQuestion(displayQuestion)}
                                  </div>
                                </div>
                                
                                {/* Navigation Buttons */}
                                {currentPassage.questions.length > 1 && (
                                  <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                                    <Button
                                      variant="secondary"
                                      onClick={handlePreviousQuestionInPassage}
                                      disabled={displayQuestionIndex === 0}
                                    >
                                      Previous
                                    </Button>
                                    <Button
                                      variant="primary"
                                      onClick={handleNextQuestionInPassage}
                                      disabled={displayQuestionIndex === currentPassage.questions.length - 1}
                                    >
                                      Next
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Question Number List */}
                                {currentPassage.questions.length > 1 && (
                                  <div className="pt-4 border-t border-neutral-200">
                                    <p className="text-sm font-medium text-neutral-700 mb-3">
                                      Questions in this passage:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {currentPassage.questions.map((q, qIndex) => {
                                        const qGlobalIndex = questions.findIndex(qu => qu.id === q.id);
                                        const qIsAnswered = answers[q.id] !== undefined && 
                                                          answers[q.id] !== null && 
                                                          answers[q.id] !== "";
                                        const qIsCurrent = qIndex === displayQuestionIndex;
                                        
                                        return (
                                          <button
                                            key={q.id}
                                            onClick={() => handleQuestionSelect(qIndex)}
                                            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                              qIsCurrent
                                                ? "bg-primary-600 text-white"
                                                : qIsAnswered
                                                ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                                                : "bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200"
                                            }`}
                                          >
                                            {qGlobalIndex + 1}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </Card>

                    {/* Progress and Passage Navigation */}
                    <Card className="p-6 border-primary-200">
                      <ProgressIndicator
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        answeredCount={answeredCount}
                        timeRemaining={timeRemaining}
                        formatTime={formatTime}
                      />
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200">
                        <div className="text-sm text-neutral-700">
                          Passage {currentPassageIndex + 1} of {passages.length}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={handlePreviousPassage}
                            disabled={currentPassageIndex === 0}
                          >
                            Previous Passage
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleNextPassage}
                            disabled={currentPassageIndex === passages.length - 1}
                          >
                            Next Passage
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })()
            ) : (
              // Standard Layout - Check if reading with single passage to show 3-column layout
              (() => {
                // Check if we have a reading passage (either in questionData or in current question)
                const hasReadingPassage = questionData?.readingPassage || (currentQuestion as any)?._passage;
                
                if (hasReadingPassage && isReading) {
                  // Reading Assignment with Single Passage - Three Column Layout
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                      {/* Left Sidebar - Question Navigation */}
                      <div className="xl:col-span-2">
                        <Card className="p-4">
                          <h3 className="font-semibold text-sm text-neutral-700 mb-3">
                            Questions ({answeredCount}/{questions.length})
                          </h3>
                          <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-2 gap-2">
                            {questions.map((q, index) => {
                              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "";
                              const isCurrent = index === currentQuestionIndex;
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => handleQuestionClick(index)}
                                  className={`p-2 rounded text-sm font-medium transition-colors ${
                                    isCurrent
                                      ? "bg-primary-600 text-white"
                                      : isAnswered
                                      ? "bg-green-100 text-green-700 border border-green-300"
                                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                  }`}
                                >
                                  Q{index + 1}
                                </button>
                              );
                            })}
                          </div>
                        </Card>
                      </div>

                      {/* Middle - Question Area */}
                      <div className="xl:col-span-6">
                        <Card className="p-6">
                          {/* Progress and Question Info */}
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-primary-600">
                                Question {currentQuestionIndex + 1} of {questions.length}
                              </span>
                              <span className="ml-2 text-sm text-neutral-500">
                                ({currentQuestion?.points || 0} point{(currentQuestion?.points || 0) !== 1 ? 's' : ''})
                              </span>
                            </div>
                            <div className="text-sm text-neutral-600 font-medium">
                              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                            </div>
                          </div>

                          {/* Question Text and Answer */}
                          {currentQuestion && (
                            <div className="mb-6">
                              {renderQuestion(currentQuestion)}
                            </div>
                          )}

                          {/* Navigation Buttons */}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <Button
                              variant="secondary"
                              onClick={handlePrevious}
                              disabled={currentQuestionIndex === 0}
                            >
                              Previous
                            </Button>
                            <div className="flex gap-2">
                              {/* <Button
                                variant="secondary"
                                onClick={saveAnswers}
                                iconLeft={<Save className="w-4 h-4" />}
                              >
                                Save Progress
                              </Button> */}
                              {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                  variant="primary"
                                  onClick={handleNext}
                                >
                                  Next
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  onClick={() => handleSubmit(false)}
                                  iconLeft={<Send className="w-4 h-4" />}
                                >
                                  Submit Assignment
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Right - Reading Passage */}
                      <div className="xl:col-span-4">
                        <Card className="p-4 sticky top-24 h-fit">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary-600" />
                              <h2 className="text-lg font-semibold text-neutral-800">Reading Passage</h2>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowReadingPassage(!showReadingPassage)}
                              iconLeft={showReadingPassage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            >
                              {showReadingPassage ? "Hide" : "Show"}
                            </Button>
                          </div>
                          {showReadingPassage && (
                            <div className="bg-white border border-neutral-200 rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                              <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed text-sm">
                                {questionData?.readingPassage || (currentQuestion as any)?._passage}
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                      </div>
                    
                      {/* Progress Indicator for Single Passage Layout */}
                      <Card className="p-6 border-primary-200">
                        <ProgressIndicator
                          currentQuestionIndex={currentQuestionIndex}
                          totalQuestions={questions.length}
                          answeredCount={answeredCount}
                          timeRemaining={timeRemaining}
                          formatTime={formatTime}
                        />
                      </Card>
                    </div>
                  );
                }

                // Standard Question Navigation Layout (for questions without passages)
                return (
                  <div className="space-y-6">
                    <Card className="p-6">
                      {currentQuestion && (() => {
                        const globalIndex = currentQuestionIndex;
                        const isAnswered = answers[currentQuestion.id] !== undefined && 
                                         answers[currentQuestion.id] !== null && 
                                         answers[currentQuestion.id] !== "";
                        
                        return (
                          <div className="space-y-4">
                            {/* Current Question Display */}
                            <div className="p-4 rounded-lg border-1 border-gray-200 bg-white shadow-md">
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-primary-600">
                                    Question {globalIndex + 1} of {questions.length}
                                  </span>
                                  <span className="ml-2 text-sm text-neutral-500">
                                    ({currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''})
                                  </span>
                                </div>
                                {isAnswered && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    Answered
                                  </span>
                                )}
                              </div>

                              <div className="mb-4">
                                {renderQuestion(currentQuestion)}
                              </div>
                            </div>
                            
                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                              <Button
                                variant="secondary"
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="primary"
                                onClick={handleNext}
                                disabled={currentQuestionIndex === questions.length - 1}
                              >
                                Next
                              </Button>
                            </div>
                            
                            {/* Question Number List */}
                            {questions.length > 1 && (
                              <div className="pt-4 border-t border-neutral-200">
                                <p className="text-sm font-medium text-neutral-700 mb-3">
                                  All Questions:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {questions.map((q, qIndex) => {
                                    const qIsAnswered = answers[q.id] !== undefined && 
                                                      answers[q.id] !== null && 
                                                      answers[q.id] !== "";
                                    const qIsCurrent = qIndex === currentQuestionIndex;
                                    
                                    return (
                                      <button
                                        key={q.id}
                                        onClick={() => handleQuestionClick(qIndex)}
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                          qIsCurrent
                                            ? "bg-primary-600 text-white"
                                            : qIsAnswered
                                            ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                                            : "bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200"
                                        }`}
                                      >
                                        {qIndex + 1}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card>

                    {/* Progress and Submit Section */}
                    <Card className="p-6 border-primary-200">
                      <ProgressIndicator
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        answeredCount={answeredCount}
                        timeRemaining={timeRemaining}
                        formatTime={formatTime}
                      />
                 
                    </Card>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-3">
                <p className="text-neutral-700">
                  Are you sure you want to submit this assignment? 
                  <br></br> 
                  You have answered {answeredCount} out of {questions.length} questions.
                </p>
                {answeredCount < questions.length && (
                  <p className="text-yellow-600 text-sm">
                    You have {questions.length - answeredCount} unanswered questions.
                  </p>
                )}
                {isSpeaking && hasRecording && (() => {
                  const pureSpeakingKey = "pure-speaking";
                  const questionRec = questionRecordings[pureSpeakingKey] || (currentQ ? questionRecordings[currentQ.id] : null);
                  const recTime = questionRec?.recordingTime || 0;
                  const mins = Math.floor(recTime / 60);
                  const secs = recTime % 60;
                  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Voice recording included ({formattedTime})
                      </p>
                    </div>
                  );
                })()}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmSubmit}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exit Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showExitDialog}
          onClose={() => setShowExitDialog(false)}
          onConfirm={confirmExit}
          title="Exit Assignment"
          message="Your progress will be saved. You can return to complete this assignment later."
          confirmText="Exit"
          cancelText="Continue"
        />

        {/* Score Result Dialog */}
        <ScoreResultDialog
          isOpen={showScoreDialog}
          onClose={() => {
            setShowScoreDialog(false);
            navigate(-1);
          }}
          submissionScore={submissionScore}
        />
      </div>
   
  );
}

