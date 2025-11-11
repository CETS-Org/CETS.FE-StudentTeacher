import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  FileText,
  ListChecks,
  Eye,
  Calendar,
  ArrowLeft,
  PlayCircle,
  Info,
  Headphones,
  BookOpen,
  PenTool,
  MessageSquare
} from "lucide-react";
import { api } from "@/api";
import { startAttempt, getSubmissionsByAssignment, getQuestionDataUrl } from "@/api/assignments.api";
import { getStudentId } from "@/lib/utils";
import type { AssignmentQuestionData } from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  skillID: string | null;
  skillName: string | null;
  totalPoints: number;
  timeLimitMinutes?: number;
  maxAttempts: number;
  isAutoGradable: boolean;
  showAnswersAfterSubmission: boolean;
  showAnswersAfterDueDate: boolean;
  assignmentType: string;
}

interface SubmissionStats {
  attemptCount: number;
  hasSubmitted: boolean;
  canRetake: boolean;
}

export default function StudentAssignmentPreview() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const studentId = getStudentId();
  
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionStats>({
    attemptCount: 0,
    hasSubmitted: false,
    canRetake: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [starting, setStarting] = useState(false);

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
        
        // Load question data if QuestionUrl exists (quiz assignment) to get settings
        let questionDataTimeLimit: number | undefined = undefined;
        let questionDataShowAnswersAfterSubmission: boolean | undefined = undefined;
        let questionDataShowAnswersAfterDueDate: boolean | undefined = undefined;
        let questionDataIsAutoGradable: boolean | undefined = undefined;
        
        if (assignmentData.questionUrl) {
          try {
            // Get presigned URL for question data
            const questionUrlResponse = await getQuestionDataUrl(assignmentId);
            const presignedUrl = questionUrlResponse.data.questionDataUrl;
            
            // Fetch question data using presigned URL
            const questionResponse = await fetch(presignedUrl);
            const questionData: AssignmentQuestionData = await questionResponse.json();
            
            // Get settings from question data if available
            if (questionData.settings) {
              if (questionData.settings.timeLimitMinutes !== undefined) {
                questionDataTimeLimit = questionData.settings.timeLimitMinutes;
              }
              if (questionData.settings.showAnswersAfterSubmission !== undefined) {
                questionDataShowAnswersAfterSubmission = questionData.settings.showAnswersAfterSubmission;
              }
              if (questionData.settings.showAnswersAfterDueDate !== undefined) {
                questionDataShowAnswersAfterDueDate = questionData.settings.showAnswersAfterDueDate;
              }
              if (questionData.settings.isAutoGradable !== undefined) {
                questionDataIsAutoGradable = questionData.settings.isAutoGradable;
              }
            }
          } catch (err) {
            console.error("Failed to load question data:", err);
            // Continue with assignment-level settings if question data fails to load
          }
        }

        // Priority: question data settings > assignment-level settings
        const timeLimitToUse = questionDataTimeLimit ?? assignmentData.timeLimitMinutes;
        const showAnswersAfterSubmissionToUse = questionDataShowAnswersAfterSubmission ?? assignmentData.showAnswersAfterSubmission ?? false;
        const showAnswersAfterDueDateToUse = questionDataShowAnswersAfterDueDate ?? assignmentData.showAnswersAfterDueDate ?? false;
        const isAutoGradableToUse = questionDataIsAutoGradable ?? assignmentData.isAutoGradable ?? false;
        
        setAssignment({
          id: assignmentData.id,
          title: assignmentData.title,
          description: assignmentData.description || "",
          dueDate: assignmentData.dueDate,
          skillID: assignmentData.skillID,
          skillName: assignmentData.skillName,
          totalPoints: assignmentData.totalPoints || 0,
          timeLimitMinutes: timeLimitToUse,
          maxAttempts: assignmentData.maxAttempts || 1,
          isAutoGradable: isAutoGradableToUse,
          showAnswersAfterSubmission: showAnswersAfterSubmissionToUse,
          showAnswersAfterDueDate: showAnswersAfterDueDateToUse,
          assignmentType: assignmentData.assignmentType || "homework"
        });

        // Fetch submission history to determine attempts
        try {
          const submissionsResponse = await getSubmissionsByAssignment(assignmentId);
          const allSubmissions = submissionsResponse.data?.data || submissionsResponse.data || [];
          
          // Filter submissions for this student
          const studentSubmissions = Array.isArray(allSubmissions) 
            ? allSubmissions.filter((sub: any) => sub.studentID === studentId)
            : [];
          
          const attemptCount = studentSubmissions.length;
          const hasSubmitted = attemptCount > 0;
          // Only one attempt allowed - if they have any submission, they can't retake
          const canRetake = attemptCount === 0;

          setSubmissions({
            attemptCount,
            hasSubmitted,
            canRetake
          });
        } catch (subErr: any) {
          console.error("Failed to load submissions:", subErr);
          // If we can't load submissions, assume no attempts (allow starting)
          setSubmissions({
            attemptCount: 0,
            hasSubmitted: false,
            canRetake: true
          });
        }

      } catch (err: unknown) {
        console.error("Failed to load assignment:", err);
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error.response?.data?.message || error.message || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId, studentId]);

  const getSkillIcon = (skillName: string | null) => {
    if (!skillName) return <FileText className="w-6 h-6" />;
    const skill = skillName.toLowerCase();
    if (skill.includes("listening")) return <Headphones className="w-6 h-6" />;
    if (skill.includes("reading")) return <BookOpen className="w-6 h-6" />;
    if (skill.includes("writing")) return <PenTool className="w-6 h-6" />;
    if (skill.includes("speaking")) return <MessageSquare className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleStartQuiz = () => {
    setShowStartDialog(true);
  };

  const confirmStart = async () => {
    if (!assignmentId || !studentId || !assignment) {
      alert("Missing required information. Please try again.");
      return;
    }

    setStarting(true);
    try {
      // Start attempt - this creates a submission record and counts as an attempt
      await startAttempt(assignmentId, studentId);

      setShowStartDialog(false);
      navigate(`/student/assignment/${assignmentId}/take`);
    } catch (err: any) {
      console.error("Failed to start quiz:", err);
      alert(err.response?.data?.message || err.message || "Failed to start quiz. Please try again.");
      setStarting(false);
    }
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
        <div className="max-w-4xl mx-auto text-center">
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

  const isDueDatePassed = new Date(assignment.dueDate) < new Date();

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            iconLeft={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back to Session
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-500 text-white rounded-lg">
              {getSkillIcon(assignment.skillName)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary-900 mb-2">{assignment.title}</h1>
              {assignment.skillName && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <span className="text-sm font-medium">{assignment.skillName}</span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-sm capitalize">{assignment.assignmentType}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Due Date Warning */}
        {isDueDatePassed && (
          <Card className="mb-6 border-l-4 border-red-500 bg-red-50">
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Assignment Overdue</p>
                <p className="text-sm text-red-700">This assignment was due on {formatDate(assignment.dueDate)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Already Attempted Warning */}
        {submissions.hasSubmitted && (
          <Card className="mb-6 border-l-4 border-red-500 bg-red-50">
            <div className="p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Already Attempted</p>
                <p className="text-sm text-red-700">You have already attempted this assignment. Only one attempt is allowed.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-3">Description</h2>
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {assignment.description || "No description provided."}
                </p>
              </div>
            </Card>

            {/* Quiz Settings */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <ListChecks className="w-5 h-5" />
                  Quiz Settings
                </h2>
                
                <div className="space-y-4">
                  {/* Time Limit */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Time Limit</p>
                      <p className="text-sm text-neutral-600">
                        {assignment.timeLimitMinutes 
                          ? `${assignment.timeLimitMinutes} minutes`
                          : "No time limit"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Max Attempts */}
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Maximum Attempts</p>
                      <p className="text-sm text-neutral-600">
                        {assignment.maxAttempts === -1 
                          ? "Unlimited attempts"
                          : `${assignment.maxAttempts} attempt(s)`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Auto Grading */}
                  <div className="flex items-start gap-3">
                    {assignment.isAutoGradable ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-neutral-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Auto Grading</p>
                      <p className="text-sm text-neutral-600">
                        {assignment.isAutoGradable
                          ? "Your answers will be graded automatically"
                          : "Your answers will be graded manually by the instructor"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Answer Visibility - Show only the enabled option or "Never" if both are false */}
                  {assignment.showAnswersAfterSubmission ? (
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">Answer Visibility</p>
                        <p className="text-sm text-neutral-600">
                          You can view the correct answers immediately after submitting
                        </p>
                      </div>
                    </div>
                  ) : assignment.showAnswersAfterDueDate ? (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">Answer Visibility</p>
                        <p className="text-sm text-neutral-600">
                          You can view the correct answers after the due date
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-neutral-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">Answer Visibility</p>
                        <p className="text-sm text-neutral-600">
                          Correct answers will never be shown
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Important Notes */}
            <Card className=" bg-secondary-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Important Notes
                </h2>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>Once you start the quiz, the timer will begin (if applicable).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>Your progress will be auto-saved every 30 seconds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>Make sure you have a stable internet connection.</span>
                  </li>
                  {assignment.timeLimitMinutes && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span className="font-medium text-red-700">The quiz will be auto-submitted when time runs out.</span>
                    </li>
                  )}
                </ul>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Assignment Info</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-primary-600">{assignment.totalPoints}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Due Date</p>
                    <p className={`text-sm font-medium ${isDueDatePassed ? 'text-red-600' : 'text-neutral-900'}`}>
                      {formatDate(assignment.dueDate)}
                    </p>
                  </div>

                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleStartQuiz}
                  disabled={!submissions.canRetake}
                  iconLeft={<PlayCircle className="w-5 h-5" />}
                >
                  Start Quiz
                </Button>

                {!submissions.canRetake && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    You have already attempted this assignment
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Start Confirmation Dialog */}
        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Quiz</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-3">
                <p className="text-neutral-700">
                  Are you ready to start this quiz?
                </p>
                {assignment.timeLimitMinutes && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>The timer will start as soon as you begin.</span>
                    </p>
                  </div>
                )}
                <p className="text-sm text-neutral-600">
                  You can only attempt this assignment once. Make sure you're ready before starting.
                </p>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowStartDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmStart} disabled={starting}>
                {starting ? "Starting..." : "Start Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

