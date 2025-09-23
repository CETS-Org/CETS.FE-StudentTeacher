// Attendance-related types based on ACAD_Attendance entity
// This file contains all attendance-related interfaces used across the application

// Attendance status types (based on CORE_LookUp entity)
export type AttendanceStatus = "Present" | "Absent";

// Individual attendance record (based on ACAD_Attendance entity)
export interface AttendanceRecord {
  id: string; // ACAD_Attendance.ID
  meetingId: string; // ACAD_Attendance.MeetingID
  studentId: string; // ACAD_Attendance.StudentID
  attendanceStatusId: string; // ACAD_Attendance.AttendanceStatusID
  attendanceStatus: AttendanceStatus; // From CORE_LookUp navigation property
  notes?: string; // ACAD_Attendance.Notes
  checkedBy?: string; // ACAD_Attendance.CheckedBy (Teacher ID)
  checkedByName?: string; // From IDN_Teacher navigation property
  updatedBy?: string; // ACAD_Attendance.UpdatedBy
  createdAt: string; // ACAD_Attendance.CreatedAt
  updatedAt?: string; // ACAD_Attendance.UpdatedAt
  
  // Meeting details (from ACAD_ClassMeeting navigation property)
  meeting: {
    id: string;
    startsAt: string;
    endsAt: string;
    roomName?: string;
    coveredTopic?: string;
    progressNote?: string;
  };
}

// Attendance summary for a single class
export interface ClassAttendanceSummary {
  classId: string;
  className: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  attendanceRate: number; // Percentage
  records: AttendanceRecord[];
}

// Overall attendance report for student
export interface StudentAttendanceReport {
  studentId: string;
  studentName: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  overallStats: {
    totalClasses: number;
    totalSessions: number;
    totalAttended: number;
    totalAbsent: number;
    overallAttendanceRate: number;
  };
  classSummaries: ClassAttendanceSummary[];
}

// Attendance filter options
export interface AttendanceFilters {
  classId?: string;
  status?: AttendanceStatus | "all";
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  period?: "current" | "all" | "custom";
}

// Props for attendance components
export interface AttendanceReportProps {
  studentId?: string;
  filters?: AttendanceFilters;
  onFilterChange?: (filters: AttendanceFilters) => void;
  className?: string;
}

export interface AttendanceCardProps {
  summary: ClassAttendanceSummary;
  onViewDetails?: (classId: string) => void;
  className?: string;
}

export interface AttendanceDetailProps {
  records: AttendanceRecord[];
  className?: string;
}

// Attendance statistics for dashboard
export interface AttendanceStats {
  label: string;
  value: number;
  total?: number;
  percentage?: number;
  color: string;
  icon?: React.ComponentType;
}
