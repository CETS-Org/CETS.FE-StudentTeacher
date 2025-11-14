import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Save,
  ArrowLeft,
  Headphones,
  BookOpen,
  PenTool,
  MessageSquare,
  Play,
  Pause,
  X,
  Eye,
  EyeOff,
  FileText
} from "lucide-react";
import type { Question, AssignmentQuestionData } from "../AdvancedAssignmentPopup";
import { config } from "@/lib/config";
import MultipleChoiceQuestion from "@/pages/Student/Assignment/components/MultipleChoiceQuestion";
import TrueFalseQuestion from "@/pages/Student/Assignment/components/TrueFalseQuestion";
import FillInBlankQuestion from "@/pages/Student/Assignment/components/FillInBlankQuestion";
import ShortAnswerQuestion from "@/pages/Student/Assignment/components/ShortAnswerQuestion";
import EssayQuestion from "@/pages/Student/Assignment/components/EssayQuestion";
import MatchingQuestion from "@/pages/Student/Assignment/components/MatchingQuestion";

interface Props {
  open: boolean;
  onClose: () => void;
  questionData: AssignmentQuestionData;
  title?: string;
  skillName?: string;
}

export default function TeacherTestPreview({
  open,
  onClose,
  questionData,
  title = "Test Preview",
  skillName,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true); // Teacher can see answers
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (open && questionData) {
      console.log("TeacherTestPreview - Received questionData:", questionData);
      console.log("TeacherTestPreview - Questions:", questionData.questions);
      console.log("TeacherTestPreview - Questions count:", questionData.questions?.length || 0);
      
      const validQuestions = (questionData.questions || []).filter(q => q && q.id && q.question);
      console.log("TeacherTestPreview - Valid questions count:", validQuestions.length);
      
      setQuestions(validQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setShowAnswers(true);
    }
  }, [open, questionData]);

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

  const toggleAudio = (audioUrl: string) => {
    const normalizedUrl = normalizeAudioUrl(audioUrl) || audioUrl;
    
    if (!audioRefs.current[normalizedUrl]) {
      const audio = new Audio(normalizedUrl);
      audioRefs.current[normalizedUrl] = audio;
      audio.onended = () => {
        setAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: false }));
      };
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        alert("Failed to load audio. Please check the audio URL.");
        setAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: false }));
      };
    }

    const audio = audioRefs.current[normalizedUrl];
    if (audioPlaying[normalizedUrl]) {
      audio.pause();
      audio.currentTime = 0;
      setAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: false }));
    } else {
      audio.play().catch((error) => {
        console.error("Audio play error:", error);
        alert("Failed to play audio. Please check the audio URL.");
      });
      setAudioPlaying((prev) => ({ ...prev, [normalizedUrl]: true }));
    }
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];
    const commonProps = {
      question,
      answer,
      onAnswerChange: (answer: any) => handleAnswerChange(question.id, answer),
      skillType: skillName || "",
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
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">🎤</span>
                <span className="text-sm font-medium text-blue-700">Speaking Question</span>
              </div>
              <p className="text-sm text-blue-600">
                Students will record their spoken response to this prompt.
              </p>
            </div>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: question.question }} />
            </div>
            {question.instructions && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-neutral-700 mb-1">Instructions:</h4>
                <p className="text-sm text-neutral-600">{question.instructions}</p>
              </div>
            )}
            {question.maxDuration && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⏱️</span>
                  <span className="text-sm font-medium text-yellow-700">
                    Maximum recording time: {question.maxDuration} seconds
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown question type: {question.type}</div>;
    }
  };

  const getSkillIcon = (skillName: string | null) => {
    if (!skillName) return <FileText className="w-5 h-5" />;
    const skill = skillName.toLowerCase();
    if (skill.includes("listening")) return <Headphones className="w-5 h-5" />;
    if (skill.includes("reading")) return <BookOpen className="w-5 h-5" />;
    if (skill.includes("writing")) return <PenTool className="w-5 h-5" />;
    if (skill.includes("speaking")) return <MessageSquare className="w-5 h-5" />;
    return <BookOpen className="w-5 h-5" />;
  };

  const getCorrectAnswerDisplay = (question: Question) => {
    if (question.type === "multiple_choice" && question.options) {
      const correctOption = question.options.find(opt => opt.id === question.correctAnswer);
      return correctOption ? `${correctOption.label}. ${correctOption.text}` : "N/A";
    }
    if (question.type === "true_false") {
      // Handle both boolean true/false and string "true"/"false"
      if (question.correctAnswer === true || question.correctAnswer === "true" || question.correctAnswer === "True") {
        return "True";
      }
      if (question.correctAnswer === false || question.correctAnswer === "false" || question.correctAnswer === "False") {
        return "False";
      }
      return question.correctAnswer ? String(question.correctAnswer) : "N/A";
    }
    if (question.type === "fill_in_the_blank") {
      if (question.correctAnswer) {
        if (Array.isArray(question.correctAnswer)) {
          return question.correctAnswer.join(", ");
        }
        return String(question.correctAnswer);
      }
      return "N/A";
    }
    if (question.type === "short_answer" || question.type === "essay") {
      return "Manual grading required";
    }
    if (question.type === "speaking") {
      return "Audio recording - Manual grading required";
    }
    if (question.type === "matching") {
      return "See matching pairs";
    }
    return "N/A";
  };

  const shouldShowCorrectAnswer = (question: Question) => {
    // Always show correct answer for teacher preview
    return showAnswers && (
      question.type === "multiple_choice" ||
      question.type === "true_false" ||
      question.type === "fill_in_the_blank"
    );
    // Note: speaking, short_answer, essay, and matching questions don't show correct answers
  };

  const isAnswerCorrect = (question: Question) => {
    const userAnswer = answers[question.id];
    if (userAnswer === undefined || userAnswer === null || userAnswer === "") {
      return null; // Not answered
    }

    if (question.type === "multiple_choice") {
      return userAnswer === question.correctAnswer;
    }
    if (question.type === "true_false") {
      return userAnswer === question.correctAnswer;
    }
    if (question.type === "fill_in_the_blank" && question.correctAnswer) {
      const userAnswerLower = String(userAnswer).toLowerCase().trim();
      if (Array.isArray(question.correctAnswer)) {
        // Check if user answer matches any of the correct answers
        return question.correctAnswer.some(correct => 
          String(correct).toLowerCase().trim() === userAnswerLower
        );
      } else {
        return String(question.correctAnswer).toLowerCase().trim() === userAnswerLower;
      }
    }
    return null; // For other types, manual grading
  };

  if (loading || questions.length === 0) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl" className="!max-w-[80vw] max-h-[95vh] !w-[80vw] h-[95vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader />
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter(
    key => answers[key] !== undefined && answers[key] !== null && answers[key] !== ""
  ).length;
  const correctCount = questions.filter(q => {
    const result = isAnswerCorrect(q);
    return result === true;
  }).length;
  const audioUrl = normalizeAudioUrl(questionData.media?.audioUrl);
  const questionAudioUrl = normalizeAudioUrl(currentQuestion.reference);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl" className="!max-w-[80vw] max-h-[95vh] !w-[80vw] h-[95vh]">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              {skillName && (
                <div className="flex items-center gap-2 mt-1">
                  {getSkillIcon(skillName)}
                  <span className="text-sm text-neutral-600">{skillName}</span>
                </div>
              )}
            </div>
           
          </div>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="min-h-full flex flex-col bg-neutral-50">
            {/* Audio Player */}
            {(audioUrl || questionAudioUrl) && (
              <div className="bg-white border-b border-neutral-200 p-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Headphones className="w-5 h-5 text-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-700">
                      {questionAudioUrl ? "Question Audio" : "Assignment Audio"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {questionAudioUrl || audioUrl}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleAudio(questionAudioUrl || audioUrl!)}
                    iconLeft={audioPlaying[questionAudioUrl || audioUrl!] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  >
                    {audioPlaying[questionAudioUrl || audioUrl!] ? "Pause" : "Play"}
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Bar */}
            <div className="bg-white border-b border-neutral-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <span className="text-neutral-600">Answered: </span>
                    <span className="font-semibold text-primary-600">{answeredCount}/{questions.length}</span>
                  </div>
                  {showAnswers && (
                    <div className="text-sm">
                      <span className="text-neutral-600">Correct: </span>
                      <span className="font-semibold text-green-600">{correctCount}/{answeredCount || 1}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-neutral-600">Progress: </span>
                    <span className="font-semibold text-neutral-900">
                      {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAnswers(!showAnswers)}
                    iconLeft={showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  >
                    {showAnswers ? "Hide Answers" : "Show Answers"}
                  </Button>
                 </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 p-4">
              <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Navigation Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="p-4 h-full overflow-y-auto scrollbar-hide">
                    <h3 className="font-semibold text-sm text-neutral-700 mb-3">
                      Questions ({answeredCount}/{questions.length})
                    </h3>
                    <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                      {questions.map((q, index) => {
                        const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "";
                        const isCurrent = index === currentQuestionIndex;
                        const isCorrect = showAnswers ? isAnswerCorrect(q) : null;
                        
                        return (
                          <button
                            key={q.id}
                            onClick={() => handleQuestionClick(index)}
                            className={`p-2 rounded text-sm font-medium transition-colors relative ${
                              isCurrent
                                ? "bg-primary-600 text-white"
                                : isCorrect === true
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : isCorrect === false
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : isAnswered
                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            Q{index + 1}
                            {showAnswers && isCorrect === true && (
                              <CheckCircle className="w-3 h-3 absolute top-0 right-0 m-1" />
                            )}
                            {showAnswers && isCorrect === false && (
                              <AlertCircle className="w-3 h-3 absolute top-0 right-0 m-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* Main Question Area */}
                <div className="lg:col-span-3">
                  <Card className="p-6 h-full overflow-y-auto scrollbar-hide">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-primary-600">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="ml-2 text-sm text-neutral-500">
                          ({currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      {renderQuestion(currentQuestion)}
                    </div>

                    {/* Show Correct Answer (Teacher View) - Always show for True/False and Fill in the Blank */}
                    {shouldShowCorrectAnswer(currentQuestion) && (
                      <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Correct Answer:</span>
                        </div>
                        <div className="ml-7">
                          {currentQuestion.type === "true_false" && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-500 rounded-lg">
                              <span className="text-lg font-bold text-green-700">
                                {getCorrectAnswerDisplay(currentQuestion)}
                              </span>
                            </div>
                          )}
                          {currentQuestion.type === "fill_in_the_blank" && (
                            <div className="px-4 py-2 bg-white border-2 border-green-500 rounded-lg">
                              <span className="text-sm font-semibold text-green-700">
                                {getCorrectAnswerDisplay(currentQuestion)}
                              </span>
                            </div>
                          )}
                          {currentQuestion.type === "multiple_choice" && (
                            <p className="text-sm font-semibold text-green-700">
                              {getCorrectAnswerDisplay(currentQuestion)}
                            </p>
                          )}
                        </div>
                        {currentQuestion.explanation && (
                          <div className="mt-3 pt-3 border-t border-green-300">
                            <p className="text-sm text-green-700">
                              <span className="font-semibold">Explanation: </span>
                              {currentQuestion.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Answer Status */}
                    {answers[currentQuestion.id] !== undefined && showAnswers && (
                      <div className={`mb-6 p-4 rounded-lg border ${
                        isAnswerCorrect(currentQuestion) === true
                          ? "bg-green-50 border-green-200"
                          : isAnswerCorrect(currentQuestion) === false
                          ? "bg-red-50 border-red-200"
                          : "bg-blue-50 border-blue-200"
                      }`}>
                        <div className="flex items-center gap-2">
                          {isAnswerCorrect(currentQuestion) === true ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-800">Your answer is correct!</span>
                            </>
                          ) : isAnswerCorrect(currentQuestion) === false ? (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="font-semibold text-red-800">Your answer is incorrect.</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-blue-800">Answer submitted (manual grading required)</span>
                            </>
                          )}
                        </div>
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
                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={handleNext}
                        >
                          Next
                        </Button>
                      ) : (
                        <div className="text-sm text-neutral-600">
                          Last question
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

