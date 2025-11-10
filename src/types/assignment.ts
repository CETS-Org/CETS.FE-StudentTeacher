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
  skillID?: string | null;
  skillName?: string | null;
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
  isAiScore?: boolean; // API returns lowercase 'i'
}

// Upcoming Assignment
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

// Speaking Assignment Question
export interface SpeakingQuestion {
  id: string;
  order: number;
  question: string;
  points: number;
  audioTimestamp?: string;
  maxDuration?: number;
  instructions?: string;
}

// Speaking Assignment Settings
export interface SpeakingAssignmentSettings {
  allowBackNavigation: boolean;
  showProgress: boolean;
  showQuestionNumbers: boolean;
  autoSubmit: boolean;
  maxRetries?: number;
}

// Speaking Assignment Image
export interface SpeakingAssignmentImage {
  url: string;
  questionId: string;
  altText?: string;
}

// Speaking Assignment Media
export interface SpeakingAssignmentMedia {
  audioUrl?: string;
  videoUrl?: string;
  images: SpeakingAssignmentImage[];
}

// Speaking Assignment Question Data
export interface SpeakingAssignmentQuestionData {
  version: string;
  questions: SpeakingQuestion[];
  settings: SpeakingAssignmentSettings;
  media: SpeakingAssignmentMedia;
}

// Create Speaking Assignment Request
export interface CreateSpeakingAssignmentRequest {
  classMeetingId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate: string;
  questionJson: string; // JSON string from frontend
  skillID?: string;
  audioUrl?: string;
  audioFileName?: string;
  audioContentType?: string;
  videoUrl?: string;
  videoFileName?: string;
  videoContentType?: string;
}

// Speaking Assignment Response from API
export interface SpeakingAssignmentFromAPI {
  id: string;
  classMeetingId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  skillID?: string;
  skillName?: string;
  audioUrl?: string;
  videoUrl?: string;
  uploadUrl?: string; // Presigned URL for JSON upload
  questionJson?: string; // JSON content for upload
  audioUploadUrl?: string; // Presigned URL for audio upload
  videoUploadUrl?: string; // Presigned URL for video upload
  questionJsonUrl?: string; // Presigned URL for frontend to download JSON
}

// Create Assignment Request
export interface CreateAssignmentRequest {
  classMeetingId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  skillID?: string | null;
  contentType: string;
  fileName: string;
}

// Update Assignment Request
export interface UpdateAssignmentRequest {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  skillID?: string | null;
  storeUrl?: string;
  contentType?: string;
  fileName?: string;
  questionUrl?: string; // File path for question JSON (for Quiz/Speaking assignments)
}

// Create Submission Request (matches SubmitAssignmentRequest from backend)
export interface CreateSubmissionRequest {
  assignmentID: string;
  studentID: string;
  fileName: string | null; // Can be null for reading/listening assignments
  contentType: string | null; // Can be null for reading/listening assignments
  content: string | null; // Can be null for reading/listening assignments
  score?: number; // Calculated score for auto-gradable assignments (reading/listening)
}

// Create Submission with Presigned URL Request
export interface CreateSubmissionWithPresignedUrlRequest {
  assignmentID: string;
  studentID: string;
  fileName: string;
  contentType: string;
}

// Submit Assignment Answers Request
export interface SubmitAssignmentAnswersRequest {
  assignmentID: string;
  answers: Array<{
    questionId: string;
    answer: any;
    timestamp?: string;
  }>;
  audioBlob?: Blob | null;
  score?: number; // Calculated score for auto-gradable assignments (reading/listening)
}

// Update Submission Feedback Request
export interface UpdateSubmissionFeedbackRequest {
  submissionId: string;
  feedback: string;
}

// Update Submission Score Request
export interface UpdateSubmissionScoreRequest {
  submissionId: string;
  score: number;
}

// Bulk Update Submission Request
export interface BulkUpdateSubmissionRequest {
  submissionId: string;
  score?: number | null;
  feedback?: string | null;
}

// Bulk Update Submissions Request
export interface BulkUpdateSubmissionsRequest {
  submissions: BulkUpdateSubmissionRequest[];
}

// Quiz Assignment Question Data
export interface QuizAssignmentQuestionData {
  version: string;
  questions: Array<{
    id: string;
    type: string;
    order: number;
    question: string;
    points: number;
    options?: Array<{ id: string; label: string; text: string }>;
    correctAnswer?: any;
    explanation?: string;
    audioTimestamp?: string;
    reference?: string;
    shuffleOptions?: boolean;
    blanks?: Array<{ id: string; position: number; correctAnswers: string[]; caseSensitive: boolean }>;
    matching?: {
      leftColumn: Array<{ id: string; text: string }>;
      rightColumn: Array<{ id: string; text: string }>;
      correctMatches: Array<{ left: string; right: string }>;
      shuffleRightColumn: boolean;
    };
    maxLength?: number;
    keywords?: string[];
    requiresManualGrading?: boolean;
  }>;
  settings: {
    shuffleQuestions: boolean;
    allowBackNavigation: boolean;
    showProgress: boolean;
    showQuestionNumbers: boolean;
    timeLimitMinutes?: number;
    allowMultipleRecordings?: boolean;
    maxRecordings?: number;
  };
}

// Create Quiz Assignment Request
export interface CreateQuizAssignmentRequest {
  classMeetingId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate: string;
  questionJson: string; // JSON string from frontend
  skillID?: string;
  audioUrl?: string;
  videoUrl?: string;
}

// Quiz Assignment Response from API
export interface QuizAssignmentFromAPI {
  id: string;
  classMeetingId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  skillID?: string;
  skillName?: string;
  audioUrl?: string;
  videoUrl?: string;
  uploadUrl?: string; // Presigned URL for JSON upload
  questionJson?: string; // JSON content for upload
  questionJsonUrl?: string; // Presigned URL for frontend to download JSON
  questionFilePath?: string; // File path for question JSON (for updates)
}

