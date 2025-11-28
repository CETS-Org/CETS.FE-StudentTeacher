export interface CreateSuspensionRequest {
  studentID: string;
  requestTypeID: string;
  startDate: string;
  endDate: string;
  reasonCategory: string;
  reasonDetail: string;
  attachmentUrl?: string;
}

export interface SuspensionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiresDocument: boolean;
  durationDays: number;
  suspensionCountThisYear: number;
}

export const SuspensionReasonCategories = {
  Health: 'Health',
  FamilyIssue: 'FamilyIssue',
  ScheduleConflict: 'ScheduleConflict',
  TemporaryRelocation: 'TemporaryRelocation',
  FinancialDifficulty: 'FinancialDifficulty',
  Other: 'Other'
} as const;

export type SuspensionReasonCategory = typeof SuspensionReasonCategories[keyof typeof SuspensionReasonCategories];

export const SuspensionReasonCategoryLabels: Record<SuspensionReasonCategory, string> = {
  [SuspensionReasonCategories.Health]: 'Health',
  [SuspensionReasonCategories.FamilyIssue]: 'Family Issue',
  [SuspensionReasonCategories.ScheduleConflict]: 'Schedule Conflict',
  [SuspensionReasonCategories.TemporaryRelocation]: 'Temporary Relocation',
  [SuspensionReasonCategories.FinancialDifficulty]: 'Financial Difficulty',
  [SuspensionReasonCategories.Other]: 'Other'
};

export const SuspensionStatuses = {
  Draft: 'Draft',
  Pending: 'Pending',
  NeedInfo: 'NeedInfo',
  UnderReview: 'UnderReview',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Suspended: 'Suspended',
  AwaitingReturn: 'AwaitingReturn',
  Completed: 'Completed',
  AutoDroppedOut: 'AutoDroppedOut',
  Expired: 'Expired'
} as const;

export type SuspensionStatus = typeof SuspensionStatuses[keyof typeof SuspensionStatuses];

