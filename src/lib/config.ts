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
  
  // API endpoints
  endpoints: {
    courses: '/api/ACAD_Course/',
    courseDetail: '/api/ACAD_Course',
    coursesSearch:'/api/ACAD_Course/search-basic',
    loginStudent: '/api/IDN_Account/login/student',
    loginTeacher: '/api/IDN_Account/login/teacher',
  },
  
  // Full API URLs
  getApiUrl: (endpoint: string) => {
    const baseUrl = config.apiUrl;
    return `${baseUrl}${endpoint}`;
  }
};

// Helper function to get the courses API URL
export const getCoursesApiUrl = () => config.getApiUrl(config.endpoints.courses);
export const getCourseSearchApiUrl = () => config.getApiUrl(config.endpoints.coursesSearch);

// Helper function to get a specific course detail API URL
export const getCourseDetailApiUrl = (courseId: string) => `${config.getApiUrl(config.endpoints.courseDetail)}/${courseId}`;

export const getLoginStudentApiUrl = () => config.getApiUrl(config.endpoints.loginStudent);
export const getLoginTeacherApiUrl = () => config.getApiUrl(config.endpoints.loginTeacher);
