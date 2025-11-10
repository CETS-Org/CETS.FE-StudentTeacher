import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
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
  FileText
} from "lucide-react";
import { api } from "@/api";
import { getQuestionDataUrl } from "@/api/assignments.api";
import { getStudentId } from "@/lib/utils";
import type { Question, AssignmentQuestionData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import QuizQuestion from "./components/QuizQuestion";
import SpeakingAssignment from "./components/SpeakingAssignment";
import { submitSpeakingAssignment, validateSpeakingSubmission } from "./components/SpeakingAssignmentSubmission";

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
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
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [allowMultipleRecordings, setAllowMultipleRecordings] = useState(false);
  const [maxRecordings, setMaxRecordings] = useState(3);
  
  // Store recordings per question
  interface QuestionRecording {
    recordings: Array<{ id: string; blobUrl: string; duration: number; timestamp: Date }>;
    selectedId: string | null;
    recordingTime: number;
    currentBlobUrl: string | null;
  }
  const [questionRecordings, setQuestionRecordings] = useState<Record<string, QuestionRecording>>({});
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          assignmentType: assignmentData.assignmentType || null,
          totalPoints: assignmentData.totalPoints || 0,
          timeLimitMinutes: assignmentData.timeLimitMinutes,
          maxAttempts: assignmentData.maxAttempts || 1,
          questionDataUrl: assignmentData.questionDataUrl,
          isAutoGradable: assignmentData.isAutoGradable || false,
          showAnswersAfterSubmission: assignmentData.showAnswersAfterSubmission || false,
          showAnswersAfterDueDate: assignmentData.showAnswersAfterDueDate || false,
        });

        // Load question data if QuestionUrl exists (quiz assignment)
        let questionDataTimeLimit: number | undefined = undefined;
        if (assignmentData.questionUrl) {
          try {
            // Get presigned URL for question data
            const questionUrlResponse = await getQuestionDataUrl(assignmentId);
            const presignedUrl = questionUrlResponse.data.questionDataUrl;
            
            // Fetch question data using presigned URL
            const questionResponse = await fetch(presignedUrl);
            const questionData: AssignmentQuestionData = await questionResponse.json();
            setQuestions(questionData.questions || []);
            
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

  // Get current question's recording data
  const getCurrentQuestionRecording = (): QuestionRecording => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) {
      return { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
    }
    return questionRecordings[currentQ.id] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
  };

  // Handle speaking assignment recording updates
  const handleRecordingUpdate = useCallback((questionId: string, data: Partial<QuestionRecording>) => {
    setQuestionRecordings(prev => {
      const current = prev[questionId] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
      const updated = { ...current, ...data };
      
      // Mark question as answered if there's a selected recording
      if (updated.selectedId && updated.recordings.length > 0) {
        const selectedRecording = updated.recordings.find(r => r.id === updated.selectedId);
        if (selectedRecording) {
          handleAnswerChange(questionId, "recorded");
        }
      }
      
      return { ...prev, [questionId]: updated };
    });
  }, [handleAnswerChange]);

  // Handle recording complete (for single recording mode or when selection changes)
  const handleRecordingComplete = useCallback((blobUrl: string | null) => {
    const currentQ = questions[currentQuestionIndex];
    const isSpeakingAssignment = assignment?.skillName?.toLowerCase().includes("speaking");
    const questionId = currentQ?.id || (isSpeakingAssignment && questions.length === 0 ? "pure-speaking" : null);
    
    if (!questionId) return;
    
    setQuestionRecordings(prev => {
      const current = prev[questionId] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
      return { ...prev, [questionId]: { ...current, currentBlobUrl: blobUrl } };
    });
    
    // Mark the current speaking question as answered only if there's a recording
    if (blobUrl && currentQ) {
      handleAnswerChange(currentQ.id, "recorded");
    }
  }, [questions, currentQuestionIndex, handleAnswerChange, assignment]);

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

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      alert("Student ID is missing. Please try again.");
      return;
    }

    setSubmitting(true);
    try {
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
            alert("Assignment submitted successfully!");
            navigate(-1);
          },
          onError: (errorMessage) => {
            alert(errorMessage);
          }
        });
      } else {
        // Handle regular quiz assignment (non-speaking)
        // TODO: Implement quiz submission endpoint if needed
        // For now, use the existing submitAssignmentAnswers
        const submissionData: any = {
          assignmentID: assignmentId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
            timestamp: new Date().toISOString(),
          })),
        };

        await api.submitAssignmentAnswers(submissionData);
        
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

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    return (
      <QuizQuestion
        question={question}
        answer={answer}
        onAnswerChange={(answer: any) => handleAnswerChange(question.id, answer)}
        skillType={assignment?.skillName || ""}
      />
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

  const isSpeaking = assignment.skillName?.toLowerCase().includes("speaking");
  // Check if current question has a recording
  const currentQ = questions[currentQuestionIndex];
  const currentQuestionRec = currentQ ? questionRecordings[currentQ.id] : null;
  const hasRecording = currentQuestionRec ? (
    allowMultipleRecordings 
      ? (currentQuestionRec.selectedId && currentQuestionRec.recordings.length > 0)
      : !!currentQuestionRec.currentBlobUrl
  ) : false;

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

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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

        <div className="py-6">
          <div className="max-w-7xl mx-auto px-6">
            {questions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Navigation Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="p-4">
                    <h3 className="font-semibold text-sm text-neutral-700 mb-3">
                      Questions ({answeredCount}/{questions.length})
                    </h3>
                    <div className="grid grid-cols-5 lg:grid-cols-1 gap-2 max-h-[600px] overflow-y-auto">
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

                {/* Main Question Area */}
                <div className="lg:col-span-3">
                  <Card className="p-6">
                    {currentQuestion && (
                      <>
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-primary-600">
                              Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span className="ml-2 text-sm text-neutral-500">
                              ({currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="text-sm text-neutral-600">
                            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                          </div>
                        </div>

                        {/* Show question prompt for speaking questions */}
                        {currentQuestion.type === "speaking" && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">{currentQuestion.question}</h3>
                            {currentQuestion.explanation && (
                              <div className="mb-4 p-4 bg-info-50 border border-info-200 rounded-lg">
                                <p className="text-sm text-info-800">
                                  <span className="font-medium">Explanation:</span> {currentQuestion.explanation}
                                </p>
                              </div>
                            )}
                            {currentQuestion.audioTimestamp && (
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <span className="font-medium">Audio Timestamp:</span> {currentQuestion.audioTimestamp}
                                </p>
                              </div>
                            )}
                            {currentQuestion.reference && (
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <span className="font-medium">Reference:</span> {currentQuestion.reference}
                                </p>
                              </div>
                            )}
                            {currentQuestion.maxLength && (
                              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <span className="font-medium">Time limit:</span> {currentQuestion.maxLength} seconds
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Render regular question for non-speaking types */}
                        {currentQuestion.type !== "speaking" && (
                          <div className="mb-6">
                            {renderQuestion(currentQuestion)}
                          </div>
                        )}

                        {/* Voice Recording Section for Speaking Questions */}
                        {currentQuestion.type === "speaking" && (() => {
                          const questionRec = questionRecordings[currentQuestion.id] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
                          return (
                            <SpeakingAssignment
                              questionId={currentQuestion.id}
                              recordingTime={questionRec.recordingTime}
                              setRecordingTime={(time) => {
                                setQuestionRecordings(prev => ({
                                  ...prev,
                                  [currentQuestion.id]: {
                                    ...(prev[currentQuestion.id] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null }),
                                    recordingTime: typeof time === 'function' ? time(questionRec.recordingTime) : time
                                  }
                                }));
                              }}
                              onRecordingComplete={handleRecordingComplete}
                              allowMultipleRecordings={allowMultipleRecordings}
                              maxRecordings={maxRecordings}
                              initialRecordings={questionRec.recordings}
                              initialSelectedId={questionRec.selectedId}
                              onRecordingsUpdate={(recordings, selectedId) => {
                                setQuestionRecordings(prev => ({
                                  ...prev,
                                  [currentQuestion.id]: {
                                    ...(prev[currentQuestion.id] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null }),
                                    recordings,
                                    selectedId
                                  }
                                }));
                              }}
                            />
                          );
                        })()}
                      </>
                    )}

                    {/* Voice Recording Section for Speaking Assignments (when no questions but skill is speaking) */}
                    {!currentQuestion && isSpeaking && (() => {
                      // For pure speaking assignments without questions, use a special key
                      const pureSpeakingKey = "pure-speaking";
                      const questionRec = questionRecordings[pureSpeakingKey] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
                      return (
                        <SpeakingAssignment
                          questionId={pureSpeakingKey}
                          recordingTime={questionRec.recordingTime}
                          setRecordingTime={(time) => {
                            setQuestionRecordings(prev => ({
                              ...prev,
                              [pureSpeakingKey]: {
                                ...(prev[pureSpeakingKey] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null }),
                                recordingTime: typeof time === 'function' ? time(questionRec.recordingTime) : time
                              }
                            }));
                          }}
                          onRecordingComplete={handleRecordingComplete}
                          allowMultipleRecordings={allowMultipleRecordings}
                          maxRecordings={maxRecordings}
                          initialRecordings={questionRec.recordings}
                          initialSelectedId={questionRec.selectedId}
                          onRecordingsUpdate={(recordings, selectedId) => {
                            setQuestionRecordings(prev => ({
                              ...prev,
                              [pureSpeakingKey]: {
                                ...(prev[pureSpeakingKey] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null }),
                                recordings,
                                selectedId
                              }
                            }));
                          }}
                        />
                      );
                    })()}

                    {/* Navigation Buttons */}
                    {questions.length > 0 && (
                      <div className="flex justify-between items-center pt-4 border-t">
                        <Button
                          variant="secondary"
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={saveAnswers}
                            iconLeft={<Save className="w-4 h-4" />}
                          >
                            Save
                          </Button>
                          {currentQuestionIndex < questions.length - 1 && (
                            <Button
                              variant="primary"
                              onClick={handleNext}
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              // Pure speaking assignment without questions
              <div className="max-w-4xl mx-auto">
                <Card className="p-6">
                  {(() => {
                    const pureSpeakingKey = "pure-speaking";
                    const questionRec = questionRecordings[pureSpeakingKey] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null };
                    return (
                      <SpeakingAssignment
                        questionId={pureSpeakingKey}
                        recordingTime={questionRec.recordingTime}
                        setRecordingTime={(time) => {
                          setQuestionRecordings(prev => ({
                            ...prev,
                            [pureSpeakingKey]: {
                              ...(prev[pureSpeakingKey] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null }),
                              recordingTime: typeof time === 'function' ? time(questionRec.recordingTime) : time
                            }
                          }));
                        }}
                        onRecordingComplete={handleRecordingComplete}
                        allowMultipleRecordings={allowMultipleRecordings}
                        maxRecordings={maxRecordings}
                        initialRecordings={questionRec.recordings}
                        initialSelectedId={questionRec.selectedId}
                        onRecordingsUpdate={(recordings, selectedId) => {
                          setQuestionRecordings(prev => ({
                            ...prev,
                            [pureSpeakingKey]: {
                              ...(prev[pureSpeakingKey] || { recordings: [], selectedId: null, recordingTime: 0, currentBlobUrl: null }),
                              recordings,
                              selectedId
                            }
                          }));
                        }}
                      />
                    );
                  })()}
                </Card>
              </div>
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
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Voice recording included ({formatRecordingTime(recTime)})
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
    </div>
  );
}

