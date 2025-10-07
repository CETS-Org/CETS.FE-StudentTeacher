import { api } from '@/lib/config';

// API Response Types based on your API
export interface AttendanceReportItem {
  studentId: string;
  courseId: string;
  courseName: string;
  className: string;
  teacherName: string | null;
  totalClasses: number;
  totalSessions: number;
  totalPresent: number; // Keep for backward compatibility
  totalAbsent: number; // Keep for backward compatibility
  attended: number; // Main field for attended sessions
  absent: number; // Main field for absent sessions
  attendanceRate: number;
  isWarning: boolean;
  warningMessage: string | null;
  sessionRecords: any[]; // You can define this more specifically if needed
}

// Transform API response to component format
export const transformAttendanceReport = (apiData: AttendanceReportItem[]) => {
  // Calculate overall stats manually by summing up individual class data
  const totalSessions = apiData.reduce((sum, item) => sum + item.totalSessions, 0);
  const totalAttended = apiData.reduce((sum, item) => sum + item.attended, 0);
  const totalAbsent = apiData.reduce((sum, item) => sum + item.absent, 0);
  const overallAttendanceRate = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 0;

  // Transform each class using the correct fields
  const classSummaries = apiData.map(item => ({
    classId: item.courseId,
    className: item.className,
    courseCode: item.className, // Using className as courseCode
    courseName: item.courseName,
    instructor: item.teacherName || 'TBA',
    totalSessions: item.totalSessions,
    attendedSessions: item.attended, // Using 'attended' field from API
    absentSessions: item.absent, // Using 'absent' field from API
    attendanceRate: item.attendanceRate,
    records: item.sessionRecords || []
  }));

  return {
    overallStats: {
      totalClasses: apiData.length,
      totalSessions,
      totalAttended,
      totalAbsent,
      overallAttendanceRate
    },
    classSummaries
  };
};

// Service functions
export const attendanceService = {
  // Get student attendance report
  getStudentAttendanceReport: async (studentId: string) => {
    try {
      const response = await api.getStudentAttendanceReport(studentId);
      const apiData: AttendanceReportItem[] = response.data;
      
      // Transform API response to component format
      return transformAttendanceReport(apiData);
    } catch (error) {
      console.error('Error fetching student attendance report:', error);
      throw error;
    }
  },

  // Get student attendance report with error handling
  getStudentAttendanceReportSafe: async (studentId: string) => {
    try {
      const data = await attendanceService.getStudentAttendanceReport(studentId);
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attendance report';
      return { data: null, error: errorMessage };
    }
  }
};
