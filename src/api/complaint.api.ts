import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

// Types for Complaint
export interface SystemComplaint {
  id: string;
  reportTypeID: string;
  reportTypeName?: string;
  submittedBy: string;
  submitterName?: string;
  submitterEmail?: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  reportStatusID: string;
  statusName?: string;
  priority?: string;
  reportUrl?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  adminResponse?: string;
}

export interface CreateComplaintRequest {
  reportTypeID: string;
  submittedBy: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  reportStatusID: string;
  priority?: string;
  reportUrl?: string;
}

export interface UpdateComplaintRequest {
  reportTypeID: string;
  submittedBy: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  reportStatusID: string;
  priority?: string;
  reportUrl?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminResponse?: string;
}

export interface ReportType {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface ReportStatus {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

// Get all system complaints
export const getAllComplaints = async (config?: AxiosRequestConfig): Promise<SystemComplaint[]> => {
  const response = await api.get('/api/RPT_Report/system-complaints', config);
  return response.data;
};

// Get complaints by submitter (current user)
export const getMyComplaints = async (submitterId: string, config?: AxiosRequestConfig): Promise<SystemComplaint[]> => {
  const response = await api.get(`/api/RPT_Report/submitter/${submitterId}`, config);
  return response.data;
};

// Get complaint by ID
export const getComplaintById = async (id: string, config?: AxiosRequestConfig): Promise<SystemComplaint> => {
  const response = await api.get(`/api/RPT_Report/${id}`, config);
  return response.data;
};

// Create a new complaint
export const createComplaint = async (data: CreateComplaintRequest, config?: AxiosRequestConfig): Promise<SystemComplaint> => {
  const response = await api.post('/api/RPT_Report', data, config);
  return response.data;
};

// Update a complaint
export const updateComplaint = async (id: string, data: UpdateComplaintRequest, config?: AxiosRequestConfig): Promise<SystemComplaint> => {
  const response = await api.put(`/api/RPT_Report/${id}`, data, config);
  return response.data;
};

// Delete a complaint
export const deleteComplaint = async (id: string, config?: AxiosRequestConfig): Promise<void> => {
  await api.delete(`/api/RPT_Report/${id}`, config);
};

// Get download URL for complaint attachment
export const getComplaintDownloadUrl = async (id: string, config?: AxiosRequestConfig): Promise<{ downloadUrl: string; complaintInfo: any }> => {
  const response = await api.get(`/api/RPT_Report/download/${id}`, config);
  return response.data;
};

// Get download URL for complaint problem image
export const getComplaintImageUrl = async (id: string, config?: AxiosRequestConfig): Promise<{ downloadUrl: string; complaintInfo: any }> => {
  const response = await api.get(`/api/RPT_Report/image/${id}`, config);
  return response.data;
};

// Get all report types for selection
export const getReportTypes = async (config?: AxiosRequestConfig): Promise<ReportType[]> => {
  const response = await api.get('/api/RPT_Report/report-types', config);
  return response.data;
};

// Get all report statuses for selection
export const getReportStatuses = async (config?: AxiosRequestConfig): Promise<ReportStatus[]> => {
  const response = await api.get('/api/RPT_Report/report-statuses', config);
  return response.data;
};

// Get presigned upload URL for report image
export interface GetReportImageUploadUrlRequest {
  fileName: string;
  contentType: string;
}

export interface GetReportImageUploadUrlResponse {
  uploadUrl: string;
  filePath: string;
}

export const getReportImageUploadUrl = async (
  data: GetReportImageUploadUrlRequest,
  config?: AxiosRequestConfig
): Promise<GetReportImageUploadUrlResponse> => {
  const response = await api.post<GetReportImageUploadUrlResponse>(
    '/api/RPT_Report/image-upload-url',
    data,
    config
  );
  return response.data;
};

