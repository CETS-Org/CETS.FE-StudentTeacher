// Class-related types
// This file contains all class-related interfaces used across the application

// Student-specific class interface for enrolled classes (based on ACAD_Class entity)
export interface MyClass {
  id: string;
  className: string;
  classNum: number;
  description?: string;
  instructor?: string;
  
  // Class status and format
  classStatus: string;
  courseFormat?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  
  // Date information
  startDate: string;
  endDate: string;
  enrolledDate?: string;
  
  // Capacity and enrollment
  capacity: number;
  enrolledCount: number;
  
  // Status flags
  isActive: boolean;
  status: "upcoming" | "active" | "completed" | "cancelled";
  
  // Course information (from related entities)
  courseName?: string;
  courseCode?: string;
  category?: string;
  totalHours?: number;
  sessionsPerWeek?: number;
  
  // Additional properties
  certificate?: boolean;
  price?: number;
  
  // Next meeting information (based on ACAD_ClassMeeting entity)
  nextMeeting?: {
    id: string;
    startsAt: string; // DateTime from ACAD_ClassMeeting.StartsAt
    endsAt: string; // DateTime from ACAD_ClassMeeting.EndsAt
    roomId?: string; // from ACAD_ClassMeeting.RoomID
    roomName?: string; // from FAC_Room navigation property
    onlineMeetingUrl?: string; // from ACAD_ClassMeeting.OnlineMeetingUrl
    passcode?: string; // from ACAD_ClassMeeting.Passcode
    coveredTopic?: string; // from ACAD_SyllabusItem navigation property
    progressNote?: string; // from ACAD_ClassMeeting.ProgressNote
  };
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
  courseName: string;
  className: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  roomCode: string;
  isActive: boolean;
}