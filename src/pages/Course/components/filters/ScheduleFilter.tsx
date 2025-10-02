import { Calendar, Clock } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';
import { DAYS_OF_WEEK } from '@/types/course';
import type { DayOfWeek } from '@/types/course';
import { useTimeSlots } from '@/hooks/useTimeSlots';

interface ScheduleFilterProps {
  selectedDays: string[];
  selectedTimeSlots: string[];
  onToggleDay: (day: string) => void;
  onToggleTimeSlot: (timeSlot: string) => void;
}

export default function ScheduleFilter({ 
  selectedDays, 
  selectedTimeSlots,
  onToggleDay,
  onToggleTimeSlot
}: ScheduleFilterProps) {
  const { timeSlots, loading } = useTimeSlots();
  
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
      <Calendar className="w-3 h-3 text-white" />
    </div>
  );

  const totalSelected = selectedDays.length + selectedTimeSlots.length;

  return (
    <CollapsibleFilter
      title="Schedule"
      subtitle="Filter by days and time slots"
      icon={icon}
      selectedCount={totalSelected}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        {/* Days of Week Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Days of Week
          </h4>
          <div className="space-y-2 max-h-32 overflow-auto">
            {DAYS_OF_WEEK.map((day) => (
              <label key={day} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => onToggleDay(day)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-1"
                />
                <span className="text-neutral-700 flex-1 text-sm">
                  {day}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Slots Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            Time Slots
          </h4>
          <div className="space-y-2 max-h-40 overflow-auto">
            {loading ? (
              <div className="text-center py-2 text-sm text-gray-500">
                Loading time slots...
              </div>
            ) : (
              Object.entries(timeSlots).map(([slotName, slot]) => (
                <label key={slotName} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTimeSlots.includes(slotName)}
                    onChange={() => onToggleTimeSlot(slotName)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-1"
                  />
                  <div className="flex-1">
                    <span className="text-neutral-700 text-sm font-medium">
                      {slotName}
                    </span>
                    <span className="text-neutral-500 text-xs ml-2">
                      {slot.displayTime}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Clear Filters */}
        {totalSelected > 0 && (
          <button 
            onClick={() => {
              selectedDays.forEach(onToggleDay);
              selectedTimeSlots.forEach(onToggleTimeSlot);
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full text-center py-1 border-t border-gray-100 mt-3 pt-3"
          >
            Clear Schedule Filters
          </button>
        )}
      </div>
    </CollapsibleFilter>
  );
}
