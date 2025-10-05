// src/components/schedule/ScheduleHeader.tsx
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

type Props = {
  weekStart: Date;
  weekEnd: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onOpenDatePicker: () => void;
};

export default function ScheduleHeader({
  weekStart,
  weekEnd,
  onPreviousWeek,
  onNextWeek,
  onOpenDatePicker,
}: Props) {
  const labelWeek = `${weekStart.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  })}–${weekEnd.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="flex items-center justify-between p-6 border-b border-accent-200">
      <div>
        <h2 className="text-xl font-bold text-primary-800">Weekly Schedule</h2>
        <div className="mt-2 flex items-center gap-3">
          <button
            className="p-2 rounded-lg hover:bg-accent-100 transition-colors border border-accent-200"
            onClick={onPreviousWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5 text-primary-600" />
          </button>
          <span className="text-lg font-semibold text-primary-700 px-4">{labelWeek}</span>
          <button
            className="p-2 rounded-lg hover:bg-accent-100 transition-colors border border-accent-200"
            onClick={onNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5 text-primary-600" />
          </button>
        </div>
      </div>

      <button
        className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-md transition-all duration-200"
        onClick={onOpenDatePicker}
      >
        <CalendarIcon className="w-5 h-5" />
        Select Date
      </button>
    </div>
  );
}


