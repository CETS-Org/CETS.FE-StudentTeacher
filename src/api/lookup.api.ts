import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getPlanTypes = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/PlanType`, config);

export const getTimeSlots = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/TimeSlot`, config);

export const getReportTypes = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/ReportType`, config);

export const getReportStatuses = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/ReportStatus`, config);

export const getAcademicRequestTypes = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/AcademicRequestType`, config);


