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

// Get presigned URL for audio file upload
export const getAudioUploadUrl = (
  fileName: string,
  config?: AxiosRequestConfig
) => api.get(`/api/ACAD_Assignments/audio-url?fileName=${encodeURIComponent(fileName)}`, config);

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

// Get presigned URL for question data (used when taking test, viewing details, or editing)
export const getQuestionDataUrl = (
  assignmentId: string,
  config?: AxiosRequestConfig
) => api.get(`${endpoint.assignments}/${assignmentId}/question-data-url`, config);

// Submit assignment answers (for question-based assignments)
export const submitAssignmentAnswers = (
  submissionData: SubmitAssignmentAnswersRequest,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/submit-answers', submissionData, config);

// Start an attempt for a quiz/assignment (counts as an attempt)
export const startAttempt = (
  assignmentId: string,
  studentId: string,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/start-attempt', {
  assignmentID: assignmentId,
  studentID: studentId
}, config);

// Get presigned URLs for uploading speaking assignment files
export const getSpeakingSubmissionUploadUrls = (
  assignmentId: string,
  studentId: string,
  audioQuestionIds?: string[],
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/speaking-upload-urls', {
  assignmentID: assignmentId,
  studentID: studentId,
  AudioQuestionIds: audioQuestionIds || [] 
}, config);

// Submit speaking assignment after files are uploaded
export const submitSpeakingSubmission = (
  assignmentId: string,
  studentId: string,
  answersJsonFilePath: string,
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_Submissions/submit-speaking', {
  assignmentID: assignmentId,
  studentID: studentId,
  answersJsonFilePath
}, config);

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

// Get upcoming assignments for a student using dedicated backend endpoint (single API call)
export const getUpcomingAssignmentsForStudent = async (
  studentId: string,
  limit: number = 5
): Promise<UpcomingAssignment[]> => {
  try {
    const response = await api.get(`${endpoint.assignments}/student/${studentId}/upcoming`, {
      params: { limit }
    });
    
    const data = Array.isArray(response.data) ? response.data : [];
    
    // Map backend response to frontend type
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      dueAt: item.dueAt,
      className: item.className,
      classId: item.classId,
      classMeetingId: item.classMeetingId,
      sessionNumber: item.sessionNumber || 0,
      hasSubmission: item.hasSubmission,
      isOverdue: item.isOverdue
    }));
  } catch (error: any) {
    console.error('Error fetching upcoming assignments:', error?.response?.data || error?.message || error);
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

