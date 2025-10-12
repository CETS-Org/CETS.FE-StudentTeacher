// Teacher Schedule and Availability Types

// ===== Day and Time Slot Types =====
export type DayOfWeekEnum = number; // 0=Sunday..6=Saturday per JS; backend uses System.DayOfWeek

export type DaySchedule = {
  [dayValue: string]: string[]; // day -> array of selected time slot IDs (GUIDs)
};

export interface DayOption {
  label: string;
  value: string;
}

// ===== Teacher Availability Types =====
export interface TeacherAvailability {
  id: string;
  teacherID: string;
  teachDay: string; // "Monday", "Tuesday", etc. from backend
  timeSlotID: string;
}

export interface TeacherAvailabilityCreate {
  teacherID: string;
  teachDay: DayOfWeekEnum;
  timeSlotID?: string | null;
}

export interface TeacherAvailabilityUpdate extends TeacherAvailabilityCreate {}

// ===== Schedule Session Types =====
export interface Session {
  id: string;
  title: string;
  classCode: string;
  start: string; // "YYYY-MM-DDTHH:mm:ss" or "yyyy:MM:dd:HH:mm"
  room?: string;
  durationMin?: number; // default 90 minutes (1h30)
  attendanceStatus?: "attended" | "absent" | "upcoming";
}

export interface TeacherScheduleApiResponse {
  date: string;
  dayOfWeek: string;
  slot: string;
  startTime: string;
  endTime: string;
  className: string;
  courseName: string;
  room: string;
  enrolledCount: number;
  capacity: number;
  onlineMeetingUrl: string | null;
}

// ===== Component Props Types =====
export interface ScheduleRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (daySchedules: DaySchedule) => void;
}

export interface TeacherWeekScheduleProps {
  sessions: Session[];
  startHour?: number; // start hour in day (e.g., 14h)
  slots?: number; // number of slots per day
  slotMinutes?: number; // duration per slot (minutes)
}

// ===== Session Details Types =====
export interface SessionDetails {
  courseName: string;
  className: string;
  instructor?: string;
  date: string;
  time: string;
  roomNumber: string;
  format: "Hybrid" | "Online" | "In-person";
  meetingLink?: string;
  attendanceStatus?: "attended" | "absent" | "upcoming";
  onlineMeetingUrl?: string | null;
}

