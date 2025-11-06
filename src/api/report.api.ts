import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import type {
  SubmitAcademicReportRequest,
  AcademicReportResponse,
  AcademicReportUploadResponse,
  ProcessAcademicReportRequest
} from '@/types/report';

const REPORT_ENDPOINT = '/api/RPT_Report';

// Submit a new academic request (schedule or class change)
export const submitAcademicRequest = (
  data: SubmitAcademicReportRequest,
  config?: AxiosRequestConfig
) =>
  api.post<AcademicReportUploadResponse>(
    `${REPORT_ENDPOINT}/academic-request`,
    data,
    config
  );

// Get all academic requests submitted by the current user
export const getMyAcademicRequests = (
  submitterId: string,
  config?: AxiosRequestConfig
) =>
  api.get<AcademicReportResponse[]>(
    `${REPORT_ENDPOINT}/academic-request/submitter/${submitterId}`,
    config
  );

// Get details of a specific academic request
export const getAcademicRequestDetails = (
  requestId: string,
  config?: AxiosRequestConfig
) =>
  api.get<AcademicReportResponse>(
    `${REPORT_ENDPOINT}/academic-request/${requestId}`,
    config
  );

// Get all academic requests for a specific course
export const getAcademicRequestsByCourse = (
  courseId: string,
  config?: AxiosRequestConfig
) =>
  api.get<AcademicReportResponse[]>(
    `${REPORT_ENDPOINT}/academic-request/course/${courseId}`,
    config
  );

// Get all academic requests for a specific class
export const getAcademicRequestsByClass = (
  classId: string,
  config?: AxiosRequestConfig
) =>
  api.get<AcademicReportResponse[]>(
    `${REPORT_ENDPOINT}/academic-request/class/${classId}`,
    config
  );

// Get all pending academic requests (for staff)
export const getPendingAcademicRequests = (config?: AxiosRequestConfig) =>
  api.get<AcademicReportResponse[]>(
    `${REPORT_ENDPOINT}/academic-request/pending`,
    config
  );

// Process (approve/reject) an academic request (for staff)
export const processAcademicRequest = (
  requestId: string,
  data: ProcessAcademicReportRequest,
  config?: AxiosRequestConfig
) =>
  api.put(
    `${REPORT_ENDPOINT}/academic-request/${requestId}/process`,
    data,
    config
  );

// Get download URL for report attachment
export const getReportDownloadUrl = (
  reportId: string,
  config?: AxiosRequestConfig
) =>
  api.get<{ downloadUrl: string; reportInfo: { id: string; title: string; createdAt: string } }>(
    `${REPORT_ENDPOINT}/download/${reportId}`,
    config
  );



