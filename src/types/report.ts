// Academic Request types (using ACAD_AcademicRequest instead of RPT_Report)

export interface SubmitAcademicRequest {
  studentID: string;
  requestTypeID: string;
  reason: string;
  fromClassID?: string;
  toClassID?: string;
  effectiveDate?: string;
  attachmentUrl?: string;
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
  reason: string;
  createdAt: string;
  fromClassID?: string;
  fromClassName?: string;
  toClassID?: string;
  toClassName?: string;
  effectiveDate?: string;
  attachmentUrl?: string;
  processedBy?: string;
  processedByName?: string;
  processedAt?: string;
}



