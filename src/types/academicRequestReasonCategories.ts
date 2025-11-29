// General reason categories for all academic request types
export const AcademicRequestReasonCategories = {
  Health: 'Health',
  FamilyIssue: 'FamilyIssue',
  ScheduleConflict: 'ScheduleConflict',
  TemporaryRelocation: 'TemporaryRelocation',
  FinancialDifficulty: 'FinancialDifficulty',
  AcademicPerformance: 'AcademicPerformance',
  PersonalMatter: 'PersonalMatter',
  WorkCommitment: 'WorkCommitment',
  Other: 'Other'
} as const;

export type AcademicRequestReasonCategory = typeof AcademicRequestReasonCategories[keyof typeof AcademicRequestReasonCategories];

export const AcademicRequestReasonCategoryLabels: Record<AcademicRequestReasonCategory, string> = {
  [AcademicRequestReasonCategories.Health]: 'Health',
  [AcademicRequestReasonCategories.FamilyIssue]: 'Family Issue',
  [AcademicRequestReasonCategories.ScheduleConflict]: 'Schedule Conflict',
  [AcademicRequestReasonCategories.TemporaryRelocation]: 'Temporary Relocation',
  [AcademicRequestReasonCategories.FinancialDifficulty]: 'Financial Difficulty',
  [AcademicRequestReasonCategories.AcademicPerformance]: 'Academic Performance',
  [AcademicRequestReasonCategories.PersonalMatter]: 'Personal Matter',
  [AcademicRequestReasonCategories.WorkCommitment]: 'Work Commitment',
  [AcademicRequestReasonCategories.Other]: 'Other'
};

