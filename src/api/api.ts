import axios from 'axios';
import { clearAuthData } from '@/lib/utils';

// Shared axios instance for Student/Teacher app
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const endpoint = {
  account: '/api/IDN_Account',
  student: '/api/IDN_Student',
  teacher: '/api/IDN_Teacher',
  course: '/api/ACAD_Course',
  coursePackage: '/api/ACAD_CoursePackage',
  courseSchedule: '/api/ACAD_CourseSchedule',
  courseTeacherAssignment: '/api/ACAD_CourseTeacherAssignment',
  learningMaterial: '/api/ACAD_LearningMaterial',
  payment: '/api/FIN_Payment',
  reservationItems: '/api/reservation-items',
  classReservations: '/api/class-reservations',
  classes: '/api/ACAD_Classes',
  coreLookup: '/api/CORE_LookUp',
  classMeetings: '/api/ACAD_ClassMeetings',
  assignments: '/api/ACAD_Assignments',
  teacherAvailability: '/api/HR_TeacherAvailability',
  attendance: '/api/ACAD_Attendance',
  wishlist: '/api/ACAD_CourseWishlist',
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      // Optionally redirect to login page here if desired
    }
    return Promise.reject(error);
  }
);


