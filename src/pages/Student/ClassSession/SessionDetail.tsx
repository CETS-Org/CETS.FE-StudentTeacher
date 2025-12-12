import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import Tabs from "@/components/ui/Tabs";
import Breadcrumbs, { type Crumb } from "@/components/ui/Breadcrumbs";
import Loader from "@/components/ui/Loader";
import PageHeader from "@/components/ui/PageHeader";
import { 
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Upload,
  BookOpen,
  ExternalLink,
  Target,
  CheckSquare,
  MessageSquare,
  Send,
  Save,
  ArrowLeft,
  Headphones,
  PenTool,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { getCoveredTopicByMeetingId, getAssignmentsByMeetingAndStudent, type CoveredTopic, type MeetingAssignment } from "@/services/teachingClassesService";
import { getClassMeetingsByClassId, type ClassMeeting } from "@/api/classMeetings.api";
import { getStudentId } from "@/lib/utils";
import { api, downloadSubmission } from "@/api";
import { submitWritingAssignment } from "@/api/assignments.api";
import type { ClassDetail } from "@/types/class";
import type { LearningMaterial } from "@/types/learningMaterial";
import { config } from "@/lib/config";
import WritingAssignmentEditor from "@/pages/Student/Assignment/components/WritingAssignmentEditor";
import QuizReviewDialog from "@/pages/Student/Assignment/components/QuizReviewDialog";

const tabs = [
  { id: "context", label: "Session Context" },
  { id: "materials", label: "Materials" },
  { id: "assignments", label: "Assignments" }
];

export default function SessionDetail() {
  const { classId, sessionId } = useParams<{ classId: string; sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Persist active tab in localStorage
  const getInitialTab = (currentSessionId: string | undefined) => {
    if (typeof window !== 'undefined' && currentSessionId) {
      const saved = localStorage.getItem(`sessionTab_${currentSessionId}`);
      // Validate that the saved tab exists in tabs array
      if (saved && tabs.some(tab => tab.id === saved)) {
        return saved;
      }
    }
    return tabs[0].id;
  };
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || getInitialTab(sessionId));
  const [context, setContext] = useState<CoveredTopic | null>(null);
  const [assignments, setAssignments] = useState<MeetingAssignment[] | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [meeting, setMeeting] = useState<ClassMeeting | null>(null);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [sessionNumber, setSessionNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingContext, setLoadingContext] = useState<boolean>(true);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(true);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorContext, setErrorContext] = useState<string | null>(null);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [errorMaterials, setErrorMaterials] = useState<string | null>(null);
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedSkillTab, setSelectedSkillTab] = useState<string | null>('all'); // 'all' or skillID
  
  // Writing Assignment View state
  const [isWritingViewOpen, setIsWritingViewOpen] = useState<boolean>(false);
  const [writingAssignment, setWritingAssignment] = useState<MeetingAssignment | null>(null);
  const [writingSubmissionSuccess, setWritingSubmissionSuccess] = useState<boolean>(false);
  
  // Store data for confirm dialog
  const [confirmData, setConfirmData] = useState<{
    assignmentId: string;
    file: File;
  } | null>(null);

  // AI Score dialog state for writing assignments
  const [aiScoreDialogOpen, setAiScoreDialogOpen] = useState<boolean>(false);
  const [aiScoreData, setAiScoreData] = useState<{
    score: number;
    feedback: string;
    submissionId: string;
    isAiScore?: boolean; // lowercase to match API
  } | null>(null);

  // Quiz Review Dialog state
  const [quizReviewOpen, setQuizReviewOpen] = useState<boolean>(false);
  const [selectedQuizReview, setSelectedQuizReview] = useState<{
    assignmentId: string;
    assignmentTitle: string;
    dueAt: string;
    submission: any;
  } | null>(null);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  // Helper to parse objectives string from API to string[]
  const parseObjectives = (raw?: string | null): string[] => {
    if (!raw) return [];
    const trimmed = raw.trim();
    try {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      }
    } catch {}
    return trimmed
      .split(/\r?\n|;|•|,/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  // Fetch class details and meeting info
  useEffect(() => {
    const loadClassAndMeetingDetails = async () => {
      if (!classId || !sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class details
        const classResponse = await api.getClassDetailsById(classId);
        setClassDetail(classResponse.data);
        
        // Fetch all meetings to find the current one and its session number
        const meetings = await getClassMeetingsByClassId(classId);
        
        if (meetings && meetings.length > 0) {
          const meetingIndex = meetings.findIndex(m => m.id === sessionId);
          const foundMeeting = meetings.find(m => m.id === sessionId);
          
          if (foundMeeting) {
            setMeeting(foundMeeting);
            // Use passcode if available, otherwise use session number
            const sessionNum = foundMeeting.passcode || `Session ${meetingIndex + 1}`;
            setSessionNumber(sessionNum);
          }
        }
      } catch (err) {
        console.error('Error fetching class/meeting details:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    loadClassAndMeetingDetails();
  }, [classId, sessionId]);

  // Update activeTab when tab query parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["context", "materials", "assignments"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Load Session Context via API
  useEffect(() => {
    let mounted = true;
    async function loadContext() {
      if (!sessionId) { setErrorContext("Missing sessionId"); setLoadingContext(false); return; }
      try {
        const rawData = await getCoveredTopicByMeetingId(sessionId);
        // Parse objectives from string to array
        const parsedContext = {
          ...rawData,
          objectives: parseObjectives((rawData as any)?.objectives)
        };
        if (mounted) setContext(parsedContext as CoveredTopic);
      } catch (e: any) {
        if (mounted) setErrorContext(e?.message || "Failed to load session context");
      } finally {
        if (mounted) setLoadingContext(false);
      }
    }
    loadContext();
    return () => { mounted = false; };
  }, [sessionId]);

  // Define loadAssignments as a reusable function (outside useEffect so it can be called anywhere)
  const loadAssignments = useCallback(async () => {
    if (!sessionId) { 
      setErrorAssignments("Missing sessionId"); 
      setLoadingAssignments(false); 
      return; 
    }
    
    // Get student ID from authentication
    const studentId = getStudentId();
    if (!studentId) { 
      setErrorAssignments("User not authenticated. Please login again."); 
      setLoadingAssignments(false); 
      return; 
    }
    
    try {
      console.log('Loading assignments for session:', sessionId);
      const data = await getAssignmentsByMeetingAndStudent(sessionId, studentId);
      setAssignments(data);
      console.log('Assignments loaded:', data);
    } catch (e: any) {
      setErrorAssignments(e?.message || "Failed to load assignments");
      console.error('Error loading assignments:', e);
    } finally {
      setLoadingAssignments(false);
    }
  }, [sessionId]);

  // Load assignments on mount and refresh when navigating back to this page
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Refresh assignments when assignments tab becomes active or window gains focus
  useEffect(() => {
    if (!sessionId || activeTab !== 'assignments') return;
    
    // Refresh on window focus (when user returns to tab)
    const handleFocus = () => {
      loadAssignments();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [sessionId, activeTab, loadAssignments]);

  // Load Materials via API
  useEffect(() => {
    let mounted = true;
    async function loadMaterials() {
      if (!sessionId) { 
        setErrorMaterials("Missing sessionId"); 
        setLoadingMaterials(false); 
        return; 
      }
      
      try {
        const response = await api.getLearningMaterialsByClassMeeting(sessionId);
        const materialsData = response.data || [];
        if (mounted) setMaterials(materialsData);
      } catch (e: any) {
        if (mounted) setErrorMaterials(e?.message || "Failed to load materials");
      } finally {
        if (mounted) setLoadingMaterials(false);
      }
    }
    loadMaterials();
    return () => { mounted = false; };
  }, [sessionId]);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (sessionId && activeTab) {
      localStorage.setItem(`sessionTab_${sessionId}`, activeTab);
    }
  }, [activeTab, sessionId]);

  // Update active tab when sessionId changes (e.g., navigating to different session)
  useEffect(() => {
    if (sessionId) {
      const savedTab = getInitialTab(sessionId);
      setActiveTab(savedTab);
    }
  }, [sessionId]);
  
  const handleDownloadFile = async (material: LearningMaterial) => {
    if (!material.storeUrl) {
      alert('File URL is not available.');
      return;
    }

    try {
      // Construct full URL using storage base URL
      const fullUrl = material.storeUrl.startsWith('http') 
        ? material.storeUrl 
        : `${config.storagePublicUrl}${material.storeUrl.startsWith('/') ? material.storeUrl : '/' + material.storeUrl}`;
      
      // Fetch the file as a blob to bypass CORS restrictions
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = material.fileName || material.title || 'download';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Download assignment file using API
  const handleDownloadAssignment = async (assignmentId: string, fileName?: string) => {
    try {
      const response = await api.downloadAssignment(assignmentId);
      
      // Create blob from response data
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `assignment-${assignmentId}`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error('Download assignment error:', error);
      alert(`Failed to download assignment: ${error.response?.data?.message || error.message}`);
    }
  };

  // Download submission file using API
  const handleDownloadSubmission = async (submissionId: string) => {
    try {
      const res = await downloadSubmission(submissionId);
  
      // BE trả JSON có downloadUrl
      const presignedUrl = res.data?.downloadUrl;
      if (!presignedUrl) throw new Error("No presigned URL returned from server");
  
      // Mở file thật (Cloudflare R2)
      const link = document.createElement("a");
      link.href = presignedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error("Download submission error:", error);
      alert(
        `Failed to download submission: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  // Extract filename from URL
  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch {
      return url;
    }
  };

  // Check if assignment is past due date
  const isPastDue = (dueAt: string) => {
    try {
      const now = new Date();
      const due = new Date(dueAt);
      return now > due;
    } catch {
      return false;
    }
  };

  // Quiz handling - navigate to quiz preview page
  const handleStartQuiz = (assignment: MeetingAssignment) => {
    if (!assignment.questionUrl) return;
    navigate(`/student/assignment/${assignment.id}/preview`);
  };

  // Upload flow handlers
  const handleOpenUpload = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsUploadOpen(true);
  };

  // Writing Assignment handlers
  const handleOpenWritingView = (assignment: MeetingAssignment) => {
    setWritingAssignment(assignment);
    setIsWritingViewOpen(true);
  };

  const handleCloseWritingView = () => {
    setIsWritingViewOpen(false);
    setWritingAssignment(null);
    
    // Always refresh assignments when closing view to ensure latest data
    // This handles both successful submissions and cancellations
    setTimeout(async () => {
      try {
        console.log('Refreshing assignments after closing writing view...');
        await loadAssignments();
        console.log('Assignments refreshed after closing view');
        
        // If submission was successful, try one more refresh after a delay
        // to ensure backend has fully processed the submission
        if (writingSubmissionSuccess) {
          setWritingSubmissionSuccess(false);
          setTimeout(async () => {
            try {
              console.log('Second refresh to ensure submission is processed...');
              await loadAssignments();
              console.log('Second refresh completed');
            } catch (error) {
              console.warn('Second refresh failed:', error);
            }
          }, 1500);
        }
      } catch (error) {
        console.error('Failed to refresh assignments after closing view:', error);
        // Force reload if refresh fails
        if (writingSubmissionSuccess) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }, 300);
  };

  const handleWritingSubmit = async (file: File) => {
    if (!writingAssignment) {
      throw new Error("No assignment selected");
    }

    const studentId = getStudentId();
    if (!studentId) {
      throw new Error("Student ID not found");
    }

    try {
      // Prepare file metadata following teacher's standard
      const contentType = file.type || 'application/octet-stream';
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentID", writingAssignment.id);
      formData.append("studentID", studentId);
      formData.append("FileName", fileNameWithoutExtension);
      formData.append("ContentType", contentType);

      console.log('Submitting writing assignment:', {
        originalFileName: file.name,
        fileName: fileNameWithoutExtension,
        contentType: contentType,
        fileSize: file.size,
        assignmentId: writingAssignment.id,
        studentId: studentId
      });

      const response = await submitWritingAssignment(formData);

      console.log('Writing assignment submission response:', {
        status: response.status,
        data: response.data
      });

      // Handle nested response structure: { success, data: { submissionId, score, feedback, uploadUrl, storeUrl, submittedAt, isAiScore } } or direct data
      let responseData = response.data;
      if (responseData && responseData.data) {
        responseData = responseData.data;
      }

      console.log('Parsed response data:', responseData);

      // Extract uploadUrl and other data
      const { uploadUrl, storeUrl, submissionId, score, feedback, submittedAt, isAiScore } = responseData;

      // Step 2: Upload file to Cloudflare using uploadUrl
      if (uploadUrl) {
        console.log('Uploading file to Cloudflare:', uploadUrl);
        
        const putResp = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
          },
          body: file,
        });

        if (!putResp.ok) {
          throw new Error(`File upload to Cloudflare failed: ${putResp.status} ${putResp.statusText}`);
        }

        console.log('File uploaded to Cloudflare successfully');
      } else {
        console.warn('No uploadUrl received from server, skipping file upload');
      }

      // Check if AI scored
      const hasAiScore = score !== undefined && score !== null;

      if (hasAiScore) {
        // Show AI score dialog
        setAiScoreData({
          score: score || 0,
          feedback: feedback || "No feedback provided",
          submissionId: submissionId || "",
          isAiScore: isAiScore || false,
        });
        setAiScoreDialogOpen(true);
      }

      // Mark submission as successful
      setWritingSubmissionSuccess(true);

      // Wait a bit for backend to process the submission before refreshing
      // This ensures the API returns the updated submission status
      setTimeout(async () => {
        try {
          console.log('Refreshing assignments after submission...');
          await loadAssignments();
          console.log('Assignments refreshed successfully');
        } catch (refreshError) {
          console.warn('Failed to refresh assignments after submission:', refreshError);
          // Try one more time after a longer delay
          setTimeout(async () => {
            try {
              console.log('Retrying assignments refresh...');
              await loadAssignments();
              console.log('Assignments refreshed on retry');
            } catch (retryError) {
              console.error('Retry refresh also failed:', retryError);
            }
          }, 1000);
        }
      }, 1000); // Wait 1 second for backend to process
      
      // Function should return void, not the response
    } catch (error: any) {
      // Reset success flag on error
      setWritingSubmissionSuccess(false);
      
      console.error("Writing assignment submission error:", error);
      
      // Check if it's an axios error with response
      if (error.response) {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.title 
          || error.response?.data?.errors 
          || "Failed to submit assignment";
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }
      
      throw new Error(error.message || "Failed to submit assignment");
    }
  };

  const handleFileChange = (file: File | null) => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setSelectedFile(file);
    if (file) {
      // Check file size (50MB limit)
      const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSizeInBytes) {
        alert(`File size exceeds the 50MB limit. Please choose a smaller file.`);
        setSelectedFile(null);
        return;
      }
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    }
  };

  const resetUploadState = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setSelectedFile(null);
    setSelectedAssignmentId(null);
    setSubmitting(false);
  };

  const closeUploadDialog = () => {
    setIsUploadOpen(false);
    resetUploadState();
  };

  const handleSubmitAssignment = () => {
    if (!selectedFile || !selectedAssignmentId) {
      return;
    }
    
    // Store data for confirm dialog
    setConfirmData({
      assignmentId: selectedAssignmentId,
      file: selectedFile
    });
    
    // Close upload dialog first, then open confirm dialog
    setIsUploadOpen(false);
    setConfirmOpen(true);
  };

  const confirmSubmitAssignment = async () => {
    if (!confirmData || !sessionId) {
      return;
    }
    
    const { assignmentId, file } = confirmData;
    
    try {
      setSubmitting(true);
      
      // Get student ID
      const studentId = getStudentId();
      if (!studentId) {
        alert('User not authenticated. Please login again.');
        return;
      }

      // Find the assignment to check if it's a writing assignment
      const currentAssignment = assignments?.find(a => a.id === assignmentId);
      const isWritingAssignment = currentAssignment?.skillName?.toLowerCase() === 'writing';


      if (isWritingAssignment) {
        // Handle writing assignment with AI grading
        // Validate file type for writing assignments
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['docx', 'doc', 'pdf'];
        
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
          throw new Error('Only DOCX, DOC, and PDF files are allowed for writing assignments.');
        }
        
        // Create FormData for writing submission following teacher's standard
        const formData = new FormData();
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        
        // Set correct ContentType based on file extension, fallback to octet-stream
        let contentType = file.type || 'application/octet-stream';
        if (contentType === 'application/octet-stream') {
          // Map file extension to correct MIME type
          const mimeTypes: { [key: string]: string } = {
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword',
            'pdf': 'application/pdf'
          };
          contentType = mimeTypes[fileExtension] || 'application/octet-stream';
        }
        
        formData.append('file', file);
        formData.append('assignmentID', assignmentId);
        formData.append('studentID', studentId);
        formData.append('FileName', fileNameWithoutExt);
        formData.append('ContentType', contentType);

        console.log('Submitting writing assignment (file upload):', {
          originalFileName: file.name,
          fileName: fileNameWithoutExt,
          contentType: contentType,
          fileExtension: fileExtension,
          fileSize: file.size,
          assignmentId: assignmentId,
          studentId: studentId
        });

        const writingResponse = await submitWritingAssignment(formData);
        
        // Response structure: { success, data: { submissionId, score, feedback, uploadUrl, storeUrl, submittedAt, isAiScore } }
        const responseData = writingResponse.data.data || writingResponse.data;
        // API returns 'isAiScore' (lowercase 'i')
        const { uploadUrl, storeUrl, submissionId, score, feedback, submittedAt, isAiScore } = responseData;

        if (!uploadUrl) {
          throw new Error('No upload URL received from server');
        }

        // Step 2: Upload to Cloudflare using PUT
        
        const putResp = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
          },
          body: file,
        });

        if (!putResp.ok) {
          throw new Error(`File upload failed: ${putResp.status} ${putResp.statusText}`);
        }

        // Update UI with AI-graded submission
        setAssignments(prev => {
          if (!prev) return prev;
          return prev.map(a => {
            if (a.id !== assignmentId) return a;
            return {
              ...a,
              submissions: [
                {
                  id: submissionId || `submission-${Date.now()}`,
                  assignmentID: a.id,
                  studentID: studentId,
                  storeUrl: storeUrl,
                  content: file.name,
                  score: score,
                  feedback: feedback,
                  createdAt: submittedAt || new Date().toISOString(),
                  isAiScore: isAiScore, // lowercase to match API
                },
                ...(a.submissions || []),
              ],
            };
          });
        });

        // Show AI score dialog
        setAiScoreData({
          score: score,
          feedback: feedback,
          submissionId: submissionId,
          isAiScore: isAiScore, // lowercase to match API
        });
        setAiScoreDialogOpen(true);

        setConfirmOpen(false);
        setConfirmData(null);
        resetUploadState();
        
      } else {
        // Handle regular assignment submission
        const submitResponse = await api.submitAssignment({
          assignmentID: assignmentId,
          studentID: studentId,
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          content: null,
        });

        const { uploadUrl, storeUrl, contentType, id, createdAt } = submitResponse.data;
        
        if (!uploadUrl) {
          throw new Error('No upload URL received from server');
        }
        
        // Step 2: Upload to R2 using EXACT same Content-Type as signed
        const putResp = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 
            'Content-Type': contentType || file.type || 'application/octet-stream' 
          },
          body: file,
        });

        // Step 3: Validate upload result
        if (!putResp.ok) {
          const errText = await putResp.text().catch(() => '');
          throw new Error(`R2 upload failed: ${putResp.status} ${putResp.statusText} ${errText}`);
        }

        alert('Upload / Resubmit thành công!');
        // Update UI to show submission with real data from backend response
        setAssignments(prev => {
          if (!prev) return prev;
          return prev.map(a => {
            if (a.id !== assignmentId) return a;
            return {
              ...a,
              submissions: [
                {
                  id: id || `submission-${Date.now()}`,
                  assignmentID: a.id,
                  studentID: studentId,
                  storeUrl: storeUrl,
                  content: file.name,
                  score: null,
                  feedback: null,
                  createdAt: createdAt || new Date().toISOString(),
                },
                ...(a.submissions || []),
              ],
            };
          });
        });

        setConfirmOpen(false);
        setConfirmData(null);
        resetUploadState();
      }
    } catch (e: any) {
      console.error('Submit assignment error:', e);
      alert(`Failed to submit assignment: ${e.response?.data?.message || e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Breadcrumbs - using real data when available
  const crumbs: Crumb[] = classDetail
    ? [
        { label: "My Classes", to: "/student/my-classes" },
        { label: classDetail.courseName, to: `/student/class/${classId}` },
        { label: sessionNumber || "Session" },
      ]
    : [
        { label: "My Classes", to: "/student/my-class" },
        { label: "Loading..." },
      ];

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </StudentLayout>
    );
  }

  if (error || !classDetail || !sessionId) {
    return (
      <StudentLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            {error || 'Session not found'}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={crumbs} />

        {/* Page Header */}
        <PageHeader
          title={`${classDetail.courseName} - ${sessionNumber || 'Session'}`}
          description={context?.topicTitle || 'View session content, materials, and assignments.'}
        />

        {/* Tabs + Card */}
        <Card className="shadow-lg border border-accent-100 bg-white">
          <div className="bg-white p-1 rounded-lg">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId)}
            />
            <div className="mt-4 p-4 min-h-[400px]">
              {/* Session Context Tab */}
              <div className={activeTab === "context" ? "block" : "hidden"}>
            <div className="space-y-6">
              {loadingContext && (
                <div className="text-sm text-neutral-600">Loading session context...</div>
              )}
              {errorContext && !loadingContext && (
                <div className="text-sm text-danger-600">{errorContext}</div>
              )}
              {!loadingContext && !errorContext && context && (
                <>
                  {/* Main Content Area with 2-column layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Topic and Content Summary */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Session Topic */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-blue-600 mb-1">Session Topic</h3>
                            <p className="text-xl font-bold text-gray-900">{context.topicTitle}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Summary */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">Content Summary</h3>
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-blue-100">
                          <p className="text-gray-700 leading-relaxed">{context.contentSummary || 'No content summary provided.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Learning Objectives */}
                    <div className="lg:col-span-1">
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl shadow-sm h-full">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">Learning Objectives</h3>
                          </div>
                        </div>
                        {(!context.objectives || !Array.isArray(context.objectives) || context.objectives.length === 0) ? (
                          <div className="text-gray-600 text-sm">No objectives provided.</div>
                        ) : (
                          <div className="space-y-3">
                            {context.objectives.map((objective, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-white border border-emerald-200 rounded-lg shadow-sm">
                                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed">{objective}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pre-Reading Material */}
                  {context.preReadingUrl && (
                    <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-neutral-600 rounded-xl flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800">Pre-Reading Material</h3>
                      </div>
                      <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                        <a 
                          href={context.preReadingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-800 font-semibold text-lg transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Access Pre-Reading Material
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
              </div>

              {/* Course Materials Tab */}
              <div className={activeTab === "materials" ? "block" : "hidden"}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-800">Course Materials</h3>
              {loadingMaterials && (
                <div className="text-sm text-neutral-600">Loading materials...</div>
              )}
              {errorMaterials && !loadingMaterials && (
                <div className="text-sm text-danger-600">{errorMaterials}</div>
              )}
              {!loadingMaterials && !errorMaterials && materials.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No materials available</h3>
                  <p className="text-neutral-600">Course materials will be uploaded by your instructor.</p>
                </div>
              )}
              {!loadingMaterials && !errorMaterials && materials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-4 border border-accent-200 rounded-lg bg-white hover:bg-accent-25 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-800">{material.title}</h4>
                      <p className="text-sm text-accent-600 font-medium">
                        Uploaded on {formatDate(material.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownloadFile(material)}
                      iconLeft={<Download className="w-4 h-4" />}
                      className="bg-accent-500 hover:bg-accent-600"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
              </div>



              {/* Assignment Submission Tab */}
              <div className={activeTab === "assignments" ? "block" : "hidden"}>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-900">Assignments</h2>
              </div>
              
              {loadingAssignments && (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader />
                </div>
              )}
              {errorAssignments && !loadingAssignments && (
                <div className="text-center py-12">
                  <div className="text-sm text-danger-600 mb-4">{errorAssignments}</div>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {!loadingAssignments && !errorAssignments && (assignments?.length ?? 0) === 0 && (
                <div className="text-center py-12 bg-accent-25 rounded-lg">
                  <Calendar className="w-16 h-16 text-accent-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary-800 mb-2">
                    No Assignments Yet
                  </h3>
                  <p className="text-neutral-600">
                    Assignments will be posted by your instructor.
                  </p>
                </div>
              )}
              
              {/* Skill Tabs and Assignments */}
              {!loadingAssignments && !errorAssignments && assignments && assignments.length > 0 && (() => {
                const skillGroups: { [key: string]: { skillID: string | null; skillName: string; assignments: MeetingAssignment[] } } = {
                  'all': { skillID: null, skillName: 'All', assignments: [] },
                  'no-skill': { skillID: null, skillName: 'No Skill', assignments: [] }
                };
                
                assignments.forEach(asm => {
                  const skillKey = asm.skillID || 'no-skill';
                  const skillName = asm.skillName || 'No Skill';
                  
                  if (!skillGroups[skillKey]) {
                    skillGroups[skillKey] = {
                      skillID: asm.skillID || null,
                      skillName: skillName,
                      assignments: []
                    };
                  }
                  skillGroups[skillKey].assignments.push(asm);
                });
                
                // Sort assignments by createdAt (latest first)
                const sortedAssignments = [...assignments].sort((a, b) => {
                  const dateA = new Date(a.createdAt).getTime();
                  const dateB = new Date(b.createdAt).getTime();
                  return dateB - dateA; // Descending order (latest first)
                });
                
                // Sort assignments in each skill group
                Object.keys(skillGroups).forEach(key => {
                  if (key !== 'all') {
                    skillGroups[key].assignments.sort((a, b) => {
                      const dateA = new Date(a.createdAt).getTime();
                      const dateB = new Date(b.createdAt).getTime();
                      return dateB - dateA; // Descending order (latest first)
                    });
                  }
                });
                
                skillGroups['all'].assignments = sortedAssignments;
                
                const filteredAssignments = selectedSkillTab === 'all' 
                  ? sortedAssignments 
                  : skillGroups[selectedSkillTab || 'all']?.assignments || [];
                
                return (
                  <>
                    {/* Skill Tabs */}
                    {Object.keys(skillGroups).length > 1 && (
                      <div className="mb-6 border-b border-accent-200">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(skillGroups).map(([key, group]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedSkillTab(key)}
                              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                                selectedSkillTab === key
                                  ? 'bg-primary-600 text-white border-b-2 border-primary-600'
                                  : 'bg-secondary-200 text-primary-700 hover:bg-secondary-300'
                              }`}
                            >
                              {group.skillName} ({group.assignments.length})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center py-12 bg-accent-25 rounded-lg">
                        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No assignments for this skill</h3>
                        <p className="text-neutral-600">There are no assignments for the selected skill.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAssignments.map((assignment) => {
                          const submission = assignment.submissions?.[0];
                          const hasSubmittedFile = !!(submission && submission.storeUrl);
                          const pastDue = isPastDue(assignment.dueAt);
                          const status = submission?.score != null ? "graded" : hasSubmittedFile ? "submitted" : pastDue ? "not_submitted" : "pending";
                        const canSubmit = status === "pending" || (status === "submitted" && !pastDue);
                        return (
                            <Card key={assignment.id} className="p-6 border border-accent-200 bg-white hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-primary-800 mb-3">
                                    {assignment.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3">
                                    {assignment.skillName && (
                                      <div className="flex items-center gap-2 bg-accent2-200 px-3 py-2 rounded-lg">
                                        <span className="text-sm font-medium text-primary-800">{assignment.skillName}</span>
                                      </div>
                                    )}
                                    {assignment.fileUrl && (
                                      <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span 
                                          className="text-sm font-medium text-blue-700 hover:text-blue-800 underline cursor-pointer"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDownloadAssignment(assignment.id, `${assignment.title}.pdf`);
                                          }}
                                        >
                                          Download Assignment File
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  pastDue 
                                    ? 'bg-red-100 border border-red-300' 
                                    : 'bg-green-100'
                                }`}>
                                  <Calendar className={`w-4 h-4 ${
                                    pastDue 
                                      ? 'text-red-600' 
                                      : 'text-green-600'
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    pastDue 
                                      ? 'text-red-600' 
                                     : 'text-green-600'
                                  }`}>
                                    Due: {formatDateTime(assignment.dueAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                    status === "graded" ? "bg-success-500 text-white" :
                                    status === "submitted" ? "bg-accent-500 text-white" :
                                    status === "pending" ? "bg-warning-500 text-white" :
                                    status === "not_submitted" ? "bg-red-500 text-white" :
                                    "bg-neutral-400 text-white"
                                  }`}>
                                    {status === "graded" ? "Graded" :
                                     status === "submitted" ? "Submitted" :
                                     status === "pending" ? "Pending" :
                                     status === "not_submitted" ? "Not Submitted" : status}
                                  </span>
                                  {status === "not_submitted" && (
                                    <span className="text-sm text-red-600 font-medium">Assignment is past due date</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {status === "pending" && !pastDue && (
                                    <>
                                      {assignment.questionUrl && (
                                        <Button 
                                          variant="primary"
                                          size="sm"
                                          className="btn-primary"
                                          iconLeft={<BookOpen className="w-4 h-4" />}
                                          onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation(); 
                                            handleStartQuiz(assignment);
                                          }}
                                        >
                                          Take Assignment
                                        </Button>
                                      )}
                                      {!assignment.questionUrl && (
                                        <Button 
                                          variant="secondary"
                                          size="sm"
                                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-600/30 transition-all duration-200 text-white font-medium px-4 py-2 rounded-lg"
                                          iconLeft={assignment.skillName?.toLowerCase() === 'writing' ? <PenTool className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                  onClick={(e) => { 
                                    e.preventDefault();
                                            e.stopPropagation(); 
                                            // Check if writing assignment
                                            if (assignment.skillName?.toLowerCase() === 'writing') {
                                              handleOpenWritingView(assignment);
                                            } else {
                                              handleOpenUpload(assignment.id);
                                            }
                                          }}
                                        >
                                          {assignment.skillName?.toLowerCase() === 'writing' ? 'Write Answer' : 'Submit Assignment'}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setOpenAssignmentId(openAssignmentId === assignment.id ? null : assignment.id)}
                                    className="btn-secondary"
                                  >
                                    {openAssignmentId === assignment.id ? "Hide Details" : "View Details"}
                                  </Button>
                                </div>
                              </div>

                    {openAssignmentId === assignment.id && (
                      <div className="mt-4 space-y-4">
                        {/* Assignment Information */}
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-neutral-800 mb-2">Assignment Information</h5>
                          <div className="space-y-2 text-sm text-neutral-600">
                            {assignment.description && (
                              <p className="whitespace-pre-wrap">{assignment.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-neutral-500" />
                              <span>
                                Due: {formatDateTime(assignment.dueAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Score Display */}
                        {submission?.score != null && (
                          <div className="mb-4 space-y-2">
                            <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-success-600" />
                                <span className="text-lg font-bold text-success-700">Score: {submission.score}</span>
                              </div>
                            </div>
                            {submission.isAiScore === true && (
                              <div className="p-2 bg-warning-50 border-l-4 border-warning-400 rounded">
                                <p className="text-xs text-warning-800 font-medium">
                                  ⚠️ This score is AI-generated for reference only. Your final grade will be determined by your instructor.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Submitted File - Hide for quiz assignments */}
                        {submission?.storeUrl && !assignment.questionUrl ? (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-green-600" />
                                <div>
                                  <span 
                                    className="text-sm font-semibold text-green-800 hover:text-green-900 underline cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDownloadSubmission(submission.id);
                                    }}
                                  >
                                    {getFileNameFromUrl(submission.storeUrl)}
                                  </span>
                                  {submission.createdAt && (
                                    <p className="text-xs text-green-600">Submitted at: {formatDateTime(submission.createdAt)}</p>
                                  )}
                                </div>
                              </div>
                              {status === "submitted" && !pastDue && (
                                <Button 
                                  variant="secondary"
                                  size="sm"
                                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-600/30 transition-all duration-200 text-white font-medium px-4 py-2 rounded-lg"
                                  iconLeft={assignment.skillName?.toLowerCase() === 'writing' ? <PenTool className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                  onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    // Check if writing assignment
                                    if (assignment.skillName?.toLowerCase() === 'writing') {
                                      handleOpenWritingView(assignment);
                                    } else {
                                      handleOpenUpload(assignment.id);
                                    }
                                  }}
                                >
                                  {assignment.skillName?.toLowerCase() === 'writing' ? 'Rewrite Answer' : 'Resubmit'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : submission?.storeUrl && assignment.questionUrl ? (
                          // For quiz assignments, show submission timestamp and review button
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-semibold text-green-800">Quiz completed</p>
                                  {submission.createdAt && (
                                    <p className="text-xs text-green-600">Submitted at: {formatDateTime(submission.createdAt)}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedQuizReview({
                                    assignmentId: assignment.id,
                                    assignmentTitle: assignment.title,
                                    dueAt: assignment.dueAt,
                                    submission: submission
                                  });
                                  setQuizReviewOpen(true);
                                }}
                                iconLeft={<BookOpen className="w-4 h-4" />}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                              >
                                View Quiz Details
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 text-sm text-neutral-600">No submission yet.</div>
                        )}

                        {/* Feedback Display */}
                        {submission?.feedback && (
                          <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg">
                            <h5 className="text-sm font-semibold text-info-800 mb-2">
                              {submission.isAiScore === true ? 'AI-Generated Feedback:' : 'Instructor Feedback:'}
                            </h5>
                            <p className="text-sm text-info-700 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
                            {submission.isAiScore === true && (
                              <p className="text-xs text-info-600 mt-2 italic">
                                This feedback is automatically generated. Your instructor may provide additional feedback.
                              </p>
                            )}
                          </div>
                        )}

                        {/* No inline action here; Submit button shown in header when pending */}
                      </div>
                    )}
                            </Card>
                        );
                      })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={(open) => { setIsUploadOpen(open); if (!open) closeUploadDialog(); }}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-6">
                {/* Drag & Drop Area */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50"
                  onClick={() => document.getElementById('file-input')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-primary-400', 'bg-primary-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileChange(files[0]);
                    }
                  }}
                >
                  {/* Upload Icon */}
                  <div className="mx-auto w-16 h-16 mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <p className="text-lg font-medium text-gray-700 mb-2">Drag & drop your files here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse from your computer</p>
                  
                  <Button 
                    variant="primary"
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700"
                    iconLeft={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-input')?.click();
                    }}
                  >
                    Choose File
                  </Button>
                  
                  {/* Hidden file input */}
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,image/*"
                  />
                </div>

                {/* File Info */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Allowed file types:</p>
                      <p className="text-sm text-gray-600">PDF, DOCX, PPT, MP4, MP3 (Maximum file size: 50MB)</p>
                    </div>
                  </div>
                </div>

                {/* Selected File Preview */}
                {selectedFile && (
                  <div className="p-4 border border-primary-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-primary-800">Selected File</h5>
                      <Button variant="ghost" size="sm" onClick={() => handleFileChange(null)}>Remove</Button>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-neutral-700 font-medium">{selectedFile.name}</div>
                      <div className="text-xs text-neutral-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                      {filePreviewUrl && selectedFile.type.startsWith("image/") && (
                        <img src={filePreviewUrl} alt="preview" className="max-h-64 rounded border" />
                      )}
                      {filePreviewUrl && selectedFile.type === "application/pdf" && (
                        <iframe src={filePreviewUrl} className="w-full h-64 border rounded" />
                      )}
                      {!selectedFile.type.startsWith("image/") && selectedFile.type !== "application/pdf" && (
                        <div className="text-xs text-neutral-600">Preview not available for this file type.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={closeUploadDialog} disabled={submitting}>Cancel</Button>
              <Button 
                onClick={handleSubmitAssignment} 
                disabled={!selectedFile || submitting} 
                loading={submitting}
                className="bg-gray-600 hover:bg-gray-700"
                iconLeft={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                }
              >
                Submit Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Submit */}
        <ConfirmationDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmSubmitAssignment}
          title="Confirm Submission"
          message="Are you sure you want to submit this assignment? You may not be able to change the file after submitting."
          confirmText="Submit"
          cancelText="Cancel"
          type="warning"
        />

        {/* AI Score Dialog for Writing Assignments */}
        <Dialog 
          open={aiScoreDialogOpen} 
          onOpenChange={(open) => {
            setAiScoreDialogOpen(open);
            // When dialog closes, refresh assignments to show updated status
            if (!open) {
              setTimeout(async () => {
                try {
                  console.log('Refreshing assignments after closing AI score dialog...');
                  await loadAssignments();
                  console.log('Assignments refreshed after closing AI dialog');
                } catch (error) {
                  console.error('Failed to refresh assignments after closing AI dialog:', error);
                }
              }, 300);
            }
          }}
        >
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary-800">
                <CheckCircle className="w-6 h-6 text-success-600" />
                Submission Successful!
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-success-50 border-l-4 border-success-500 p-4 rounded">
                  <p className="text-success-800 font-medium">
                    Your writing assignment has been submitted successfully!
                  </p>
                </div>

                {/* Score Section */}
                {aiScoreData && (
                  <>
                    <div className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{aiScoreData.score}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary-800 mb-2">
                            {aiScoreData.isAiScore === true ? 'AI-Generated Score' : 'Score'}
                          </h3>
                          {aiScoreData.isAiScore === true && (
                            <div className="bg-warning-50 border-l-4 border-warning-500 p-3 rounded">
                              <p className="text-sm text-warning-800 font-medium">
                                ⚠️ <strong>Important Note:</strong> The score you see is generated by AI for reference only. 
                                This is NOT your final grade. Your instructor will review your submission and provide the official grade.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {aiScoreData.feedback && (
                      <div className="bg-white border border-accent-200 rounded-xl p-6">
                        <h4 className="text-md font-bold text-primary-800 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-accent-500" />
                          {aiScoreData.isAiScore === true ? 'AI Feedback' : 'Feedback'}
                        </h4>
                        <div className="bg-accent-25 rounded-lg p-4">
                          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {aiScoreData.feedback}
                          </p>
                        </div>
                        {aiScoreData.isAiScore === true && (
                          <p className="text-xs text-neutral-500 mt-3 italic">
                            This feedback is automatically generated to help you understand your writing. 
                            Your instructor may provide additional feedback.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button 
                variant="primary" 
                onClick={async () => {
                  setAiScoreDialogOpen(false);
                  // Refresh assignments when closing dialog
                  setTimeout(async () => {
                    try {
                      console.log('Refreshing assignments after clicking "Got it" button...');
                      await loadAssignments();
                      console.log('Assignments refreshed after button click');
                    } catch (error) {
                      console.error('Failed to refresh assignments:', error);
                    }
                  }, 300);
                }}
                className="w-full sm:w-auto"
              >
                Got it, thanks!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quiz Review Dialog */}
        {quizReviewOpen && selectedQuizReview && (
          <QuizReviewDialog
            isOpen={quizReviewOpen}
            onClose={() => {
              setQuizReviewOpen(false);
              setSelectedQuizReview(null);
            }}
            assignmentId={selectedQuizReview.assignmentId}
            assignmentTitle={selectedQuizReview.assignmentTitle}
            dueAt={selectedQuizReview.dueAt}
            submission={selectedQuizReview.submission}
          />
        )}

        {/* Writing Assignment Editor */}
        {isWritingViewOpen && writingAssignment && (
          <WritingAssignmentEditor
            assignment={{
              id: writingAssignment.id,
              title: writingAssignment.title,
              description: writingAssignment.description || "",
              dueAt: writingAssignment.dueAt,
              attachmentUrl: writingAssignment.fileUrl || undefined,
            }}
            existingContent=""
            onClose={handleCloseWritingView}
            onSubmit={handleWritingSubmit}
          />
        )}
      </div>
  );
}