import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getAssignmentsByMeetingAndStudent = (
  classMeetingId: string,
  studentId: string,
  config?: AxiosRequestConfig
) => api.get(`${endpoint.assignments}/class-meeting/${classMeetingId}/student/${studentId}/assignments`, config);

// Get all assignments for a class meeting (Teacher view)
export const getAssignmentsByClassMeeting = (
  classMeetingId: string,
  config?: AxiosRequestConfig
) => api.get(`${endpoint.assignments}/class-Assignment/${classMeetingId}`, config);

// Get submissions for an assignment (Teacher view)
export const getSubmissionsByAssignment = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Submissions/assignment/${assignmentId}`, config);

// Update submission feedback
export const updateSubmissionFeedback = (
  submissionId: string,
  feedback: string,
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Submissions/update-feedback`, { submissionId, feedback }, config);

// Update submission score
export const updateSubmissionScore = (
  submissionId: string,
  score: number,
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Submissions/update-score`, { submissionId, score }, config);

// Bulk update submission scores and feedback
export const bulkUpdateSubmissions = (
  submissions: Array<{ 
    submissionId: string; 
    score?: number | null; 
    feedback?: string | null;
  }>,
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Submissions/bulk-update`, { submissions }, config);

// Create assignment
export const createAssignment = (
  assignmentData: {
    classMeetingId: string;
    teacherId: string;
    title: string;
    description: string;
    dueDate: string;
    contentType: string;
    fileName: string;
  },
  config?: AxiosRequestConfig
) => api.post(`/api/ACAD_Assignments/create-assignment`, assignmentData, config);

// Download assignment
export const downloadAssignment = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Assignments/download/${assignmentId}`, config);

// Download submission
export const downloadSubmission = (
  submissionId: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Submissions/download/${submissionId}`, config);

// Download all submissions for an assignment
export const downloadAllSubmissions = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Submissions/assignment/${assignmentId}/downloads`, config);

// Create submission with presigned URL
export const createSubmissionWithPresignedUrl = (
  submissionData: {
    assignmentID: string;
    studentID: string;
    fileName: string;
    contentType: string;
  },
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/create-with-presigned-url', submissionData, config);

// Submit assignment
export const submitAssignment = (
  submissionData: {
    assignmentID: string;
    studentID: string;
    fileUrl: string;
    content: string;
  },
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/submit', submissionData, config);

// Types for Assignment API
export interface AssignmentFromAPI {
  id: string;
  classMeetingId: string;
  title: string;
  description: string | null;
  storeUrl: string | null;
  dueAt: string;
  createdAt: string;
  submissionCount: number;
}

// Types for Submission API
export interface SubmissionFromAPI {
  id: string;
  assignmentID: string;
  studentID: string;
  studentName: string;
  studentCode: string;
  storeUrl: string | null;
  content: string | null;
  score: number | null;
  feedback: string | null;
  createdAt: string;
}

// Get upcoming assignments for a student (across all classes)
export const getUpcomingAssignmentsForStudent = async (
  studentId: string,
  limit: number = 5
): Promise<UpcomingAssignment[]> => {
  try {
    // Get all student's learning classes
    const classesResponse = await api.get(`${endpoint.classes}/learningClass?studentId=${studentId}`);
    const classes = classesResponse.data;
    
    // Get class meetings and assignments for each class
    const allAssignments: UpcomingAssignment[] = [];
    
    for (const classItem of classes) {
      try {
        // Get class meetings for this class
        const meetingsResponse = await api.get(`${endpoint.classMeetings}/class/${classItem.id}`);
        const meetings = meetingsResponse.data;
        
        // For each meeting, get assignments
        for (const meeting of meetings) {
          try {
            const assignmentsResponse = await api.get(
              `${endpoint.assignments}/class-meeting/${meeting.id}/student/${studentId}/assignments`
            );
            const assignments = assignmentsResponse.data;
            
            // Map assignments to include class info
            assignments.forEach((assignment: any) => {
              // Only include assignments that haven't been submitted or are upcoming
              const dueDate = new Date(assignment.dueAt);
              const now = new Date();
              
              // Check if assignment is upcoming (due date in the future or within last 7 days)
              if (dueDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
                const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
                
                allAssignments.push({
                  id: assignment.id,
                  title: assignment.title,
                  dueAt: assignment.dueAt,
                  className: classItem.className,
                  classId: classItem.id,
                  classMeetingId: meeting.id,
                  hasSubmission,
                  isOverdue: dueDate < now && !hasSubmission
                });
              }
            });
          } catch (err) {
            console.error(`Error fetching assignments for meeting ${meeting.id}:`, err);
          }
        }
      } catch (err) {
        console.error(`Error fetching meetings for class ${classItem.id}:`, err);
      }
    }
    
    // Sort by due date (ascending) and take the first 'limit' items
    return allAssignments
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error fetching upcoming assignments:', error);
    return [];
  }
};

export interface UpcomingAssignment {
  id: string;
  title: string;
  dueAt: string;
  className: string;
  classId: string;
  classMeetingId: string;
  hasSubmission: boolean;
  isOverdue: boolean;
}


