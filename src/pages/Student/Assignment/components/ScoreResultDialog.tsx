import Button from "@/components/ui/Button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

interface SubmissionScore {
  score: number;
  totalPoints: number;
  earnedPoints: number;
  totalQuestions: number;
  correctAnswers: number;
  answeredQuestions: number;
}

interface ScoreResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissionScore: SubmissionScore | null;
}

/**
 * Dialog component to display assignment submission score results
 * Shows score, correct answers, points earned, and progress visualization
 */
export default function ScoreResultDialog({
  isOpen,
  onClose,
  submissionScore,
}: ScoreResultDialogProps) {
  if (!submissionScore) return null;

  const getScoreMessage = (score: number) => {
    if (score >= 8) return "Excellent!";
    if (score >= 6) return "Good Job!";
    if (score >= 4) return "Keep Trying!";
    return "Practice More!";
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Assignment Submitted!
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
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
                {getScoreMessage(submissionScore.score)}
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
                  className={`h-3 rounded-full transition-all ${getProgressColor(submissionScore.score)}`}
                  style={{ width: `${(submissionScore.score / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
