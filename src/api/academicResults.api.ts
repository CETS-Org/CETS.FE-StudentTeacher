import { api, endpoint } from './api';

// Types for the API response
export interface AcademicResultsApiResponse {
  totalCourses: number;
  passedCourses: number;
  failedCourses: number;
  inProgressCourses: number;
  items: AcademicResultItem[];
}

export interface AcademicResultItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  teacherNames: string[];
  statusCode: string;
  statusName: string;
}

export interface Assignment {
  assignmentId: string;
  title: string;
  description: string;
  dueAt: string;
  submittedAt: string;
  score: number;
  feedback: string;
  submissionStatus: string;
}

export interface CourseDetailResponse {
  courseId: string;
  courseCode: string;
  courseName: string;
  description: string;
  teacherNames: string[];
  statusCode: string;
  statusName: string;
  assignments: Assignment[];
}

/**
 * Get academic results for a student
 * @param studentId - The student ID to get academic results for
 * @returns Promise<AcademicResultsApiResponse>
 */
export const getAcademicResults = async (studentId: string): Promise<AcademicResultsApiResponse> => {
  try {
    const response = await api.get(`https://localhost:8000/api/ACAD_Enrollment/academic-results/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching academic results:', error);
    throw error;
  }
};

/**
 * Get detailed course information including assignments
 * @param studentId - The student ID
 * @param courseId - The course ID to get details for
 * @returns Promise<CourseDetailResponse>
 */
export const getCourseDetails = async (studentId: string, courseId: string): Promise<CourseDetailResponse> => {
  try {
    const response = await api.get(`https://localhost:7096/api/ACAD_Enrollment/${studentId}/coursedetails-results/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};
