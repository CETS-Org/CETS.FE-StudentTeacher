// src/pages/Student/components/StudentWeekSchedule.tsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { Calendar as ShadCalendar } from "@/components/ui/calendar"; // Shadcn calendar

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
  return t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm mt-4">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">My Class Schedule</h2>
          <div className="mt-1 flex items-center gap-2 text-blue-700">
            <button
              className="p-1 rounded hover:bg-blue-100"
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm">{labelWeek}</span>
            <button
              className="p-1 rounded hover:bg-blue-100"
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Today → mở Dialog chứa Shadcn Calendar */}
        <button
          className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm"
          onClick={() => setPickerOpen(true)}
        >
          <CalendarIcon className="w-4 h-4" />
          Today
        </button>
      </div>

      {/* ===== Grid Header Row ===== */}
      <div className="border-t border-blue-100">
        <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] text-sm text-blue-800">
          <div className="p-3 border-b border-blue-100 font-medium">Time</div>
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d, i) => (
            <div
              key={d.toISOString()}
              className={
                "p-3 border-b border-blue-100 text-center " +
                (i === todayIdx ? "bg-blue-50 rounded-t" : "")
              }
            >
              <div className="font-medium flex items-center justify-center gap-2">
                {fmtDayHeader(d)}
                {i === todayIdx && (
                  <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-200 text-blue-900">
                    Today
                  </span>
                )}
              </div>
              <div className="text-xs text-blue-600">{fmtDaySub(d)}</div>
            </div>
          ))}
        </div>

        {/* ===== Grid Body ===== */}
        <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))]">
          {slotTimes.map(([h, m], row) => (
            <React.Fragment key={row}>
              <div className="border-t border-blue-100 p-3 text-xs text-blue-700">
                {fmtTime(h, m)}
              </div>

              {Array.from({ length: 7 }, (_, dayIdx) => {
                const key = `${dayIdx}-${row}`;
                const items = cellMap.get(key) || [];

                // nền cột hôm nay (nhạt)
                const colBase = dayIdx === todayIdx ? "bg-blue-50" : "";

                // highlight slot nếu có session + theo selected/today
                let slotHighlight = "";
                if (items.length > 0) {
                  if (dayIdx === selectedIdx) slotHighlight = "bg-blue-200"; // ngày chọn (đậm hơn)
                  else if (dayIdx === todayIdx) slotHighlight = "bg-blue-100"; // hôm nay (nhạt)
                }

                return (
                  <div
                    key={key}
                    className={`border-t border-l border-blue-100 p-1 min-h-[92px] ${colBase} ${slotHighlight}`}
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
                        return (
                          <button
                            key={s.id}
                            onClick={() => openDetails(s, startLabel, endLabel)}
                            className="group w-full text-left rounded-lg border border-blue-200 bg-white shadow-sm p-2 transition
                                       hover:shadow-md hover:ring-1 hover:ring-blue-300 hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            title={`${s.title} • ${startLabel} – ${endLabel}`}
                          >
                            <div className="text-sm font-semibold leading-5 text-blue-900 group-hover:text-blue-950">
                              {s.title}
                            </div>
                            <div className="text-[12px] text-blue-700">
                              Class {s.classCode}
                              {s.room ? (
                                <>
                                  {" • "}{s.room}
                                  {detailsData?.meetingLink && (
                                    <span className="inline-flex items-center gap-1 ml-1 text-blue-600">
                                      / <Video className="w-3 h-3" />
                                    </span>
                                  )}
                                </>
                              ) : null}
                            </div>
                            {s.instructor && (
                              <div className="text-[12px] text-blue-600 mt-0.5">
                                {s.instructor}
                              </div>
                            )}
                            <div className="text-[12px] text-blue-700 mt-0.5">
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
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
          </DialogHeader>
          <DialogBody className="pt-2">
            {detailsData && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-900">{detailsData.courseName}</h3>
                  <p className="text-sm text-blue-700">{detailsData.className}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Instructor:</span>
                    <p className="text-blue-600">{detailsData.instructor}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Date:</span>
                    <p className="text-blue-600">{detailsData.date}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Time:</span>
                    <p className="text-blue-600">{detailsData.time}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Room:</span>
                    <p className="text-blue-600">{detailsData.roomNumber}</p>
                  </div>
                </div>
                {detailsData.meetingLink && (
                  <div>
                    <span className="font-medium text-blue-800">Meeting Link:</span>
                    <a 
                      href={detailsData.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      {detailsData.meetingLink}
                    </a>
                  </div>
                )}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

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
              className="rounded-md border border-blue-100"
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}