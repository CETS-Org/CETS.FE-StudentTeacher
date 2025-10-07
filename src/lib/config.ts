import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuthToken, isTokenValid, clearAuthData } from '@/lib/utils';

/**
 * Environment configuration
 * 
 * To use custom API URL, create a .env file in the project root with:
 * VITE_API_URL=https://your-api-url.com
 * VITE_PORT=3000
 */
export const config = {
  // API base URL from environment variable with fallback
  apiUrl: import.meta.env.VITE_API_URL || 'https://localhost:8000',
};

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens or other headers
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// API helper functions using axios
export const api = {
  // Courses
  getCourses: (requestConfig?: AxiosRequestConfig) => 
    apiClient.get('/api/ACAD_Course', requestConfig),
  
  getCourseDetail: (courseId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/ACAD_Course/detail/${courseId}`, config),
  
  searchCourses: (searchParams?: any, config?: AxiosRequestConfig) => 
    apiClient.get('/api/ACAD_Course/search-basic', { ...config, params: searchParams }),
  
  // Authentication
  loginStudent: (credentials: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/login/student', credentials, config),
  
  loginTeacher: (credentials: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/login/teacher', credentials, config),
  
  // Google OAuth
  googleLogin: (googleData: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/googleLogin', googleData, config),
  
  // Registration
  register: (userData: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/register', userData, config),
  
  // Forgot Password Flow
  forgotPassword: (email: string, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/forgot-password', email, config),
  
  verifyOtp: (otpData: { email: string; otp: string; token: string }, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/verify-otp', otpData, config),
  
  resetPassword: (resetData: { email: string; newPassword: string; token: string }, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/reset-password', resetData, config),
  
  // Change Password (requires JWT authorization)
  changePassword: async (changePasswordData: { email: string; oldPassword: string; newPassword: string }, config?: AxiosRequestConfig) => {
    try {
      // Verify JWT token exists and is valid before making the request
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      if (!isTokenValid()) {
        clearAuthData();
        throw new Error('Session expired. Please login again.');
      }

      console.log('Making change password request with JWT authorization...');
      
      // The apiClient automatically adds JWT token via interceptor
      const response = await apiClient.post('/api/IDN_Account/change-password', changePasswordData, {
        ...config,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...config?.headers
        }
      });
      
      console.log('Change password response:', response.data);
      return response;
    } catch (error: any) {
      console.error('Change password API error:', error);
      
      // Handle specific JWT authorization errors
      if (error.response?.status === 401) {
        // Token expired or invalid
        clearAuthData();
        throw new Error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Insufficient permissions.');
      }
      
      throw error;
    }
  },

  // Teacher Courses
  getTeachingCourses: (teacherId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/ACAD_CourseTeacherAssignment/teaching-courses/${teacherId}`, config),
  
  // Teacher Classes
  getTeachingClasses: (teacherId: string, courseId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/ACAD_CourseTeacherAssignment/teaching-classes/${teacherId}/${courseId}`, config),

  // Learning Materials
  createLearningMaterial: (materialData: { classID?: string; title: string; contentType: string; fileName: string }, config?: AxiosRequestConfig) =>
    apiClient.post('/api/ACAD_LearningMaterial', materialData, config),

  getLearningMaterialsByClass: (classId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_LearningMaterial/class/${classId}`, config),

  deleteLearningMaterial: (materialId: string, config?: AxiosRequestConfig) =>
    apiClient.delete(`/api/ACAD_LearningMaterial/${materialId}`, config),

  // Course Schedules
  getCourseSchedules: (courseId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_CourseSchedule/course/${courseId}`, config),

  getAllCourseSchedules: (config?: AxiosRequestConfig) =>
    apiClient.get('/api/ACAD_CourseSchedule', config),

  // Course Packages
  getCoursePackages: (config?: AxiosRequestConfig) => 
    apiClient.get('/api/ACAD_CoursePackage', config),
  
  getActiveCoursePackages: (config?: AxiosRequestConfig) => 
    apiClient.get('/api/ACAD_CoursePackage/active', config),
  
  searchCoursePackages: (searchParams?: any, config?: AxiosRequestConfig) => {
    // Custom parameter serialization for arrays to match ASP.NET Core model binding
    const params = new URLSearchParams();
    
    Object.entries(searchParams || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For arrays, add each item as a separate parameter with the same key
        value.forEach(item => params.append(key, item.toString()));
      } else if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    return apiClient.get(`/api/ACAD_CoursePackage/search-basic?${params.toString()}`, config);
  },
  
  getCoursePackageDetail: (packageId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/ACAD_CoursePackage/${packageId}/detail`, config),
  
  getCoursePackageById: (packageId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/ACAD_CoursePackage/${packageId}`, config),

  // File upload to presigned URL (direct to Cloudflare R2)
  uploadToPresignedUrl: (url: string, file: File, contentType: string) =>
    fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    }),

  // Payment
  createMonthlyPayment: (paymentData: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/FIN_Payment/monthlyPay', paymentData, config),
  
  createFullPayment: (paymentData: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/FIN_Payment/fullPay', paymentData, config),

  // Reservation Items
  getReservationItems: (reservationId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/reservation-items/by-reservation/${reservationId}`, config),

  // Class Reservations
  getClassReservations: (studentId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/class-reservations/student/${studentId}`, config),
  // Student Learning Classes
  getStudentLearningClasses: (studentId: string, config?: AxiosRequestConfig) => 
    apiClient.get(`/api/ACAD_Classes/learningClass?studentId=${studentId}`, config),

  // Class Reservations (Complete - with items in single transaction)
  createCompleteReservation: (reservationData: {
    studentID: string;
    coursePackageID?: string | null;
    items: Array<{
      courseID: string;
      invoiceID?: string | null;
      paymentSequence?: number;
      planTypeID?: string;
    }>;
  }, config?: AxiosRequestConfig) => 
    apiClient.post('/api/class-reservations/items', reservationData, config),

  // Plan Types
  getPlanTypes: (config?: AxiosRequestConfig) => 
    apiClient.get('/api/CORE_LookUp/type/code/PlanType', config),

  // Class Meetings
  getClassMeetingsByClassId: (classId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_ClassMeetings/${classId}`, config),

  // Class Meeting Covered Topic
  getClassMeetingCoveredTopic: (classMeetingId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_ClassMeetings/${classMeetingId}/covered-topic`, config),

  // Class Meeting Assignments by student
  getAssignmentsByMeetingAndStudent: (classMeetingId: string, studentId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_Assignments/class-meeting/${classMeetingId}/student/${studentId}/assignments`, config),

  // Student Attendance Report
  getStudentAttendanceReport: (studentId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_Attendance/students/${studentId}/attendance-report`, config),

  // Student Schedule
  getStudentSchedule: (studentId: string, config?: AxiosRequestConfig) =>
    apiClient.get(`/api/ACAD_ClassMeetings/Schedule/${studentId}`, config),
};

