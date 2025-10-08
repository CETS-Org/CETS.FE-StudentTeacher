import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getPlanTypes = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/PlanType`, config);

export const getTimeSlots = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/TimeSlot`, config);


