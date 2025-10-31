// Academic Results-related types
// This file contains all academic results-related interfaces used across the application

// API Response types
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

// Grade types
export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "F";

// Academic status types
export type AcademicStatus = "Pass" | "Fail" | "Incomplete" | "Withdrawn";

// Individual academic result record
export interface AcademicResult {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  className: string;
  instructor: string;
  semester: string;
  academicYear: string;
  credits: number;
  
  // Assessment components
  assessments: {
    id: string;
    name: string;
    type: "Assignment" | "Quiz" | "Midterm" | "Final" | "Project" | "Participation";
    weight: number; // Percentage
    score: number;
    maxScore: number;
    grade: Grade;
    submittedAt: string;
    gradedAt: string;
  }[];
  
  // Final results
  finalScore: number;
  finalGrade: Grade;
  gpa: number;
  status: AcademicStatus;
  remarks?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

// Academic result summary for a single course
export interface CourseResultSummary {
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  className: string;
  instructor: string;
  semester: string;
  academicYear: string;
  credits: number;
  finalScore: number;
  finalGrade: Grade;
  gpa: number;
  status: AcademicStatus;
  remarks?: string;
  result: AcademicResult;
}

// Overall academic report for student
export interface StudentAcademicReport {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  reportPeriod: {
    academicYear: string;
    semester: string;
  };
  overallStats: {
    totalCourses: number;
    totalCredits: number;
    completedCredits: number;
    currentGPA: number;
    cumulativeGPA: number;
    passedCourses: number;
    failedCourses: number;
    honorsEligible: boolean;
  };
  courseSummaries: CourseResultSummary[];
}

// Academic result filter options
export interface AcademicResultFilters {
  courseId?: string;
  semester?: string;
  academicYear?: string;
  status?: AcademicStatus | "all";
  grade?: Grade | "all";
  period?: "current" | "all" | "custom";
}

// Props for academic result components
export interface AcademicResultReportProps {
  studentId?: string;
  filters?: AcademicResultFilters;
  onFilterChange?: (filters: AcademicResultFilters) => void;
  className?: string;
}

export interface AcademicResultCardProps {
  summary: CourseResultSummary;
  onViewDetails?: (courseId: string) => void;
  className?: string;
}

export interface AcademicResultDetailProps {
  result: AcademicResult;
  className?: string;
}

// Academic statistics for dashboard
export interface AcademicStats {
  label: string;
  value: number | string;
  total?: number;
  percentage?: number;
  color: string;
  icon?: React.ComponentType;
}

// Grade point mapping
export const GRADE_POINTS: Record<Grade, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0
};

// Grade color mapping
export const GRADE_COLORS: Record<Grade, string> = {
  "A+": "text-success-600",
  "A": "text-success-600",
  "A-": "text-success-500",
  "B+": "text-primary-600",
  "B": "text-primary-600",
  "B-": "text-primary-500",
  "C+": "text-warning-600",
  "C": "text-warning-600",
  "C-": "text-warning-500",
  "D+": "text-error-500",
  "D": "text-error-600",
  "F": "text-error-700"
};

// Grade background color mapping
export const GRADE_BG_COLORS: Record<Grade, string> = {
  "A+": "bg-gradient-to-r from-success-50 to-success-100 border-success-200",
  "A": "bg-gradient-to-r from-success-50 to-success-100 border-success-200",
  "A-": "bg-gradient-to-r from-success-50 to-success-100 border-success-200",
  "B+": "bg-gradient-to-r from-secondary-100 to-secondary-200 border-primary-200",
  "B": "bg-gradient-to-r from-secondary-100 to-secondary-200 border-primary-200",
  "B-": "bg-gradient-to-r from-secondary-100 to-secondary-200 border-primary-200",
  "C+": "bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200",
  "C": "bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200",
  "C-": "bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200",
  "D+": "bg-gradient-to-r from-error-50 to-error-100 border-error-200",
  "D": "bg-gradient-to-r from-error-50 to-error-100 border-error-200",
  "F": "bg-gradient-to-r from-error-50 to-error-100 border-error-200"
};

