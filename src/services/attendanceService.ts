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
  // Remove duplicates based on courseId + className combination
  // This prevents counting the same course multiple times
  const uniqueCourses = new Map<string, AttendanceReportItem>();
  
  apiData.forEach((item) => {
    // Use courseId + className as unique key
    const uniqueKey = `${item.courseId}_${item.className}`;
    
    // Chỉ lấy item đầu tiên nếu có duplicate (giữ nguyên thứ tự từ API)
    if (!uniqueCourses.has(uniqueKey)) {
      uniqueCourses.set(uniqueKey, item);
    }
    // Nếu đã có, bỏ qua (giữ item đầu tiên)
  });
  
  // Convert back to array
  const deduplicatedData = Array.from(uniqueCourses.values());
  
  // Debug: Log để kiểm tra dữ liệu
  deduplicatedData.forEach((item, index) => {
    console.log(`Course ${index + 1}:`, {
      courseId: item.courseId,
      courseName: item.courseName,
      className: item.className,
      totalSessions: item.totalSessions,
      attended: item.attended,
      absent: item.absent,
      sessionRecordsCount: item.sessionRecords?.length || 0
    });
  });
  
  // Transform each class - lấy trực tiếp từ API response, không tính toán
  const classSummaries = deduplicatedData.map(item => ({
    classId: item.courseId,
    className: item.className,
    courseCode: item.className, // Using className as courseCode
    courseName: item.courseName,
    instructor: item.teacherName || 'TBA',
    totalSessions: item.totalSessions, // Lấy trực tiếp từ API response
    attendedSessions: item.attended, // Lấy trực tiếp từ API response
    absentSessions: item.absent, // Lấy trực tiếp từ API response
    attendanceRate: item.attendanceRate, // Lấy trực tiếp từ API response
    records: item.sessionRecords || []
  }));
  
  // Calculate overall stats - tính tổng từ sessionRecords thực tế thay vì tổng totalSessions
  // Vì totalSessions của mỗi course có thể khác với số sessionRecords thực tế
  const allSessionRecords = classSummaries.flatMap(item => item.records || []);
  const totalSessions = allSessionRecords.length; // Tổng số session records thực tế
  const totalAttended = classSummaries.reduce((sum, item) => sum + item.attendedSessions, 0);
  const totalAbsent = classSummaries.reduce((sum, item) => sum + item.absentSessions, 0);
  const overallAttendanceRate = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 0;

  return {
    overallStats: {
      totalClasses: classSummaries.length,
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
      
      // Check if API returns overall stats in response
      // API might return: { overallStats: {...}, courses: [...] } or just array [...]
      let apiData: AttendanceReportItem[];
      let overallStatsFromApi: any = null;
      
      if (Array.isArray(response.data)) {
        // API returns array directly
        apiData = response.data;
        console.log('Using array directly, count:', apiData.length);
      } else if (response.data?.courses && Array.isArray(response.data.courses)) {
        // API returns object with courses array and possibly overallStats
        apiData = response.data.courses;
        overallStatsFromApi = response.data.overallStats || response.data.summary;
        console.log('Using courses array, count:', apiData.length);
      } else {
        // Fallback: try to use response.data as array
        apiData = response.data;
      }
      
      
      // Transform API response to component format
      const transformed = transformAttendanceReport(apiData);
      
      // If API provides overall stats, use them instead of calculating
      if (overallStatsFromApi) {
        transformed.overallStats = {
          totalClasses: overallStatsFromApi.totalClasses ?? transformed.overallStats.totalClasses,
          totalSessions: overallStatsFromApi.totalSessions ?? transformed.overallStats.totalSessions,
          totalAttended: overallStatsFromApi.totalAttended ?? overallStatsFromApi.totalPresent ?? transformed.overallStats.totalAttended,
          totalAbsent: overallStatsFromApi.totalAbsent ?? transformed.overallStats.totalAbsent,
          overallAttendanceRate: overallStatsFromApi.overallAttendanceRate ?? overallStatsFromApi.attendanceRate ?? transformed.overallStats.overallAttendanceRate
        };
      }
      
      return transformed;
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
