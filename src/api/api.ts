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
  enrollment: '/api/ACAD_Enrollment',
  teacherCredential: '/api/IDN_TeacherCredential',
  weeklyFeedback: '/api/weekly-feedback',
  notification: '/api/COM_Notification',
  chat:'/api/COM_Chat',
};

// Request interceptor to add auth token dynamically
// This ensures the token is always read fresh from localStorage on each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Explicitly remove Authorization header if no token exists
      // This prevents sending empty/invalid Bearer tokens
      delete config.headers.Authorization;
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
      // Redirect to login page on session timeout
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


