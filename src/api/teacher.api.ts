import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';
import type { CredentialTypeResponse, Teacher, TeacherCredentialResponse, UpdateTeacherProfile } from '@/types/teacher.type';

export const getTeachingCourses = (teacherId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.courseTeacherAssignment}/teaching-courses/${teacherId}`, config);

export const getTeachingClasses = (
  teacherId: string,
  courseId: string,
  config?: AxiosRequestConfig
) => api.get(`${endpoint.courseTeacherAssignment}/teaching-classes/${teacherId}/${courseId}`, config);

export const getTeacherById = async (id: string): Promise<Teacher> => {
  try {
    const url = `${endpoint.account}/${id}`;
    console.log("API URL:", url);
    console.log("Base URL:", api.defaults.baseURL);
    console.log("Full URL:", `${api.defaults.baseURL}${url}`);
    
    const response = await api.get<Teacher>(url);
    console.log("API Response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching teacher ${id}:`, error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
    }
    throw error;
  }
};
export const getListCredentialByTeacherId = async (teacherId: string): Promise<TeacherCredentialResponse[]> => {
  try {
    const response = await api.get<TeacherCredentialResponse[]>(`${endpoint.teacherCredential}/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching list credential by teacher id:`, error);
    throw error;
  }
}

export const updateTeacher = async (id: string, teacherData: UpdateTeacherProfile): Promise<Teacher> => {
  try {
    const response = await api.patch<Teacher>(`${endpoint.teacher}/updateprofile/${id}`, teacherData);
    return response.data;
  } catch (error) {
    console.error(`Error updating teacher ${id}:`, error);
    throw error;
  }
};
export const getListCredentialType = async (): Promise<CredentialTypeResponse[]> => {
  try {
    const response = await api.get<CredentialTypeResponse[]>(`${endpoint.teacherCredential}/credential-types`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching list credential type:`, error);
    throw error;
  }
}

