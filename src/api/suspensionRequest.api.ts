import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import type { SuspensionValidationResult } from '@/types/suspensionRequest';

const SUSPENSION_ENDPOINT = '/api/ACAD_AcademicRequest/suspension';

// Validate a suspension request before submission
export const validateSuspensionRequest = (
  data: {
    studentID: string;
    requestTypeID: string;
    startDate: string;
    endDate: string;
    reasonCategory: string;
    reasonDetail: string;
  },
  config?: AxiosRequestConfig
) =>
  api.post<SuspensionValidationResult>(
    `${SUSPENSION_ENDPOINT}/validate`,
    data,
    config
  );

