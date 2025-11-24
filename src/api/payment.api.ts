import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const createMonthlyPayment = (paymentData: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.payment}/monthlyPay`, paymentData, config);

export const createFullPayment = (paymentData: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.payment}/fullPay`, paymentData, config);

export const getPaymentHistory = (studentId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.payment}/history/${studentId}`, config);


