// src/pages/Teacher/SchedulePage.tsx
import React from "react";
import TeacherLayout from "@/Shared/TeacherLayout";
import TeacherWeekSchedule from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";
import type { Session } from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";

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

/* ===== Dataset trong TUẦN HIỆN TẠI (format yyyy:MM:dd:HH:mm) ===== */
const sessions: Session[] = [
  // Thứ 2 (Mon=0)
  { id: "1", title: "Intermediate English", classCode: "A11", room: "B-203", start: fmtCustom(dateOfThisWeek(0, 14, 0)) },
  { id: "2", title: "Elementary English",  classCode: "E1", room: "B-203", start: fmtCustom(dateOfThisWeek(0, 16, 0)) },
  { id: "3", title: "TOEFL Prep",          classCode: "T1", room: "B-203", start: fmtCustom(dateOfThisWeek(0, 20, 0)) },

  // Thứ 3
  { id: "4", title: "Business English",     classCode: "B2", room: "B-203", start: fmtCustom(dateOfThisWeek(1, 15, 30)) },
  { id: "5", title: "Elementary English",   classCode: "E1", room: "B-203", start: fmtCustom(dateOfThisWeek(1, 17, 0)) },

  // Thứ 4
  { id: "6", title: "Business English",     classCode: "B2", room: "B-203", start: fmtCustom(dateOfThisWeek(2, 14, 0)) },

  // Thứ 5
  { id: "7", title: "Advanced English",     classCode: "A3", room: "B-203", start: fmtCustom(dateOfThisWeek(3, 16, 0)) },

  // Thứ 6
  { id: "8", title: "IELTS Prep",           classCode: "C1", room: "B-203", start: fmtCustom(dateOfThisWeek(4, 14, 0)) },

  // Thứ 7
  { id: "9", title: "Conversation Class",   classCode: "S1", room: "B-203", start: fmtCustom(dateOfThisWeek(5, 16, 0)) },
];

export default function SchedulePage() {
  return (
    <TeacherLayout crumbs={[{ label: "Schedule" }]}>
      <div className="px-4 md:px-6">
        {/* 6 slot, mỗi slot 90', học từ 14:00 → 22:30 */}
        <TeacherWeekSchedule sessions={sessions} startHour={14} slots={6} slotMinutes={90} />
      </div>
    </TeacherLayout>
  );
}
