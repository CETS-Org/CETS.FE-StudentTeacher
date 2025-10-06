import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { api, endpoint } from './api';
import { getAuthToken, isTokenValid, clearAuthData } from '@/lib/utils';

export const loginStudent = (credentials: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/login/student`, credentials, config);

export const loginTeacher = (credentials: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/login/teacher`, credentials, config);

export const googleLogin = (googleData: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/googleLogin`, googleData, config);

export const register = (userData: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/register`, userData, config);

export const forgotPassword = (email: string, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.account}/forgot-password`, email, config);

export const verifyOtp = (
  otpData: { email: string; otp: string; token: string },
  config?: AxiosRequestConfig
) => api.post(`${endpoint.account}/verify-otp`, otpData, config);

export const resetPassword = (
  resetData: { email: string; newPassword: string; token: string },
  config?: AxiosRequestConfig
) => api.post(`${endpoint.account}/reset-password`, resetData, config);

export const changePassword = async (
  changePasswordData: { email: string; oldPassword: string; newPassword: string },
  config?: AxiosRequestConfig
) : Promise<AxiosResponse<any>> => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found. Please login again.');
  if (!isTokenValid()) {
    clearAuthData();
    throw new Error('Session expired. Please login again.');
  }

  try {
    const response = await api.post(`${endpoint.account}/change-password`, changePasswordData, {
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
    return response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      clearAuthData();
      throw new Error('Session expired. Please login again.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. Insufficient permissions.');
    }
    throw error;
  }
};


