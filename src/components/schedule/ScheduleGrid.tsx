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

  function getPosition(dt: Date) {
    const dayIdx = (dt.getDay() + 6) % 7; // Mon=0
    const minutes = dt.getHours() * 60 + dt.getMinutes();

    if (timeSlots && timeSlots.length > 0) {
      const slotIdx = timeSlots.findIndex((slot) => {
        const [startHours, startMinutes] = slot.start.split(":").map(Number);
        const [endHours, endMinutes] = slot.end.split(":").map(Number);
        const slotStart = startHours * 60 + startMinutes;
        const slotEnd = endHours * 60 + endMinutes;
        return minutes >= slotStart && minutes < slotEnd;
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
              {d.toLocaleDateString(undefined, { weekday: "long" })}
            </div>
            <div className="text-xs text-accent-600 font-medium mt-1">
              {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
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

      <div className="grid grid-cols-[140px_repeat(7,minmax(0,1fr))]">
        {slotTimes.map(([h, m], row) => (
          <React.Fragment key={row}>
            <div className="border-t border-accent-400 p-2 text-sm font-semibold text-primary-700 bg-accent-200 text-center">
              {timeSlots && timeSlots[row] ? (
                <div>
                  <div>{timeSlots[row].start}</div>
                  <span className="opacity-70">–</span>
                  <div>{timeSlots[row].end}</div>
                </div>
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
                      const endLabel = timeSlots && timeSlots[row]
                        ? timeSlots[row].end
                        : fmtTime(
                            h + Math.floor(eMin / 60),
                            eMin % 60
                          );
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


