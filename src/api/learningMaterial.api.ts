import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const createLearningMaterial = (
  materialData: { classMeetingID?: string; title: string; contentType: string; fileName: string },
  config?: AxiosRequestConfig
) => api.post(`${endpoint.learningMaterial}`, materialData, config);

export const getLearningMaterialsByClassMeeting = (classMeetingId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.learningMaterial}/class-meeting/${classMeetingId}`, config);

export const deleteLearningMaterial = (materialId: string, config?: AxiosRequestConfig) =>
  api.delete(`${endpoint.learningMaterial}/${materialId}`, config);