// Utility function to map API response to existing data structure
export const mapApiResponseToStudentReport = (
  apiResponse: AcademicResultsApiResponse,
  studentId: string,
  studentName: string = "Student"
): StudentAcademicReport => {
  // Map status codes to academic status
  const mapStatusCodeToStatus = (statusCode: string): AcademicStatus => {
    switch (statusCode.toLowerCase()) {
      case 'passed':
      case 'completed':
        return 'Pass';
      case 'failed':
        return 'Fail';
      case 'incomplete':
        return 'Incomplete';
      case 'withdrawn':
        return 'Withdrawn';
      case 'enrolled':
      default:
        return 'Pass'; // Default to Pass for enrolled courses
    }
  };

  // Generate mock data for courses since API doesn't provide detailed assessment data
  const courseSummaries: CourseResultSummary[] = apiResponse.items.map((item, index) => {
    // Generate mock scores and grades based on status
    const finalScore = item.statusCode.toLowerCase() === 'enrolled' ? 0 : 
                      item.statusCode.toLowerCase() === 'passed' ? Math.floor(Math.random() * 20) + 80 : 
                      Math.floor(Math.random() * 40) + 40;
    
    const finalGrade: Grade = finalScore >= 97 ? 'A+' :
                             finalScore >= 93 ? 'A' :
                             finalScore >= 90 ? 'A-' :
                             finalScore >= 87 ? 'B+' :
                             finalScore >= 83 ? 'B' :
                             finalScore >= 80 ? 'B-' :
                             finalScore >= 77 ? 'C+' :
                             finalScore >= 73 ? 'C' :
                             finalScore >= 70 ? 'C-' :
                             finalScore >= 67 ? 'D+' :
                             finalScore >= 60 ? 'D' : 'F';

    const gpa = GRADE_POINTS[finalGrade];

    return {
      studentId, 
      courseId: item.courseId,
      courseCode: item.courseCode,
      courseName: item.courseName,
      className: `${item.courseName} - Class ${item.courseCode}`,
      instructor: item.teacherNames.join(', '),
      semester: "Current",
      academicYear: "2024",
      credits: 3, // Default credits
      finalScore,
      finalGrade,
      gpa,
      status: mapStatusCodeToStatus(item.statusCode),
      remarks: item.statusCode.toLowerCase() === 'enrolled' ? 'Course in progress' : 
               item.statusCode.toLowerCase() === 'passed' ? 'Course completed successfully' : 
               'Course requires attention',
      result: {
        id: `result-${item.courseId}`,
        studentId,
        courseId: item.courseId,
        courseCode: item.courseCode,
        courseName: item.courseName,
        className: `${item.courseName} - Class ${item.courseCode}`,
        instructor: item.teacherNames.join(', '),
        semester: "Current",
        academicYear: "2024",
        credits: 3,
        assessments: [], // Empty for now since API doesn't provide detailed assessments
        finalScore,
        finalGrade,
        gpa,
        status: mapStatusCodeToStatus(item.statusCode),
        remarks: item.statusCode.toLowerCase() === 'enrolled' ? 'Course in progress' : 
                 item.statusCode.toLowerCase() === 'passed' ? 'Course completed successfully' : 
                 'Course requires attention',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  });

  // Calculate overall stats
  const totalCredits = courseSummaries.reduce((sum, course) => sum + course.credits, 0);
  const completedCredits = courseSummaries
    .filter(course => course.status === 'Pass')
    .reduce((sum, course) => sum + course.credits, 0);
  
  const totalGPA = courseSummaries.reduce((sum, course) => sum + course.gpa, 0);
  const currentGPA = courseSummaries.length > 0 ? totalGPA / courseSummaries.length : 0;

  return {
    studentId,
    studentName,
    studentIdNumber: `STU${studentId.slice(-6)}`,
    reportPeriod: {
      academicYear: "2024",
      semester: "Current"
    },
    overallStats: {
      totalCourses: apiResponse.totalCourses,
      totalCredits,
      completedCredits,
      currentGPA,
      cumulativeGPA: currentGPA,
      passedCourses: apiResponse.passedCourses,
      failedCourses: apiResponse.failedCourses,
      honorsEligible: currentGPA >= 3.5
    },
    courseSummaries
  };
};
