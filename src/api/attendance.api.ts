import { api, endpoint } from './api';

// Types based on API response
export interface StudentInClass {
  studentId: string;
  studentCode: string;
  studentName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  enrollmentId: string;
  enrollmentStatus: string;
  attendanceId?: string;
  attendanceStatus?: 'Present' | 'Absent';
  attendanceNotes?: string;
  hasAttended?: boolean;
}

// Bulk mark attendance types
export interface BulkMarkAttendanceRequest {
  classMeetingId: string;
  teacherId: string;
  absentStudentIds: string[];
  notes?: string;
}

export interface AttendanceRecord {
  attendanceId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  status: 'Present' | 'Absent';
}

export interface BulkMarkAttendanceResponse {
  classMeetingId: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  markedAt: string;
  markedByTeacher: string;
  records: AttendanceRecord[];
}

/**
 * Get students in a class for attendance
 * @param classId - The class ID to get students for
 * @param classMeetingId - Optional class meeting ID to get attendance status
 * @returns Promise with list of students in the class
 */
export const getStudentsInClass = async (
  classId: string,
  classMeetingId?: string
): Promise<StudentInClass[]> => {
  const url = classMeetingId
    ? `${endpoint.attendance}/classes/${classId}/students/${classMeetingId}`
    : `${endpoint.attendance}/classes/${classId}/students`;
  
  const response = await api.get<StudentInClass[]>(url);
  return response.data;
};

/**
 * Bulk mark attendance for a class meeting
 * @param data - Attendance data including classMeetingId, teacherId, and absentStudentIds
 * @returns Promise with bulk mark attendance response
 */
export const bulkMarkAttendance = async (
  data: BulkMarkAttendanceRequest
): Promise<BulkMarkAttendanceResponse> => {
  const response = await api.post<BulkMarkAttendanceResponse>(
    `${endpoint.attendance}/bulk-mark`,
    data
  );
  return response.data;
};


