import { Calendar, Clock } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';
import { DAYS_OF_WEEK } from '@/types/course';
import type { CourseSchedule } from '@/types/course';
import { useMemo } from 'react';

interface ScheduleFilterProps {
  selectedDays: string[];
  selectedTimeSlots: string[];
  onToggleDay: (day: string) => void;
  onToggleTimeSlot: (timeSlot: string) => void;
  allSchedules?: CourseSchedule[]; // Get from parent component
}

export default function ScheduleFilter({ 
  selectedDays, 
  selectedTimeSlots,
  onToggleDay,
  onToggleTimeSlot,
  allSchedules = []
}: ScheduleFilterProps) {
  // Extract unique time slots from all schedules
  const timeSlots = useMemo(() => {
    const uniqueTimeSlots = new Map<string, { startTime: string; displayTime: string }>();
    
    allSchedules.forEach(schedule => {
      if (schedule.timeSlotName && !uniqueTimeSlots.has(schedule.timeSlotName)) {
        const startTime = schedule.timeSlotName;
        
        // Calculate end time (start + 90 minutes)
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 90);
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        
        uniqueTimeSlots.set(startTime, {
          startTime,
          displayTime: `${startTime} - ${endTime}`
        });
      }
    });
    
    // Sort by start time
    return Array.from(uniqueTimeSlots.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, { startTime: string; displayTime: string }>);
  }, [allSchedules]);
  
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
            {Object.keys(timeSlots).length === 0 ? (
              <div className="text-center py-2 text-sm text-gray-500">
                No time slots available
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
                    <span className="text-neutral-700 text-sm ">
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
