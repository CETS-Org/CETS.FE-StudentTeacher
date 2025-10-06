import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getCourses = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}`, config);

export const getCourseDetail = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/detail/${courseId}`, config);

export const searchCourses = (searchParams?: any, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/search-basic`, { ...config, params: searchParams });


