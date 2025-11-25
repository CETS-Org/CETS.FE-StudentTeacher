// Class-related types
// This file contains all class-related interfaces used across the application

// Student-specific class interface for enrolled classes (based on ACAD_Class entity)
export interface MyClass {
  id: string;
  className: string;
  classNum: number;
  description: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  classStatus: string;
  courseFormat: "In-person" | "Online" | "Hybrid";
  courseName?: string;
  courseCode?: string;
  category?: string;
  startDate: string;
  endDate: string;
  status: string;
  capacity?: number;
  enrolledCount?: number;
  isActive: boolean;
  certificate: boolean;
  nextMeeting?: ClassMeetingResponse | null;
}

// Props interfaces for components
export interface MyClassCardProps {
  classItem: MyClass;
  onOpenClass?: (classItem: MyClass) => void;
  onViewDetails?: (classItem: MyClass) => void;
  className?: string;
}

// Class status type for filtering
export type ClassStatus = "all" | "active" | "completed" | "upcoming" | "cancelled";

// Class format types
export type ClassFormat = "Online" | "In-person" | "Hybrid";

// Class level types
export type ClassLevel = "Beginner" | "Intermediate" | "Advanced";

// Student Learning Class API Response Interface
export interface StudentLearningClassResponse {
  id: string;
  statusName: string;

  courseName: string | null;
  className: string | null;
  courseCode?: string | null;

  teacherId: string | null;
  teacherName: string | null;

  startDate: string;
  endDate: string;

  timeSlot: string | null;
  roomCode: string | null;

  isActive: boolean;

  nextMeeting: ClassMeetingResponse | null;
}


export interface ClassMeetingResponse {
  id: string;
  classID: string;
  date: string;           // "yyyy-MM-dd"
  isStudy: boolean;
  roomID: string | null;
  roomCode: string | null;
  onlineMeetingUrl: string | null;
  passcode: string | null;
  recordingUrl: string | null;
  isActive: boolean;
  slot: string | null; 
  coveredTopic: string | null;   // tên ca học nếu bạn có
}

// Teacher Class Detail Interface (simplified view)
export interface ClassDetail {
  id: string;
  className: string;
  courseName: string;
  courseId: string;
  capacity: number;
  enrolledCount: number;
}