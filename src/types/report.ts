// Report-related types for Academic Requests

export interface SubmitAcademicReportRequest {
  reportTypeID: string;
  submittedBy: string;
  title: string;
  description: string;
  fileName?: string;
  contentType?: string;
  attachmentUrl?: string;
}

export interface AcademicReportUploadResponse {
  report: AcademicReportResponse;
  uploadUrl?: string;
  filePath?: string;
}

export interface AcademicReportResponse {
  id: string;
  reportTypeID: string;
  reportTypeName?: string;
  submittedBy: string;
  submitterName?: string;
  submitterEmail?: string;
  submitterRole?: string;
  title: string;
  description: string;
  courseID?: string;
  courseName?: string;
  courseCode?: string;
  classID?: string;
  className?: string;
  currentSchedule?: string;
  newSchedule?: string;
  attachmentUrl?: string;
  reportStatusID: string;
  statusName?: string;
  reportUrl?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
}

export interface ProcessAcademicReportRequest {
  processedBy: string;
  newStatusId: string;
  notes?: string;
}



