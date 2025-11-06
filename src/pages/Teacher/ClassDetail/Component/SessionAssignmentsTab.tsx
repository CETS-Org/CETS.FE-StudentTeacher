// src/components/teacher/SessionAssignmentsTab.tsx

import { useState, useMemo, useEffect } from "react";
import { PlusCircle, Calendar, Users, Eye, MessageSquare, FilePenLine, ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import JSZip from 'jszip';
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Pagination from "@/Shared/Pagination";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import CreateAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UploadAssignmentPopup";
import EditAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/EditAssignmentPopup";
import FeedbackPopup from "@/pages/Teacher/ClassDetail/Component/Popup/FeedbackPopup";
import GradeScorePopup from "@/pages/Teacher/ClassDetail/Component/Popup/GradeScorePopup";
import BulkGradeImportPopup, { type GradeImportData } from "@/pages/Teacher/ClassDetail/Component/Popup/BulkGradeImportPopup";
import { 
  getAssignmentsByClassMeeting, 
  getSubmissionsByAssignment,
  updateSubmissionFeedback,
  updateSubmissionScore,
  bulkUpdateSubmissions,
  downloadAssignment,
  downloadSubmission,
  downloadAllSubmissions,
  type AssignmentFromAPI,
  type SubmissionFromAPI 
} from "@/api/assignments.api";

// --- CẤU TRÚC DỮ LIỆU ---
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
};

type Assignment = {
  id: number;
  assignmentId: string; // UUID from API
  title: string;
  description: string | null;
  dueDate: string;
  storeUrl: string | null;
  submissions: Submission[];
  submissionCount: number;
};

type AssignmentData = {
  title: string;
  instructions: string;
  dueDate: string;
};

// Types for Download All Submissions API
type DownloadUrlItem = {
  submissionId: string;
  studentCode: string;
  studentName: string;
  downloadUrl: string;
  fileName: string;
};

type DownloadAllResponse = {
  assignmentInfo: {
    id: string;
    title: string;
  };
  downloadUrls: DownloadUrlItem[];
};

// --- COMPONENT CHÍNH ---
interface SessionAssignmentsTabProps {
  classMeetingId?: string;
}

