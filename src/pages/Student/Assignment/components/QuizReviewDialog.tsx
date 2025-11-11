import { useState, useEffect } from "react";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getQuestionDataUrl } from "@/api/assignments.api";
import type { AssignmentQuestionData, Question, MatchingPair } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface ExtendedSettings {
  shuffleQuestions: boolean;
  allowBackNavigation: boolean;
  showProgress: boolean;
  showQuestionNumbers: boolean;
  allowMultipleRecordings?: boolean;
  maxRecordings?: number;
  timeLimitMinutes?: number;
  showAnswersAfterSubmission?: boolean;
  showAnswersAfterDueDate?: boolean;
  dueDate?: string;
}

interface QuizReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  assignmentTitle: string;
  dueDate?: string;
  submission: {
    id: string;
    score: number | null;
    feedback?: string;
    createdAt: string;
    isAiScore?: boolean;
    content?: string; // JSON string of answers
  };
}

/**
 * Dialog component for reviewing completed quiz assignments
 * Shows quiz settings, questions, student answers, and correct answers (if allowed)
 */
export default function QuizReviewDialog({
  isOpen,
  onClose,
  assignmentId,
  assignmentTitle,
  dueDate,
  submission,
}: QuizReviewDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionData, setQuestionData] = useState<AssignmentQuestionData | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadQuizData();
    }
  }, [isOpen, assignmentId]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get presigned URL for question data
      const questionUrlResponse = await getQuestionDataUrl(assignmentId);
      const presignedUrl = questionUrlResponse.data.questionDataUrl;

      // Fetch question data
      const questionResponse = await fetch(presignedUrl);
      const data: AssignmentQuestionData = await questionResponse.json();
      setQuestionData(data);

      // Parse student answers from submission content
      if (submission.content) {
        try {
          const answers = JSON.parse(submission.content);
          setStudentAnswers(answers);
        } catch (e) {
          console.error("Failed to parse student answers:", e);
        }
      }
    } catch (err: any) {
      console.error("Failed to load quiz data:", err);
      setError(err.message || "Failed to load quiz data");
    } finally {
      setLoading(false);
    }
  };

  const canShowAnswers = () => {
    if (!questionData?.settings) return false;
    
    const settings = questionData.settings as ExtendedSettings;
    const { showAnswersAfterSubmission, showAnswersAfterDueDate } = settings;
    
    // Check if answers can be shown after submission
    if (showAnswersAfterSubmission) return true;
    
    // Check if answers can be shown after due date
    if (showAnswersAfterDueDate && dueDate) {
      const now = new Date();
      const dueDateObj = new Date(dueDate);
      return now > dueDateObj;
    }
    
    return false;
  };

  const isAnswerCorrect = (question: Question, studentAnswer: any): boolean => {
    if (!studentAnswer) return false;

    switch (question.type) {
      case "multiple_choice":
        return studentAnswer === question.correctAnswer;
      
      case "true_false":
        return studentAnswer === question.correctAnswer;
      
      case "fill_in_the_blank":
        if (!question.correctAnswer) return false;
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        return correctAnswers.some(ans => 
          studentAnswer?.toLowerCase().trim() === ans.toLowerCase().trim()
        );
      
      case "matching":
        if (!question.matching?.correctMatches || !studentAnswer) return false;
        return question.matching.correctMatches.every((pair: MatchingPair) => 
          studentAnswer[pair.left] === pair.right
        );
      
      case "short_answer":
      case "essay":
        // These are manually graded, so we can't determine correctness automatically
        return false;
      
      default:
        return false;
    }
  };

  const renderStudentAnswer = (question: Question, answer: any) => {
    if (!answer) {
      return <span className="text-neutral-500 italic">No answer provided</span>;
    }

    switch (question.type) {
      case "multiple_choice":
        const selectedOption = question.options?.find((opt: any) => opt.id === answer);
        return <span className="font-medium">{selectedOption?.text || answer}</span>;
      
      case "true_false":
        return <span className="font-medium">{answer ? "True" : "False"}</span>;
      
      case "fill_in_the_blank":
        return <span className="font-medium">{answer}</span>;
      
      case "matching":
        if (!question.matching?.correctMatches) return null;
        return (
          <div className="space-y-1">
            {question.matching.correctMatches.map((pair: MatchingPair, idx: number) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{pair.left}</span> → {answer[pair.left] || <span className="text-neutral-500 italic">Not matched</span>}
              </div>
            ))}
          </div>
        );
      
      case "short_answer":
      case "essay":
        return <p className="whitespace-pre-wrap font-medium">{answer}</p>;
      
      default:
        return <span className="text-neutral-500">Unknown answer type</span>;
    }
  };

  const renderCorrectAnswer = (question: Question) => {
    switch (question.type) {
      case "multiple_choice":
        const correctOption = question.options?.find((opt: any) => opt.id === question.correctAnswer);
        return <span className="font-medium text-success-700">{correctOption?.text || question.correctAnswer}</span>;
      
      case "true_false":
        return <span className="font-medium text-success-700">{question.correctAnswer ? "True" : "False"}</span>;
      
      case "fill_in_the_blank":
        const answers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        return (
          <div className="space-y-1">
            {answers.map((ans: string, idx: number) => (
              <div key={idx} className="font-medium text-success-700">{ans}</div>
            ))}
          </div>
        );
      
      case "matching":
        if (!question.matching?.correctMatches) return null;
        return (
          <div className="space-y-1">
            {question.matching.correctMatches.map((pair: MatchingPair, idx: number) => (
              <div key={idx} className="text-sm font-medium text-success-700">
                {pair.left} → {pair.right}
              </div>
            ))}
          </div>
        );
      
      case "short_answer":
      case "essay":
        return <span className="text-neutral-600 italic">Manually graded by instructor</span>;
      
      default:
        return null;
    }
  };

  const currentQuestion = questionData?.questions?.[currentQuestionIndex];
  const studentAnswer = currentQuestion ? studentAnswers[currentQuestion.id] : null;
  const isCorrect = currentQuestion ? isAnswerCorrect(currentQuestion, studentAnswer) : false;
  const answersAllowed = canShowAnswers();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary-800">
            Quiz Review: {assignmentTitle}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button variant="secondary" onClick={loadQuizData} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : questionData ? (
            <div className="space-y-6">
              {/* Quiz Summary */}
              <div className="bg-secondary-200 border border-secondary-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary-900 mb-4">Quiz Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                      <span className="text-sm font-medium text-neutral-600">Score</span>
                    </div>
                    <p className="text-lg font-bold text-primary-800">
                      {submission.score !== null ? `${submission.score}/10` : "Pending"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <span className="text-sm font-medium text-neutral-600">Questions</span>
                    </div>
                    <p className="text-lg font-bold text-primary-800">{questionData.questions?.length || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-warning-600" />
                      <span className="text-sm font-medium text-neutral-600">Time Limit</span>
                    </div>
                    <p className="text-lg font-bold text-primary-800">
                      {questionData.settings?.timeLimitMinutes ? `${questionData.settings.timeLimitMinutes} min` : "No limit"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-info-600" />
                      <span className="text-sm font-medium text-neutral-600">Submitted</span>
                    </div>
                    <p className="text-sm font-medium text-primary-800">
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {submission.isAiScore && (
                  <div className="mt-4 bg-warning-50 border-l-4 border-warning-500 p-3 rounded">
                    <p className="text-sm text-warning-800 font-medium">
                      ⚠️ This score is AI-generated for reference only. Your final grade will be determined by your instructor.
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {submission.feedback && (
                <div className="bg-info-50 border border-info-200 rounded-lg p-4">
                  <h4 className="text-md font-bold text-info-900 mb-2">
                    {submission.isAiScore ? "AI Feedback" : "Instructor Feedback"}
                  </h4>
                  <p className="text-sm text-info-800 whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              )}

              {/* Answer Visibility Toggle */}
              {answersAllowed && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-bold text-neutral-900">View Correct Answers</h4>
                      <p className="text-sm text-neutral-600">Compare your answers with the correct ones</p>
                    </div>
                    <Button
                      variant={showAnswers ? "primary" : "secondary"}
                      onClick={() => setShowAnswers(!showAnswers)}
                      iconLeft={showAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
                    >
                      {showAnswers ? "Hide Answers" : "Show Answers"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Questions Review */}
              {questionData.questions && questionData.questions.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-neutral-900">
                      Question {currentQuestionIndex + 1} of {questionData.questions.length}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        iconLeft={<ChevronLeft size={16} />}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(Math.min(questionData.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === questionData.questions.length - 1}
                        iconRight={<ChevronRight size={16} />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  {currentQuestion && (
                    <div className="space-y-4">
                      {/* Question Text */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCorrect ? "bg-success-500" : "bg-neutral-400"
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <XCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-600 mb-1">
                              {currentQuestion.type.replace(/_/g, " ").toUpperCase()}
                            </p>
                            <p className="text-base font-medium text-neutral-900">{currentQuestion.question}</p>
                          </div>
                        </div>
                      </div>

                      {/* Student Answer */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-blue-900 mb-2">Your Answer:</h5>
                        <div className="text-blue-800">
                          {renderStudentAnswer(currentQuestion, studentAnswer)}
                        </div>
                      </div>

                      {/* Correct Answer (if allowed) */}
                      {showAnswers && answersAllowed && (
                        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-success-900 mb-2">Correct Answer:</h5>
                          <div className="text-success-800">
                            {renderCorrectAnswer(currentQuestion)}
                          </div>
                        </div>
                      )}

                      {/* Explanation (if available) */}
                      {currentQuestion.explanation && showAnswers && answersAllowed && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-purple-900 mb-2">Explanation:</h5>
                          <p className="text-sm text-purple-800">{currentQuestion.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Navigation Dots */}
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-200">
                    {questionData.questions.map((q, idx) => {
                      const answer = studentAnswers[q.id];
                      const correct = isAnswerCorrect(q, answer);
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                            idx === currentQuestionIndex
                              ? "bg-primary-600 text-white ring-2 ring-primary-300"
                              : correct
                              ? "bg-success-100 text-success-700 hover:bg-success-200"
                              : answer
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          }`}
                          title={`Question ${idx + 1}${correct ? " - Correct" : answer ? " - Incorrect" : " - Not answered"}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Answers Available Message */}
              {!answersAllowed && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-semibold text-warning-900 mb-1">Answers Not Available</h5>
                      <p className="text-sm text-warning-800">
                        {(questionData.settings as ExtendedSettings)?.showAnswersAfterDueDate
                          ? `Correct answers will be available after the due date: ${new Date((questionData.settings as ExtendedSettings).dueDate || "").toLocaleString()}`
                          : "The instructor has not enabled answer viewing for this quiz."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No quiz data available</p>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
