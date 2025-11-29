export interface CreateDropoutRequest {
  studentID: string;
  requestTypeID: string;
  effectiveDate: string;
  reasonCategory: string;
  reasonDetail: string;
  attachmentUrl?: string;
  completedExitSurvey: boolean;
  exitSurveyId?: string;
}

export interface DropoutValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasUnpaidInvoices: boolean;
  hasPendingRequests: boolean;
  completedExitSurvey: boolean;
}

export const DropoutReasonCategories = {
  PersonalReason: 'PersonalReason',
  FinancialReason: 'FinancialReason',
  UnsatisfiedWithCourse: 'UnsatisfiedWithCourse',
  UnsatisfiedWithTeacher: 'UnsatisfiedWithTeacher',
  ScheduleConflict: 'ScheduleConflict',
  MovingAway: 'MovingAway',
  HealthIssue: 'HealthIssue',
  NoLongerInterested: 'NoLongerInterested',
  FoundAnotherCentre: 'FoundAnotherCentre',
  Other: 'Other'
} as const;

export type DropoutReasonCategory = typeof DropoutReasonCategories[keyof typeof DropoutReasonCategories];

export const DropoutReasonCategoryLabels: Record<DropoutReasonCategory, string> = {
  [DropoutReasonCategories.PersonalReason]: 'Personal Reason',
  [DropoutReasonCategories.FinancialReason]: 'Financial Reason',
  [DropoutReasonCategories.UnsatisfiedWithCourse]: 'Unsatisfied with Course',
  [DropoutReasonCategories.UnsatisfiedWithTeacher]: 'Unsatisfied with Teacher',
  [DropoutReasonCategories.ScheduleConflict]: 'Schedule Conflict',
  [DropoutReasonCategories.MovingAway]: 'Moving Away',
  [DropoutReasonCategories.HealthIssue]: 'Health Issue',
  [DropoutReasonCategories.NoLongerInterested]: 'No Longer Interested',
  [DropoutReasonCategories.FoundAnotherCentre]: 'Found Another Centre',
  [DropoutReasonCategories.Other]: 'Other'
};

export const DropoutStatuses = {
  Draft: 'Draft',
  Pending: 'Pending',
  NeedInfo: 'NeedInfo',
  UnderReview: 'UnderReview',
  FinancialPending: 'FinancialPending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Completed: 'Completed'
} as const;

export type DropoutStatus = typeof DropoutStatuses[keyof typeof DropoutStatuses];

// Exit Survey structure
export interface ExitSurveyData {
  // Section 1: Reason for dropping out
  reasonCategory: DropoutReasonCategory;
  reasonDetail: string;
  
  // Section 2: Feedback ratings (1-5 scale)
  feedback: {
    teacherQuality: number;
    classPacing: number;
    materials: number;
    staffService: number;
    schedule: number;
    facilities: number;
  };
  
  // Section 3: Future intentions
  futureIntentions: {
    wouldReturnInFuture: boolean;
    wouldRecommendToOthers: boolean;
  };
  
  // Section 4: Free text comments
  comments: string;
  
  // Section 5: Acknowledgement
  acknowledgesPermanent: boolean;
  
  // Metadata
  completedAt: string;
  studentID: string;
}

