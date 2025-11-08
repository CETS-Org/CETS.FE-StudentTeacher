import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';
import type {
  AssignmentFromAPI,
  SubmissionFromAPI,
  UpcomingAssignment,
  CreateSpeakingAssignmentRequest,
  SpeakingAssignmentFromAPI,
  CreateQuizAssignmentRequest,
  QuizAssignmentFromAPI,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  CreateSubmissionRequest,
  CreateSubmissionWithPresignedUrlRequest,
  SubmitAssignmentAnswersRequest,
  UpdateSubmissionFeedbackRequest,
  UpdateSubmissionScoreRequest,
  BulkUpdateSubmissionsRequest,
} from '@/types/assignment';

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
  assignmentSkill?: string,
  config?: AxiosRequestConfig
) => {
  const params = new URLSearchParams({ assignmentId });
  if (assignmentSkill) {
    params.append('assignmentSkill', assignmentSkill);
  }
  return api.get(`/api/ACAD_Submissions/api/submissions?${params.toString()}`, config);
};

// Update submission feedback
export const updateSubmissionFeedback = (
  submissionId: string,
  feedback: string,
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Submissions/update-feedback`, { submissionId, feedback } as UpdateSubmissionFeedbackRequest, config);

// Update submission score
export const updateSubmissionScore = (
  submissionId: string,
  score: number,
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Submissions/update-score`, { submissionId, score } as UpdateSubmissionScoreRequest, config);

// Bulk update submission scores and feedback
export const bulkUpdateSubmissions = (
  submissions: BulkUpdateSubmissionsRequest['submissions'],
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Submissions/bulk-update`, { submissions } as BulkUpdateSubmissionsRequest, config);

// Create assignment
export const createAssignment = (
  assignmentData: CreateAssignmentRequest,
  config?: AxiosRequestConfig
) => api.post(`/api/ACAD_Assignments/create-assignment`, assignmentData, config);

// Update assignment
export const updateAssignment = (
  assignmentId: string,
  assignmentData: UpdateAssignmentRequest,
  config?: AxiosRequestConfig
) => api.put(`/api/ACAD_Assignments/update/${assignmentId}`, assignmentData, config);

// Delete assignment
export const deleteAssignment = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.delete(`/api/ACAD_Assignments/${assignmentId}`, config);

// Get presigned URL for question JSON upload (for updates)
export const getQuestionJsonUploadUrl = (
  fileName?: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Assignments/question-json-upload-url${fileName ? `?fileName=${encodeURIComponent(fileName)}` : ''}`, config);

// Download assignment
export const downloadAssignment = (
  assignmentId: string,
  config?: AxiosRequestConfig
) =>
  api.get(`/api/ACAD_Assignments/download/${assignmentId}`, {
    responseType: 'blob',
    ...config,
  });

// Download submission
export const downloadSubmission = (
  submissionId: string,
  config?: AxiosRequestConfig
) =>
  api.get(`/api/ACAD_Submissions/download/${submissionId}`, {
    ...config, // vẫn cho phép custom header nếu cần
  });


// Download all submissions for an assignment
export const downloadAllSubmissions = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Submissions/assignment/${assignmentId}/downloads`, config);

// Create submission with presigned URL
export const createSubmissionWithPresignedUrl = (
  submissionData: CreateSubmissionWithPresignedUrlRequest,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/create-with-presigned-url', submissionData, config);

// Submit assignment
export const submitAssignment = (
  submissionData: CreateSubmissionRequest,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/submit', submissionData, config);

// Get assignment by ID
export const getAssignmentById = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.get(`${endpoint.assignments}/${assignmentId}`, config);

// Submit assignment answers (for question-based assignments)
export const submitAssignmentAnswers = (
  submissionData: SubmitAssignmentAnswersRequest,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/submit-answers', submissionData, config);

// Submit writing assignment with AI grading
export const submitWritingAssignment = (
  formData: FormData,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/SubmitWritingSubmisson', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  ...config,
});

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

// Create speaking assignment
export const createSpeakingAssignment = (
  assignmentData: CreateSpeakingAssignmentRequest,
  config?: AxiosRequestConfig
) => api.post(`${endpoint.assignments}/create-speaking-assignment`, assignmentData, config);


// Create quiz assignment
export const createQuizAssignment = (
  assignmentData: CreateQuizAssignmentRequest,
  config?: AxiosRequestConfig
) => api.post(`${endpoint.assignments}/create-quiz-assignment`, assignmentData, config);

