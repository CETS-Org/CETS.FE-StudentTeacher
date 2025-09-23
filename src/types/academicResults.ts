// Academic Results-related types
// This file contains all academic results-related interfaces used across the application

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
