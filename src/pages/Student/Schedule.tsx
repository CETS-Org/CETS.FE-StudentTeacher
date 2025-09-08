import React from "react";
import StudentLayout from "@/Shared/StudentLayout";
import StudentWeekSchedule from "@/pages/Student/components/StudentWeekSchedule";
import type { StudentSession } from "@/pages/Student/components/StudentWeekSchedule";

/* ===== Helpers: tuần hiện tại + format yyyy:MM:dd:HH:mm ===== */
const mondayOfThisWeek = (() => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
})();

function dateOfThisWeek(offsetDay: number, h: number, m: number) {
  const d = new Date(mondayOfThisWeek);
  d.setDate(d.getDate() + offsetDay);
  d.setHours(h, m, 0, 0);
  return d;
}

function fmtCustom(d: Date) {
  const zp = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}:${zp(d.getMonth() + 1)}:${zp(d.getDate())}:${zp(d.getHours())}:${zp(
    d.getMinutes()
  )}`;
}

/* ===== Student Schedule Data (Tuần hiện tại) ===== */
const studentSessions: StudentSession[] = [
  // Thứ 2 (Mon=0)
  { 
    id: "1", 
    title: "Basic English Grammar", 
    classCode: "BE101", 
    room: "A-201", 
    instructor: "Ms. Johnson",
    start: fmtCustom(dateOfThisWeek(0, 8, 0)) 
  },
  { 
    id: "2", 
    title: "English Conversation",  
    classCode: "EC102", 
    room: "A-201", 
    instructor: "Mr. Smith",
    start: fmtCustom(dateOfThisWeek(0, 14, 0)) 
  },

  // Thứ 3
  { 
    id: "3", 
    title: "Reading Comprehension", 
    classCode: "RC201", 
    room: "B-102", 
    instructor: "Dr. Wilson",
    start: fmtCustom(dateOfThisWeek(1, 9, 30)) 
  },
  { 
    id: "4", 
    title: "Writing Skills", 
    classCode: "WS201", 
    room: "B-102", 
    instructor: "Prof. Davis",
    start: fmtCustom(dateOfThisWeek(1, 15, 30)) 
  },

  // Thứ 4
  { 
    id: "5", 
    title: "Listening Practice", 
    classCode: "LP301", 
    room: "C-301", 
    instructor: "Ms. Brown",
    start: fmtCustom(dateOfThisWeek(2, 10, 0)) 
  },

  // Thứ 5
  { 
    id: "6", 
    title: "Vocabulary Building", 
    classCode: "VB401", 
    room: "A-105", 
    instructor: "Mr. Miller",
    start: fmtCustom(dateOfThisWeek(3, 13, 0)) 
  },

  // Thứ 6
  { 
    id: "7", 
    title: "Pronunciation Class", 
    classCode: "PC501", 
    room: "D-202", 
    instructor: "Dr. Taylor",
    start: fmtCustom(dateOfThisWeek(4, 11, 0)) 
  },

  // Thứ 7
  { 
    id: "8", 
    title: "Study Group Session", 
    classCode: "SG601", 
    room: "Library", 
    instructor: "Peer Tutor",
    start: fmtCustom(dateOfThisWeek(5, 14, 0)) 
  },
];

export default function Schedule() {
  return (
    <StudentLayout>
      <div className="px-4 md:px-6">
        {/* 10 slot, mỗi slot 90', học từ 8:00 → 23:00 */}
        <StudentWeekSchedule sessions={studentSessions} startHour={8} slots={10} slotMinutes={90} />
      </div>
    </StudentLayout>
  );
}