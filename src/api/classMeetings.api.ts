import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

// Class Meeting Types
export interface ClassMeeting {
  id: string;
  classID: string;
  date: string;
  isStudy: boolean;
  roomID: string | null;
  onlineMeetingUrl: string | null;
  passcode: string | null;
  recordingUrl: string | null;
  progressNote: string | null;
  isActive: boolean;
  isDeleted: boolean;
  slot : string
}

export const getClassMeetingsByClassId = async (
  classId: string, 
  config?: AxiosRequestConfig
): Promise<ClassMeeting[]> => {
  const response = await api.get<ClassMeeting[]>(`${endpoint.classMeetings}/${classId}`, config);
  return response.data;
};

export const getClassMeetingCoveredTopic = (classMeetingId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classMeetings}/${classMeetingId}/covered-topic`, config);

export const getTeacherSchedule = (teacherId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.classMeetings}/Schedule/Teacher/${teacherId}`, config);


