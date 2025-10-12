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


