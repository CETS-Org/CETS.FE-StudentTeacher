// Academic Request types (using ACAD_AcademicRequest instead of RPT_Report)

export interface SubmitAcademicRequest {
  studentID: string;
  requestTypeID: string;
  priorityID?: string; // Optional, will default to "Medium" if not provided
  reason: string;
  reasonCategory?: string; // Required for all request types
  fromClassID?: string;
  toClassID?: string;
  effectiveDate?: string;
  // For class transfer - specific meeting details
  fromMeetingDate?: string;
  fromSlotID?: string;
  toMeetingDate?: string;
  toSlotID?: string;
  attachmentUrl?: string;
  // For meeting reschedule
  classMeetingID?: string;
  newRoomID?: string;
  // For suspension requests
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  // For dropout requests
  completedExitSurvey?: boolean;
  exitSurveyId?: string;
}

export interface AcademicRequestResponse {
  id: string;
  studentID: string;
  studentName?: string;
  studentEmail?: string;
  requestTypeID: string;
  requestTypeName?: string;
  academicRequestStatusID: string;
  statusName?: string;
  priorityID?: string;
  priorityName?: string;
  reason: string;
  createdAt: string;
  fromClassID?: string;
  fromClassName?: string;
  toClassID?: string;
  toClassName?: string;
  effectiveDate?: string;
  // For class transfer - specific meeting details
  fromMeetingDate?: string;
  fromSlotID?: string;
  fromSlotName?: string;
  toMeetingDate?: string;
  toSlotID?: string;
  toSlotName?: string;
  attachmentUrl?: string;
  processedBy?: string;
  processedByName?: string;
  processedAt?: string;
  staffResponse?: string;
  // For meeting reschedule
  classMeetingID?: string;
  meetingInfo?: string;
  // New meeting details (for meeting reschedule, uses toMeetingDate and toSlotID)
  newRoomID?: string;
  newRoomName?: string;
  // For suspension requests
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  reasonCategory?: string;
  expectedReturnDate?: string;
  // For dropout requests
  completedExitSurvey?: boolean;
  exitSurveyId?: string;
}

