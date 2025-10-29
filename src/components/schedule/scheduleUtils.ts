// src/components/schedule/scheduleUtils.ts

/* =========================
   Date Utilities
========================= */
export function startOfWeek(date: Date) {
  const d = new Date(date);
  // Monday-start week (Mon=0..Sun=6)
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function fmtDayHeader(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

export function fmtDaySub(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fmtTime(h: number, m = 0) {
  const t = new Date();
  t.setHours(h, m, 0, 0);
  return t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function toDateAny(s: string): Date {
  // support "yyyy:MM:dd:HH:mm"
  if (/^\d{4}:\d{2}:\d{2}:\d{2}:\d{2}$/.test(s)) {
    const [y, M, d, H, m] = s.split(":").map(Number);
    return new Date(y, M - 1, d, H, m, 0, 0);
  }
  return new Date(s);
}

/* =========================
   Session Types
========================= */
export type BaseSession = {
  id: string;
  title: string;
  classCode: string;
  start: string;        // "YYYY-MM-DDTHH:mm:ss" or "yyyy:MM:dd:HH:mm"
  room?: string;
  durationMin?: number; // default 90 minutes
};

export type StudentSession = BaseSession & {
  instructor?: string;
  attendanceStatus?: "attended" | "absent" | "upcoming";
};

export type StaffSession = BaseSession & {
  instructor?: string;
  type?: "lesson" | "exam" | "break";
  endTime?: string; // Format: "HH:mm"
};

/* =========================
   Session Styles
========================= */
export function getAttendanceStyles(status: string | undefined) {
  const attendanceStatus = status || "upcoming";

  switch (attendanceStatus) {
    case "attended":
      return {
        border: "border-green-300",
        bg: "bg-green-50",
        hover: "hover:bg-green-100 hover:border-green-400",
        text: "text-green-800",
        badge: "bg-green-100 text-green-700",
      };
    case "absent":
      return {
        border: "border-red-300",
        bg: "bg-red-50",
        hover: "hover:bg-red-100 hover:border-red-400",
        text: "text-red-800",
        badge: "bg-red-100 text-red-700",
      };
    default: // upcoming
      return {
        border: "border-accent-300",
        bg: "bg-white",
        hover: "hover:bg-accent-25 hover:border-accent-400",
        text: "text-primary-800",
        badge: "bg-accent-50 text-accent-600",
      };
  }
}

export function getTeachingSessionStyles() {
  return {
    border: "border-accent-300",
    bg: "bg-white",
    hover: "hover:bg-accent-25 hover:border-accent-400",
    text: "text-primary-800",
    badge: "bg-accent-50 text-accent-600",
  };
}

export function getStaffSessionStyles(type?: string) {
  switch (type) {
    case "exam":
      return {
        border: "border-red-300",
        bg: "bg-red-50",
        hover: "hover:bg-red-100 hover:border-red-400",
        text: "text-red-800",
        badge: "bg-red-100 text-red-700",
      };
    case "lesson":
      return {
        border: "border-green-300",
        bg: "bg-green-50",
        hover: "hover:bg-green-100 hover:border-green-400",
        text: "text-green-800",
        badge: "bg-green-100 text-green-700",
      };
    case "break":
      return {
        border: "border-yellow-300",
        bg: "bg-yellow-50",
        hover: "hover:bg-yellow-100 hover:border-yellow-400",
        text: "text-yellow-800",
        badge: "bg-yellow-100 text-yellow-700",
      };
    default:
      return {
        border: "border-accent-300",
        bg: "bg-white",
        hover: "hover:bg-accent-25 hover:border-accent-400",
        text: "text-primary-800",
        badge: "bg-accent-50 text-accent-600",
      };
  }
}

/* =========================
   Session Details Types
========================= */
export type SessionDetailsData = {
  courseName: string;
  className: string;
  classId?: string;
  instructor?: string;
  date: string;
  time: string;
  roomNumber: string;
  format: "Hybrid" | "Online" | "In-person";
  meetingLink?: string;
};


