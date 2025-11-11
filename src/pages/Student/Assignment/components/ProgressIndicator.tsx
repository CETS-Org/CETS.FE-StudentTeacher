import { CheckCircle, Clock } from "lucide-react";

interface ProgressIndicatorProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  timeRemaining: number | null;
  formatTime: (seconds: number) => string;
}

/**
 * Displays assignment progress and timer
 */
export default function ProgressIndicator({
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
  timeRemaining,
  formatTime,
}: ProgressIndicatorProps) {
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Progress: {answeredCount} of {totalQuestions} questions answered
          </span>
          <span className="text-sm font-medium text-neutral-700">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timer and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success-600" />
          <span className="text-sm text-neutral-600">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        {timeRemaining !== null && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning-600" />
            <span
              className={`text-sm font-medium ${
                timeRemaining < 300 ? "text-danger-600" : "text-neutral-700"
              }`}
            >
              Time Remaining: {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
