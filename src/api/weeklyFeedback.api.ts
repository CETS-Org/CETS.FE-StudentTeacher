// src/api/weeklyFeedback.api.ts
import type { AxiosRequestConfig } from "axios";
import {  endpoint } from "@/api";
import { api } from "@/api/api";
import type {
  UpsertWeeklyFeedbackRequest,
  WeeklyFeedbackView,
} from "@/services/teachingClassesService";

/** Upsert (draft or submit). Có thể gửi nhiều item trong 1 payload.
 *  - submit=false => lưu draft
 *  - submit=true  => lưu kèm submit
 */
export const upsertWeeklyFeedback = (
  payload: UpsertWeeklyFeedbackRequest,
  config?: AxiosRequestConfig
) => api.post(`${endpoint.weeklyFeedback}`, payload, config);

/** Helper: upsert 1 student (draft/submit) */
export const upsertOneWeeklyFeedback = (
  args: {
    classId: string;
    classMeetingId?: string | null;
    teacherId: string
    weekNumber: number;
    item: {
      studentId: string;
      participation: string;
      assignmentQuality: string;
      skillProgress: string;
      nextStep?: string | null;
      customNote?: string | null;
    };
    submit?: boolean;
  },
  config?: AxiosRequestConfig
) => {
  const payload: UpsertWeeklyFeedbackRequest = {
    classId: args.classId,
    classMeetingId: args.classMeetingId ?? null,
    teacherId : args.teacherId,
    weekNumber: args.weekNumber,
    submit: !!args.submit,
    items: [args.item],
  };
  return upsertWeeklyFeedback(payload, config);
};

/** Lấy list feedback theo lớp + tuần */
export const getWeeklyFeedbackByClassWeek = (
  classId: string,
  weekNumber: number,
  config?: AxiosRequestConfig
) =>
  api.get<WeeklyFeedbackView[]>(
    `${endpoint.weeklyFeedback}/class/${classId}/week/${weekNumber}`,
    config
  );

/** Lấy list feedback của 1 student (có thể lọc theo classId) */
export const getWeeklyFeedbackByStudent = (
  studentId: string,
  classId?: string,
  config?: AxiosRequestConfig
) =>
  api.get<WeeklyFeedbackView[]>(
    classId
      ? `${endpoint.weeklyFeedback}/student/${studentId}?classId=${classId}`
      : `${endpoint.weeklyFeedback}/student/${studentId}`,
    config
  );

/** Lấy chi tiết 1 feedback */
export const getWeeklyFeedbackDetail = (id: string, config?: AxiosRequestConfig) =>
  api.get<WeeklyFeedbackView>(`${endpoint.weeklyFeedback}/${id}`, config);
