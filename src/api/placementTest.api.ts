import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

// Types
export interface PlacementQuestion {
  id: string;
  skillType: string;
  skillTypeID: string;
  questionType: string;
  questionTypeID: string;
  title: string;
  questionUrl?: string | null;
  difficulty: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PlacementTest {
  id: string;
  title: string;
  durationMinutes: number;
  storeUrl?: string | null;
  questions: PlacementQuestion[];
  createdAt: string;
  updatedAt?: string | null;
  isDeleted: boolean;
}

// Student APIs
export const getRandomPlacementTestForStudent = (
  config?: AxiosRequestConfig
) => api.post<PlacementTest>('/api/ACAD_PlacementTest/student/random-test', {}, config);

export const submitPlacementTest = (
  data: {
    studentId: string;
    placementTestId: string;
    score: number;
    answers?: any;
  },
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_PlacementTest/submit', data, config);

export const getQuestionDataUrl = (
  id: string,
  config?: AxiosRequestConfig
) => api.get<{ questionDataUrl: string }>(`/api/ACAD_PlacementTest/${id}/question-data-url`, config);

