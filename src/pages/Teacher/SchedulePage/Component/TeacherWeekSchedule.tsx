// src/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule.tsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

import ClassSessionDetailsPopup from "@/pages/Teacher/SchedulePage/Component/ClassSessionDetailsPopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { Calendar as ShadCalendar } from "@/components/ui/Calendar"; // Shadcn calendar

/* =========================
   Types
========================= */
export type Session = {
  id: string;
  title: string;
  classCode: string;
  start: string;         // "YYYY-MM-DDTHH:mm:ss" hoặc "yyyy:MM:dd:HH:mm"
  room?: string;
  durationMin?: number;  // mặc định 90 phút (1h30)
};

type Props = {
  sessions: Session[];
  startHour?: number;    // giờ bắt đầu trong ngày (VD: 14h)
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
function toDateAny(s: string): Date {
  // hỗ trợ "yyyy:MM:dd:HH:mm"
  if (/^\d{4}:\d{2}:\d{2}:\d{2}:\d{2}$/.test(s)) {
    const [y, M, d, H, m] = s.split(":").map(Number);
    return new Date(y, M - 1, d, H, m, 0, 0);
  }
  return new Date(s);
}

function getTeachingSessionStyles() {
  // Teacher sessions use a consistent style since they don't have attendance status
  return {
    border: "border-accent-300",
    bg: "bg-white",
    hover: "hover:bg-accent-25 hover:border-accent-400",
    text: "text-primary-800",
    badge: "bg-accent-50 text-accent-600"
  };
}

/* =========================
   Component
========================= */
export default function TeacherWeekSchedule({
  sessions,
  startHour = 14,
  slots = 6,
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
    instructor?: string;
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
    const map = new Map<string, Session[]>();
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

  function openDetails(s: Session, startLabel: string, endLabel: string) {
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
      instructor: "You (Instructor)",
      date: dateStr,
      time: `${startLabel} – ${endLabel}`,
      roomNumber: s.room ?? "—",
      format: "In-person",
      meetingLink: "https://meet.google.com/teacher-class",
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
                        const sessionStyles = getTeachingSessionStyles();
                        return (
                          <button
                            key={s.id}
                            onClick={() => openDetails(s, startLabel, endLabel)}
                            className={`group w-full text-left rounded-lg shadow-md p-2 transition-all duration-200
                                       hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400
                                       ${sessionStyles.border} ${sessionStyles.bg} ${sessionStyles.hover}`}
                            title={`${s.title} • ${startLabel} – ${endLabel}`}
                          >
                            <div className={`text-sm font-bold leading-4 group-hover:opacity-90 mb-1 ${sessionStyles.text}`}>
                              {s.title}
                            </div>
                            <div className={`text-xs font-medium mb-1 ${sessionStyles.text} opacity-80`}>
                              {s.classCode}
                              {s.room && (
                                <span>
                                  {" • "}{s.room}
                                </span>
                              )}
                            </div>
                            <div className={`text-xs font-medium px-1 py-0.5 rounded ${sessionStyles.badge}`}>
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

      {/* ===== Popup chi tiết session ===== */}
      <ClassSessionDetailsPopup
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        session={detailsData}
      />

      {/* ===== Dialog: Calendar (Shadcn) ===== */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a date</DialogTitle>
          </DialogHeader>
          <DialogBody className="pt-2">
            <ShadCalendar
              mode="single"
              selected={selectedDate ?? today}
              onSelect={(d) => {
                if (!d) return;
                setSelectedDate(d);            // lưu ngày được chọn để highlight
                setWeekStart(startOfWeek(d));  // nhảy tới tuần chứa ngày
                setPickerOpen(false);          // đóng dialog
              }}
              initialFocus
              className="rounded-md border border-accent-200"
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
