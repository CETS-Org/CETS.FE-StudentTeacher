import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { getQuestionDataUrl } from "@/api/assignments.api";

const CDN_BASE_URL = import.meta.env.VITE_STORAGE_PUBLIC_URL || '';

type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  file: string | null;
  content: string | null;
  submittedDate: string;
  score: number | null;
  feedback: string | null;
  IsAiScore?: boolean;
};

type ReadingSubmissionData = {
  submittedAt: string;
  answers: Array<{
    questionId: string;
    answer: string | string[];
    timestamp: string;
  }>;
  questions?: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string | string[];
    points?: number;
    passage?: string; // Reading passage for this question
  }>;
  passage?: string; // Main reading passage for the entire assignment
};

interface ReadingGradingViewProps {
  assignmentTitle: string;
  submissions: Submission[];
  assignment?: {
    assignmentId: string;
    questionUrl?: string;
  };
  onClose: () => void;
}

export default function ReadingGradingView({
  assignmentTitle,
  submissions,
  assignment,
  onClose,
}: ReadingGradingViewProps) {
  // Toast notifications
  const { toasts, hideToast } = useToast();
  
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(0);
  const [readingData, setReadingData] = useState<ReadingSubmissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const selectedSubmission = submissions[selectedSubmissionIndex];

  // Load submission data when submission changes
  useEffect(() => {
    if (selectedSubmission) {
      setReadingData(null);
      setError(false);
      setCurrentQuestionIndex(0);
      
      // Load reading assignment data if it's a JSON file
      if (selectedSubmission.file && selectedSubmission.file.endsWith('.json')) {
        loadReadingAssignmentData(selectedSubmission.file);
      } else if (selectedSubmission.content) {
        // Try to parse content as JSON
        try {
          const data = JSON.parse(selectedSubmission.content);
          
          // If questions are missing but we have assignment data, try to load question data
          if ((!data.questions || data.questions.length === 0) && assignment?.assignmentId) {
            loadQuestionDataForSubmission(data);
          } else {
            setReadingData(data);
          }
        } catch (err) {
          setError(true);
        }
      }
    }
  }, [selectedSubmission, assignment]);

  // Load reading assignment data from JSON
  const loadReadingAssignmentData = async (jsonUrl: string) => {
    try {
      setLoading(true);
      const fullJsonUrl = getFullFileUrl(jsonUrl);
      
      const response = await fetch(fullJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ReadingSubmissionData = await response.json();
      setReadingData(data);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  };

  // Load question data for submission when questions are missing
  const loadQuestionDataForSubmission = async (submissionData: any) => {
    try {
      setLoading(true);
      
      // Get presigned URL for question data
      const questionUrlResponse = await getQuestionDataUrl(assignment!.assignmentId);
      const presignedUrl = questionUrlResponse.data.questionDataUrl;
      
      console.log("Loading question data from URL:", presignedUrl);
      
      // Fetch question data
      const response = await fetch(presignedUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const questionData = await response.json();
      console.log("Loaded question data:", questionData);
      
      // Combine submission answers with question data
      const combinedData: ReadingSubmissionData = {
        submittedAt: submissionData.submittedAt || new Date().toISOString(),
        answers: submissionData.answers || [],
        questions: questionData.questions || [],
        passage: questionData.passage || undefined
      };
      
      setReadingData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading question data:", error);
      // If we can't load question data, just use the submission data as-is
      setReadingData(submissionData);
      setLoading(false);
    }
  };

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Arrow keys for submission navigation
      if (e.key === 'ArrowLeft' && !e.shiftKey && selectedSubmissionIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && !e.shiftKey && selectedSubmissionIndex < submissions.length - 1) {
        e.preventDefault();
        handleNext();
      }
      // Shift + Arrow keys for question navigation
      else if (e.key === 'ArrowLeft' && e.shiftKey && readingData && readingData.questions && currentQuestionIndex > 0) {
        e.preventDefault();
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (e.key === 'ArrowRight' && e.shiftKey && readingData && readingData.questions && currentQuestionIndex < readingData.questions.length - 1) {
        e.preventDefault();
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedSubmissionIndex, submissions.length, currentQuestionIndex, readingData]);

  const handleSubmissionSelect = (index: number) => {
    setSelectedSubmissionIndex(index);
  };

  const handlePrevious = () => {
    if (selectedSubmissionIndex > 0) {
      setSelectedSubmissionIndex(selectedSubmissionIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedSubmissionIndex < submissions.length - 1) {
      setSelectedSubmissionIndex(selectedSubmissionIndex + 1);
    }
  };

  const getFullFileUrl = (fileUrl: string): string => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    if (!CDN_BASE_URL) {
      return fileUrl;
    }
    
    const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    const cleanCdnUrl = CDN_BASE_URL.endsWith('/') ? CDN_BASE_URL.slice(0, -1) : CDN_BASE_URL;
    
    return `${cleanCdnUrl}${normalizedUrl}`;
  };

  type AnswerValue = string | number | boolean | null | undefined | AnswerValue[];

  const normalizeValue = (value: AnswerValue): string => {
    if (Array.isArray(value)) {
      return value
        .map(item => normalizeValue(item))
        .filter(Boolean)
        .sort()
        .join('|');
    }

    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    try {
      return JSON.stringify(value).trim().toLowerCase();
    } catch {
      return String(value).trim().toLowerCase();
    }
  };

  const toArray = (value: AnswerValue): string[] => {
    if (Array.isArray(value)) {
      return value.map(item => normalizeValue(item)).filter(Boolean);
    }

    const normalized = normalizeValue(value);
    return normalized ? [normalized] : [];
  };

  const formatPrimitiveAnswer = (value: AnswerValue): string => {
    if (value === null || value === undefined) {
      return 'No answer provided';
    }

    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      return value.trim() || 'No answer provided';
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const mapMultipleChoiceAnswer = (question: any, answer: AnswerValue): AnswerValue => {
    if (!question || !question.options || question.options.length === 0) {
      return answer;
    }

    const mapSingle = (value: AnswerValue): string => {
      if (typeof value !== 'string') {
        return formatPrimitiveAnswer(value);
      }

      const match = question.options.find((opt: any) => {
        if (typeof opt === 'string') {
          return opt === value;
        }

        return opt.id === value || opt.value === value || opt.text === value;
      });

      if (!match) {
        return value;
      }

      if (typeof match === 'string') {
        return match;
      }

      const label = match.label || match.text || match.value || match.id;
      const text = match.text || match.value || match.label || match.id;
      return label === text ? label : `${label}. ${text}`;
    };

    if (Array.isArray(answer)) {
      return answer.map(item => mapSingle(item));
    }

    return mapSingle(answer);
  };

  const renderAnswerDisplay = (value: AnswerValue, question?: any) => {
    const valueToRender = question && question.type === 'multiple_choice'
      ? mapMultipleChoiceAnswer(question, value)
      : value;

    if (Array.isArray(valueToRender)) {
      if (valueToRender.length === 0) {
        return <p className="text-neutral-500 italic">No answer provided</p>;
      }

      return (
        <ul className="list-disc list-inside space-y-1">
          {valueToRender.map((ans, index) => (
            <li key={index} className="text-neutral-800">
              {formatPrimitiveAnswer(ans)}
            </li>
          ))}
        </ul>
      );
    }

    return <p className="text-neutral-800">{formatPrimitiveAnswer(valueToRender)}</p>;
  };

  const isAnswerCorrect = (questionId: string, studentAnswer: AnswerValue, correctAnswer: AnswerValue): boolean => {
    const normalizedStudent = toArray(studentAnswer);
    const normalizedCorrect = toArray(correctAnswer);

    if (normalizedCorrect.length > 1 || normalizedStudent.length > 1) {
      if (normalizedCorrect.length !== normalizedStudent.length) {
        return normalizedCorrect.every(answer => normalizedStudent.includes(answer));
      }

      return normalizedCorrect.every(answer => normalizedStudent.includes(answer));
    }

    return (normalizedStudent[0] || '') === (normalizedCorrect[0] || '');
  };

  const renderQuestionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-neutral-600">Loading assignment data...</p>
          </div>
        </div>
      );
    }

    if (error || !readingData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">Unable to load assignment data</p>
            <p className="text-neutral-400 text-sm mt-2">
              The submission data could not be parsed or loaded.
            </p>
          </div>
        </div>
      );
    }

    if (!readingData.questions || readingData.questions.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Eye className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No questions found</p>
            <p className="text-neutral-400 text-sm mt-2">
              This assignment doesn't contain any questions to review.
            </p>
          </div>
        </div>
      );
    }

    const currentQuestion = readingData.questions[currentQuestionIndex];
    const studentAnswer = readingData.answers.find(a => a.questionId === currentQuestion.id);
    const isCorrect = studentAnswer ? isAnswerCorrect(currentQuestion.id, studentAnswer.answer, currentQuestion.correctAnswer) : false;

    return (
      <div className="h-full flex flex-col">
        {/* Reading Passage */}
        {(readingData.passage || currentQuestion.passage) && (
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4 max-h-64 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <h4 className="text-sm font-medium text-neutral-700">
                {currentQuestion.passage ? 'Question Passage' : 'Reading Passage'}
              </h4>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.passage || readingData.passage}
              </p>
            </div>
          </div>
        )}

        {/* Question Navigation */}
        {readingData.questions.length > 1 && (
          <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-700">
                  Question {currentQuestionIndex + 1} of {readingData.questions.length}
                </span>
                {currentQuestion.points && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {currentQuestion.points} pts
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="p-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous question (Shift+←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {readingData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentQuestionIndex 
                          ? 'bg-accent-300' 
                          : 'bg-neutral-300 hover:bg-neutral-400'
                      }`}
                      title={`Go to question ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === readingData.questions.length - 1}
                  className="p-1 text-neutral-600 hover:text-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next question (Shift+→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Content */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-sm overflow-y-auto">
          {/* Question Text */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-3">
              Question {currentQuestionIndex + 1}
            </h3>
            <p className="text-neutral-700 text-base leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options (for multiple choice) */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">Options:</h4>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  const isStudentChoice = studentAnswer?.answer === option || 
                    (Array.isArray(studentAnswer?.answer) && studentAnswer.answer.includes(option));
                  const isCorrectOption = currentQuestion.correctAnswer === option || 
                    (Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.includes(option));
                  
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        isCorrectOption 
                          ? 'border-green-300 bg-green-50' 
                          : isStudentChoice 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-neutral-600 min-w-[24px]">
                          {optionLetter}.
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {isStudentChoice && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Answer */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">Student Answer:</h4>
            <div className={`p-4 rounded-lg border-2 ${
              isCorrect 
                ? 'border-green-300 bg-green-50' 
                : 'border-red-300 bg-red-50'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {renderAnswerDisplay(studentAnswer?.answer, currentQuestion)}
                </div>
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">Correct Answer:</h4>
            <div className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {renderAnswerDisplay(currentQuestion.correctAnswer, currentQuestion)}
                </div>
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <Card className="bg-white p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-primary-800 mb-4">No Submissions</h3>
          <p className="text-neutral-600 mb-6">There are no submissions to review for this assignment.</p>
          <Button onClick={onClose} variant="primary" className="w-full">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-900 z-[9999] flex flex-col">
      {/* Header */}
      <div className="bg-primary-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="hover:bg-primary-600 p-2 rounded-lg transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{assignmentTitle}</h2>
            <p className="text-primary-200 text-sm">Reading Assignment Review</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-primary-200 hidden md:block">
            <span className="opacity-75">Shortcuts: </span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">←→</kbd> Navigate
            <span className="mx-1">•</span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">Shift+←→</kbd> Questions
          </div>
          <span className="text-sm text-primary-200">
            {selectedSubmissionIndex + 1} / {submissions.length}
          </span>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Student List */}
        <div className="w-80 bg-white border-r border-neutral-200 overflow-y-auto">
          <div className="p-4 bg-accent-50 border-b border-accent-200">
            <h3 className="font-semibold text-primary-800">Students</h3>
            <p className="text-xs text-neutral-600 mt-1">{submissions.length} submissions</p>
          </div>
          <div className="divide-y divide-neutral-200">
            {submissions.map((submission, index) => (
              <button
                key={submission.id}
                onClick={() => handleSubmissionSelect(index)}
                className={`w-full text-left p-4 hover:bg-accent-25 transition-colors ${
                  index === selectedSubmissionIndex ? "bg-secondary-100 border-l-4 border-primary-600" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-800 truncate">
                      {submission.studentName}
                    </p>
                    <p className="text-xs text-neutral-500">{submission.studentCode}</p>
                    <p className="text-xs text-neutral-400 mt-1">{submission.submittedDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {submission.score !== null ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                        {submission.score}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Auto-graded</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column - Question Content */}
        <div className="flex-1 flex flex-col bg-neutral-100">
          <div className="bg-neutral-800 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={selectedSubmissionIndex === 0}
                className="p-1 hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous submission (←)"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <p className="font-semibold">{selectedSubmission?.studentName}</p>
                <p className="text-xs text-neutral-400">
                  {selectedSubmission?.studentCode} • {selectedSubmissionIndex + 1}/{submissions.length}
                </p>
              </div>
              <button
                onClick={handleNext}
                disabled={selectedSubmissionIndex === submissions.length - 1}
                className="p-1 hover:bg-neutral-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next submission (→)"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="text-sm text-neutral-400">
              Submitted: {selectedSubmission?.submittedDate}
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            {renderQuestionContent()}
          </div>
        </div>

        {/* Right Column - Score Summary */}
        <div className="w-80 bg-white border-l border-neutral-200 flex flex-col">
          <div className="p-4 bg-accent-50 border-b border-accent-200">
            <h3 className="font-semibold text-primary-800 flex items-center gap-2">
              <Eye size={20} className="text-primary-600" />
              Score Summary
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Final Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-800 mb-2">
                {selectedSubmission?.score !== null ? selectedSubmission.score : 'N/A'}
                <span className="text-lg text-neutral-500">/10</span>
              </div>
              <p className="text-sm text-neutral-600">Automatically Graded</p>
            </div>

            {/* Question-by-Question Breakdown */}
            {readingData?.questions && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Question Breakdown</h4>
                <div className="space-y-2">
                  {readingData.questions.map((question, index) => {
                    const studentAnswer = readingData.answers.find(a => a.questionId === question.id);
                    const isCorrect = studentAnswer ? isAnswerCorrect(question.id, studentAnswer.answer, question.correctAnswer) : false;
                    
                    return (
                      <div 
                        key={question.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          index === currentQuestionIndex 
                            ? 'border-primary-300 bg-secondary-200' 
                            : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          <div className="flex items-center gap-2">
                            {question.points && (
                              <span className="text-xs text-neutral-500">{question.points}pts</span>
                            )}
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submission Info */}
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">Submission Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Student:</span>
                  <span className="font-medium">{selectedSubmission?.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Code:</span>
                  <span className="font-medium">{selectedSubmission?.studentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Submitted:</span>
                  <span className="font-medium">{selectedSubmission?.submittedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Questions:</span>
                  <span className="font-medium">{readingData?.questions?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
