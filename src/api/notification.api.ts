import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';
import type { UserNotification } from '@/types/notification';

export const getNotificationsByUser = (
  userId: string,
  config?: AxiosRequestConfig
) => api.get<UserNotification[]>(`${endpoint.notification}/user/${userId}`, config);

export const markNotificationAsRead = (
  id: string,
  config?: AxiosRequestConfig
) => api.post<UserNotification>(`${endpoint.notification}/${id}/read`, null, config);

export const markAllNotificationsAsRead = (
  userId: string,
  config?: AxiosRequestConfig
) => api.post<{ updatedCount: number }>(`${endpoint.notification}/user/${userId}/read-all`, null, config);

export const createNotificationsBulk = (
  requests: any,
  config?: AxiosRequestConfig
) => api.post(`${endpoint.notification}/bulk`, requests, config);
