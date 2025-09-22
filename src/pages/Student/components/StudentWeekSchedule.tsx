// src/pages/Student/components/StudentWeekSchedule.tsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon, User, Clock, MapPin, BookOpen, GraduationCap } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { Calendar as ShadCalendar } from "@/components/ui/Calendar"; // Shadcn calendar

/* =========================
   Types
========================= */
export type StudentSession = {
  id: string;
  title: string;
  classCode: string;
  start: string;         // "YYYY-MM-DDTHH:mm:ss" hoặc "yyyy:MM:dd:HH:mm"
  room?: string;
  instructor?: string;
  durationMin?: number;  // mặc định 90 phút (1h30)
  attendanceStatus?: "attended" | "absent" | "upcoming"; // attendance status
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
function startOfWeek(date: Date) {
  const d = new Date(date);
  // chuẩn hoá về Monday-start week (Mon=0..Sun=6)
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtDayHeader(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long" });
}
function fmtDaySub(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtTime(h: number, m = 0) {
  const t = new Date();
  t.setHours(h, m, 0, 0);
  return t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getAttendanceStyles(status: string | undefined) {
  // Use only the provided attendance status from mock data
  const attendanceStatus = status || "upcoming";

  switch (attendanceStatus) {
    case "attended":
      return {
        border: "border-green-300",
        bg: "bg-green-50",
        hover: "hover:bg-green-100 hover:border-green-400",
        text: "text-green-800",
        badge: "bg-green-100 text-green-700"
      };
    case "absent":
      return {
        border: "border-red-300",
        bg: "bg-red-50",
        hover: "hover:bg-red-100 hover:border-red-400",
        text: "text-red-800",
        badge: "bg-red-100 text-red-700"
      };
    default: // upcoming
      return {
        border: "border-accent-300",
        bg: "bg-white",
        hover: "hover:bg-accent-25 hover:border-accent-400",
        text: "text-primary-800",
        badge: "bg-accent-50 text-accent-600"
      };
  }
}
function toDateAny(s: string): Date {
  // hỗ trợ "yyyy:MM:dd:HH:mm"
  if (/^\d{4}:\d{2}:\d{2}:\d{2}:\d{2}$/.test(s)) {
    const [y, M, d, H, m] = s.split(":").map(Number);
    return new Date(y, M - 1, d, H, m, 0, 0);
  }
  return new Date(s);
}

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

  // Tạo các mốc thời gian theo slot
  const slotTimes = useMemo(
    () =>
      Array.from({ length: slots }, (_, i) => {
        const total = startHour * 60 + i * slotMinutes;
        return [Math.floor(total / 60), total % 60] as const;
      }),
    [startHour, slots, slotMinutes]
  );

  // Lọc sessions trong tuần
  const weekSessions = useMemo(() => {
    const s = startOfWeek(weekStart);
    const e = addDays(s, 7);
    return sessions.filter((ev) => {
      const t = toDateAny(ev.start);
      return !Number.isNaN(+t) && t >= s && t < e;
    });
  }, [sessions, weekStart]);

  // Map session -> ô (dayIdx-slotIdx)
  function getPosition(dt: Date) {
    const dayIdx = (dt.getDay() + 6) % 7; // Mon=0
    const minutes = dt.getHours() * 60 + dt.getMinutes();
    const startMin = startHour * 60;
    const diff = minutes - startMin;
    const slotIdx = Math.floor(diff / slotMinutes);
    return { dayIdx, slotIdx };
  }
  const cellMap = useMemo(() => {
    const map = new Map<string, StudentSession[]>();
    for (const s of weekSessions) {
      const dt = toDateAny(s.start);
      if (Number.isNaN(+dt)) continue;
      const { dayIdx, slotIdx } = getPosition(dt);
      if (slotIdx < 0 || slotIdx >= slots) continue;
      const key = `${dayIdx}-${slotIdx}`;
      const list = map.get(key) || [];
      list.push(s);
      map.set(key, list);
    }
    return map;
  }, [weekSessions, slots, startHour, slotMinutes]);

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
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between p-6 border-b border-accent-200">
        <div>
          <h2 className="text-xl font-bold text-primary-800">Weekly Schedule</h2>
          <div className="mt-2 flex items-center gap-3">
            <button
              className="p-2 rounded-lg hover:bg-accent-100 transition-colors border border-accent-200"
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-primary-600" />
            </button>
            <span className="text-lg font-semibold text-primary-700 px-4">{labelWeek}</span>
            <button
              className="p-2 rounded-lg hover:bg-accent-100 transition-colors border border-accent-200"
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-primary-600" />
            </button>
          </div>
        </div>

        {/* Calendar Button */}
        <button
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
          onClick={() => setPickerOpen(true)}
        >
          <CalendarIcon className="w-5 h-5" />
          Select Date
        </button>
      </div>

      {/* ===== Grid Header Row ===== */}
      <div className="border-t border-accent-200">
        <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))] text-sm">
          <div className="p-3 border-b border-accent-400 font-bold text-primary-800 bg-accent-200 text-center">Time</div>
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d, i) => (
            <div
              key={d.toISOString()}
              className={
                "p-3 border-b border-accent-200 text-center border-l " +
                (i === todayIdx ? "bg-accent-50" : "bg-white")
              }
            >
              <div className="font-bold text-center text-primary-800">
                {fmtDayHeader(d)}
              </div>
              <div className="text-xs text-accent-600 font-medium mt-1">{fmtDaySub(d)}</div>
              {i === todayIdx && (
                <div className="mt-2">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-accent-500 text-white font-semibold">
                    Today
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===== Grid Body ===== */}
        <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))]">
          {slotTimes.map(([h, m], row) => (
            <React.Fragment key={row}>
              <div className="border-t border-accent-400 p-2 text-sm font-semibold text-primary-700 bg-accent-200 text-center">
                {fmtTime(h, m)}
              </div>

              {Array.from({ length: 7 }, (_, dayIdx) => {
                const key = `${dayIdx}-${row}`;
                const items = cellMap.get(key) || [];

                // Background for today's column
                const colBase = dayIdx === todayIdx ? "bg-accent-25" : "bg-white";

                // Highlight slot if has session
                let slotHighlight = "";
                if (items.length > 0) {
                  if (dayIdx === selectedIdx) slotHighlight = "bg-accent-100"; // selected day
                  else if (dayIdx === todayIdx) slotHighlight = "bg-accent-50"; // today
                }

                return (
                  <div
                    key={key}
                    className={`border-t border-l border-accent-200 p-2 min-h-[60px] ${colBase} ${slotHighlight} hover:bg-accent-25 transition-colors`}
                  >
                    <div
                      className={
                        items.length <= 1
                          ? "h-full w-full flex items-center justify-center"
                          : "space-y-2"
                      }
                    >
                      {items.map((s) => {
                        const eMin = m + (s.durationMin ?? slotMinutes);
                        const startLabel = fmtTime(h, m);
                        const endLabel = fmtTime(
                          h + Math.floor(eMin / 60),
                          eMin % 60
                        );
                        const attendanceStyles = getAttendanceStyles(s.attendanceStatus);
                        return (
                          <button
                            key={s.id}
                            onClick={() => openDetails(s, startLabel, endLabel)}
                            className={`group w-full text-left rounded-lg shadow-md p-2 transition-all duration-200
                                       hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400
                                       ${attendanceStyles.border} ${attendanceStyles.bg} ${attendanceStyles.hover}`}
                            title={`${s.title} • ${startLabel} – ${endLabel}`}
                          >
                            <div className={`text-sm font-bold leading-4 group-hover:opacity-90 mb-1 ${attendanceStyles.text}`}>
                              {s.title}
                            </div>
                            <div className={`text-xs font-medium mb-1 ${attendanceStyles.text} opacity-80`}>
                              {s.classCode}
                              {s.room && (
                                <span>
                                  {" • "}{s.room}
                                </span>
                              )}
                            </div>
                            {s.instructor && (
                              <div className={`text-xs mb-1 ${attendanceStyles.text} opacity-70`}>
                                {s.instructor}
                              </div>
                            )}
                            <div className={`text-xs font-medium px-1 py-0.5 rounded ${attendanceStyles.badge}`}>
                              {startLabel} – {endLabel}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== Class Details Dialog ===== */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent size="xl" className="border border-accent-200">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-primary-800">Class Details</DialogTitle>
                <p className="text-accent-600 text-sm">Course Information & Schedule</p>
              </div>
            </div>
          </DialogHeader>
          <DialogBody className="pt-3">
            {detailsData && (
              <div className="space-y-4">
                {/* Course Header */}
                <div className="p-4 bg-primary-500 text-white rounded-lg relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-primary-100 text-xs font-medium uppercase tracking-wide">Course</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{detailsData.courseName}</h3>
                  <p className="text-primary-100 text-sm font-medium">{detailsData.className}</p>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-accent-800 text-sm uppercase tracking-wide">Instructor</span>
                    </div>
                    <p className="text-accent-700 font-semibold text-base">{detailsData.instructor}</p>
                    <p className="text-accent-600 text-sm mt-1">Available for Q&A after class</p>
                  </div>

                  <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-success-800 text-sm uppercase tracking-wide">Schedule</span>
                    </div>
                    <p className="text-success-700 font-semibold text-base">{detailsData.time}</p>
                    <p className="text-success-600 text-sm mt-1">90 minutes duration</p>
                  </div>

                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-warning-800 text-sm uppercase tracking-wide">Location</span>
                    </div>
                    <p className="text-warning-700 font-semibold text-base">{detailsData.roomNumber}</p>
                    <p className="text-warning-600 text-sm mt-1">CETS Language Center</p>
                  </div>

                  <div className="p-3 bg-primary-25 border border-primary-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-primary-800 text-sm uppercase tracking-wide">Date</span>
                    </div>
                    <p className="text-primary-700 font-semibold text-base">{detailsData.date}</p>
                    <p className="text-primary-600 text-sm mt-1">Please arrive 10 minutes early</p>
                  </div>
                </div>

                {/* Meeting Link Section */}
                {detailsData.meetingLink && (
                  <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-info-500 rounded flex items-center justify-center">
                          <Video className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-info-800 text-sm">Online Meeting Available</span>
                      </div>
                      <a 
                        href={detailsData.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-info-500 hover:bg-info-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      >
                        <Video className="w-3 h-3" />
                        Join
                      </a>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <h4 className="font-bold text-neutral-800 mb-2 text-sm">Class Preparation</h4>
                  <div className="text-neutral-700 text-xs space-y-1">
                    <div>• Bring textbook and notebook</div>
                    <div>• Complete assigned homework</div>
                    <div>• Review previous materials</div>
                  </div>
                </div>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* ===== Calendar Dialog ===== */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="border border-accent-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary-800">Select a Date</DialogTitle>
          </DialogHeader>
          <DialogBody className="pt-4">
            <ShadCalendar
              mode="single"
              selected={selectedDate ?? today}
              onSelect={(d) => {
                if (!d) return;
                setSelectedDate(d);
                setWeekStart(startOfWeek(d));
                setPickerOpen(false);
              }}
              initialFocus
              className="rounded-lg border border-accent-200 shadow-sm"
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}