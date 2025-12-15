import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
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
import { getStudentId } from "@/lib/utils";
import type { Question, QuestionType, AssignmentQuestionData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import MultipleChoiceQuestion from "./components/MultipleChoiceQuestion";
import TrueFalseQuestion from "./components/TrueFalseQuestion";
import FillInBlankQuestion from "./components/FillInBlankQuestion";
import ShortAnswerQuestion from "./components/ShortAnswerQuestion";
import EssayQuestion from "./components/EssayQuestion";
import MatchingQuestion from "./components/MatchingQuestion";
import SpeakingQuestion from "./components/SpeakingQuestion";
// Mock data removed - using real APIs now
// import {
//   mockAssignmentDetails,
//   mockQuestions,
//   mockAssignmentQuestionData,
//   mockListeningAssignment,
//   mockWritingAssignment,
//   mockSpeakingAssignment
// } from "./mockData";

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  dueAt: string;
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

type TestMode = "reading" | "listening" | "writing" | "speaking";

export default function StudentAssignmentTakingTest() {
  const navigate = useNavigate();
  const studentId = getStudentId();
  
  // Test mode state
  const [testMode, setTestMode] = useState<TestMode>("reading");
  
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
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showReadingPassage, setShowReadingPassage] = useState(true);
  const [questionData, setQuestionData] = useState<AssignmentQuestionData | null>(null);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load mock assignment data based on test mode
  useEffect(() => {
    const loadMockAssignment = () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with real API call to fetch assignment data
        // For now, this will show an error message
        throw new Error("Mock data removed. Please integrate with real API.");
        
        // Example API integration:
        // const assignmentData = await fetchAssignmentById(assignmentId);
        // const questionData = await fetchAssignmentQuestions(assignmentId);
        // setAssignment(assignmentData);
        // setQuestionData(questionData);
        // setQuestions(questionData.questions || []);
        // if (assignmentData.timeLimitMinutes) {
        //   const timeInSeconds = assignmentData.timeLimitMinutes * 60;
        //   setTimeRemaining(timeInSeconds);
        //   setIsTimerRunning(true);
        // }

      } catch (err: any) {
        console.error("Failed to load assignment:", err);
        setError("Failed to load assignment. Mock data has been removed. Please integrate with real API.");
      } finally {
        setLoading(false);
      }
    };

    loadMockAssignment();
  }, [testMode]);

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
    try {
      // Save answers to localStorage as backup
      localStorage.setItem(`test_assignment_${assignment?.id}_answers`, JSON.stringify(answers));
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

  const handleSubmit = async (autoSubmit: boolean = false) => {
    if (!autoSubmit) {
      setShowSubmitDialog(true);
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert("Assignment submitted successfully! (This is a test submission)");
      navigate(-1);
    } catch (err: any) {
      console.error("Failed to submit assignment:", err);
      alert("Failed to submit assignment");
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

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    const commonProps = {
      question,
      answer,
      onAnswerChange: (answer: any) => handleAnswerChange(question.id, answer),
      skillType: assignment?.skillName || "",
    };

    switch (question.type) {
      case "multiple_choice":
        return <MultipleChoiceQuestion {...commonProps} />;
      case "true_false":
        return <TrueFalseQuestion {...commonProps} />;
      case "fill_in_the_blank":
        return <FillInBlankQuestion {...commonProps} />;
      case "short_answer":
        return <ShortAnswerQuestion {...commonProps} />;
      case "essay":
        return <EssayQuestion {...commonProps} />;
      case "matching":
        return <MatchingQuestion {...commonProps} />;
      case "speaking":
        return <SpeakingQuestion {...commonProps} />;
      default:
        return <div>Unknown question type</div>;
    }
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

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isSpeaking = assignment.skillName?.toLowerCase().includes("speaking");
  const isWriting = assignment.skillName?.toLowerCase().includes("writing");

  return (
    <StudentLayout>
      <div className="min-h-screen bg-neutral-50">
        {/* Test Mode Selector */}
        <div className="bg-white border-b border-neutral-200">
          <div className="px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-neutral-700">Test Mode:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={testMode === "reading" ? "primary" : "secondary"}
                    onClick={() => setTestMode("reading")}
                  >
                    Reading
                  </Button>
                  <Button
                    size="sm"
                    variant={testMode === "listening" ? "primary" : "secondary"}
                    onClick={() => setTestMode("listening")}
                  >
                    Listening
                  </Button>
                  <Button
                    size="sm"
                    variant={testMode === "writing" ? "primary" : "secondary"}
                    onClick={() => setTestMode("writing")}
                  >
                    Writing
                  </Button>
                  <Button
                    size="sm"
                    variant={testMode === "speaking" ? "primary" : "secondary"}
                    onClick={() => setTestMode("speaking")}
                  >
                    Speaking
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            {/* Different layouts based on test mode and reading passage */}
            {testMode === "reading" && questionData?.readingPassage ? (
              // Reading Assignment with Passage - Three Column Layout
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Sidebar - Question Navigation */}
                <div className="xl:col-span-2">
                  <Card className="p-4">
                    <h3 className="font-semibold text-sm text-neutral-700 mb-3">
                      Questions ({answeredCount}/{questions.length})
                    </h3>
                    <div className="grid grid-cols-5 xl:grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
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

                {/* Middle Column - Main Question Area */}
                <div className="xl:col-span-5">
                  <Card className="p-6">
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
                        <Button
                          variant="secondary"
                          onClick={saveAnswers}
                          iconLeft={<Save className="w-4 h-4" />}
                        >
                          Save
                        </Button>
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

                {/* Right Sidebar - Reading Passage */}
                <div className="xl:col-span-5">
                  <Card className="p-4 sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-neutral-800">Reading Passage</h2>
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
                      <div className="prose max-w-none">
                        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 max-h-[600px] overflow-y-auto">
                          <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed text-sm">
                            {questionData.readingPassage}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              // Non-Reading Assignments - Standard Two Column Layout
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Question Navigation */}
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
                        <Button
                          variant="secondary"
                          onClick={saveAnswers}
                          iconLeft={<Save className="w-4 h-4" />}
                        >
                          Save
                        </Button>
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
      </div>
    </StudentLayout>
  );
}