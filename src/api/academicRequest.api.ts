import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import type {
  SubmitAcademicRequest,
  AcademicRequestResponse,
} from '@/types/report';

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

