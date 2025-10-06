import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export type DayOfWeekEnum = number; // 0=Sunday..6=Saturday per JS; backend uses System.DayOfWeek

export interface TeacherAvailabilityCreate {
  teacherID: string;
  teachDay: DayOfWeekEnum; // send enum number; backend converts via HasConversion<string>()
  timeSlotID?: string | null;
}

export interface TeacherAvailabilityUpdate extends TeacherAvailabilityCreate {}

export const createTeacherAvailability = (payload: TeacherAvailabilityCreate, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.teacherAvailability}`, payload, config);

export const updateTeacherAvailability = (id: string, payload: TeacherAvailabilityUpdate, config?: AxiosRequestConfig) =>
  api.put(`${endpoint.teacherAvailability}/${id}`, payload, config);

export const deleteTeacherAvailability = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${endpoint.teacherAvailability}/${id}`, config);

export const getTeacherAvailabilityByTeacher = (teacherId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.teacherAvailability}/teacher/${teacherId}`, config);

export const getTeacherAvailabilityByTeacherAndDate = (teacherId: string, dateIso: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.teacherAvailability}/teacher/${teacherId}/date/${dateIso}`, config);


