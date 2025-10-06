import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const createLearningMaterial = (
  materialData: { classID?: string; title: string; contentType: string; fileName: string },
  config?: AxiosRequestConfig
) => api.post(`${endpoint.learningMaterial}`, materialData, config);

export const getLearningMaterialsByClass = (classId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.learningMaterial}/class/${classId}`, config);

export const deleteLearningMaterial = (materialId: string, config?: AxiosRequestConfig) =>
  api.delete(`${endpoint.learningMaterial}/${materialId}`, config);


