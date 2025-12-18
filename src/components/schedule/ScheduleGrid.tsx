// src/components/schedule/ScheduleGrid.tsx
import React from "react";
import { addDays, fmtTime, toDateAny } from "./scheduleUtils";
import type { BaseSession } from "./scheduleUtils";
import SessionCard from "./SessionCard";

type TimeSlot = {
  start: string;
  end: string;
};

type Props<T extends BaseSession> = {
  weekStart: Date;
  sessions: T[];
  startHour: number;
  slots: number;
  slotMinutes: number;
  timeSlots?: TimeSlot[];
  todayIdx: number;
  selectedIdx: number;
  onSessionClick: (session: T, startLabel: string, endLabel: string) => void;
  isStudent?: boolean;
};

export default function ScheduleGrid<T extends BaseSession>({
  weekStart,
  sessions,
  startHour,
  slots,
  slotMinutes,
  timeSlots,
  todayIdx,
  selectedIdx,
  onSessionClick,
  isStudent = false,
}: Props<T>) {
  const slotTimes = timeSlots
    ? timeSlots.map((slot) => {
        const [hours, minutes] = slot.start.split(":").map(Number);
        return [hours, minutes] as const;
      })
    : Array.from({ length: slots }, (_, i) => {
        const total = startHour * 60 + i * slotMinutes;
        return [Math.floor(total / 60), total % 60] as const;
      });

  // Helper function to normalize time string (handles both "9:00" and "09:00")
  function normalizeTime(timeStr: string): string {
    const parts = timeStr.split(":");
    if (parts.length !== 2) return timeStr;
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function getPosition(dt: Date) {
    const dayIdx = (dt.getDay() + 6) % 7; // Mon=0
    const minutes = dt.getHours() * 60 + dt.getMinutes();

    if (timeSlots && timeSlots.length > 0) {
      const slotIdx = timeSlots.findIndex((slot) => {
        // Normalize slot times to handle both "9:00" and "09:00" formats
        const normalizedStart = normalizeTime(slot.start);
        const normalizedEnd = normalizeTime(slot.end);
        const [startHours, startMinutes] = normalizedStart.split(":").map(Number);
        const [endHours, endMinutes] = normalizedEnd.split(":").map(Number);
        const slotStart = startHours * 60 + startMinutes;
        const slotEnd = endHours * 60 + endMinutes;
        // Include both start and end boundaries: >= start and <= end
        return minutes >= slotStart && minutes <= slotEnd;
      });
      return { dayIdx, slotIdx };
    }

    const startMin = startHour * 60;
    const diff = minutes - startMin;
    const slotIdx = Math.floor(diff / slotMinutes);
    return { dayIdx, slotIdx };
  }

  const cellMap = new Map<string, T[]>();
  for (const s of sessions) {
    const dt = toDateAny(s.start);
    if (Number.isNaN(+dt)) continue;
    const { dayIdx, slotIdx } = getPosition(dt);
    const maxSlots = timeSlots ? timeSlots.length : slots;
    if (slotIdx < 0 || slotIdx >= maxSlots) continue;
    const key = `${dayIdx}-${slotIdx}`;
    const list = cellMap.get(key) || [];
    list.push(s);
    cellMap.set(key, list);
  }

  return (
    <div className="border-t border-accent-200">
      <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] text-sm">
        <div className="p-2 border-b border-accent-400 font-bold text-primary-800 bg-accent-200 text-center flex items-center justify-center text-xs">Time / Slot</div>
        {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d, i) => (
          <div
            key={d.toISOString()}
            className={
              "py-2 px-1 border-b border-accent-200 text-center border-l " +
              (i === todayIdx ? "bg-accent-50" : "bg-white")
            }
          >
            <div className="font-bold text-center text-primary-800 text-sm">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div className="text-xs text-accent-600 font-medium">
              {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
            {i === todayIdx && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-500 text-white font-semibold inline-block mt-1">
                Today
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))]">
        {slotTimes.map(([h, m], row) => (
          <React.Fragment key={row}>
            {/* --- Time / Slot Column (Staff Style) --- */}
            <div className="border-t border-r border-accent-400 p-2 text-xs bg-gray-50 flex flex-col justify-center items-center text-center h-24">
              {timeSlots && timeSlots[row] ? (
                <>
                  {/* Slot Name (e.g., Slot 1) */}
                  <span className="font-bold text-blue-700 mb-1 text-sm block">
                    Slot {row + 1}
                  </span>
                  {/* Time (e.g., 09:00 - 10:30) */}
                  <div className="text-gray-500 font-medium bg-white px-2 py-1 rounded border border-gray-200 shadow-sm inline-block whitespace-nowrap">
                    {timeSlots[row].start} - {timeSlots[row].end}
                  </div>
                </>
              ) : (
                fmtTime(h, m)
              )}
            </div>

            {Array.from({ length: 7 }, (_, dayIdx) => {
              const key = `${dayIdx}-${row}`;
              const items = cellMap.get(key) || [];

              const colBase = dayIdx === todayIdx ? "bg-accent-25" : "bg-white";
              let slotHighlight = "";
              if (items.length > 0) {
                if (dayIdx === selectedIdx) slotHighlight = "bg-accent-100";
                else if (dayIdx === todayIdx) slotHighlight = "bg-accent-50";
              }

              return (
                <div
                  key={key}
                  className={`border-t border-l border-accent-200 p-2 h-24 ${colBase} ${slotHighlight} hover:bg-accent-25 transition-colors`}
                >
                  <div
                    className={
                      items.length <= 1
                        ? "h-full w-full flex items-center justify-center"
                        : "space-y-2"
                    }
                  >
                    {items.map((s) => {
                      let startLabel: string;
                      let endLabel: string;
                      
                      if (timeSlots && timeSlots[row]) {
                        // Use custom time slot times
                        startLabel = timeSlots[row].start;
                        endLabel = timeSlots[row].end;
                      } else {
                        // Original logic
                        const eMin = m + (s.durationMin ?? slotMinutes);
                        startLabel = fmtTime(h, m);
                        endLabel = fmtTime(
                          h + Math.floor(eMin / 60),
                          eMin % 60
                        );
                      }
                      
                      return (
                        <SessionCard
                          key={s.id}
                          session={s}
                          startLabel={startLabel}
                          endLabel={endLabel}
                          onSessionClick={onSessionClick}
                          isStudent={isStudent}
                        />
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
  );
}


