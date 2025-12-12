// src/components/teacher/SessionAssignmentsTab.tsx

import { useState, useMemo, useEffect } from "react";
import { PlusCircle, Calendar, Users, Eye, MessageSquare, FilePenLine, ArrowLeft, Download, FileSpreadsheet, Bot, Edit2, Trash2 } from "lucide-react";
import JSZip from 'jszip';
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import Pagination from "@/Shared/Pagination";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import CreateAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UploadAssignmentPopup";
import AdvancedAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/AdvancedAssignmentPopup";
import AIReadingTestGeneratorPopup from "@/pages/Teacher/ClassDetail/Component/Popup/AIReadingTestGeneratorPopup";
import EditAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/EditAssignmentPopup";
import FeedbackPopup from "@/pages/Teacher/ClassDetail/Component/Popup/FeedbackPopup";
import GradeScorePopup from "@/pages/Teacher/ClassDetail/Component/Popup/GradeScorePopup";
import BulkGradeImportPopup, { type GradeImportData } from "@/pages/Teacher/ClassDetail/Component/Popup/BulkGradeImportPopup";
import WritingGradingView from "@/pages/Teacher/ClassDetail/Component/WritingGradingView";
import SpeakingGradingView from "@/pages/Teacher/ClassDetail/Component/SpeakingGradingView";
import ListeningGradingView from "@/pages/Teacher/ClassDetail/Component/ListeningGradingView";
import ReadingGradingView from "@/pages/Teacher/ClassDetail/Component/ReadingGradingView";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { 
  getAssignmentsByClassMeeting, 
  getSubmissionsByAssignment,
  updateSubmissionFeedback,
  updateSubmissionScore,
  bulkUpdateSubmissions,
  downloadAssignment,
  downloadSubmission,
  downloadAllSubmissions,
  createAssignment,
  getAssignmentById,
  deleteAssignment,
} from "@/api/assignments.api";
import type {
  AssignmentFromAPI,
  SubmissionFromAPI
} from '@/types/assignment';
import { getTeacherId } from "@/lib/utils";

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
  IsAiScore?: boolean;
};

type Assignment = {
  id: number;
  assignmentId: string; // UUID from API
  title: string;
  description?: string | null;
  dueDate: string;
  storeUrl?: string | null;
  submissions: Submission[];
  submissionCount: number;
  skillID?: string | null;
  skillName?: string | null;
  assignmentType?: string; // "Homework", "Quiz", "Speaking", or "file"
  questionUrl?: string | null; // URL to question JSON for Quiz/Speaking assignments
};

