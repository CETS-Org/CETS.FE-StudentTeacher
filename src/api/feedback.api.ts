import { api } from './api';

export interface CourseFeedbackData {
  rating?: number;
  comment?: string;
  contentClarity?: string;
  courseRelevance?: string;
  materialsQuality?: string;
}

export interface TeacherFeedbackData {
  rating?: number;
  comment?: string;
  teachingEffectiveness?: string;
  communicationSkills?: string;
  teacherSupportiveness?: string;
}

export interface CreateCombinedFeedbackRequest {
  submitterID: string;
  courseID: string;
  teacherID: string;
  courseFeedback?: CourseFeedbackData;
  teacherFeedback?: TeacherFeedbackData;
}

export interface FeedbackResponse {
  id: string;
  submitterID: string;
  feedbackTypeID?: string;
  courseID?: string;
  teacherID?: string;
  rating?: number;
  comment?: string;
  contentClarity?: string;
  courseRelevance?: string;
  materialsQuality?: string;
  teachingEffectiveness?: string;
  communicationSkills?: string;
  teacherSupportiveness?: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface CombinedFeedbackResponse {
  courseFeedback?: FeedbackResponse;
  teacherFeedback?: FeedbackResponse;
  success: boolean;
  message?: string;
}

export const feedbackApi = {
  createCombined: async (data: CreateCombinedFeedbackRequest): Promise<CombinedFeedbackResponse> => {
    const response = await api.post('/api/COM_Feedback/combined', data);
    return response.data;
  },

  getAll: async (): Promise<FeedbackResponse[]> => {
    const response = await api.get('/api/COM_Feedback');
    return response.data;
  },

  getById: async (id: string): Promise<FeedbackResponse> => {
    const response = await api.get(`/api/COM_Feedback/${id}`);
    return response.data;
  },
};
