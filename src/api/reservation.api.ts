import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getReservationItems = (reservationId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.reservationItems}/by-reservation/${reservationId}`, config);

export const getClassReservations = (studentId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classReservations}/student/${studentId}`, config);

export const createCompleteReservation = (
  reservationData: {
    studentID: string;
    coursePackageID?: string | null;
    items: Array<{
      courseID: string;
      invoiceID?: string | null;
      paymentSequence?: number;
      planTypeID?: string;
    }>;
  },
  config?: AxiosRequestConfig
) => api.post(`${endpoint.classReservations}/items`, reservationData, config);


