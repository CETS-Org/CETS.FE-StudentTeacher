// Session-related types
// This file contains all session-related interfaces used across the application

// Submission task interface for session assignments
export interface SubmissionTask {
  id: string;
  title: string;
  sessionId: string;
  isSubmitted: boolean;
}

// Course session interface for displaying session information
export interface CourseSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration: string;
  isCompleted: boolean;
  isStudy: boolean;
  submissionTasks: SubmissionTask[];
  // Session Context fields
  topicTitle: string;
  totalSlots: number;
  required: boolean;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
}

// Session content interface for teacher session detail page
export interface SessionContent {
  topicTitle: string;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
}

