import { api } from "./api";
import type { ExitSurveyData } from "@/types/dropoutRequest";

export interface CreateExitSurveyRequest {
  studentId: string;
  academicRequestId?: string;
  reasonCategory: string;
  reasonDetail: string;
  feedback: {
    teacherQuality: number;
    classPacing: number;
    materials: number;
    staffService: number;
    schedule: number;
    facilities: number;
  };
  futureIntentions: {
    wouldReturnInFuture: boolean;
    wouldRecommendToOthers: boolean;
  };
  comments: string;
  acknowledgesPermanent: boolean;
  completedAt: string;
}

export interface ExitSurveyResponse {
  id: string;
  studentId: string;
  academicRequestId?: string;
  reasonCategory: string;
  reasonDetail: string;
  feedback: {
    teacherQuality: number;
    classPacing: number;
    materials: number;
    staffService: number;
    schedule: number;
    facilities: number;
  };
  futureIntentions: {
    wouldReturnInFuture: boolean;
    wouldRecommendToOthers: boolean;
  };
  comments: string;
  acknowledgesPermanent: boolean;
  completedAt: string;
  createdAt: string;
}

/**
 * Create a new exit survey
 */
export const createExitSurvey = async (
  surveyData: ExitSurveyData
): Promise<ExitSurveyResponse> => {
  const request: CreateExitSurveyRequest = {
    studentId: surveyData.studentID,
    reasonCategory: surveyData.reasonCategory,
    reasonDetail: surveyData.reasonDetail,
    feedback: {
      teacherQuality: surveyData.feedback.teacherQuality,
      classPacing: surveyData.feedback.classPacing,
      materials: surveyData.feedback.materials,
      staffService: surveyData.feedback.staffService,
      schedule: surveyData.feedback.schedule,
      facilities: surveyData.feedback.facilities,
    },
    futureIntentions: {
      wouldReturnInFuture: surveyData.futureIntentions.wouldReturnInFuture,
      wouldRecommendToOthers: surveyData.futureIntentions.wouldRecommendToOthers,
    },
    comments: surveyData.comments,
    acknowledgesPermanent: surveyData.acknowledgesPermanent,
    completedAt: surveyData.completedAt,
  };

  const response = await api.post<ExitSurveyResponse>(
    "/api/ACAD_ExitSurvey",
    request
  );
  return response.data;
};

/**
 * Get exit survey by ID
 */
export const getExitSurveyById = async (
  id: string
): Promise<ExitSurveyResponse> => {
  const response = await api.get<ExitSurveyResponse>(`/api/ACAD_ExitSurvey/${id}`);
  return response.data;
};

/**
 * Get exit survey by academic request ID
 */
export const getExitSurveyByAcademicRequestId = async (
  academicRequestId: string
): Promise<ExitSurveyResponse> => {
  const response = await api.get<ExitSurveyResponse>(
    `/api/ACAD_ExitSurvey/academic-request/${academicRequestId}`
  );
  return response.data;
};

/**
 * Get all exit surveys for a student
 */
export const getExitSurveysByStudent = async (
  studentId: string
): Promise<ExitSurveyResponse[]> => {
  const response = await api.get<ExitSurveyResponse[]>(
    `/api/ACAD_ExitSurvey/student/${studentId}`
  );
  return response.data;
};

/**
 * Get exit survey analytics (Admin/Staff only)
 */
export const getExitSurveyAnalytics = async (): Promise<{
  totalSurveys: number;
  reasonCategoryStatistics: Record<string, number>;
  averageFeedbackRatings: Record<string, number>;
  surveysThisMonth: number;
  surveysThisYear: number;
}> => {
  const response = await api.get<{
    totalSurveys: number;
    reasonCategoryStatistics: Record<string, number>;
    averageFeedbackRatings: Record<string, number>;
    surveysThisMonth: number;
    surveysThisYear: number;
  }>("/api/ACAD_ExitSurvey/analytics");
  return response.data;
};

