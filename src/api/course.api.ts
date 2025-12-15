import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getCourses = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}`, config);

export const getCourseDetail = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/detail/${courseId}`, config);

export const searchCourses = (searchParams?: any, config?: AxiosRequestConfig) => {
  // Custom parameter serialization for arrays to match ASP.NET Core model binding
  // This ensures SkillIds=id1&SkillIds=id2 format (not SkillIds[]=id1&SkillIds[]=id2)
  const params = new URLSearchParams();
  
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // For arrays, add each item as a separate parameter with the same key
      value.forEach(item => params.append(key, item.toString()));
    } else if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  return api.get(`${endpoint.course}/search-basic?${params.toString()}`, config);
};


