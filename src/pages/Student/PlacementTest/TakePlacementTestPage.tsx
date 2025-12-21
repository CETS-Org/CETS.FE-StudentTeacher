import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
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
  Eye,
  EyeOff,
  X,
  Play,
  Pause,
} from "lucide-react";
import {
  getRandomPlacementTestForStudent,
  submitPlacementTest,
  type PlacementTest,
  type PlacementQuestion,
} from "@/api/placementTest.api";
import { config } from "@/lib/config";
import { getStudentId } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import type { Question } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import QuestionRenderer from "../Assignment/components/QuestionRenderer";
import AssignmentHeader from "../Assignment/components/AssignmentHeader";
import ProgressIndicator from "../Assignment/components/ProgressIndicator";
import ScoreResultDialog from "../Assignment/components/ScoreResultDialog";

interface PlacementQuestionData {
  version: string;
  questions: Question[];
  settings?: {
    timeLimitMinutes?: number;
    isAutoGradable?: boolean;
    totalPoints?: number;
    showAnswersAfterSubmission?: boolean;
    showAnswersAfterDueDate?: boolean;
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

interface PlacementTestJsonQuestion {
  questionId: string;
  title: string;
  questionType: string;
  difficulty: number;
  data: PlacementQuestionData;
}

// Helper type để phân loại câu hỏi
type QuestionCategory = "single_mcq" | "passage" | "audio";

interface ProcessedQuestion {
  category: QuestionCategory;
  placementQuestion: PlacementQuestion;
  jsonQuestion: PlacementTestJsonQuestion;
  questions: any[]; // Danh sách câu hỏi con
  hasPassage: boolean;
  hasAudio: boolean;
}

// Helper functions để phân loại và xử lý câu hỏi
const categorizeQuestion = (jsonQuestion: PlacementTestJsonQuestion): QuestionCategory => {
  const questionType = jsonQuestion.questionType.toLowerCase();
  const hasReadingPassage = jsonQuestion.data.readingPassage && jsonQuestion.data.readingPassage.trim().length > 0;
  const hasMediaAudio = jsonQuestion.data.media?.audioUrl && jsonQuestion.data.media.audioUrl.trim().length > 0;
  
  // Kiểm tra _audioUrl trong questions
  const firstQuestion = jsonQuestion.data.questions[0] as any;
  const hasQuestionAudio = firstQuestion?._audioUrl || firstQuestion?.reference;

  if (questionType.includes("audio") || hasMediaAudio || hasQuestionAudio) {
    return "audio";
  }
  
  if (questionType.includes("passage") || hasReadingPassage) {
    return "passage";
  }
  
  // MCQ đơn: có 1 câu hỏi, không có passage, không có audio
  if (questionType.includes("multiple choice") && 
      jsonQuestion.data.questions.length === 1 &&
      !hasReadingPassage && 
      !hasMediaAudio &&
      !hasQuestionAudio) {
    return "single_mcq";
  }
  
  return "single_mcq"; // Default
};

const processPlacementQuestion = (
  jsonQuestion: PlacementTestJsonQuestion, 
  placementQuestion: PlacementQuestion
): ProcessedQuestion => {
  const category = categorizeQuestion(jsonQuestion);
  const questionData = jsonQuestion.data;
  
  // Process questions - giữ nguyên _passage và _audioUrl từ JSON
  const questionsList: any[] = (questionData.questions || []).map((q: any) => ({
    ...q,
    id: q.id || `q-${Date.now()}-${q.order}`,
    type: q.type || "multiple_choice",
    order: q.order || 0,
    question: q.question || "",
    points: q.points || 0,
    // Giữ nguyên _passage và _audioUrl nếu có trong JSON
    _passage: q._passage,
    _audioUrl: q._audioUrl || q.reference, // reference có thể là audioUrl
  }));

  // Lấy passage và audioUrl từ question đầu tiên (nếu có) để dùng cho sorting
  const firstQuestion = questionsList[0] as any;
  const hasPassage = firstQuestion?._passage && typeof firstQuestion._passage === 'string' && firstQuestion._passage.trim().length > 0;
  const hasAudio = firstQuestion?._audioUrl && typeof firstQuestion._audioUrl === 'string' && firstQuestion._audioUrl.trim().length > 0;

  return {
    category,
    placementQuestion,
    jsonQuestion,
    questions: questionsList,
    hasPassage,
    hasAudio,
  };
};

export default function TakePlacementTestPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const studentId = getStudentId();

  const [placementTest, setPlacementTest] = useState<PlacementTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionDataList, setQuestionDataList] = useState<
    Array<{ question: PlacementQuestion; data: PlacementQuestionData; questions: Question[] }>
  >([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimeLimit, setInitialTimeLimit] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track first load to prevent premature auto-submit
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
  const [showReadingPassage, setShowReadingPassage] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [questionAudioPlaying, setQuestionAudioPlaying] = useState<Record<string, boolean>>({});
  const [questionAudioPlayCount, setQuestionAudioPlayCount] = useState<Record<string, number>>({});
  const [questionAudioHasEnded, setQuestionAudioHasEnded] = useState<Record<string, boolean>>({});
  const [questionAudioProgress, setQuestionAudioProgress] = useState<Record<string, { currentTime: number; duration: number }>>({});
  const questionAudioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const passageRef = useRef<HTMLDivElement>(null);
  const [attemptLimitReached, setAttemptLimitReached] = useState(false);
  const [showLimitScoreDialog, setShowLimitScoreDialog] = useState(false);

  const TODAY_KEY = new Date().toISOString().split("T")[0];

  type AttemptRecord = {
    date: string;
    count: number;
    lastScore?: {
      score: number;
      totalPoints: number;
      earnedPoints: number;
      totalQuestions: number;
      correctAnswers: number;
      answeredQuestions: number;
    };
  };

  const getAttemptKey = (id: string | null) => `placement_attempts_${id || "guest"}`;

  const loadAttemptRecord = (): AttemptRecord | null => {
    if (!studentId) return null;
    try {
      const raw = localStorage.getItem(getAttemptKey(studentId));
      return raw ? (JSON.parse(raw) as AttemptRecord) : null;
    } catch (err) {
      console.error("Failed to parse placement attempt record", err);
      return null;
    }
  };

  const saveAttemptRecord = (scoreData: AttemptRecord["lastScore"]) => {
    if (!studentId) return;
    const key = getAttemptKey(studentId);
    const existing = loadAttemptRecord();
    let next: AttemptRecord;
    if (existing && existing.date === TODAY_KEY) {
      next = { ...existing, count: existing.count + 1, lastScore: scoreData || existing.lastScore };
    } else {
      next = { date: TODAY_KEY, count: 1, lastScore: scoreData };
    }
    localStorage.setItem(key, JSON.stringify(next));
  };

  const ensureAttemptLimit = useCallback(() => {
    const record = loadAttemptRecord();
    if (record && record.date === TODAY_KEY && record.count >= 3) {
      setAttemptLimitReached(true);
      if (record.lastScore) {
        setSubmissionScore(record.lastScore);
        setShowScoreDialog(true);
      }
    }
  }, [studentId]);
  
  // Maximum play count for listening questions (2 times)
  const MAX_AUDIO_PLAY_COUNT = 2;

  // Anti-cheat protection: activate when test is loaded and not submitted
  const isTestActive = !loading && !error && placementTest !== null && !submitting && !showScoreDialog;
  useAntiCheat(isTestActive);

  // Add extra protection for passage element
  useEffect(() => {
    if (!passageRef.current || !isTestActive) return;

    const passageElement = passageRef.current;

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    passageElement.addEventListener("selectstart", handleSelectStart);
    passageElement.addEventListener("copy", handleCopy);
    passageElement.addEventListener("cut", handleCut);
    passageElement.addEventListener("paste", handlePaste);
    passageElement.addEventListener("mousedown", handleMouseDown);
    passageElement.addEventListener("dragstart", handleDragStart);

    return () => {
      passageElement.removeEventListener("selectstart", handleSelectStart);
      passageElement.removeEventListener("copy", handleCopy);
      passageElement.removeEventListener("cut", handleCut);
      passageElement.removeEventListener("paste", handlePaste);
      passageElement.removeEventListener("mousedown", handleMouseDown);
      passageElement.removeEventListener("dragstart", handleDragStart);
    };
  }, [isTestActive]);

  // Load placement test data
  useEffect(() => {
    const loadPlacementTest = async () => {
      if (!studentId) {
        setError("Student ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch random placement test for student
        const response = await getRandomPlacementTestForStudent();
        const test = response.data;

        setPlacementTest(test);

        // ========================================
        // NEW FLOW: Load từ storeUrl (JSON tổng chứa tất cả questions)
        // ========================================
        // Thay vì load từng question URL riêng lẻ, giờ chỉ cần:
        // 1. Fetch 1 lần từ test.storeUrl
        // 2. Parse JSON để lấy tất cả questions
        // 3. Build UI từ JSON này
        // ========================================
        if (test.storeUrl) {
          try {
            // Build direct URL to cloud storage
            const storeUrl = test.storeUrl.startsWith("/")
              ? test.storeUrl
              : `/${test.storeUrl}`;
            const directUrl = `${config.storagePublicUrl}${storeUrl}`;

            const testJsonResponse = await fetch(directUrl);
            if (!testJsonResponse.ok) {
              throw new Error(`Failed to fetch placement test JSON: ${testJsonResponse.status}`);
            }

            const testJson = await testJsonResponse.json();
            
            // Parse questions from test JSON
            const testJsonQuestions: PlacementTestJsonQuestion[] = testJson.questions || [];
            
            // Process từng question theo category (single_mcq, passage, audio)
            const validResults = testJsonQuestions.map((jsonQuestion, index) => {
              // Find corresponding PlacementQuestion metadata from test.questions
              const placementQuestion = test.questions.find(q => q.id === jsonQuestion.questionId);
              if (!placementQuestion) {
                console.warn(`⚠️ PlacementQuestion not found for questionId: ${jsonQuestion.questionId}`);
                return null;
              }

              // Process question theo category
              const processed = processPlacementQuestion(jsonQuestion, placementQuestion);

              return {
                question: processed.placementQuestion,
                data: processed.jsonQuestion.data,
                questions: processed.questions,
                hasPassage: processed.hasPassage,
                hasAudio: processed.hasAudio,
                category: processed.category, // Để dễ filter và debug
              };
            }).filter((r): r is NonNullable<typeof r> => r !== null);

            // Sắp xếp: ưu tiên những câu hỏi không có passage lên đầu
            // Thứ tự: Reading không passage -> Reading có passage -> Listening không audio -> Listening có audio
            const sortedResults = validResults.sort((a, b) => {
              const getSortOrder = (
                result: { question: PlacementQuestion; data: PlacementQuestionData; questions: Question[]; hasPassage: boolean; hasAudio: boolean }
              ): number => {
                const skillType = result.question.skillType?.toLowerCase() || "";
                const questionType = result.question.questionType.toLowerCase();
                const difficulty = result.question.difficulty;
                const isReading = skillType.includes("reading");
                const isListening = skillType.includes("listening");
                
                // Normalize questionType: "multiple choice question" -> "mcq", "passage" -> "passage", "audio" -> "audio"
                const normalizedType = questionType.includes("multiple choice") || questionType.includes("mcq") 
                  ? "mcq" 
                  : questionType.includes("passage") 
                  ? "passage" 
                  : questionType.includes("audio") 
                  ? "audio" 
                  : questionType;
                
                // Sử dụng hasPassage và hasAudio đã tính sẵn
                const hasPassage = result.hasPassage;

                // Reading questions
                if (isReading) {
                  // 1. Reading không có passage (ưu tiên lên đầu)
                  if (!hasPassage) {
                    return 1;
                  }
                  // 2. Passage ngắn (difficulty = 2)
                  if (normalizedType === "passage" && difficulty === 2) {
                    return 2;
                  }
                  // 3. Passage dài (difficulty = 3)
                  if (normalizedType === "passage" && difficulty === 3) {
                    return 3;
                  }
                  return 4;
                }

                // Listening questions
                if (isListening) {
                  // 4. Listening multiple_choice (không phải audio)
                  if (normalizedType !== "audio" && !result.hasAudio) {
                    return 4;
                  }
                  // 5. Audio ngắn (difficulty = 2)
                  if (normalizedType === "audio" && difficulty === 2 && result.hasAudio) {
                    return 5;
                  }
                  // 6. Audio dài (difficulty = 3)
                  if (normalizedType === "audio" && difficulty === 3 && result.hasAudio) {
                    return 6;
                  }
                  return 7;
                }

                return 50;
              };

              const orderA = getSortOrder(a);
              const orderB = getSortOrder(b);
              
              // Nếu cùng order, giữ nguyên thứ tự từ test.questions
              if (orderA === orderB) {
                const indexA = test.questions.findIndex((q) => q.id === a.question.id);
                const indexB = test.questions.findIndex((q) => q.id === b.question.id);
                if (indexA !== -1 && indexB !== -1) {
                  return indexA - indexB;
                }
              }
              
              return orderA - orderB;
            });

            setQuestionDataList(sortedResults);

            // Flatten all questions from all question sets
            // Giữ nguyên thứ tự từ sortedResults (đã sắp xếp đúng theo yêu cầu)
            // Chỉ sắp xếp questions trong mỗi placement question group theo order
            const allQuestions: Question[] = [];
            sortedResults.forEach((result) => {
              // Sắp xếp questions trong mỗi group theo order để đảm bảo thứ tự đúng trong group
              const sortedGroupQuestions = [...result.questions].sort((a, b) => a.order - b.order);

              sortedGroupQuestions.forEach((q) => {
                // Passage và audioUrl đã có sẵn trong question object từ JSON
                // Chỉ cần attach context reference
                const questionWithContext = {
                  ...q,
                  // _passage và _audioUrl đã có trong q từ khi map questions
                  _questionDataResult: result, // Store reference to questionData result for context
                };
                allQuestions.push(questionWithContext);
              });
            });

            // KHÔNG sắp xếp lại allQuestions vì thứ tự đã đúng từ sortedResults
            setQuestions(allQuestions);
          } catch (err) {
            console.error("Error loading placement test JSON from storeUrl:", err);
            throw err;
          }
        } else {
          throw new Error("Placement test is missing storeUrl. Please contact administrator.");
        }

        // Initialize timer if duration exists
        if (test.durationMinutes) {
          const timeInSeconds = test.durationMinutes * 60;
          setInitialTimeLimit(timeInSeconds);
          
          // Load saved progress if available
          const savedProgressKey = `placement_test_${test.id}_answers`;
          const savedProgressStr = localStorage.getItem(savedProgressKey);
          const savedStartTime = localStorage.getItem(`placement_test_${test.id}_startTime`);
          
          if (savedProgressStr && savedStartTime) {
            try {
              const progressData = JSON.parse(savedProgressStr);
              
              // Restore answers
              if (progressData.answers) {
                setAnswers(progressData.answers);
              }
              
              // Restore current question index
              if (progressData.currentQuestionIndex !== undefined) {
                setCurrentQuestionIndex(progressData.currentQuestionIndex);
              }
              
              // Calculate elapsed time and restore remaining time
              const startTime = new Date(savedStartTime).getTime();
              const currentTime = new Date().getTime();
              const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
              const remainingTime = Math.max(0, timeInSeconds - elapsedSeconds);
              
              setTimeRemaining(remainingTime);
              
              // Only start timer if there's still time remaining
              if (remainingTime > 0) {
                setIsTimerRunning(true);
              } else {
                // Time is up - show expired state, auto-submit will be handled by useEffect after initial load
                setIsTimerRunning(false);
              }
            } catch (err) {
              console.error("Failed to load saved progress:", err);
              // Fallback to starting fresh
              setTimeRemaining(timeInSeconds);
              setIsTimerRunning(true);
            }
          } else {
            // No saved progress, start fresh
            const startTime = new Date().toISOString();
            localStorage.setItem(`placement_test_${test.id}_startTime`, startTime);
            setTimeRemaining(timeInSeconds);
            setIsTimerRunning(true);
          }
        } else {
          // Load saved progress even if no timer (for answers and question index)
          const savedProgressKey = `placement_test_${test.id}_answers`;
          const savedProgressStr = localStorage.getItem(savedProgressKey);
          
          if (savedProgressStr) {
            try {
              const progressData = JSON.parse(savedProgressStr);
              if (progressData.answers) {
                setAnswers(progressData.answers);
              }
              if (progressData.currentQuestionIndex !== undefined) {
                setCurrentQuestionIndex(progressData.currentQuestionIndex);
              }
            } catch (err) {
              console.error("Failed to load saved progress:", err);
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to load placement test:", err);
        setError(err.response?.data || err.message || "Failed to load placement test");
      } finally {
        setLoading(false);
      }
    };

    loadPlacementTest();
  }, [studentId]);

  // Enforce per-day attempt limit (3 per day)
  useEffect(() => {
    if (!placementTest || !studentId) return;
    ensureAttemptLimit();
  }, [placementTest, studentId, ensureAttemptLimit]);

  // Mark initial load as complete after questions are loaded
  useEffect(() => {
    if (!loading && questions.length > 0 && isInitialLoad) {
      // Give a small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, questions.length, isInitialLoad]);

  // Check if time expired (ONLY after initial load is complete)
  useEffect(() => {
    if (!loading && !isInitialLoad && timeRemaining !== null && timeRemaining <= 0 && !submitting && questions.length > 0) {
      // Time has expired, auto-submit
      handleSubmit(true);
    }
  }, [loading, isInitialLoad, timeRemaining, submitting, questions.length]);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            handleSubmit(true); // Auto-submit when time is up
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

  // Update audio progress periodically
  useEffect(() => {
    const updateProgress = () => {
      const progress: Record<string, { currentTime: number; duration: number }> = {};
      Object.entries(questionAudioRefs.current).forEach(([key, audio]) => {
        if (!audio.paused && !audio.ended) {
          progress[key] = {
            currentTime: audio.currentTime,
            duration: audio.duration || 0,
          };
        }
      });
      if (Object.keys(progress).length > 0) {
        setQuestionAudioProgress((prev) => ({ ...prev, ...progress }));
      }
    };

    audioProgressIntervalRef.current = setInterval(updateProgress, 100); // Update every 100ms

    return () => {
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
    };
  }, [questionAudioPlaying]);

  // Cleanup audio refs on unmount
  useEffect(() => {
    return () => {
      Object.values(questionAudioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      questionAudioRefs.current = {};
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((seconds: number | null): string => {
    if (seconds === null) {
      return "--:--";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const saveAnswers = async () => {
    try {
      setIsSaving(true);
      // Save answers to localStorage as backup
      if (placementTest) {
        const progressData = {
          answers,
          currentQuestionIndex,
          timeRemaining,
          startTime: localStorage.getItem(`placement_test_${placementTest.id}_startTime`) || new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`placement_test_${placementTest.id}_answers`, JSON.stringify(progressData));
        // Also save start time separately if not already saved
        if (!localStorage.getItem(`placement_test_${placementTest.id}_startTime`)) {
          localStorage.setItem(`placement_test_${placementTest.id}_startTime`, progressData.startTime);
        }
      }
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save answers:", err);
    } finally {
      setIsSaving(false);
    }
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

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const unansweredQuestions = totalQuestions - answeredQuestions;

  // Calculate score
  const calculateDetailedScore = (): {
    score: number;
    totalPoints: number;
    earnedPoints: number;
    totalQuestions: number;
    correctAnswers: number;
    answeredQuestions: number;
  } | null => {
    if (questions.length === 0) {
      return null;
    }

    let totalScore = 0;
    let totalPoints = 0;
    let answeredCount = 0;
    let correctCount = 0;

    questions.forEach((question) => {
      const questionPoints = question.points || 0;
      totalPoints += questionPoints;

      const studentAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;

      if (studentAnswer === undefined || studentAnswer === null || studentAnswer === "") {
        return;
      }

      answeredCount++;
      let isCorrect = false;

      switch (question.type) {
        case "multiple_choice":
          isCorrect = studentAnswer === correctAnswer;
          break;
        case "true_false":
          const studentBool = studentAnswer === true || studentAnswer === "true" || studentAnswer === "True";
          const correctBool = correctAnswer === true || correctAnswer === "true" || correctAnswer === "True";
          isCorrect = studentBool === correctBool;
          break;
        case "fill_in_the_blank":
          if (question.blanks && question.blanks.length > 0) {
            if (typeof studentAnswer === "string") {
              const blank = question.blanks[0];
              const normalizedStudent = blank.caseSensitive
                ? studentAnswer.trim()
                : studentAnswer.trim().toLowerCase();
              isCorrect = blank.correctAnswers.some((correct) => {
                const normalizedCorrect = blank.caseSensitive ? correct.trim() : correct.trim().toLowerCase();
                return normalizedStudent === normalizedCorrect;
              });
            }
          } else if (correctAnswer !== undefined && correctAnswer !== null) {
            const normalizedStudent = String(studentAnswer).trim().toLowerCase();
            const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
            isCorrect = normalizedStudent === normalizedCorrect;
          }
          break;
        case "matching":
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
          break;
        default:
          return;
      }

      if (isCorrect) {
        totalScore += questionPoints;
        correctCount++;
      }
    });

    if (totalPoints > 0) {
      // Return actual score (0-900) instead of converting to 10-point scale
      const finalScore = Math.round(totalScore * 100) / 100;

      return {
        score: finalScore,
        totalPoints,
        earnedPoints: totalScore,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        answeredQuestions: answeredCount,
      };
    }

    return null;
  };

  

  const handleSubmit = async (autoSubmit: boolean = false) => {
    if (attemptLimitReached) return;
    if (!autoSubmit) {
      setShowSubmitDialog(true);
      return;
    }

    if (!placementTest || !studentId) {
      showError("Test ID or Student ID is missing");
      return;
    }

    setSubmitting(true);
    try {
      // Calculate score
      const detailedScore = calculateDetailedScore();

      // Submit to backend
      const scoreToSubmit = detailedScore?.score || 0;
      await submitPlacementTest({
        studentId,
        placementTestId: placementTest.id,
        score: scoreToSubmit,
        answers,
      });

      // Hiển thị popup điểm sau khi submit
      const basicScore = {
        score: 0,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        earnedPoints: 0,
        totalQuestions: questions.length,
        correctAnswers: 0,
        answeredQuestions: Object.keys(answers).length,
      };

      const scoreToStore = detailedScore || basicScore;
      setSubmissionScore(scoreToStore);
      setShowScoreDialog(true);
      saveAttemptRecord(scoreToStore);
    } catch (err: any) {
      console.error("Failed to submit placement test:", err);
      
      // Handle rate limiting (429 Too Many Requests)
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.['retry-after'] || 60;
        showError(
          `Too many requests. Please wait ${retryAfter} seconds before submitting again. ` +
          `If you're testing, try waiting a bit longer between submissions.`
        );
      } else {
        showError(err.response?.data || err.message || "Failed to submit placement test");
      }
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
    // If daily limit is reached, no need to show confirmation dialog
    if (attemptLimitReached) {
      navigate(-1);
      return;
    }
    setShowExitDialog(true);
  };

  const confirmExit = async () => {
    await saveAnswers();
    navigate(-1);
  };

  // Get audio URL for a question
  const getQuestionAudioUrl = (question: Question): string | null => {
    const audioUrl = (question as any)._audioUrl || question.reference;
    if (!audioUrl) return null;
    if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
      return audioUrl;
    }
    return `${config.storagePublicUrl}${audioUrl.startsWith("/") ? audioUrl : "/" + audioUrl}`;
  };

  const normalizeAudioUrl = (url: string | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${config.storagePublicUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  // Format time for audio progress (mm:ss)
  const formatAudioTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleQuestionAudio = (question: Question & { audioUrl?: string }) => {
    if (!question.audioUrl) return;

    const normalizedUrl = normalizeAudioUrl(question.audioUrl);
    if (!normalizedUrl) return;

    const audioKey = normalizedUrl;
    const isPlaying = questionAudioPlaying[audioKey] || false;
    const playCount = questionAudioPlayCount[audioKey] || 0;

    if (isPlaying) {
      // Pause audio
      const audio = questionAudioRefs.current[audioKey];
      if (audio) {
        audio.pause();
      }
      setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: false }));
    } else {
      // Get or create audio element
      let audio = questionAudioRefs.current[audioKey];
      const hasEnded = questionAudioHasEnded[audioKey] || false;
      
      // Determine if this is a resume (audio exists, not ended, paused, and currentTime > 0.1)
      const isResume = audio && !hasEnded && audio.paused && audio.currentTime > 0.1;
      
      // If this is a new play from the beginning (not a resume), check limit first
      if (!isResume) {
        if (playCount >= MAX_AUDIO_PLAY_COUNT) {
          showError(`You have reached the maximum play limit (${MAX_AUDIO_PLAY_COUNT} times) for this audio.`);
          return;
        }
      }

      // Create audio if it doesn't exist
      if (!audio) {
        audio = new Audio(normalizedUrl);
        
        // Listen for loadedmetadata to get duration
        audio.addEventListener("loadedmetadata", () => {
          setQuestionAudioProgress((prev) => ({
            ...prev,
            [audioKey]: {
              currentTime: audio.currentTime,
              duration: audio.duration || 0,
            },
          }));
        });
        
        // Listen for timeupdate to update progress
        audio.addEventListener("timeupdate", () => {
          setQuestionAudioProgress((prev) => ({
            ...prev,
            [audioKey]: {
              currentTime: audio.currentTime,
              duration: audio.duration || 0,
            },
          }));
        });
        
        audio.addEventListener("ended", () => {
          setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: false }));
          setQuestionAudioHasEnded((prev) => ({ ...prev, [audioKey]: true }));
          setQuestionAudioProgress((prev) => ({
            ...prev,
            [audioKey]: {
              currentTime: 0,
              duration: prev[audioKey]?.duration || 0,
            },
          }));
        });
        
        questionAudioRefs.current[audioKey] = audio;
      } else if (hasEnded || audio.ended) {
        // If audio has ended, reset to beginning
        audio.currentTime = 0;
        setQuestionAudioHasEnded((prev) => ({ ...prev, [audioKey]: false }));
      }

      // Stop all other audio
      Object.values(questionAudioRefs.current).forEach((a) => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      Object.keys(questionAudioRefs.current).forEach((key) => {
        if (key !== audioKey) {
          setQuestionAudioPlaying((prev) => ({ ...prev, [key]: false }));
        }
      });

      // If resuming from middle, just play without counting
      if (isResume) {
        audio.play().catch((err) => {
          console.error("Error playing audio:", err);
          setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: false }));
        });
        setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: true }));
      } else {
        // Playing from start - reset to beginning and increment count
        audio.currentTime = 0;
        
        // Increment count BEFORE playing
        setQuestionAudioPlayCount((prev) => ({
          ...prev,
          [audioKey]: (prev[audioKey] || 0) + 1,
        }));
        
        audio.play().catch((err) => {
          console.error("Error playing audio:", err);
          setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: false }));
          // Decrement count if play failed
          setQuestionAudioPlayCount((prev) => ({
            ...prev,
            [audioKey]: Math.max(0, (prev[audioKey] || 0) - 1),
          }));
        });
        setQuestionAudioPlaying((prev) => ({ ...prev, [audioKey]: true }));
      }
    }
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    const questionAudioUrl = getQuestionAudioUrl(question);
    const normalizedAudioUrl = questionAudioUrl ? normalizeAudioUrl(questionAudioUrl) : null;
    const audioPlayCount = normalizedAudioUrl ? (questionAudioPlayCount[normalizedAudioUrl] || 0) : 0;
    const remainingPlays = normalizedAudioUrl ? Math.max(0, MAX_AUDIO_PLAY_COUNT - audioPlayCount) : 0;
    const isAudioDisabled = normalizedAudioUrl ? audioPlayCount >= MAX_AUDIO_PLAY_COUNT : false;

    // Lấy skillType từ question data result (mỗi question có skillType riêng)
    const questionDataResult = (question as any)._questionDataResult;
    const currentSkillType =
      questionDataResult?.question?.skillType || placementTest?.questions?.[0]?.skillType || "";

    return (
      <QuestionRenderer
        question={question}
        answer={answer}
        onAnswerChange={(answer: any) => handleAnswerChange(question.id, answer)}
        skillType={currentSkillType}
        questionAudioUrl={questionAudioUrl || undefined}
        questionAudioPlaying={questionAudioPlaying || undefined}
        toggleQuestionAudio={toggleQuestionAudio || undefined}
        normalizeAudioUrl={normalizeAudioUrl}
        audioPlayCount={audioPlayCount}
        remainingAudioPlays={remainingPlays}
        isAudioDisabled={isAudioDisabled}
        maxAudioPlays={MAX_AUDIO_PLAY_COUNT}
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

  if (error || !placementTest) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-neutral-600">{error || "Placement test not found"}</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">No Questions</h2>
          <p className="text-neutral-600">This placement test doesn't have any questions yet.</p>
          <Button onClick={() => navigate(-1)} className="mt-4" variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Group questions by passage
  const groupQuestionsByPassage = () => {
    const passageGroups = new Map<string, Question[]>();
    const questionsWithoutPassage: Question[] = [];

    questions.forEach((q) => {
      const passage = (q as any)._passage;
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

    const passages = Array.from(passageGroups.entries())
      .map(([passage, qs]) => ({
        passage,
        questions: qs.sort((a, b) => a.order - b.order),
        firstQuestionOrder: Math.min(...qs.map((q) => q.order)),
      }))
      .sort((a, b) => a.firstQuestionOrder - b.firstQuestionOrder);

    return { passages, questionsWithoutPassage };
  };

  // Group questions by audio (for listening questions with shared audio)
  const groupQuestionsByAudio = () => {
    const audioGroups = new Map<string, Question[]>();
    const questionsWithoutAudio: Question[] = [];

    questions.forEach((q) => {
      const audioUrl = (q as any)._audioUrl;
      const questionDataResult = (q as any)._questionDataResult;
      const questionType = questionDataResult?.question?.questionType?.toLowerCase() || "";
      const difficulty = questionDataResult?.question?.difficulty || 0;
      
      // Only group if this is an audio type question (difficulty 2 or 3 = short/long audio with multiple questions)
      const isSharedAudio = audioUrl && audioUrl.trim() && questionType === "audio" && (difficulty === 2 || difficulty === 3);
      
      if (isSharedAudio) {
        const audioKey = normalizeAudioUrl(audioUrl) || audioUrl.trim();
        if (!audioGroups.has(audioKey)) {
          audioGroups.set(audioKey, []);
        }
        audioGroups.get(audioKey)!.push(q);
      } else {
        questionsWithoutAudio.push(q);
      }
    });

    const audios = Array.from(audioGroups.entries())
      .map(([audioUrl, qs]) => ({
        audioUrl: audioUrl.trim(),
        questions: qs.sort((a, b) => a.order - b.order),
        firstQuestionOrder: Math.min(...qs.map((q) => q.order)),
      }))
      .sort((a, b) => a.firstQuestionOrder - b.firstQuestionOrder);

    return { audios, questionsWithoutAudio };
  };

  const { passages, questionsWithoutPassage } = groupQuestionsByPassage();
  const { audios } = groupQuestionsByAudio();
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  // Get current question's passage and audio context
  const getCurrentQuestionContext = () => {
    if (!currentQuestion) return { currentQuestion: null, passage: null, passageQuestions: [], questionIndexInPassage: 0, audioUrl: null, audioQuestions: [], questionIndexInAudio: 0 };

    // Check for passage
    for (const passageGroup of passages) {
      const indexInPassage = passageGroup.questions.findIndex((q) => q.id === currentQuestion.id);
      if (indexInPassage !== -1) {
        return {
          currentQuestion,
          passage: passageGroup.passage,
          passageQuestions: passageGroup.questions,
          questionIndexInPassage: indexInPassage,
          audioUrl: null,
          audioQuestions: [],
          questionIndexInAudio: 0,
        };
      }
    }

    // Check for shared audio
    for (const audioGroup of audios) {
      const indexInAudio = audioGroup.questions.findIndex((q) => q.id === currentQuestion.id);
      if (indexInAudio !== -1) {
        return {
          currentQuestion,
          passage: null,
          passageQuestions: [currentQuestion],
          questionIndexInPassage: 0,
          audioUrl: audioGroup.audioUrl,
          audioQuestions: audioGroup.questions,
          questionIndexInAudio: indexInAudio,
        };
      }
    }

    return {
      currentQuestion,
      passage: null,
      passageQuestions: [currentQuestion],
      questionIndexInPassage: 0,
      audioUrl: null,
      audioQuestions: [],
      questionIndexInAudio: 0,
    };
  };

  const currentContext = getCurrentQuestionContext();
  const currentPassage = currentContext.passage;
  const currentAudioUrl = currentContext.audioUrl;
  const currentAudioQuestions = currentContext.audioQuestions;
  
  // Get audio play count and remaining plays for current audio
  const normalizedCurrentAudioUrl = currentAudioUrl ? normalizeAudioUrl(currentAudioUrl) : null;
  const currentAudioPlayCount = normalizedCurrentAudioUrl ? (questionAudioPlayCount[normalizedCurrentAudioUrl] || 0) : 0;
  const currentAudioRemainingPlays = normalizedCurrentAudioUrl ? Math.max(0, MAX_AUDIO_PLAY_COUNT - currentAudioPlayCount) : 0;
  const isCurrentAudioDisabled = normalizedCurrentAudioUrl ? currentAudioPlayCount >= MAX_AUDIO_PLAY_COUNT : false;
  const currentAudioProgress = normalizedCurrentAudioUrl ? (questionAudioProgress[normalizedCurrentAudioUrl] || { currentTime: 0, duration: 0 }) : { currentTime: 0, duration: 0 };

  // Check if current question is reading without passage (should be centered)
  const questionDataResult = currentQuestion ? (currentQuestion as any)._questionDataResult : null;
  const currentSkillType = questionDataResult?.question?.skillType || placementTest?.questions?.[0]?.skillType || "";
  const isReadingQuestion = currentSkillType?.toLowerCase().includes("reading");
  const hasPassageOrAudio = currentPassage || currentAudioUrl;
  const shouldCenterQuestion = isReadingQuestion && !hasPassageOrAudio;

  if (attemptLimitReached) {
    const latestScore =
      submissionScore ||
      {
        score: 0,
        totalPoints: 0,
        earnedPoints: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        answeredQuestions: 0,
      };

    return (
      <div className="min-h-screen bg-neutral-50">
        <AssignmentHeader
          title={placementTest?.title || "Placement Test"}
          skillName={placementTest?.questions?.[0]?.skillType || ""}
          lastSaved={lastSaved}
          isSaving={false}
          onBack={handleExit}
          onSubmit={() => {}}
          canSubmit={false}
          timeRemaining={timeRemaining}
          timeLimitSeconds={initialTimeLimit}
          formatTime={formatTime}
          submitText="Submit"
        />

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 border-amber-200 bg-amber-50">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Daily attempt limit reached</h2>
              <p className="text-amber-700">
                You have reached the maximum of <strong>3 placement test attempts</strong> for today. You can try again tomorrow.
              </p>
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => setShowLimitScoreDialog(true)}>
                  View latest score
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <ScoreResultDialog
          isOpen={showLimitScoreDialog}
          onClose={() => setShowLimitScoreDialog(false)}
          submissionScore={latestScore}
          onRecommendCourses={() => navigate("/courses#courses-content")}
          onRecommendPackages={() => navigate("/courses#packages-content")}
          recommendCoursesLabel="Courses for you"
          recommendPackagesLabel="Learning paths for you"
        />
      </div>
    );
  }

  function handleClearAnswer(): void {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <AssignmentHeader
        title={placementTest.title}
        skillName={placementTest.questions?.[0]?.skillType || ""}
        lastSaved={lastSaved}
        isSaving={isSaving}
        onBack={handleExit}
        onSubmit={() => {
          if (attemptLimitReached || (timeRemaining !== null && timeRemaining <= 0)) return;
          handleSubmit(false);
        }}
        canSubmit={!attemptLimitReached && !submitting && timeRemaining !== null && timeRemaining > 0}
        timeRemaining={timeRemaining}
        timeLimitSeconds={initialTimeLimit}
        formatTime={formatTime}
        submitText="Submit"
      />

      {/* Time Warning Banner */}
      {showTimeWarning && timeRemaining !== null && timeRemaining < 300 && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg border-2 ${
            timeRemaining < 60
              ? "bg-red-500 text-white border-red-600 animate-pulse"
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
        >
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
                  ? "Your test will be automatically submitted when time expires. Please save your work!"
                  : "Please make sure to save your answers. Your test will be automatically submitted when time expires."}
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
          {/* Progress Indicator + Time Remaining - ở trên cùng */}
          <Card className="p-6 border-primary-200 mb-6">
            <ProgressIndicator
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              timeRemaining={timeRemaining}
              formatTime={(seconds: number) => formatTime(seconds)}
            />
          </Card>

          {/* Reading: layout 2 cột nếu có passage/audio, layout 1 cột căn giữa nếu không có passage cho reading question */}
          {shouldCenterQuestion ? (
            /* Layout 1 cột căn giữa cho reading question không có passage */
            <div className="flex justify-center">
              <div className="w-full max-w-3xl">
                <Card className="p-6">
                <div className="flex justify-end mb-3">                
                    <Button variant="secondary" onClick={handleClearAnswer} disabled={!answers[currentQuestion?.id]}>
                      Clear Answer
                    </Button>
                  </div>
                  {currentQuestion && renderQuestion(currentQuestion)}

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-8 border-t">
                    <Button variant="secondary" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={handleNext}>Next</Button>
                      ) : (
                        <Button
                          onClick={() => handleSubmit(false)}
                          disabled={
                            submitting || attemptLimitReached || (timeRemaining !== null && timeRemaining <= 0)
                          }
                        >
                          {submitting ? "Submitting..." : "Submit Test"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Question Navigation Panel */}
                <Card className="mt-6 p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Question Navigation</h3>
                  <div className="grid grid-cols-10 gap-2">
                    {questions.map((q, index) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isCurrent = index === currentQuestionIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => handleQuestionClick(index)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            isCurrent
                              ? "border-primary-600 bg-primary-50"
                              : isAnswered
                              ? "border-green-500 bg-green-50"
                              : "border-neutral-300 bg-white hover:border-primary-300"
                          }`}
                        >
                          <div className="text-sm font-medium">{index + 1}</div>
                          {/* {isAnswered && <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />} */}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            /* Layout 2 cột với passage/audio bên trái và question bên phải */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left - Reading Passage or Shared Audio (cố định, chỉ hiển thị nội dung khi có passage hoặc audio) */}
              <div className="lg:sticky lg:top-24 h-full lg:self-start">
                {currentPassage && (
                  <Card className="p-4">
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
                        <div 
                          ref={passageRef}
                          className="whitespace-pre-wrap text-neutral-700 leading-relaxed text-sm select-none"
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            pointerEvents: 'auto',
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            return false;
                          }}
                        >
                          {currentPassage}
                        </div>
                      </div>
                    )}
                  </Card>
                )}
                {currentAudioUrl && !currentPassage && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Headphones className="w-5 h-5 text-purple-600" />
                      <h2 className="text-lg font-semibold text-neutral-800">Audio ({currentAudioQuestions.length} {currentAudioQuestions.length > 1 ? 'questions' : 'question'})</h2>
                    </div>
                    <div className={`bg-white border rounded-lg p-4 ${isCurrentAudioDisabled ? 'border-red-300 bg-red-50' : 'border-purple-200 bg-purple-50'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => !isCurrentAudioDisabled && toggleQuestionAudio({ id: '', audioUrl: currentAudioUrl } as Question & { audioUrl?: string })}
                          disabled={isCurrentAudioDisabled}
                          className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                            isCurrentAudioDisabled
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                          title={
                            isCurrentAudioDisabled
                              ? `Reached maximum play limit (${MAX_AUDIO_PLAY_COUNT} times)`
                              : questionAudioPlaying[normalizedCurrentAudioUrl || ''] || false
                              ? "Pause"
                              : `Play (${currentAudioRemainingPlays} ${currentAudioRemainingPlays === 1 ? 'time' : 'times'} remaining)`
                          }
                        >
                          {isCurrentAudioDisabled ? (
                            <X className="w-6 h-6" />
                          ) : questionAudioPlaying[normalizedCurrentAudioUrl || ''] || false ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCurrentAudioDisabled ? 'text-red-900' : 'text-purple-900'}`}>
                            {isCurrentAudioDisabled
                              ? `Reached play limit (${MAX_AUDIO_PLAY_COUNT}/${MAX_AUDIO_PLAY_COUNT} times)`
                              : questionAudioPlaying[normalizedCurrentAudioUrl || ''] || false
                              ? "Playing audio..."
                              : currentAudioRemainingPlays > 0
                              ? `Click to play audio (${currentAudioRemainingPlays} ${currentAudioRemainingPlays === 1 ? 'time' : 'times'} remaining)`
                              : "Click to play audio"}
                          </p>
                          {currentAudioPlayCount > 0 && !isCurrentAudioDisabled && (
                            <p className="text-xs text-purple-600 mt-1">
                              Played: {currentAudioPlayCount}/{MAX_AUDIO_PLAY_COUNT} times
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      {(currentAudioProgress.duration > 0 || questionAudioPlaying[normalizedCurrentAudioUrl || ''] || false) && (
                        <div className="space-y-2 mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-100 ${
                                isCurrentAudioDisabled ? 'bg-gray-400' : 'bg-purple-600'
                              }`}
                              style={{
                                width: currentAudioProgress.duration > 0
                                  ? `${(currentAudioProgress.currentTime / currentAudioProgress.duration) * 100}%`
                                  : '0%',
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-neutral-600">
                            <span>{formatAudioTime(currentAudioProgress.currentTime)}</span>
                            <span>{formatAudioTime(currentAudioProgress.duration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right - Question Area */}
              <div>
                <Card className="p-6">
                  <div className="flex justify-end mb-3">                
                    <Button variant="secondary" onClick={handleClearAnswer} disabled={!answers[currentQuestion?.id]}>
                      Clear Answer
                    </Button>
                  </div>
                  {currentQuestion && renderQuestion(currentQuestion)}

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-8 border-t">
                    <Button variant="secondary" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                      Previous
                    </Button>
                    
                    <div className="flex gap-2">
                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={handleNext}>Next</Button>
                      ) : (
                        <Button onClick={() => handleSubmit(false)} disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Test"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Question Navigation Panel */}
                <Card className="mt-6 p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Question Navigation</h3>
                  <div className="grid grid-cols-10 gap-2">
                    {questions.map((q, index) => {
                      const isAnswered = answers[q.id] !== undefined;
                      const isCurrent = index === currentQuestionIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => handleQuestionClick(index)}
                          className={`p-3 rounded-lg border-2 transition-colors  ${
                            isCurrent
                              ? "border-primary-600 bg-primary-50"
                              : isAnswered
                              ? "border-green-500 bg-green-50"
                              : "border-neutral-300 bg-white hover:border-primary-300"
                          }`}
                        >
                          <div className="text-sm font-medium">{index + 1}</div>
                          {/* {isAnswered && <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />} */}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={confirmSubmit}
        title="Submit Placement Test?"
        message={
          unansweredQuestions > 0
            ? `You have answered ${answeredQuestions}/${totalQuestions} questions.
        ⚠ There are still ${unansweredQuestions} unanswered questions.
        Are you sure you want to submit?`
            : `You have answered all ${totalQuestions} questions.
        Are you sure you want to submit?`
        }
        
        confirmText="Submit"
        cancelText="Cancel"
        type="info"
      />

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
        title="Exit Placement Test?"
        message="Your progress will be saved, but you may need to start a new attempt if you leave without submitting."
        confirmText="Exit"
        cancelText="Stay"
        type="danger"
      />

      {/* Score Result Dialog */}
      <ScoreResultDialog
        isOpen={showScoreDialog}
        onClose={() => navigate(-1)}
        submissionScore={submissionScore}
        onRecommendCourses={() => navigate("/courses#courses-content")}
        onRecommendPackages={() => navigate("/courses#packages-content")}
        recommendCoursesLabel="Courses for you"
        recommendPackagesLabel="Learning path for you"
        maxScore={900}
      />
    </div>
  );
}
