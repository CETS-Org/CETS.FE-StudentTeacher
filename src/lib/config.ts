import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

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
    apiClient.get(`/api/ACAD_Course/${courseId}`, config),
  
  searchCourses: (searchParams?: any, config?: AxiosRequestConfig) => 
    apiClient.get('/api/ACAD_Course/search-basic', { ...config, params: searchParams }),
  
  // Authentication
  loginStudent: (credentials: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/login/student', credentials, config),
  
  loginTeacher: (credentials: any, config?: AxiosRequestConfig) => 
    apiClient.post('/api/IDN_Account/login/teacher', credentials, config),
};

