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
  onRecommendCourses?: () => void;
  onRecommendPackages?: () => void;
  recommendCoursesLabel?: string;
  recommendPackagesLabel?: string;
  maxScore?: number; // Optional max score (default: 10 for assignments, 900 for placement test)
}

/**
 * Dialog component to display assignment submission score results
 * Shows score, correct answers, points earned, and progress visualization
 */
const isTakingAssignment =
  location.pathname.includes("/student/assignment") ;

export default function ScoreResultDialog({
  isOpen,
  onClose,
  submissionScore,
  onRecommendCourses,
  onRecommendPackages,
  recommendCoursesLabel = "Courses for you",
  recommendPackagesLabel = "Learning path for you",
  maxScore, // Optional maxScore prop, will use submissionScore.totalPoints if not provided
}: ScoreResultDialogProps) {
  if (!submissionScore) return null;

  // Use submissionScore.totalPoints as maxScore if maxScore prop is not provided
  const effectiveMaxScore = maxScore ?? submissionScore.totalPoints;

  const getScoreMessage = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "Excellent!";
    if (percentage >= 60) return "Good Job!";
    if (percentage >= 40) return "Keep Trying!";
    return "Practice More!";
  };

  const getProgressColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden">
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
                  <div className="text-sm text-primary-100">out of {effectiveMaxScore}</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mt-2">
                {getScoreMessage(submissionScore.score, effectiveMaxScore)}
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
                    {submissionScore.score.toFixed(2)} / {effectiveMaxScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Progress</span>
                <span>{Math.round((submissionScore.score / effectiveMaxScore) * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getProgressColor(submissionScore.score, effectiveMaxScore)}`}
                  style={{ width: `${(submissionScore.score / effectiveMaxScore) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full">
          {onRecommendCourses && (
            <Button variant="secondary" onClick={onRecommendCourses} className="w-full sm:w-1/2">
              {recommendCoursesLabel}
            </Button>
          )}
          {onRecommendPackages && (
            <Button variant="secondary" onClick={onRecommendPackages} className="w-full sm:w-1/2">
              {recommendPackagesLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
