import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Save, MessageSquare, Award, Bot } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

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

interface WritingGradingViewProps {
  assignmentTitle: string;
  submissions: Submission[];
  onClose: () => void;
  onGradeSubmit: (submissionId: string, score: number, feedback: string) => Promise<void>;
}

export default function WritingGradingView({
  assignmentTitle,
  submissions,
  onClose,
  onGradeSubmit,
}: WritingGradingViewProps) {
  // Toast notifications
  const { toasts, hideToast, success, error: showError } = useToast();
  
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(0);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [documentError, setDocumentError] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [currentFileUrl, setCurrentFileUrl] = useState<string>("");

  const selectedSubmission = submissions[selectedSubmissionIndex];

  // Load score and feedback when submission changes
  useEffect(() => {
    if (selectedSubmission) {
      console.log('Selected submission changed:', {
        studentName: selectedSubmission.studentName,
        score: selectedSubmission.score,
        IsAiScore: selectedSubmission.IsAiScore,
        feedback: selectedSubmission.feedback,
        fileUrl: selectedSubmission.file
      });
      
      setScore(selectedSubmission.score?.toString() || "");
      setFeedback(selectedSubmission.feedback || "");
      setDocumentError(false);
      
      // Only reset loading state if the file URL actually changed (new submission)
      const newFileUrl = selectedSubmission.file || "";
      if (newFileUrl !== currentFileUrl) {
        console.log('File URL changed, resetting loading state');
        setCurrentFileUrl(newFileUrl);
        setDocumentLoading(true);
        
        // Fallback timeout: hide loading after 10 seconds if iframe doesn't trigger onLoad
        const loadingTimeout = setTimeout(() => {
          console.log('Document loading timeout - hiding spinner');
          setDocumentLoading(false);
        }, 10000);
        
        return () => clearTimeout(loadingTimeout);
      } else {
        console.log('Same file URL, keeping current loading state');
      }
    }
  }, [selectedSubmission, currentFileUrl]);

  // Preload next submission's file
  useEffect(() => {
    if (selectedSubmissionIndex < submissions.length - 1) {
      const nextSubmission = submissions[selectedSubmissionIndex + 1];
      if (nextSubmission?.file) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = getFullFileUrl(nextSubmission.file);
        document.head.appendChild(link);
        
        // Cleanup
        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [selectedSubmissionIndex, submissions]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && selectedSubmissionIndex > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && selectedSubmissionIndex < submissions.length - 1) {
        e.preventDefault();
        handleNext();
      }
      // Ctrl/Cmd + S to save
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedSubmissionIndex, submissions.length, score, feedback]);

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

  const handleSave = async () => {
    if (!selectedSubmission) return;

    const parsedScore = score.trim() !== "" ? parseFloat(score) : null;
    const trimmedFeedback = feedback.trim();

    // Validation
    if (parsedScore === null && trimmedFeedback === "") {
      showError("Please provide at least a score or feedback.");
      return;
    }

    if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10)) {
      showError("Score must be a number between 0 and 10.");
      return;
    }

    try {
      setSaving(true);
      await onGradeSubmit(
        selectedSubmission.id,
        parsedScore ?? selectedSubmission.score ?? 0,
        trimmedFeedback || selectedSubmission.feedback || ""
      );
      
      // Check if this is the last submission
      const isLastSubmission = selectedSubmissionIndex === submissions.length - 1;
      
      if (isLastSubmission) {
        success("Grade saved! This was the last submission.");
      } else {
        success("Grade saved! Moving to next submission...");
        // Auto-navigate to next submission after a short delay
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      showError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getFullFileUrl = (fileUrl: string): string => {
    // Ensure proper URL formatting (add / if needed)
    const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${CDN_BASE_URL}${normalizedUrl}`;
  };

  const getDocumentViewerUrl = (fileUrl: string): string => {
    const fullUrl = getFullFileUrl(fileUrl);
    
    // Check if URL has proper extension
    const hasExtension = fileUrl.includes('.') && fileUrl.lastIndexOf('.') > fileUrl.lastIndexOf('/');
    const fileExtension = hasExtension ? fileUrl.split('.').pop()?.toLowerCase() : null;

    console.log('Getting viewer URL:', {
      fileUrl,
      fullUrl,
      hasExtension,
      fileExtension
    });

    // For PDF files, use direct iframe
    if (fileExtension === 'pdf') {
      console.log('Using direct PDF viewer');
      return fullUrl;
    }

    // For DOCX and other Office files, use Microsoft Office Online Viewer
    if (fileExtension === 'docx' || fileExtension === 'doc' || fileExtension === 'xlsx' || fileExtension === 'pptx') {
      console.log('Using Office Online Viewer for Office files');
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    }

    // If no extension detected:
    // - For submissions (student uploaded files), use Google Docs Viewer (supports both PDF and DOC/DOCX)
    // - For assignments (teacher uploaded), use Office viewer as they're likely Word docs
    if (!fileExtension) {
      if (fileUrl.includes('submissions/')) {
        console.log('No extension but is submission - using Google Docs Viewer (supports PDF and DOC)');
        // Submissions can be PDF (from text editor) or DOC/DOCX (from file upload)
        // Google Docs Viewer supports both formats
        return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      } else if (fileUrl.includes('assignments/')) {
        console.log('No extension but is assignment - using Office Online Viewer');
        // Assignments are likely Word docs from teacher
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
      }
    }

    // For other files, use Google Docs Viewer as fallback
    console.log('Using Google Docs Viewer as fallback');
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  const renderDocumentViewer = () => {
    if (!selectedSubmission?.file) {
      return (
        <div className="h-full flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No file submitted</p>
            {selectedSubmission?.content && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm max-w-lg">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {selectedSubmission.content}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    const viewerUrl = getDocumentViewerUrl(selectedSubmission.file);
    console.log('Rendering document viewer:', {
      studentName: selectedSubmission.studentName,
      fileUrl: selectedSubmission.file,
      viewerUrl: viewerUrl
    });

    return (
      <div className="h-full w-full bg-neutral-50 relative">
        {!documentError ? (
          <>
            {/* Loading Skeleton */}
            {documentLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-neutral-600 font-medium">Loading document...</p>
                  <p className="text-neutral-500 text-sm mt-2">{selectedSubmission.studentName}'s submission</p>
                </div>
              </div>
            )}
            
            <iframe
              key={selectedSubmission.file} // Force re-render on file change
              src={viewerUrl}
              className="w-full h-full border-0"
              title="Document Viewer"
              onLoad={() => {
                console.log('Iframe onLoad triggered for:', selectedSubmission.studentName);
                setDocumentLoading(false);
              }}
              onError={() => {
                console.error('Iframe onError triggered');
                setDocumentError(true);
                setDocumentLoading(false);
              }}
            />
            
            <div className="absolute top-2 right-2 z-20">
              <a
                href={getFullFileUrl(selectedSubmission.file)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors shadow-lg"
              >
                Open in New Tab
              </a>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-neutral-500 mb-4">Unable to preview this file</p>
              <a
                href={getFullFileUrl(selectedSubmission.file)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors inline-block"
              >
                Download File
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <Card className="bg-white p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-primary-800 mb-4">No Submissions</h3>
          <p className="text-neutral-600 mb-6">There are no submissions to grade for this assignment.</p>
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
            <p className="text-primary-200 text-sm">Writing Assignment Grading</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-primary-200 hidden md:block">
            <span className="opacity-75">Shortcuts: </span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">←→</kbd> Navigate
            <span className="mx-1">•</span>
            <kbd className="px-2 py-1 bg-primary-600 rounded text-xs">Ctrl+S</kbd> Save
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
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                          {submission.score}
                        </span>
                        {submission.IsAiScore === true && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px]">
                            <Bot size={10} className="text-blue-600" />
                            <span className="text-blue-700 font-medium">AI</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Not graded</span>
                    )}
                    {submission.feedback && (
                      <MessageSquare size={14} className="text-primary-400" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Column - Document Viewer */}
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
          <div className="flex-1 overflow-hidden">
            {renderDocumentViewer()}
          </div>
        </div>

        {/* Right Column - Grading Form */}
        <div className="w-96 bg-white border-l border-neutral-200 flex flex-col">
          <div className="p-4 bg-accent-50 border-b border-accent-200">
            <h3 className="font-semibold text-primary-800 flex items-center gap-2">
              <Award size={20} className="text-primary-600" />
              Grading
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Score Input */}
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Score (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg font-semibold"
                placeholder="Enter score"
              />
              {score && (
                <p className="text-xs text-neutral-500 mt-1">
                  Score: {score}/10
                </p>
              )}
              {/* AI Score Note - Show when IsAiScore is true */}
              {selectedSubmission?.IsAiScore === true && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Bot size={16} className="text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    💡 This score is AI-generated. Your grading will replace it.
                  </p>
                </div>
              )}
            </div>

            {/* Feedback Textarea */}
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                placeholder="Write your feedback here..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                {feedback.length} characters
              </p>
            </div>

            {/* Quick Feedback Buttons */}
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Quick Feedback
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFeedback(feedback + "\n• Good organization and structure")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Good organization
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Strong vocabulary usage")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Strong vocabulary
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Clear thesis statement")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Clear thesis
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Well-supported arguments")}
                  className="text-xs px-3 py-2 bg-accent-100 hover:bg-accent-200 rounded transition-colors text-left"
                >
                  + Good arguments
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• Needs grammar improvement")}
                  className="text-xs px-3 py-2 bg-warning-100 hover:bg-warning-200 rounded transition-colors text-left"
                >
                  - Grammar issues
                </button>
                <button
                  onClick={() => setFeedback(feedback + "\n• More examples needed")}
                  className="text-xs px-3 py-2 bg-warning-100 hover:bg-warning-200 rounded transition-colors text-left"
                >
                  - More examples
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-neutral-200 bg-white">
            <Button
              onClick={handleSave}
              disabled={saving || (score.trim() === "" && feedback.trim() === "")}
              className="w-full btn-primary"
              iconLeft={saving ? <Loader /> : <Save size={18} />}
            >
              {saving ? "Saving..." : "Save & Next"}
            </Button>
            <p className="text-xs text-center text-neutral-500 mt-2">
              {selectedSubmissionIndex < submissions.length - 1
                ? "Will move to next submission after saving"
                : "This is the last submission"}
            </p>
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