type AssignmentData = {
  title: string;
  instructions: string;
  dueDate: string;
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

  // Helper function to format date with hours and minutes
  const formatDueDate = (dueDateString: string): string => {
    const dueDate = new Date(dueDateString);
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    const hours = String(dueDate.getHours()).padStart(2, '0');
    const minutes = String(dueDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Helper function to check if due date has passed
  const isPastDue = (dueDateString: string): boolean => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate < now;
  };
  
  // State chung
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'assignments' | 'submissions'>('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  // Persist selected skill tab in localStorage
  const getInitialSkillTab = () => {
    if (typeof window !== 'undefined' && classMeetingId) {
      const saved = localStorage.getItem(`assignmentTab_${classMeetingId}`);
      return saved || 'all';
    }
    return 'all';
  };
  const [selectedSkillTab, setSelectedSkillTab] = useState<string | null>(getInitialSkillTab()); // 'all' or skillID
  
  // Save selected skill tab to localStorage when it changes
  useEffect(() => {
    if (classMeetingId && selectedSkillTab) {
      localStorage.setItem(`assignmentTab_${classMeetingId}`, selectedSkillTab);
    }
  }, [selectedSkillTab, classMeetingId]);
  
  // State cho các popup
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isAdvancedCreateOpen, setAdvancedCreateOpen] = useState(false);
  const [isAIReadingTestOpen, setAIReadingTestOpen] = useState(false);
  const [isAdvancedEditOpen, setAdvancedEditOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [assignmentToEditAdvanced, setAssignmentToEditAdvanced] = useState<Assignment | null>(null);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isGradeOpen, setGradeOpen] = useState(false);
  const [isBulkImportOpen, setBulkImportOpen] = useState(false);
  const [isWritingGradingOpen, setWritingGradingOpen] = useState(false);
  const [isSpeakingGradingOpen, setSpeakingGradingOpen] = useState(false);
  const [isListeningGradingOpen, setListeningGradingOpen] = useState(false);
  const [isReadingGradingOpen, setReadingGradingOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);

  // State cho phân trang

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
        
        
        // Handle nested response structure: { success, data: [...] } or direct array
        const apiAssignments: AssignmentFromAPI[] = Array.isArray(response.data)
          ? response.data
          : (response.data.data || []);
        
        
        
        // Transform API data to component format
        const transformedAssignments: Assignment[] = apiAssignments.map((apiAsm) => {
          // Keep the full due date with time for comparison
          const dueDate = new Date(apiAsm.dueAt);
          
          return {
            id: parseInt(apiAsm.id.split('-')[0], 16), // Convert UUID to number for display
            assignmentId: apiAsm.id, // Keep original UUID for API calls
            title: apiAsm.title,
            description: apiAsm.description,
            dueDate: apiAsm.dueAt, // Keep full ISO string with time
            storeUrl: apiAsm.storeUrl,
            submissions: [], // Submissions will be loaded separately when viewing
            submissionCount: apiAsm.submissionCount,
            skillID: apiAsm.skillID,
            skillName: apiAsm.skillName,
            assignmentType: (apiAsm as any).assignmentType || (apiAsm.storeUrl ? "Homework" : "Quiz"), // Determine type
            questionUrl: (apiAsm as any).questionUrl || null,
          };
        });
        
        // Cache the data
        assignmentsCache.set(classMeetingId, {
          data: transformedAssignments,
          timestamp: now
        });
        
        setAssignments(transformedAssignments);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        
        setError(err?.message || 'Failed to load assignments');
        setLoading(false);
        setAssignments([]);
      }
    };

    fetchAssignments();
  }, [classMeetingId]);

  const refreshAssignments = async () => {
    if (!classMeetingId) return;
    
    try {
      setError(null);
      const response = await getAssignmentsByClassMeeting(classMeetingId);
      const apiAssignments: AssignmentFromAPI[] = response.data.data || response.data;
      
      // Transform API data to component format
      const transformedAssignments: Assignment[] = apiAssignments.map((apiAsm) => {
        // Keep the full due date with time for comparison
        const dueDate = new Date(apiAsm.dueAt);
        
          return {
            id: parseInt(apiAsm.id.split('-')[0], 16), // Convert UUID to number for display
            assignmentId: apiAsm.id, // Keep original UUID for API calls
            title: apiAsm.title,
            description: apiAsm.description,
            dueDate: apiAsm.dueAt, // Keep full ISO string with time
            storeUrl: apiAsm.storeUrl,
            submissions: [], // Submissions will be loaded separately when viewing
            submissionCount: apiAsm.submissionCount,
            skillID: apiAsm.skillID,
            skillName: apiAsm.skillName,
            assignmentType: (apiAsm as any).assignmentType || (apiAsm.storeUrl ? "Homework" : "Quiz"), // Determine type
            questionUrl: (apiAsm as any).questionUrl || null,
          };
      });
      
      // Update cache with fresh data
      assignmentsCache.set(classMeetingId, {
        data: transformedAssignments,
        timestamp: Date.now()
      });
      
      setAssignments(transformedAssignments);
    } catch (err) {
      
      showError('Failed to refresh assignments list.');
    }
  };

  const handleCreateAssignment = (assignmentData: AssignmentData) => {
    // Don't add to local state immediately since we need to refresh from API
    // The assignment will be added when the assignments list is refreshed
    success("Assignment created successfully!");
    refreshAssignments();
  };

  const handleAdvancedCreateAssignment = async (assignmentData: {
    title: string;
    description: string;
    dueAt: string;
    skillID: string | null;
    assignmentType: string;
    totalPoints: number;
    timeLimitMinutes?: number;
    maxAttempts: number;
    isAutoGradable: boolean;
    answerVisibility: "immediately" | "after_due_date" | "never";
    questionData: any;
    files: File[];
  }) => {
    // The actual assignment creation is handled in AdvancedAssignmentPopup
    // This callback is just to refresh the list after successful creation
    try {
      await refreshAssignments();
      // If assignment has a skill, switch to that skill tab
      if (assignmentData.skillID) {
        setSelectedSkillTab(assignmentData.skillID);
      }
    } catch (err: any) {
      
      // Don't show error here as the assignment was already created successfully
    }
  };

  const handleEditAssignment = async (assignment: Assignment) => {
    // Determine assignment type based on storeUrl and questionUrl
    const assignmentType = assignment.assignmentType || 
      (assignment.questionUrl ? (assignment.skillName?.toLowerCase().includes('speaking') ? "Speaking" : "Quiz") : "Homework");
    
    if (assignmentType === "Quiz" || assignmentType === "Speaking") {
      // For Quiz/Speaking assignments, fetch full assignment data to get questionUrl
      try {
        let fullAssignmentData = assignment;
        
        // Fetch full assignment details to get questionUrl
        const response = await getAssignmentById(assignment.assignmentId);
        const assignmentData = response.data;
        if (assignmentData) {
          fullAssignmentData = {
            ...assignment,
            assignmentId: assignmentData.id || assignment.assignmentId || (assignmentData as any).assignmentId,
            questionUrl: assignmentData.questionUrl || null,
            assignmentType: assignmentType,
          };
        } else {
          // If fetch fails but we have the original assignment, use it
          fullAssignmentData = assignment;
        }
        
        // Use AdvancedAssignmentPopup in edit mode with full data
        if (!fullAssignmentData.assignmentId) {
          
        }
        setAssignmentToEditAdvanced(fullAssignmentData);
        setAdvancedEditOpen(true);
      } catch (err) {
        
        // Fallback to basic assignment data if fetch fails
        setAssignmentToEditAdvanced(assignment);
        setAdvancedEditOpen(true);
      }
    } else {
      // For Homework assignments, use basic EditAssignmentPopup
      setAssignmentToEdit(assignment);
      setEditOpen(true);
    }
  };

  const handleUpdateAssignment = async (assignmentData: AssignmentData) => {
    if (!assignmentToEdit) return;
    
    // Clear cache and refresh assignments list to get the new assignment with proper ID
    if (classMeetingId) {
      // Clear cache for this classMeetingId
      assignmentsCache.delete(classMeetingId);
      
      const fetchAssignments = async () => {
        try {
          const response = await getAssignmentsByClassMeeting(classMeetingId);
          
          // Handle nested response structure: { success, data: [...] } or direct array
          const apiAssignments: AssignmentFromAPI[] = Array.isArray(response.data)
            ? response.data
            : (response.data.data || []);
          
          // Transform API data to component format
          const transformedAssignments: Assignment[] = apiAssignments.map((apiAsm) => {
            // Format date without timezone issues
            const dueDate = new Date(apiAsm.dueAt);
            const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
            
            return {
              id: parseInt(apiAsm.id.split('-')[0], 16), // Convert UUID to number for display
              assignmentId: apiAsm.id, // Keep original UUID for API calls
              title: apiAsm.title,
              dueDate: formattedDueDate,
              submissions: [], // Submissions will be loaded separately when viewing
              submissionCount: apiAsm.submissionCount,
              skillID: apiAsm.skillID,
              skillName: apiAsm.skillName,
            };
          });
          
          // Update cache with fresh data
          assignmentsCache.set(classMeetingId, {
            data: transformedAssignments,
            timestamp: Date.now()
          });
          
          setAssignments(transformedAssignments);
        } catch (err) {
          
          showError('Failed to refresh assignments list.');
        }
      };
      
      fetchAssignments();
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    
    try {
      setLoading(true);
      
      // Fetch submissions from API
      const response = await getSubmissionsByAssignment(assignment.assignmentId);
      
      
      // Handle nested response structure: { success, data: [...] } or direct array
      const apiSubmissions: SubmissionFromAPI[] = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);
      
      
      
      // Transform API data to component format
      const transformedSubmissions: Submission[] = apiSubmissions.map((apiSub) => {
        // Format submitted date
        const submittedDate = new Date(apiSub.createdAt);
        const formattedDate = `${submittedDate.getFullYear()}-${String(submittedDate.getMonth() + 1).padStart(2, '0')}-${String(submittedDate.getDate()).padStart(2, '0')}`;
        
        // Normalize isAiScore: handle boolean or undefined
        // Backend returns 'isAiScore' (lowercase 'i')
        const isAiScore = apiSub.isAiScore === true;
        
        
        
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
          IsAiScore: isAiScore,
        };
      });
      
      // Update selected assignment with submissions
      const updatedAssignment = {
        ...assignment,
        submissions: transformedSubmissions
      };
      setSelectedAssignment(updatedAssignment);
      
      // Check assignment skill type and open appropriate grading view
      if (assignment.skillName?.toLowerCase() === 'writing') {
        setWritingGradingOpen(true);
      } else if (assignment.skillName?.toLowerCase() === 'speaking') {
        setSpeakingGradingOpen(true);
      } else if (assignment.skillName?.toLowerCase() === 'listening') {
        setListeningGradingOpen(true);
      } else if (assignment.skillName?.toLowerCase() === 'reading') {
        setReadingGradingOpen(true);
      } else {
        setViewMode('submissions');
      }
      
      setLoading(false);
    } catch (err: any) {
      
      showError(err?.message || 'Failed to load submissions');
      setLoading(false);
    }
  };

  const handleBackToAssignments = () => {
    setViewMode('assignments');
    setSelectedAssignment(null);
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
      
      showError('Failed to submit score. Please try again.');
    }
  };

  const handleWritingGradeSubmit = async (submissionId: string, score: number, feedback: string) => {
    try {
      // Update both score and feedback
      const promises = [];
      
      if (score !== null && score !== undefined) {
        promises.push(updateSubmissionScore(submissionId, score));
      }
      
      if (feedback && feedback.trim() !== '') {
        promises.push(updateSubmissionFeedback(submissionId, feedback));
      }
      
      await Promise.all(promises);
      
      // Update the submission in the local state
      // When teacher manually grades, set IsAiScore to false
      if (selectedAssignment) {
        const updatedSubmissions = selectedAssignment.submissions.map(sub =>
          sub.id === submissionId
            ? { ...sub, score, feedback, IsAiScore: false }
            : sub
        );
        setSelectedAssignment({
          ...selectedAssignment,
          submissions: updatedSubmissions
        });
      }
      
      success('Grade and feedback saved successfully!');
    } catch (error) {
      
      throw error; // Re-throw to be caught by WritingGradingView
    }
  };

  const handleCloseWritingGrading = () => {
    setWritingGradingOpen(false);
    setSelectedAssignment(null);
    setViewMode('assignments');
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    try {
      setLoading(true);
      await deleteAssignment(assignmentToDelete.assignmentId);
      
      // Remove from local state
      setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentToDelete.assignmentId));
      
      // Clear cache
      if (classMeetingId) {
        assignmentsCache.delete(classMeetingId);
      }
      
      success('Assignment deleted successfully!');
      setDeleteConfirmOpen(false);
      setAssignmentToDelete(null);
    } catch (error) {
      
      showError('Failed to delete assignment. Please try again.');
    } finally {
      setLoading(false);
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
            
          }
        } else {
          // Complete success
          success(`Successfully imported ${data.data.updatedCount} record(s)!`);
        }
      }
    } catch (error: any) {
      
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to import grades and feedback. Please try again.';
      
      throw new Error(errorMessage);
    }
  };

  const handleDownloadAssignment = async (assignment: Assignment) => {
    try {
      const response = await downloadAssignment(assignment.assignmentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${assignment.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success("Assignment downloaded successfully!");
    } catch (err: any) {
      
      showError(err?.message || 'Failed to download assignment');
    }
  };

  const handleDownloadSubmission = async (submission: Submission) => {
    try {
      const response = await downloadSubmission(submission.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submission_${submission.studentCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success("Submission downloaded successfully!");
    } catch (err: any) {
      
      showError(err?.message || 'Failed to download submission');
    }
  };

  const handleDownloadAllSubmissions = async (assignment: Assignment) => {
    try {
      const response = await downloadAllSubmissions(assignment.assignmentId);
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_submissions_${assignment.title}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success("All submissions downloaded successfully!");
    } catch (err: any) {
      
      showError(err?.message || 'Failed to download all submissions');
    }
  };

  const handleUpdateFeedback = async (feedback: string, submissionId: string) => {
    try {
      await updateSubmissionFeedback(submissionId, feedback);
      success("Feedback updated successfully!");
      
      // Refresh submissions
      if (selectedAssignment) {
        await handleViewSubmissions(selectedAssignment);
      }
    } catch (err: any) {
      
      showError(err?.message || 'Failed to update feedback');
    }
  };

  const handleUpdateScore = async (score: number, submissionId: string) => {
        try {
      await updateSubmissionScore(submissionId, score);
      success("Score updated successfully!");
      
      // Refresh submissions
      if (selectedAssignment) {
        await handleViewSubmissions(selectedAssignment);
      }
    } catch (err: any) {
      
      showError(err?.message || 'Failed to update score');
    }
  };

  const handleBulkUpdate = async (updates: GradeImportData[]) => {
    try {
      const submissions = updates.map(update => ({
        submissionId: update.submissionId,
        score: update.score ?? null,
        feedback: update.feedback ?? null,
      }));
      
      await bulkUpdateSubmissions(submissions);
      success("Bulk update completed successfully!");
      
      // Refresh submissions
      if (selectedAssignment) {
        await handleViewSubmissions(selectedAssignment);
      }
      
      setBulkImportOpen(false);
    } catch (err: any) {
      
      showError(err?.message || 'Failed to bulk update submissions');
    }
  };
  
  // Group assignments by skill
  const skillGroups = useMemo(() => {
    const groups: { [key: string]: { skillID: string | null; skillName: string; assignments: Assignment[] } } = {
      'all': { skillID: null, skillName: 'All', assignments: [] }
    };
    
    assignments.forEach(asm => {
      const key = asm.skillID || 'no-skill';
      const skillName = asm.skillName || 'No Skill';
      
      if (!groups[key]) {
        groups[key] = { skillID: asm.skillID || null, skillName, assignments: [] };
      }
      groups[key].assignments.push(asm);
    
      // Also add to 'all' group
      groups['all'].assignments.push(asm);
    });
    
    return groups;
  }, [assignments]);

  // Filter assignments based on selected skill tab
  const filteredAssignments = useMemo(() => {
    if (selectedSkillTab === 'all') {
      return assignments;
    }
    return skillGroups[selectedSkillTab || 'all']?.assignments || [];
  }, [assignments, selectedSkillTab, skillGroups]);

  // Pagination for submissions
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsToDisplay = selectedAssignment?.submissions || [];
  const totalPages = Math.ceil(submissionsToDisplay.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return submissionsToDisplay.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, submissionsToDisplay]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when switching assignments
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAssignment]);

  // --- RENDER ---
  // Show loading state
  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshAssignments} variant="secondary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {viewMode === 'assignments' ? (
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-900">Assignments</h2>
            <div className="flex gap-2">
              <Button 
                variant="secondary"
                onClick={() => setAIReadingTestOpen(true)} 
                iconLeft={<Bot size={16} />}
                className="btn-secondary"
              >
                AI Reading Test
              </Button>
              <Button 
                variant="primary"
                onClick={() => setAdvancedCreateOpen(true)} 
                iconLeft={<PlusCircle size={16} />}
                className="btn-primary"
              >
                Create Assignment
              </Button>
            </div>
          </div>

          {/* Skill Tabs */}
          {assignments.length > 0 && Object.keys(skillGroups).length > 1 && (
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
          
          {/* Empty State */}
          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-accent-25 rounded-lg">
              <Calendar className="w-16 h-16 text-accent-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                No Assignments Yet
              </h3>
              <p className="text-neutral-600 mb-4">
                Create your first assignment to get started.
              </p>
              <Button 
                variant="secondary"
                onClick={() => setCreateOpen(true)} 
                iconLeft={<PlusCircle size={16} />}
                className="btn-secondary"
              >
                Create First Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map(asm => (
              <Card key={asm.id} className="p-6 border border-accent-200 bg-white hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-800 mb-3">
                      {asm.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {asm.skillName && (
                        <div className="flex items-center gap-2 bg-accent2-200 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium text-primary-800">{asm.skillName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-warning-200 px-3 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">{asm.submissionCount} Submissions</span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isPastDue(asm.dueDate) 
                      ? 'bg-red-100 border border-red-300' 
                      : 'bg-green-100'
                  }`}>
                    <Calendar className={`w-4 h-4 ${
                      isPastDue(asm.dueDate) 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isPastDue(asm.dueDate) 
                        ? 'text-red-600' 
                       : 'text-green-600'
                    }`}>
                      Due: {formatDueDate(asm.dueDate)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <Button 
                    variant="primary"
                    onClick={() => handleViewSubmissions(asm)}
                    className="btn-primary"
                  >
                    View Submissions
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary"
                      onClick={() => handleEditAssignment(asm)}
                      iconLeft={<FilePenLine size={16} />}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-600/30 transition-all duration-200 text-white font-medium px-4 py-2 rounded-lg"
                    >
                      Edit
                    </Button>
                    {asm.storeUrl && (
                    <Button 
                      variant="secondary"
                        onClick={() => handleDownloadAssignment(asm)}
                        iconLeft={<Download size={16} />}
                        className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 hover:shadow-green-600/30 transition-all duration-200 text-white font-medium px-4 py-2 rounded-lg"
                    >
                        Download
                    </Button>
                    )}
                    <Button 
                      variant="secondary"
                      onClick={() => handleDeleteAssignment(asm)}
                      iconLeft={<Trash2 size={16} />}
                      className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-600/30 transition-all duration-200 text-white font-medium px-4 py-2 rounded-lg"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Submissions View */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={handleBackToAssignments}
            iconLeft={<ArrowLeft size={16} />}
            className="btn-secondary"
          >
            Back to Assignments
              </Button>
            </div>

        {selectedAssignment && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">
                {selectedAssignment.title}
              </h2>
              <p className="text-neutral-600">
                {selectedAssignment.submissionCount} submission{selectedAssignment.submissionCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              <Button 
                variant="secondary"
                onClick={() => setBulkImportOpen(true)}
                className="flex items-center"
                iconLeft={<FileSpreadsheet size={16} />}
              >
                Import Grades
              </Button>
              <Button 
                disabled={selectedAssignment.submissions.length === 0} 
                onClick={() => handleDownloadAllSubmissions(selectedAssignment)}
                className="flex items-center"
                iconLeft={<Download size={16} />}
              >
                Download All Submissions
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader />
          </div>
            ) : paginatedSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-accent-25 rounded-lg">
                <Users className="w-16 h-16 text-accent-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  No Submissions Yet
                </h3>
                <p className="text-neutral-600">
                  Students haven't submitted their work for this assignment yet.
                </p>
                        </div>
            ) : (
              <div className="space-y-4">
                {paginatedSubmissions.map((submission) => (
                  <Card key={submission.id} className="p-6 border border-accent-200 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-primary-800 mb-2">
                          {submission.studentName}
                        </h4>
                        <p className="text-sm text-neutral-600 mb-1">
                          Student Code: {submission.studentCode}
                        </p>
                        <p className="text-sm text-neutral-500 mb-3">
                          Submitted: {new Date(submission.submittedDate).toLocaleString()}
                        </p>
                        {submission.score !== null ? (
                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-700">
                                {submission.score}
                              </span>
                            </div>
                            {submission.IsAiScore === true && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
                                <Bot size={12} className="text-blue-600" />
                                <span className="text-blue-700 font-medium">AI Graded</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400 italic mb-3">Not graded</span>
                        )}
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                        <p className="text-sm text-neutral-700">
                          <span className="font-medium">Feedback:</span> {submission.feedback}
                            </p>
                          </div>
                    )}

                    <div className="flex gap-2">
                      {submission.file && (
                        <Button
                          variant="secondary"
                          onClick={() => handleDownloadSubmission(submission)}
                          iconLeft={<Download size={16} />}
                          className="btn-secondary"
                        >
                          Download Submission
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setFeedbackOpen(true);
                        }}
                        iconLeft={<MessageSquare size={16} />}
                        className="btn-secondary"
                      >
                        Add Feedback
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGradeOpen(true);
                        }}
                        iconLeft={<Eye size={16} />}
                        className="btn-secondary"
                      >
                        Grade
                      </Button>
                        </div>
                  </Card>
                ))}

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
      <AdvancedAssignmentPopup
        open={isAdvancedCreateOpen || isAdvancedEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAdvancedCreateOpen(false);
            setAdvancedEditOpen(false);
            setAssignmentToEditAdvanced(null);
          } else if (isAdvancedEditOpen) {
            setAdvancedEditOpen(open);
          } else {
            setAdvancedCreateOpen(open);
          }
        }}
        onSubmit={handleAdvancedCreateAssignment}
        classMeetingId={classMeetingId}
        editAssignment={assignmentToEditAdvanced ? {
          assignmentId: assignmentToEditAdvanced.assignmentId,
          title: assignmentToEditAdvanced.title,
          description: assignmentToEditAdvanced.description || null,
          dueDate: assignmentToEditAdvanced.dueDate,
          skillID: assignmentToEditAdvanced.skillID || null,
          assignmentType: assignmentToEditAdvanced.assignmentType,
          questionUrl: assignmentToEditAdvanced.questionUrl || null,
        } : undefined}
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
            description: assignmentToEdit.description || null,
            dueDate: assignmentToEdit.dueDate,
            storeUrl: assignmentToEdit.storeUrl || null,
          }}
        />
      )}
      {selectedSubmission && (
        <>
      <FeedbackPopup 
        open={isFeedbackOpen} 
        onOpenChange={setFeedbackOpen} 
            submissionId={selectedSubmission.id}
            initialFeedback={selectedSubmission.feedback || ""}
            onSubmit={handleUpdateFeedback}
      />
      <GradeScorePopup 
        open={isGradeOpen} 
        onOpenChange={setGradeOpen} 
            submissionId={selectedSubmission.id}
            initialScore={selectedSubmission.score !== null ? selectedSubmission.score.toString() : ""}
            onSubmit={handleUpdateScore}
          />
        </>
      )}
      {selectedAssignment && (
      <BulkGradeImportPopup 
        open={isBulkImportOpen} 
        onOpenChange={setBulkImportOpen} 
          assignmentTitle={selectedAssignment.title}
          submissions={selectedAssignment.submissions.map(sub => ({
          id: sub.id,
          studentCode: sub.studentCode,
          studentName: sub.studentName,
          }))}
          onSubmit={handleBulkUpdate}
      />
      )}
       {isWritingGradingOpen && selectedAssignment && selectedAssignment.skillName === "Writing" && (
         <WritingGradingView
           assignmentTitle={selectedAssignment.title}
           submissions={selectedAssignment.submissions}
           onClose={() => {
             setWritingGradingOpen(false);
             setViewMode('assignments');
             setSelectedAssignment(null);
           }}
           onGradeSubmit={async (submissionId: string, score: number, feedback: string) => {
             try {
               await updateSubmissionScore(submissionId, score);
               if (feedback) {
                 await updateSubmissionFeedback(submissionId, feedback);
               }
               success("Grade submitted successfully!");
               if (selectedAssignment) {
                 await handleViewSubmissions(selectedAssignment);
               }
             } catch (err: any) {              
               showError(err?.message || 'Failed to submit grade');
             }
           }}
         />
       )}

       {isSpeakingGradingOpen && selectedAssignment && selectedAssignment.skillName === "Speaking" && (
         <SpeakingGradingView
           assignmentTitle={selectedAssignment.title}
           submissions={selectedAssignment.submissions}
           onClose={() => {
             setSpeakingGradingOpen(false);
             setViewMode('assignments');
             setSelectedAssignment(null);
           }}
           onGradeSubmit={async (submissionId: string, score: number, feedback: string) => {
             try {
               await updateSubmissionScore(submissionId, score);
               if (feedback) {
                 await updateSubmissionFeedback(submissionId, feedback);
               }
               success("Grade submitted successfully!");
               if (selectedAssignment) {
                 await handleViewSubmissions(selectedAssignment);
               }
             } catch (err: any) {              
               showError(err?.message || 'Failed to submit grade');
             }
           }}
         />
       )}

       {isListeningGradingOpen && selectedAssignment && selectedAssignment.skillName === "Listening" && (
         <ListeningGradingView
           assignmentTitle={selectedAssignment.title}
           submissions={selectedAssignment.submissions}
           onClose={() => {
             setListeningGradingOpen(false);
             setViewMode('assignments');
             setSelectedAssignment(null);
           }}
         />
       )}

       {isReadingGradingOpen && selectedAssignment && selectedAssignment.skillName === "Reading" && (
         <ReadingGradingView
           assignmentTitle={selectedAssignment.title}
           submissions={selectedAssignment.submissions}
           assignment={{
             assignmentId: selectedAssignment.assignmentId,
             questionUrl: selectedAssignment.questionUrl || undefined
           }}
           onClose={() => {
             setReadingGradingOpen(false);
             setViewMode('assignments');
             setSelectedAssignment(null);
           }}
         />
       )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setAssignmentToDelete(null);
        }}
        onConfirm={confirmDeleteAssignment}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${assignmentToDelete?.title}"? This action cannot be undone and will delete all submissions.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* AI Reading Test Generator Popup */}
      <AIReadingTestGeneratorPopup
        open={isAIReadingTestOpen}
        onOpenChange={setAIReadingTestOpen}
        classMeetingId={classMeetingId}
        onSubmit={refreshAssignments}
      />
    </div>
  );
}
