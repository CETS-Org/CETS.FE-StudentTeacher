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

const pendingRequests = new Map<string, Promise<UpcomingAssignment[]>>();

const resultCache = new Map<string, { data: UpcomingAssignment[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

// Get upcoming assignments for a student (across all classes)
export const getUpcomingAssignmentsForStudent = async (
  studentId: string,
  limit: number = 5
): Promise<UpcomingAssignment[]> => {
  // Create a unique cache key for this request
  const cacheKey = `upcoming-assignments-${studentId}-${limit}`;
  
  // Check if there's a pending request
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }
  
  // Check result cache
  const cached = resultCache.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  // Create the request promise
  const requestPromise = (async () => {
    try {
      // Get all student's learning classes
      const classesResponse = await api.get(`${endpoint.classes}/learningClass?studentId=${studentId}`);
      const classes = Array.isArray(classesResponse.data) ? classesResponse.data : [];
      
      if (classes.length === 0) {
        return [];
      }
      
      // Fetch all class meetings in parallel
      const meetingPromises = classes.map(async (classItem) => {
        try {
          const meetingsResponse = await api.get(`${endpoint.classMeetings}/${classItem.id}`);
          const meetings = Array.isArray(meetingsResponse.data) ? meetingsResponse.data : [];
          return { classItem, meetings };
        } catch (err: any) {
          console.error(`Error fetching meetings for class ${classItem.id}:`, err?.response?.data || err?.message || err);
          return { classItem, meetings: [] };
        }
      });
      
      const classMeetingsResults = await Promise.all(meetingPromises);
      
      // Collect all meetings with their class info
      const meetingsWithClass: Array<{ meeting: any; classItem: any }> = [];
      for (const { classItem, meetings } of classMeetingsResults) {
        for (const meeting of meetings) {
          meetingsWithClass.push({ meeting, classItem });
        }
      }
      
      if (meetingsWithClass.length === 0) {
        return [];
      }
      
      // Fetch all assignments in parallel
      const assignmentPromises = meetingsWithClass.map(async ({ meeting, classItem }) => {
        try {
          const assignmentsResponse = await api.get(
            `${endpoint.assignments}/class-meeting/${meeting.id}/student/${studentId}/assignments`
          );
          const assignments = Array.isArray(assignmentsResponse.data) ? assignmentsResponse.data : [];
          return { assignments, classItem, meeting };
        } catch (err: any) {
          console.error(`Error fetching assignments for meeting ${meeting.id}:`, err?.response?.data || err?.message || err);
          return { assignments: [], classItem, meeting };
        }
      });
      
      const assignmentResults = await Promise.all(assignmentPromises);
      
      // Process all assignments
      const allAssignments: UpcomingAssignment[] = [];
      const now = new Date();
      
      for (const { assignments, classItem, meeting } of assignmentResults) {
        for (const assignment of assignments) {
          const dueDateValue = assignment.dueDate;
          if (!dueDateValue) {
            continue;
          }
          
          const dueDate = new Date(dueDateValue);
          const hasSubmission = assignment.submissions && assignment.submissions.length > 0;
          
          // Only include assignments that are upcoming (due date in the future)
          if (dueDate >= now) {
            allAssignments.push({
              id: assignment.id,
              title: assignment.title,
              dueAt: dueDateValue,
              className: classItem.className || 'Unknown Class',
              classId: classItem.id,
              classMeetingId: meeting.id,
              hasSubmission,
              isOverdue: false
            });
          }
        }
      }
      
      // Sort by due date (ascending) and take the first 'limit' items
      const sortedAssignments = allAssignments
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
        .slice(0, limit);
      
      // Cache the result
      resultCache.set(cacheKey, { data: sortedAssignments, timestamp: Date.now() });
      
      return sortedAssignments;
        
    } catch (error: any) {
      console.error('Error fetching upcoming assignments:', error?.response?.data || error?.message || error);
      return [];
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(cacheKey);
    }
  })();
  
  // Store the pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
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

