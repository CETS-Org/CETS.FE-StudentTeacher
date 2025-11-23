import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getStudentLearningClasses = (studentId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classes}/learningClass`, { ...config, params: { studentId } });

export const getClassDetailsById = (classId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classes}/${classId}/detail`, config);

// Get all classes (for class transfer dropdown)
export const getAllClasses = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classes}/staff-classes`, config);

