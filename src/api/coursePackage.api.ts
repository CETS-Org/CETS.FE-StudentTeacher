import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getCoursePackages = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coursePackage}`, config);

export const getActiveCoursePackages = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coursePackage}/active`, config);

export const searchCoursePackages = (searchParams?: any, config?: AxiosRequestConfig) => {
  const params = new URLSearchParams();
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item.toString()));
    } else if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  return api.get(`${endpoint.coursePackage}/search-basic?${params.toString()}`, config);
};

export const getCoursePackageDetail = (packageId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coursePackage}/${packageId}/detail`, config);

export const getCoursePackageById = (packageId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coursePackage}/${packageId}`, config);


