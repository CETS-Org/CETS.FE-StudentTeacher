import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import type {
  SubmitAcademicRequest,
  AcademicRequestResponse,
} from '@/types/academicRequest';

const ACADEMIC_REQUEST_ENDPOINT = '/api/ACAD_AcademicRequest';

// Submit a new academic request
export const submitAcademicRequest = (
  data: SubmitAcademicRequest,
  config?: AxiosRequestConfig
) =>
  api.post<AcademicRequestResponse>(
    ACADEMIC_REQUEST_ENDPOINT,
    data,
    config
  );

// Get all academic requests submitted by the current user (student)
export const getMyAcademicRequests = (
  studentId: string,
  config?: AxiosRequestConfig
) =>
  api.get<AcademicRequestResponse[]>(
    `${ACADEMIC_REQUEST_ENDPOINT}/student/${studentId}`,
    config
  );

// Get details of a specific academic request
export const getAcademicRequestDetails = (
  requestId: string,
  config?: AxiosRequestConfig
) =>
  api.get<AcademicRequestResponse>(
    `${ACADEMIC_REQUEST_ENDPOINT}/${requestId}`,
    config
  );

// Get presigned upload URL for attachment
export interface GetUploadUrlRequest {
  fileName: string;
  contentType: string;
}

export interface GetUploadUrlResponse {
  uploadUrl: string;
  filePath: string;
}

export const getAttachmentUploadUrl = (
  data: GetUploadUrlRequest,
  config?: AxiosRequestConfig
) => api.post<GetUploadUrlResponse>(`${ACADEMIC_REQUEST_ENDPOINT}/upload-url`, data, config);

// Get presigned download URL for attachment
export const getAttachmentDownloadUrl = (
  filePath: string,
  config?: AxiosRequestConfig
) =>
  api.get<{ downloadUrl: string }>(
    `${ACADEMIC_REQUEST_ENDPOINT}/download-url`,
    {
      params: { filePath },
      ...config,
    }
  );

// Update attachment for request with NeedInfo status
export interface UpdateAttachmentRequest {
  requestID: string;
  attachmentUrl: string;
  additionalNotes?: string;
}

export const updateRequestAttachment = (
  data: UpdateAttachmentRequest,
  config?: AxiosRequestConfig
) =>
  api.put<{ message: string }>(
    `${ACADEMIC_REQUEST_ENDPOINT}/update-attachment`,
    data,
    config
  );

