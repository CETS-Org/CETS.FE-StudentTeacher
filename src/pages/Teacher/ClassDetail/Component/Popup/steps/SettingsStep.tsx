import { Settings, CheckCircle, Eye } from "lucide-react";
import Input from "@/components/ui/Input";

interface SettingsStepProps {
  totalPoints: number;
  onTotalPointsChange: (value: number) => void;
  assignmentType?: string;
  timeLimitMinutes: number | undefined;
  onTimeLimitChange: (value: number | undefined) => void;
  maxAttempts: number;
  onMaxAttemptsChange: (value: number) => void;
  isAutoGradable: boolean;
  onAutoGradableChange: (value: boolean) => void;
  answerVisibility: "immediately" | "after_due_date" | "never";
  onAnswerVisibilityChange: (value: "immediately" | "after_due_date" | "never") => void;
  allowBackNavigation: boolean;
  onAllowBackNavigationChange: (value: boolean) => void;
  showProgress: boolean;
  onShowProgressChange: (value: boolean) => void;
  showQuestionNumbers: boolean;
  onShowQuestionNumbersChange: (value: boolean) => void;
  autoSubmit: boolean;
  onAutoSubmitChange: (value: boolean) => void;
  isSpeakingAssignment?: boolean;
  allowMultipleRecordings: boolean;
  onAllowMultipleRecordingsChange: (value: boolean) => void;
  maxRecordings: number;
  onMaxRecordingsChange: (value: number) => void;
}

export default function SettingsStep({
  totalPoints,
  onTotalPointsChange,
  assignmentType,
  timeLimitMinutes,
  onTimeLimitChange,
  maxAttempts,
  onMaxAttemptsChange,
  isAutoGradable,
  onAutoGradableChange,
  answerVisibility,
  onAnswerVisibilityChange,
  allowBackNavigation,
  onAllowBackNavigationChange,
  showProgress,
  onShowProgressChange,
  showQuestionNumbers,
  onShowQuestionNumbersChange,
  autoSubmit,
  onAutoSubmitChange,
  isSpeakingAssignment = false,
  allowMultipleRecordings,
  onAllowMultipleRecordingsChange,
  maxRecordings,
  onMaxRecordingsChange,
}: SettingsStepProps) {
  return (
    <div className="space-y-6 min-h-full">
      {/* Scoring & Timing */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary-600" />
          <h4 className="font-semibold text-neutral-900">Scoring & Timing</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Total Points"
              type="number"
              value={totalPoints}
              onChange={(e) => onTotalPointsChange(parseInt(e.target.value) || 0)}
              disabled={assignmentType === "Quiz"}
              hint={assignmentType === "Quiz" ? "Calculated from questions" : "Enter total points for this assignment"}
            />
          </div>
          <div>
            <Input
              label="Time Limit (minutes)"
              type="number"
              value={timeLimitMinutes || ""}
              onChange={(e) => onTimeLimitChange(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              hint="Leave empty for no time limit"
            />
          </div>
        </div>
      </div>

      {/* Grading Settings - Hide for speaking assignments */}
      {!isSpeakingAssignment && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-neutral-900">Grading Settings</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200">
              <input
                type="checkbox"
                id="autoGradable"
                checked={isAutoGradable}
                onChange={(e) => onAutoGradableChange(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="autoGradable" className="text-sm font-medium text-neutral-900 cursor-pointer">
                  Enable Auto-Grading
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  Automatically grade multiple choice, true/false, and fill-in-the-blank questions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Answer Visibility - Hide for speaking assignments */}
      {!isSpeakingAssignment && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-neutral-900">Answer Visibility</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200">
              <input
                type="radio"
                id="showAnswersImmediately"
                name="answerVisibility"
                value="immediately"
                checked={answerVisibility === "immediately"}
                onChange={(e) => onAnswerVisibilityChange(e.target.value as "immediately" | "after_due_date" | "never")}
                className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="showAnswersImmediately" className="text-sm font-medium text-neutral-900 cursor-pointer">
                  Show correct answers immediately after submission
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  Students will see correct answers right after they submit their assignment
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200">
              <input
                type="radio"
                id="showAnswersAfterDueDate"
                name="answerVisibility"
                value="after_due_date"
                checked={answerVisibility === "after_due_date"}
                onChange={(e) => onAnswerVisibilityChange(e.target.value as "immediately" | "after_due_date" | "never")}
                className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="showAnswersAfterDueDate" className="text-sm font-medium text-neutral-900 cursor-pointer">
                  Show correct answers after due date
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  Students will see correct answers once the due date has passed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200">
              <input
                type="radio"
                id="neverShowAnswers"
                name="answerVisibility"
                value="never"
                checked={answerVisibility === "never"}
                onChange={(e) => onAnswerVisibilityChange(e.target.value as "immediately" | "after_due_date" | "never")}
                className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="neverShowAnswers" className="text-sm font-medium text-neutral-900 cursor-pointer">
                  Never show correct answers
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  Students will never see the correct answers
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speaking Assignment Settings */}
      {isSpeakingAssignment && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-neutral-900">Speaking Recording Settings</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-200">
              <input
                type="checkbox"
                id="allowMultipleRecordings"
                checked={allowMultipleRecordings}
                onChange={(e) => onAllowMultipleRecordingsChange(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="allowMultipleRecordings" className="text-sm font-medium text-neutral-900 cursor-pointer">
                  Allow multiple recordings
                </label>
                <p className="text-xs text-neutral-500 mt-1">
                  Students can record multiple times and select their best recording
                </p>
              </div>
            </div>

            {allowMultipleRecordings && (
              <div>
                <Input
                  label="Maximum Recordings"
                  type="number"
                  value={maxRecordings}
                  onChange={(e) => onMaxRecordingsChange(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  hint="Maximum number of recordings students can make (1-10)"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

