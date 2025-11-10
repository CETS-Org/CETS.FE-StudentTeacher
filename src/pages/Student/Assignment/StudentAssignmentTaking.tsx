import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import PageHeader from "@/components/ui/PageHeader";
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
  EyeOff
} from "lucide-react";
import { api, apiClient } from "@/api";
import { getStudentId } from "@/lib/utils";
import { config } from "@/lib/config";
import type { Question, QuestionType, AssignmentQuestionData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import MultipleChoiceQuestion from "./components/MultipleChoiceQuestion";
import TrueFalseQuestion from "./components/TrueFalseQuestion";
import FillInBlankQuestion from "./components/FillInBlankQuestion";
import ShortAnswerQuestion from "./components/ShortAnswerQuestion";
import EssayQuestion from "./components/EssayQuestion";
import MatchingQuestion from "./components/MatchingQuestion";

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  skillID: string | null;
  skillName: string | null;
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
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
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
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [questionAudioPlaying, setQuestionAudioPlaying] = useState<Record<string, boolean>>({});
  const [showReadingPassage, setShowReadingPassage] = useState(true); // Default to showing passage
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0); // Track current passage for multi-passage reading
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const questionAudioRefs = useRef<Record<string, HTMLAudioElement>>({});

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
          dueDate: assignmentData.dueDate,
          skillID: assignmentData.skillID,
          skillName: assignmentData.skillName,
          totalPoints: assignmentData.totalPoints || 0,
          timeLimitMinutes: assignmentData.timeLimitMinutes,
          maxAttempts: assignmentData.maxAttempts || 1,
          questionDataUrl: assignmentData.questionUrl,
          isAutoGradable: assignmentData.isAutoGradable || false,
          showAnswersAfterSubmission: assignmentData.showAnswersAfterSubmission || false,
          showAnswersAfterDueDate: assignmentData.showAnswersAfterDueDate || false,
        });

        // Load question data if URL exists
        if (assignmentData.questionUrl) {
          try {
            // Normalize question URL (add base URL if needed)
            let questionDataUrl = assignmentData.questionUrl;
            if (!questionDataUrl.startsWith('http://') && !questionDataUrl.startsWith('https://')) {
              // If it's a relative path, add storage public URL
              questionDataUrl = `${config.storagePublicUrl}${questionDataUrl.startsWith('/') ? questionDataUrl : '/' + questionDataUrl}`;
            }
            
            const questionResponse = await fetch(questionDataUrl);
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
          } catch (err) {
            console.error("Failed to load question data:", err);
            setError("Failed to load assignment questions");
          }
        }

        // Initialize timer if time limit exists
        if (assignmentData.timeLimitMinutes) {
          const timeInSeconds = assignmentData.timeLimitMinutes * 60;
          setTimeRemaining(timeInSeconds);
          setIsTimerRunning(true);
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

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const interval = setInterval(() => {
        saveAnswers();
      }, 30000); // Auto-save every 30 seconds
      setAutoSaveInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [answers]);

  const saveAnswers = async () => {
    if (!assignmentId || !studentId) return;
    
    try {
      // Save answers to localStorage as backup
      localStorage.setItem(`assignment_${assignmentId}_answers`, JSON.stringify(answers));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save answers:", err);
    }
  };

  const handleTimeUp = () => {
    alert("Time is up! Your assignment will be automatically submitted.");
    handleSubmit(true);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
  const calculateDetailedScore = (forceCalculate: boolean = false) => {
    if (!forceCalculate && !assignment?.isAutoGradable) {
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

  const handleSubmit = async (autoSubmit: boolean = false) => {
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
        calculatedScore,
        hasAudioBlob: !!audioBlob
      });

      // Prepare submission data according to SubmitAssignmentRequest from backend controller
      const submissionData: any = {
        assignmentID: assignmentId,
        studentID: studentId,
      };

      // For reading/listening assignments, fileName and content can be null
      if (isReadingOrListening) {
        submissionData.fileName = null;
        submissionData.contentType = null;
        submissionData.content = null;
      } else {
        // For other assignments (writing, speaking, etc.), include fileName and content
        submissionData.fileName = audioBlob ? 'recording.webm' : 'answers.json';
        submissionData.contentType = audioBlob ? 'audio/webm' : 'application/json';
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

      // If audioBlob exists, we need to handle it differently
      // For now, we'll send the answers as JSON content
      // Audio can be handled separately if needed via a different endpoint
      if (audioBlob) {
        // Convert audioBlob to base64 and include in content or handle separately
        // For now, we'll send answers as JSON and note that audio needs separate handling
        // You may need to upload audio first and then submit with the audio URL
        console.warn('Audio blob detected. Consider uploading audio separately first.');
      }

      // Submit via API using the correct endpoint (/api/ACAD_Submissions/submit)
      await api.submitAssignment(submissionData);
      
      // Calculate detailed score for popup display
      const detailedScore = calculateDetailedScore(isReadingOrListening);
      
      // Show score popup if score was calculated
      if (detailedScore) {
        setSubmissionScore(detailedScore);
        setShowScoreDialog(true);
      } else {
        // If no score, just show success and navigate
        alert("Assignment submitted successfully!");
        navigate(-1);
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

  // Helper function to normalize audio URL
  const normalizeAudioUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Convert filePath to full URL
    return `${config.storagePublicUrl}${url.startsWith('/') ? url : '/' + url}`;
  };

  // Get audio URL for a question
  const getQuestionAudioUrl = (question: Question): string | null => {
    const audioUrl = (question as any)._audioUrl || question.reference;
    if (!audioUrl) return null;
    return normalizeAudioUrl(audioUrl) || audioUrl;
  };

  // Toggle audio playback for a question
  const toggleQuestionAudio = (question: Question) => {
    const audioUrl = getQuestionAudioUrl(question);
    if (!audioUrl) return;

    const normalizedUrl = normalizeAudioUrl(audioUrl) || audioUrl;
    
    if (!questionAudioRefs.current[normalizedUrl]) {
      const audio = new Audio(normalizedUrl);
      questionAudioRefs.current[normalizedUrl] = audio;
      audio.onended = () => {
        setQuestionAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: false }));
      };
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        alert("Failed to load audio. Please check the audio URL.");
        setQuestionAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: false }));
      };
    }

    const audio = questionAudioRefs.current[normalizedUrl];
    if (questionAudioPlaying[normalizedUrl]) {
      audio.pause();
      audio.currentTime = 0;
      setQuestionAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: false }));
    } else {
      audio.play().catch((error) => {
        console.error("Audio play error:", error);
        alert("Failed to play audio. Please check the audio URL.");
      });
      setQuestionAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: true }));
    }
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    const questionAudioUrl = getQuestionAudioUrl(question);
    const commonProps = {
      question,
      answer,
      onAnswerChange: (answer: any) => handleAnswerChange(question.id, answer),
      skillType: assignment?.skillName || "",
    };

    let questionComponent;
    switch (question.type) {
      case "multiple_choice":
        questionComponent = <MultipleChoiceQuestion {...commonProps} />;
        break;
      case "true_false":
        questionComponent = <TrueFalseQuestion {...commonProps} />;
        break;
      case "fill_in_the_blank":
        questionComponent = <FillInBlankQuestion {...commonProps} />;
        break;
      case "short_answer":
        questionComponent = <ShortAnswerQuestion {...commonProps} />;
        break;
      case "essay":
        questionComponent = <EssayQuestion {...commonProps} />;
        break;
      case "matching":
        questionComponent = <MatchingQuestion {...commonProps} />;
        break;
      default:
        questionComponent = <div>Unknown question type</div>;
    }

    return (
      <div className="space-y-4">
        {/* Audio Player for Question */}
        {questionAudioUrl && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleQuestionAudio(question)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                title={questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? "Pause" : "Play"}
              >
                {questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    {questionAudioPlaying[normalizeAudioUrl(questionAudioUrl) || questionAudioUrl] ? "Playing audio..." : "Click to play audio for this question"}
                  </p>
                  {question.audioTimestamp && (
                    <p className="text-xs text-purple-600 mt-1">
                      Timestamp: {question.audioTimestamp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {questionComponent}
      </div>
    );
  };

  const getSkillIcon = (skillName: string | null) => {
    if (!skillName) return <FileText className="w-5 h-5" />;
    const skill = skillName.toLowerCase();
    if (skill.includes("listening")) return <Headphones className="w-5 h-5" />;
    if (skill.includes("reading")) return <BookOpen className="w-5 h-5" />;
    if (skill.includes("writing")) return <PenTool className="w-5 h-5" />;
    if (skill.includes("speaking")) return <MessageSquare className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </StudentLayout>
    );
  }

  if (error || !assignment) {
    return (
      <StudentLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
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
      </StudentLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <StudentLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
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
      </StudentLayout>
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

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isSpeaking = assignment.skillName?.toLowerCase().includes("speaking");
  const isWriting = assignment.skillName?.toLowerCase().includes("writing");
  const isReading = assignment.skillName?.toLowerCase().includes("reading");
  
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
    <StudentLayout>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExit}
                  iconLeft={<ArrowLeft className="w-4 h-4" />}
                >
                  Exit
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-primary-800">{assignment.title}</h1>
                  {assignment.skillName && (
                    <div className="flex items-center gap-2 mt-1">
                      {getSkillIcon(assignment.skillName)}
                      <span className="text-sm text-neutral-600">{assignment.skillName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                  </div>
                )}
                {lastSaved && (
                  <div className="text-xs text-neutral-500">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                <Button
                  variant="primary"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  iconLeft={submitting ? <Loader /> : <Send className="w-4 h-4" />}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>

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
                        <div className="lg:w-[40%]">
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
                        <div className="lg:w-[60%] space-y-4">
                          {currentPassage.questions.map((question, qIndex) => {
                            const globalIndex = questions.findIndex(q => q.id === question.id);
                            const isCurrent = question.id === currentQuestion.id;
                            const isAnswered = answers[question.id] !== undefined && answers[question.id] !== null && answers[question.id] !== "";
                            
                            return (
                              <div
                                key={question.id}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  isCurrent
                                    ? "border-primary-500 bg-white"
                                    : "border-neutral-200 bg-white"
                                }`}
                              >
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium text-primary-600">
                                      Question {globalIndex + 1} of {questions.length}
                                      {currentPassage.questions.length > 1 && (
                                        <span className="text-neutral-500 ml-2">
                                          (Question {qIndex + 1}/{currentPassage.questions.length})
                                        </span>
                                      )}
                                    </span>
                                    <span className="ml-2 text-sm text-neutral-500">
                                      ({question.points} point{question.points !== 1 ? 's' : ''})
                                    </span>
                                  </div>
                                  {isAnswered && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                      Answered
                                    </span>
                                  )}
                                </div>

                                <div className="mb-4">
                                  {renderQuestion(question)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>

                    {/* Passage Navigation */}
                    <Card className="p-4 bg-primary-50 border-primary-200">
                      <div className="flex justify-between items-center">
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
                          {currentPassageIndex < passages.length - 1 ? (
                            <Button
                              variant="primary"
                              onClick={handleNextPassage}
                            >
                              Next Passage
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
                                ({currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''})
                              </span>
                            </div>
                            <div className="text-sm text-neutral-600 font-medium">
                              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                            </div>
                          </div>

                          {/* Question Text and Answer */}
                          <div className="mb-6">
                            {renderQuestion(currentQuestion)}
                          </div>

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
                  );
                }

                // Standard Layout - Single Question View
                return (
                  <div className="space-y-6">
                    {/* Questions without passage (if any) */}
                    {questionsWithoutPassage.length > 0 && (
                      <Card className="p-6">
                        <div className="mb-6 pb-4 border-b border-neutral-200">
                          <h2 className="text-xl font-semibold text-primary-800">
                            Additional Questions
                          </h2>
                          <p className="text-sm text-neutral-600 mt-1">
                            {questionsWithoutPassage.length} question{questionsWithoutPassage.length !== 1 ? 's' : ''} without passage
                          </p>
                        </div>

                        <div className="space-y-6">
                          {questionsWithoutPassage.map((question) => {
                            const globalIndex = questions.findIndex(q => q.id === question.id);
                            const isCurrent = question.id === currentQuestion.id;
                            const isAnswered = answers[question.id] !== undefined && answers[question.id] !== null && answers[question.id] !== "";
                            
                            return (
                              <div
                                key={question.id}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  isCurrent
                                    ? "border-primary-500 bg-white"
                                    : "border-neutral-200 bg-white"
                                }`}
                              >
                                <div className="mb-4 flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium text-primary-600">
                                      Question {globalIndex + 1} of {questions.length}
                                    </span>
                                    <span className="ml-2 text-sm text-neutral-500">
                                      ({question.points} point{question.points !== 1 ? 's' : ''})
                                    </span>
                                  </div>
                                  {isAnswered && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                      Answered
                                    </span>
                                  )}
                                </div>

                                <div className="mb-4">
                                  {renderQuestion(question)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}

                    {/* Navigation and Submit Section */}
                    <Card className="p-6 bg-primary-50 border-primary-200">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-neutral-700">
                          Progress: {answeredCount} of {questions.length} questions answered
                        </div>
                        <div className="flex gap-2">
                          {/* <Button
                            variant="secondary"
                            onClick={saveAnswers}
                            iconLeft={<Save className="w-4 h-4" />}
                          >
                            Save Progress
                          </Button> */}
                          <Button
                            variant="primary"
                            onClick={() => handleSubmit(false)}
                            iconLeft={<Send className="w-4 h-4" />}
                          >
                            Submit Assignment
                          </Button>
                        </div>
                      </div>
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
              <p className="text-neutral-700">
                Are you sure you want to submit this assignment? You have answered {answeredCount} out of {questions.length} questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-yellow-600 mt-2 text-sm">
                  You have {questions.length - answeredCount} unanswered questions.
                </p>
              )}
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
        <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Assignment Submitted!</DialogTitle>
            </DialogHeader>
            <DialogBody>
              {submissionScore && (
                <div className="space-y-6 py-4">
                  {/* Score Display */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">
                          {submissionScore.score.toFixed(1)}
                        </div>
                        <div className="text-sm text-primary-100">out of 10</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mt-2">
                      {submissionScore.score >= 8 ? "Excellent!" : 
                       submissionScore.score >= 6 ? "Good Job!" : 
                       submissionScore.score >= 4 ? "Keep Trying!" : "Practice More!"}
                    </h3>
                  </div>

                  {/* Score Details */}
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Correct Answers:</span>
                      <span className="font-semibold text-green-600">
                        {submissionScore.correctAnswers} / {submissionScore.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Points Earned:</span>
                      <span className="font-semibold text-primary-600">
                        {submissionScore.earnedPoints} / {submissionScore.totalPoints}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Questions Answered:</span>
                      <span className="font-semibold text-neutral-800">
                        {submissionScore.answeredQuestions} / {submissionScore.totalQuestions}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-200">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600 font-medium">Final Score:</span>
                        <span className="text-xl font-bold text-primary-700">
                          {submissionScore.score.toFixed(2)} / 10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>Progress</span>
                      <span>{Math.round((submissionScore.score / 10) * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          submissionScore.score >= 8 ? "bg-green-500" :
                          submissionScore.score >= 6 ? "bg-blue-500" :
                          submissionScore.score >= 4 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${(submissionScore.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button 
                variant="primary" 
                onClick={() => {
                  setShowScoreDialog(false);
                  navigate(-1);
                }}
                className="w-full"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
}

