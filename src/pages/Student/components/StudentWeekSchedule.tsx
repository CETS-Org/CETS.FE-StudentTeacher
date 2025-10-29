// src/pages/Student/components/StudentWeekSchedule.tsx
import React, { useMemo, useState } from "react";
import { ScheduleHeader, ScheduleGrid, SessionDetailsDialog, DatePickerDialog, startOfWeek, addDays, isSameDay, toDateAny } from "@/components/schedule";

/* =========================
   Types
========================= */
export type StudentSession = {
  id: string;
  title: string;
  classCode: string;
  classId?: string;
  start: string;
  room?: string;
  instructor?: string;
  durationMin?: number;
  attendanceStatus?: "attended" | "absent" | "upcoming";
};

type Props = {
  sessions: StudentSession[];
  startHour?: number;    // giờ bắt đầu trong ngày (VD: 8h)
  slots?: number;        // số slot / ngày
  slotMinutes?: number;  // thời lượng / slot (phút)
};

/* =========================
   Helpers
========================= */
// helpers pulled from shared schedule utils via imports above

/* =========================
   Component
========================= */
export default function StudentWeekSchedule({
  sessions,
  startHour = 8,
  slots = 10,
  slotMinutes = 90,
}: Props) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  // Ngày được chọn từ Calendar (để highlight cột & slot)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Popup chi tiết
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<{
    courseName: string;
    className: string;
    classId?: string;
    instructor: string;
    date: string;
    time: string;
    roomNumber: string;
    format: "Hybrid" | "Online" | "In-person";
    meetingLink?: string;
  } | null>(null);

  // Dialog chứa Calendar
  const [pickerOpen, setPickerOpen] = useState(false);

  // Hôm nay & index ngày hôm nay trong tuần hiện tại
  const today = new Date();
  const todayIdx = (() => {
    const s = startOfWeek(weekStart);
    for (let i = 0; i < 7; i++) if (isSameDay(addDays(s, i), today)) return i;
    return -1;
  })();

  // Index ngày đang chọn trong tuần hiện tại (nếu có)
  const selectedIdx = (() => {
    if (!selectedDate) return -1;
    const s = startOfWeek(weekStart);
    for (let i = 0; i < 7; i++) if (isSameDay(addDays(s, i), selectedDate)) return i;
    return -1;
  })();

  // Lọc sessions trong tuần
  const weekSessions = useMemo(() => {
    const s = startOfWeek(weekStart);
    const e = addDays(s, 7);
    return sessions.filter((ev) => {
      const t = toDateAny(ev.start);
      return !Number.isNaN(+t) && t >= s && t < e;
    });
  }, [sessions, weekStart]);

  const labelWeek = `${weekStart.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  })}–${weekEnd.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  function openDetails(s: StudentSession, startLabel: string, endLabel: string) {
    const dt = toDateAny(s.start);
    const dateStr = dt.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setDetailsData({
      courseName: s.title,
      className: `Class ${s.classCode}`,
      classId: s.classId,
      instructor: s.instructor || "TBA",
      date: dateStr,
      time: `${startLabel} – ${endLabel}`,
      roomNumber: s.room ?? "—",
      format: "In-person",
      meetingLink: "https://meet.google.com/student-class",
    });
    setDetailsOpen(true);
  }

  return (
    <div className="bg-white rounded-xl border-0 shadow-none">
      <ScheduleHeader
        weekStart={weekStart}
        weekEnd={weekEnd}
        onPreviousWeek={() => setWeekStart((d) => addDays(d, -7))}
        onNextWeek={() => setWeekStart((d) => addDays(d, 7))}
        onOpenDatePicker={() => setPickerOpen(true)}
      />

      <ScheduleGrid
        weekStart={weekStart}
        sessions={weekSessions}
        startHour={startHour}
        slots={slots}
        slotMinutes={slotMinutes}
        timeSlots={[
          { start: "09:00", end: "10:30" },
          { start: "13:30", end: "15:00" },
          { start: "15:30", end: "17:00" },
          { start: "18:00", end: "19:30" },
          { start: "20:00", end: "21:30" },
        ]}
        todayIdx={todayIdx}
        selectedIdx={selectedIdx}
        onSessionClick={openDetails}
        isStudent
      />

      <SessionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        sessionData={detailsData}
        isStudent
      />

      <DatePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedDate={selectedDate}
        onDateSelect={(d) => {
          setSelectedDate(d);
          setWeekStart(startOfWeek(d));
          setPickerOpen(false);
        }}
        today={today}
      />
    </div>
  );
}