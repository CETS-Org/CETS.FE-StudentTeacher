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
  description: string | null;
  dueAt: string;
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
  submissionStatus: string;
}

export interface AssignmentByMeeting {
  meetingId: string;
  meetingDate: string;
  topic: string;
  assignments: Assignment[];
}

export interface WeeklyPerformance {
  weekNumber: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  totalScore: number;
  averageScore: number;
  performanceLevel: string;
}

export interface CompletionStats {
  totalAssignments: number;
  completedOnTime: number;
  completedLate: number;
  pendingGrading: number;
  notSubmitted: number;
  completionRate: number;
}

export interface CourseDetailResponse {
  courseId: string;
  courseCode: string;
  courseName: string;
  description: string | null;
  teacherNames: string[];
  statusCode: string;
  statusName: string;
  assignments: AssignmentByMeeting[]; // Changed from Assignment[] to AssignmentByMeeting[]
  weeklyPerformance: WeeklyPerformance[];
  classMeetings: any[]; // Can be typed more specifically if needed
  completionStats: CompletionStats;
}

// Learning Path Overview Response
export interface LearningPathOverviewResponse {
  studentId: string;
  studentName: string;
  overallStats: {
    totalCourses: number;
    passedCourses: number;
    failedCourses: number;
    inProgressCourses: number;
    overallAttendanceRate: number;
    totalSessions: number;
    totalAttended: number;
    totalAbsent: number;
  };
  courses: LearningPathCourseItem[];
}

export interface LearningPathCourseItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  teacherNames: string[];
  statusCode: "InProgress" | "Passed" | "Failed" | string;
  statusName: string;
  courseProgress: string; // Format: "x/y" (attendedSessions/totalSessions)
  instructor: string;
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
 * Get learning path overview for a student
 * @param studentId - The student ID to get learning path overview for
 * @returns Promise<LearningPathOverviewResponse>
 */
export const getLearningPathOverview = async (studentId: string): Promise<LearningPathOverviewResponse> => {
  try {
    const response = await api.get(`/api/ACAD_Enrollment/students/${studentId}/learning-path/overview`);
    return response.data;
  } catch (error) {
    console.error('Error fetching learning path overview:', error);
    throw error;
  }
};

// Course Attendance Summary Response
export interface CourseAttendanceSummaryResponse {
  studentId: string;
  courseId: string;
  courseName: string;
  className: string;
  teacherName: string;
  totalClasses: number;
  totalSessions: number;
  totalPresent: number;
  totalAbsent: number;
  attended: number;
  absent: number;
  attendanceRate: number;
  isWarning: boolean;
  warningMessage: string | null;
  sessionRecords: Array<{
    meetingId: string;
    meetingDate: string;
    status: "Present" | "Absent";
    notes: string | null;
    topicTitle: string;
    roomCode: string;
    startTime: string;
    endTime: string;
    checkedBy: string;
  }>;
}

/**
 * Get course attendance summary for a student
 * @param courseId - The course ID
 * @param studentId - The student ID
 * @returns Promise<CourseAttendanceSummaryResponse>
 */
export const getCourseAttendanceSummary = async (
  courseId: string,
  studentId: string
): Promise<CourseAttendanceSummaryResponse> => {
  // Route: [HttpGet("courses/{courseId}/students/{studentId}/summary")]
  // Based on similar endpoint pattern in getTotalAttendceByStudentId which uses ACAD_Attendance
  // Try ACAD_Attendance first, then ACAD_Course
  const endpoints = [
    `${endpoint.attendance}/courses/${courseId}/students/${studentId}/summary`, // ACAD_Attendance controller (similar pattern)
    `${endpoint.course}/courses/${courseId}/students/${studentId}/summary`, // ACAD_Course controller
  ];
  
  let lastError: any = null;
  
  for (const url of endpoints) {
    try {
      console.log('Trying endpoint:', url, { courseId, studentId });
      const response = await api.get(url);
      console.log('✅ Success with endpoint:', url);
      return response.data;
    } catch (error: any) {
      console.log(`❌ Endpoint failed (${error?.response?.status}):`, url);
      lastError = error;
      
      // If not 404, don't try other endpoints
      if (error?.response?.status !== 404) {
        break;
      }
    }
  }
  
  // All endpoints failed
  console.error('❌ All endpoints failed for course attendance summary:', {
    courseId,
    studentId,
    attemptedEndpoints: endpoints,
    lastError: {
      status: lastError?.response?.status,
      statusText: lastError?.response?.statusText,
      data: lastError?.response?.data,
      message: lastError?.message
    }
  });
  
  throw lastError || new Error('Failed to fetch course attendance summary');
};

/**
 * Get detailed course information including assignments
 * Endpoint: GET /api/ACAD_Enrollment/{studentId}/coursedetails-results/{courseId}/
 * @param studentId - The student ID
 * @param courseId - The course ID to get details for
 * @returns Promise<CourseDetailResponse>
 */
export const getCourseDetails = async (studentId: string, courseId: string): Promise<CourseDetailResponse> => {
  try {
    const response = await api.get(`${endpoint.enrollment}/${studentId}/coursedetails-results/${courseId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};
