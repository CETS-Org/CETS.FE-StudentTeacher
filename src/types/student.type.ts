import type { Account } from "./account.type";

export interface StudentInfo {
    accountId: string;
    studentCode: string;
    studentNumber: number;
    guardianName: string;
    guardianPhone: string | null;
    school: string | null;
    academicNote: string | null;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
  } 
export interface Student extends Account {
    studentInfo: StudentInfo | null;
}
  export interface CourseEnrollment {
      id: string;
      courseCode: string;
      courseName: string;
      description: string | null;
      courseImageUrl: string | null;
      isActive: boolean;
      teachers: string[]; // Array of teacher names
      enrollmentStatus: string;
      createdAt: string;    
  }

  export interface AssignmentSubmited {
      submitted: number,
      total: number,
      summary: string
  }
  export interface TotalStudentAttendanceByCourse {
      studentId: string;
      totalMeetings: number;
      totalPresent: number;
      totalAbsent: number;
  }


  export interface UpdateStudent {
    accountID: string;
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
    cid: string | null;
    address: string | null;
    dateOfBirth: string | null;
    avatarUrl: string | null;
    guardianName: string  | null;
    guardianPhone: string | null;
    school: string | null;
    academicNote: string | null;  
  }

  export interface AddStudent {
    fullName: string;
    email: string;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    cid: string | null;
    address: string | null;
    avatarUrl: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    school: string | null;
    academicNote: string | null;
  }