// Cache for assignments data to avoid reloading when switching tabs
const assignmentsCache = new Map<string, { data: Assignment[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function SessionAssignmentsTab({ classMeetingId }: SessionAssignmentsTabProps) {
  // Toast notifications
  const { toasts, hideToast, success, error: showError } = useToast();
  
  // State chung
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'assignments' | 'submissions'>('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // State cho các popup
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isGradeOpen, setGradeOpen] = useState(false);
  const [isBulkImportOpen, setBulkImportOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- FETCH ASSIGNMENTS FROM API WITH CACHING ---
  useEffect(() => {
    const fetchAssignments = async () => {
      // If no classMeetingId, show empty state
      if (!classMeetingId) {
        setLoading(false);
        setAssignments([]);
        return;
      }

      // Check cache first
      const cached = assignmentsCache.get(classMeetingId);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        // Use cached data
        setAssignments(cached.data);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await getAssignmentsByClassMeeting(classMeetingId);
        const apiAssignments: AssignmentFromAPI[] = response.data;
        
        // Transform API data to component format
        const transformedAssignments: Assignment[] = apiAssignments.map((apiAsm) => {
          // Format date without timezone issues
          const dueDate = new Date(apiAsm.dueAt);
          const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
          
          return {
            id: parseInt(apiAsm.id.split('-')[0], 16), // Convert UUID to number for display
            assignmentId: apiAsm.id, // Keep original UUID for API calls
            title: apiAsm.title,
            description: apiAsm.description,
            dueDate: formattedDueDate,
            storeUrl: apiAsm.storeUrl,
            submissions: [], // Submissions will be loaded separately when viewing
            submissionCount: apiAsm.submissionCount,
          };
        });
        
        // Cache the data
        assignmentsCache.set(classMeetingId, {
          data: transformedAssignments,
          timestamp: now
        });
        
        setAssignments(transformedAssignments);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again later.');
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [classMeetingId]);

  // --- HÀM XỬ LÝ ---
  // Helper function to refresh assignments
  const refreshAssignments = async () => {
    if (!classMeetingId) return;
    
    // Clear cache for this classMeetingId
    assignmentsCache.delete(classMeetingId);
    
    try {
      const response = await getAssignmentsByClassMeeting(classMeetingId);
      const apiAssignments: AssignmentFromAPI[] = response.data;
      
      // Transform API data to component format
      const transformedAssignments: Assignment[] = apiAssignments.map((apiAsm) => {
        // Format date without timezone issues
        const dueDate = new Date(apiAsm.dueAt);
        const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
        
        return {
          id: parseInt(apiAsm.id.split('-')[0], 16), // Convert UUID to number for display
          assignmentId: apiAsm.id, // Keep original UUID for API calls
          title: apiAsm.title,
          description: apiAsm.description,
          dueDate: formattedDueDate,
          storeUrl: apiAsm.storeUrl,
          submissions: [], // Submissions will be loaded separately when viewing
          submissionCount: apiAsm.submissionCount,
        };
      });
      
      // Update cache with fresh data
      assignmentsCache.set(classMeetingId, {
        data: transformedAssignments,
        timestamp: Date.now()
      });
      
      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error refreshing assignments:', err);
      showError('Failed to refresh assignments list.');
    }
  };

  const handleCreateAssignment = (assignmentData: AssignmentData) => {
    // Don't add to local state immediately since we need to refresh from API
    // The assignment will be added when the assignments list is refreshed
    success("Assignment created successfully!");
    refreshAssignments();
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setAssignmentToEdit(assignment);
    setEditOpen(true);
  };

  const handleUpdateAssignment = async (assignmentData: AssignmentData) => {
    if (!assignmentToEdit) return;
    
    try {
      // The actual update is handled in EditAssignmentPopup
      // This callback is just to refresh the list after successful update
      await refreshAssignments();
      setEditOpen(false);
      setAssignmentToEdit(null);
    } catch (err) {
      console.error('Error refreshing after update:', err);
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    try {
      setLoading(true);
      
      // Validate assignmentId
      if (!assignment.assignmentId || assignment.assignmentId.trim() === '') {
        showError('Assignment ID is invalid. Please refresh the page and try again.');
        return;
      }
      
      // Fetch submissions from API
      const response = await getSubmissionsByAssignment(assignment.assignmentId);
      const apiSubmissions: SubmissionFromAPI[] = response.data;
      
      // Transform API data to component format
      const transformedSubmissions: Submission[] = apiSubmissions.map((apiSub) => {
        // Format submitted date
        const submittedDate = new Date(apiSub.createdAt);
        const formattedDate = `${submittedDate.getFullYear()}-${String(submittedDate.getMonth() + 1).padStart(2, '0')}-${String(submittedDate.getDate()).padStart(2, '0')}`;
        
        return {
          id: apiSub.id,
          studentId: apiSub.studentID,
          studentName: apiSub.studentName,
          studentCode: apiSub.studentCode,
          file: apiSub.storeUrl,
          content: apiSub.content,
          submittedDate: formattedDate,
          score: apiSub.score,
          feedback: apiSub.feedback,
        };
      });
      
      // Update assignment with fetched submissions
      const updatedAssignment = {
        ...assignment,
        submissions: transformedSubmissions,
      };
      
      setSelectedAssignment(updatedAssignment);
      setViewMode('submissions');
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      showError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAssignments = () => {
    setSelectedAssignment(null);
    setViewMode('assignments');
  };

  const handleOpenFeedback = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackOpen(true);
  };

  const handleOpenGrade = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeOpen(true);
  };

  const handleFeedbackSubmit = async (feedback: string, submissionId: string) => {
    try {
      await updateSubmissionFeedback(submissionId, feedback);
      
      // Refresh submissions after update
      if (selectedAssignment) {
        await handleViewSubmissions(selectedAssignment);
      }
      
      setFeedbackOpen(false);
      success('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError('Failed to submit feedback. Please try again.');
    }
  };

  const handleGradeSubmit = async (score: number, submissionId: string) => {
    try {
      await updateSubmissionScore(submissionId, score);
      
      // Refresh submissions after update
      if (selectedAssignment) {
        await handleViewSubmissions(selectedAssignment);
      }
      
      setGradeOpen(false);
      success('Score submitted successfully!');
    } catch (error) {
      console.error('Error submitting score:', error);
      showError('Failed to submit score. Please try again.');
    }
  };

  const handleBulkGradeImport = async (gradesData: GradeImportData[]) => {
    try {
      // Format data for API - only include non-null fields
      const submissions = gradesData.map((grade) => {
        const submission: {
          submissionId: string;
          score?: number;
          feedback?: string;
        } = {
          submissionId: grade.submissionId,
        };
        
        // Only include score if it's not null
        if (grade.score !== null) {
          submission.score = grade.score;
        }
        
        // Only include feedback if it's not null
        if (grade.feedback !== null) {
          submission.feedback = grade.feedback;
        }
        
        return submission;
      });

      // Call bulk update API
      const response = await bulkUpdateSubmissions(submissions);
      
      // Refresh submissions after update
      if (selectedAssignment) {
        await handleViewSubmissions(selectedAssignment);
      }
      
      // Handle response
      const { data } = response;
      if (data.success) {
        if (data.data.failedCount > 0) {
          // Partial success
          success(`Updated ${data.data.updatedCount} record(s). ${data.data.failedCount} failed.`);
          
          // Log failed items for debugging
          const failedItems = data.data.results.filter((r: any) => r.status === 'failed');
          if (failedItems.length > 0) {
            console.warn('Failed to update:', failedItems);
          }
        } else {
          // Complete success
          success(`Successfully imported ${data.data.updatedCount} record(s)!`);
        }
      }
    } catch (error: any) {
      console.error('Error importing grades:', error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to import grades and feedback. Please try again.';
      
      throw new Error(errorMessage);
    }
  };

  const handleDownloadAssignment = async (assignment: Assignment) => {
    try {
      setLoading(true);
      
      // Validate assignmentId
      if (!assignment.assignmentId || assignment.assignmentId.trim() === '') {
        showError('Assignment ID is invalid. Please refresh the page and try again.');
        return;
      }
      
      // Call download API
      const response = await downloadAssignment(assignment.assignmentId);
      const { downloadUrl, assignmentInfo } = response.data;
      
      if (!downloadUrl) {
        showError('No download URL available for this assignment.');
        return;
      }
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${assignmentInfo.title || assignment.title}.docx`; // Default to DOCX for Word documents
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success('Assignment downloaded successfully!');
    } catch (error) {
      console.error('Error downloading assignment:', error);
      showError('Failed to download assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSubmission = async (submission: Submission) => {
    try {
      setLoading(true);
      
      // Validate submissionId
      if (!submission.id || submission.id.trim() === '') {
        showError('Submission ID is invalid. Please refresh the page and try again.');
        return;
      }
      
      // Call download API
      const response = await downloadSubmission(submission.id);
      const { downloadUrl, submissionInfo } = response.data;
      
      if (!downloadUrl) {
        showError('No download URL available for this submission.');
        return;
      }
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${submission.studentName}_submission.docx`; // Default to DOCX for Word documents
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success('Submission downloaded successfully!');
    } catch (error) {
      console.error('Error downloading submission:', error);
      showError('Failed to download submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllSubmissions = async () => {
    try {
      setLoading(true);
      
      if (!selectedAssignment || selectedAssignment.submissions.length === 0) {
        showError('No submissions to download.');
        return;
      }
      
      // Validate assignmentId
      if (!selectedAssignment.assignmentId || selectedAssignment.assignmentId.trim() === '') {
        showError('Assignment ID is invalid. Please refresh the page and try again.');
        return;
      }
      
      // Call download all submissions API
      const response = await downloadAllSubmissions(selectedAssignment.assignmentId);
      const data: DownloadAllResponse = response.data;
      
      if (!data.downloadUrls || data.downloadUrls.length === 0) {
        showError('No submissions available for download.');
        return;
      }
      
      // Create ZIP file
      const zip = new JSZip();
      let successCount = 0;
      let failCount = 0;
      
      // Download each submission and add to ZIP
      for (const item of data.downloadUrls) {
        try {
          // Fetch file content from download URL
          const fileResponse = await fetch(item.downloadUrl);
          if (!fileResponse.ok) {
            console.error(`Failed to fetch file for ${item.studentCode}`);
            failCount++;
            continue;
          }
          
          const fileBlob = await fileResponse.blob();
          
          // Create folder structure: submissions/StudentCode/FileName
          // Keep original extension but replace filename with student name
          let fileName: string;
          if (item.fileName && item.fileName.includes('.')) {
            // Extract extension from original fileName
            const fileExtension = item.fileName.split('.').pop();
            fileName = `${item.studentName}_submission.${fileExtension}`;
          } else {
            // Fallback if no extension found
            fileName = `${item.studentName}_submission.docx`;
          }
          const folderPath = `submissions/${item.studentCode}/${fileName}`;
          
          zip.file(folderPath, fileBlob);
          successCount++;
        } catch (error) {
          console.error(`Error downloading submission for ${item.studentCode}:`, error);
          failCount++;
        }
      }
      
      if (successCount === 0) {
        showError('Failed to download any submissions. Please try again.');
        return;
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download ZIP file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${data.assignmentInfo.title}_submissions.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      URL.revokeObjectURL(link.href);
      
      if (failCount === 0) {
        success(`All ${successCount} submissions downloaded successfully!`);
      } else {
        success(`${successCount} submissions downloaded successfully. ${failCount} failed.`);
      }
    } catch (error) {
      console.error('Error downloading all submissions:', error);
      showError('Failed to download submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // --- LOGIC PHÂN TRANG ---
  const submissionsToDisplay = selectedAssignment?.submissions || [];
  const totalPages = Math.ceil(submissionsToDisplay.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return submissionsToDisplay.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, submissionsToDisplay]);
  const handlePageChange = (page: number) => setCurrentPage(page);

  // --- RENDER ---
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
        <p className="text-warning-700 font-medium">{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Show message if no classMeetingId
  if (!classMeetingId) {
    return (
      <div className="bg-accent-50 border border-accent-200 rounded-lg p-8 text-center">
        <Calendar className="w-12 h-12 text-accent-400 mx-auto mb-4" />
        <p className="text-accent-700 font-medium">No class session selected</p>
        <p className="text-accent-600 text-sm mt-2">
          Please select a class session to view assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Chế độ xem danh sách Assignments */}
      {viewMode === 'assignments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary-800">Session Assignments</h2>
            <Button 
              onClick={() => setCreateOpen(true)} 
              iconLeft={<PlusCircle size={16} />}
              className="btn-secondary"
            >
              Create Assignment
            </Button>
          </div>
          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-accent-25 rounded-lg">
              <Calendar className="w-16 h-16 text-accent-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                No Assignments Yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Create your first assignment for this session.
              </p>
              <Button 
                onClick={() => setCreateOpen(true)} 
                iconLeft={<PlusCircle size={16} />}
                className="btn-secondary"
              >
                Create First Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map(asm => (
              <Card key={asm.id} className="p-6 border border-accent-200 bg-white hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-800 mb-3">
                      {asm.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-error-200 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">Due: {asm.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-warning-200 px-3 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">{asm.submissionCount} Submissions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="primary"
                    onClick={() => handleViewSubmissions(asm)}
                    className="btn-primary"
                  >
                    View Submissions
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleDownloadAssignment(asm)}
                    iconLeft={<Download size={16} />}
                    className="btn-secondary"
                  >
                    Download
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleEditAssignment(asm)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chế độ xem danh sách Submissions */}
      {viewMode === 'submissions' && selectedAssignment && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Button variant="ghost" onClick={handleBackToAssignments} className="mb-2 -ml-3">
                <ArrowLeft size={16} className="mr-2"/> 
              </Button>
              <h2 className="text-xl font-semibold">{selectedAssignment.title}: Submissions</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                disabled={selectedAssignment.submissions.length === 0} 
                onClick={() => setBulkImportOpen(true)}
                className="btn-secondary flex items-center"
                iconLeft={<FileSpreadsheet size={16} />}
                variant="primary"
              >
                Import Grades   
              </Button>
              <Button 
                disabled={selectedAssignment.submissions.length === 0} 
                onClick={handleDownloadAllSubmissions}
                className="btn-primary flex items-center"
                iconLeft={<Download size={16} />}
                variant="primary"
              >
                Download All
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-accent-200 to-accent-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Submission</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Submitted Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  paginatedSubmissions.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-accent-25/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary-800">{sub.studentName}</span>
                          <span className="text-xs text-neutral-500">{sub.studentCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {sub.file ? (
                            <Button
                              variant="secondary"
                              onClick={() => handleDownloadSubmission(sub)}
                              iconLeft={<Download size={14} />}
                              className="btn-secondary text-[10px] px-1 py-0 h-5 leading-none"
                            >
                              Download
                            </Button>
                          ) : sub.content ? (
                            <span className="text-sm text-neutral-600 max-w-xs truncate">
                              {sub.content}
                            </span>
                          ) : (
                            <span className="text-sm text-neutral-400 italic">No submission</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {sub.submittedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sub.score !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-700">
                              {sub.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400 italic">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sub.feedback ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-neutral-700 line-clamp-2" title={sub.feedback}>
                              {sub.feedback}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400 italic">No feedback</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleOpenFeedback(sub)} 
                            className="text-gray-500 hover:text-green-600 transition-colors"
                            title="Give feedback"
                          >
                            <MessageSquare size={20} />
                          </button>
                          <button 
                            onClick={() => handleOpenGrade(sub)} 
                            className="text-gray-500 hover:text-purple-600 transition-colors"
                            title="Grade submission"
                          >
                            <FilePenLine size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage} totalPages={totalPages}
                totalItems={submissionsToDisplay.length} itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Popups */}
      <CreateAssignmentPopup 
        open={isCreateOpen} 
        onOpenChange={setCreateOpen} 
        onSubmit={handleCreateAssignment}
        classMeetingId={classMeetingId}
      />
      {assignmentToEdit && (
        <EditAssignmentPopup
          open={isEditOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setAssignmentToEdit(null);
          }}
          onSubmit={handleUpdateAssignment}
          assignmentId={assignmentToEdit.assignmentId}
          initialData={{
            title: assignmentToEdit.title,
            description: assignmentToEdit.description,
            dueDate: assignmentToEdit.dueDate,
            storeUrl: assignmentToEdit.storeUrl,
          }}
        />
      )}
      <FeedbackPopup 
        open={isFeedbackOpen} 
        onOpenChange={setFeedbackOpen} 
        onSubmit={handleFeedbackSubmit}
        initialFeedback={selectedSubmission?.feedback || ""}
        submissionId={selectedSubmission?.id || ""}
      />
      <GradeScorePopup 
        open={isGradeOpen} 
        onOpenChange={setGradeOpen} 
        onSubmit={handleGradeSubmit}
        initialScore={selectedSubmission?.score?.toString() || ""}
        submissionId={selectedSubmission?.id || ""}
      />
      <BulkGradeImportPopup 
        open={isBulkImportOpen} 
        onOpenChange={setBulkImportOpen} 
        onSubmit={handleBulkGradeImport}
        assignmentTitle={selectedAssignment?.title || ""}
        submissions={selectedAssignment?.submissions.map(sub => ({
          id: sub.id,
          studentCode: sub.studentCode,
          studentName: sub.studentName,
        })) || []}
      />

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