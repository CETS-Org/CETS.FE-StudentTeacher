import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getClassMeetingsByClassId = (classId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classMeetings}/${classId}`, config);

export const getClassMeetingCoveredTopic = (classMeetingId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classMeetings}/${classMeetingId}/covered-topic`, config);

export const getTeacherSchedule = (teacherId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classMeetings}/Schedule/Teacher/${teacherId}`, config);


