import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import type { DropoutValidationResult, ExitSurveyData } from '@/types/dropoutRequest';
import type { GetUploadUrlRequest, GetUploadUrlResponse } from './academicRequest.api';

const DROPOUT_ENDPOINT = '/api/ACAD_AcademicRequest/dropout';

// Validate a dropout request before submission
export const validateDropoutRequest = (
  data: {
    studentID: string;
    requestTypeID: string;
    effectiveDate: string;
    reasonCategory: string;
    reasonDetail: string;
    completedExitSurvey: boolean;
    exitSurveyId?: string;
  },
  config?: AxiosRequestConfig
) =>
  api.post<DropoutValidationResult>(
    `${DROPOUT_ENDPOINT}/validate`,
    data,
    config
  );

// Submit a dropout request
export const submitDropoutRequest = (
  data: {
    studentID: string;
    requestTypeID: string;
    effectiveDate: string;
    reasonCategory: string;
    reasonDetail: string;
    attachmentUrl?: string;
    completedExitSurvey: boolean;
    exitSurveyId?: string;
  },
  config?: AxiosRequestConfig
) =>
  api.post(DROPOUT_ENDPOINT, data, config);

// Upload exit survey data to cloud storage
export const uploadExitSurvey = async (
  surveyData: ExitSurveyData,
  config?: AxiosRequestConfig
): Promise<string> => {
  // Convert survey data to JSON blob
  const surveyJson = JSON.stringify(surveyData, null, 2);
  const blob = new Blob([surveyJson], { type: 'application/json' });
  
  // Generate filename
  const fileName = `exit-survey-${surveyData.studentID}-${Date.now()}.json`;
  
  // Get upload URL
  const uploadUrlResponse = await api.post<GetUploadUrlResponse>(
    '/api/ACAD_AcademicRequest/upload-url',
    {
      fileName,
      contentType: 'application/json'
    },
    config
  );
  
  const { uploadUrl, filePath } = uploadUrlResponse.data;
  
  // Upload the survey JSON to cloud storage
  await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Return the file path to be stored in the database
  return filePath;
};

