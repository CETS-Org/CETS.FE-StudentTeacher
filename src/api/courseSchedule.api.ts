import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getCourseSchedules = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.courseSchedule}/course/${courseId}`, config);

export const getAllCourseSchedules = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.courseSchedule}`, config);


