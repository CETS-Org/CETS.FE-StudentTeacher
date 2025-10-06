import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getTeachingCourses = (teacherId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.courseTeacherAssignment}/teaching-courses/${teacherId}`, config);

export const getTeachingClasses = (
  teacherId: string,
  courseId: string,
  config?: AxiosRequestConfig
) => api.get(`${endpoint.courseTeacherAssignment}/teaching-classes/${teacherId}/${courseId}`, config);


