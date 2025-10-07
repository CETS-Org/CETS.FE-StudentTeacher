import { api } from '@/lib/config';

// API Response Types based on your API
export interface ScheduleItem {
  date: string;
  dayOfWeek: string;
  slot: string;
  startTime: string;
  endTime: string;
  className: string;
  courseName: string;
  room: string;
  teacher: string;
  onlineMeetingUrl: string | null;
}

// StudentSession interface (from component)
export interface StudentSession {
  id: string;
  title: string;
  classCode: string;
  room: string;
  instructor: string;
  start: string; // Format: yyyy:MM:dd:HH:mm
  attendanceStatus: "attended" | "absent" | "upcoming";
}

// Transform API response to component format
export const transformScheduleData = (apiData: ScheduleItem[]): StudentSession[] => {
  return apiData.map((item, index) => {
    // Parse date and time
    const sessionDate = new Date(item.date);
    const [startHour, startMinute] = item.startTime.split(':').map(Number);
    const [endHour, endMinute] = item.endTime.split(':').map(Number);
    
    // Set the session time
    sessionDate.setHours(startHour, startMinute, 0, 0);
    
    // Format date as yyyy:MM:dd:HH:mm
    const formatDate = (date: Date) => {
      const zp = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}:${zp(date.getMonth() + 1)}:${zp(date.getDate())}:${zp(date.getHours())}:${zp(date.getMinutes())}`;
    };
    
    // Determine attendance status based on current time
    const now = new Date();
    const sessionTime = new Date(sessionDate);
    const timeDiff = sessionTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    let attendanceStatus: "attended" | "absent" | "upcoming";
    if (hoursDiff < -2) {
      // Session was more than 2 hours ago - assume attended for now
      attendanceStatus = "attended";
    } else if (hoursDiff < 0) {
      // Session was recent - could be attended or absent
      attendanceStatus = "attended";
    } else {
      // Future session
      attendanceStatus = "upcoming";
    }
    
    return {
      id: `session-${index}`,
      title: item.courseName,
      classCode: item.className,
      room: item.room,
      instructor: item.teacher,
      start: formatDate(sessionDate),
      attendanceStatus
    };
  });
};

// Service functions
export const scheduleService = {
  // Get student schedule
  getStudentSchedule: async (studentId: string): Promise<StudentSession[]> => {
    try {
      const response = await api.getStudentSchedule(studentId);
      const apiData: ScheduleItem[] = response.data;
      
      // Transform API response to component format
      return transformScheduleData(apiData);
    } catch (error) {
      console.error('Error fetching student schedule:', error);
      throw error;
    }
  },

  // Get student schedule with error handling
  getStudentScheduleSafe: async (studentId: string) => {
    try {
      const data = await scheduleService.getStudentSchedule(studentId);
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch student schedule';
      return { data: null, error: errorMessage };
    }
  }
};
