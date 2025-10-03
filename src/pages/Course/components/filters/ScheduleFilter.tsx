import { Calendar, Clock } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';
import { useMemo } from 'react';

// Generic facet item type that works with both course and package facets
interface FacetItemType {
  key: string;
  label?: string | null;
  count: number;
  selected?: boolean;
}

interface ScheduleFilterProps {
  selectedDays: string[];
  selectedTimeSlots: string[];
  onToggleDay: (day: string) => void;
  onToggleTimeSlot: (timeSlot: string) => void;
  daysOfWeekFacet?: FacetItemType[];
  timeSlotsFacet?: FacetItemType[];
}

export default function ScheduleFilter({ 
  selectedDays, 
  selectedTimeSlots,
  onToggleDay,
  onToggleTimeSlot,
  daysOfWeekFacet = [],
  timeSlotsFacet = []
}: ScheduleFilterProps) {
  // Convert time slots from facets
  const timeSlots = useMemo(() => {
    return timeSlotsFacet.reduce((acc, facet) => {
      if (facet.key) {
        const startTime = facet.key;
        
        // Calculate end time (start + 90 minutes)
        const [hours, minutes] = startTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const startDate = new Date();
          startDate.setHours(hours, minutes, 0, 0);
          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + 90);
          const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
          
          acc[startTime] = {
            startTime,
            displayTime: `${startTime} - ${endTime}`,
            count: facet.count
          };
        }
      }
      return acc;
    }, {} as Record<string, { startTime: string; displayTime: string; count: number }>);
  }, [timeSlotsFacet]);
  
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
            {daysOfWeekFacet.length === 0 ? (
              <div className="text-center py-2 text-sm text-gray-500">
                No days available
              </div>
            ) : (
              daysOfWeekFacet.map((facet) => (
                <label key={facet.key} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(facet.key)}
                    onChange={() => onToggleDay(facet.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-1"
                  />
                  <span className="text-neutral-700 flex-1 text-sm">
                    {facet.label || facet.key}
                  </span>
                  <span className="text-xs text-gray-500">({facet.count})</span>
                </label>
              ))
            )}
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
                  <span className="text-xs text-gray-500">({slot.count})</span>
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
