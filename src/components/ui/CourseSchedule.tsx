import { Calendar, Clock, MapPin, Users, BookOpen } from "lucide-react";
import type { CourseSchedule, TimeSlot } from "@/types/course";
import { TIME_SLOTS } from "@/types/course";

interface CourseScheduleProps {
  schedules: CourseSchedule[];
  className?: string;
  compact?: boolean;
}

interface ScheduleDisplayProps {
  schedule: CourseSchedule;
  timeSlot: TimeSlot;
  compact?: boolean;
}

function ScheduleItem({ schedule, timeSlot, compact = false }: ScheduleDisplayProps) {
  const getDayShort = (day: string): string => {
    const dayMap: Record<string, string> = {
      'Monday': 'Mon',
      'Tuesday': 'Tue', 
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return dayMap[day] || day;
  };

  const getDayVeryShort = (day: string): string => {
    const dayMap: Record<string, string> = {
      'Monday': 'M',
      'Tuesday': 'T', 
      'Wednesday': 'W',
      'Thursday': 'T',
      'Friday': 'F',
      'Saturday': 'S',
      'Sunday': 'S'
    };
    return dayMap[day] || day.charAt(0);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-0.5 lg:gap-1 text-xs bg-blue-50 px-1 lg:px-2 py-1 rounded-md border border-blue-100 min-w-0 flex-shrink-0">
        <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0 hidden lg:block" />
        <span className="font-medium text-blue-700 whitespace-nowrap">
          <span className="md:hidden">{getDayVeryShort(schedule.dayOfWeek)}</span>
          <span className="hidden md:inline">{getDayShort(schedule.dayOfWeek)}</span>
        </span>
        <span className="text-blue-600 text-xs truncate">{timeSlot.displayTime}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-gray-800">{schedule.dayOfWeek}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {schedule.timeSlotName || timeSlot.name}
          </span>
        </div>
      </div>
      <div className="mt-1 text-sm text-gray-600">
        {timeSlot.displayTime}
      </div>
    </div>
  );
}

export default function CourseSchedule({ schedules, className = "", compact = false }: CourseScheduleProps) {
  if (!schedules || schedules.length === 0) {
    if (compact) {
      return (
        <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600">No schedule available</span>
        </div>
      );
    }
    
    return (
      <div className={`text-center py-4 md:py-6 lg:py-8 text-gray-500 ${className}`}>
        <Calendar className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mx-auto mb-2 md:mb-3 text-gray-300" />
        <p className="text-sm md:text-base">No schedule available</p>
      </div>
    );
  }

  // Group schedules by day and sort
  const sortedSchedules = schedules.sort((a, b) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const aDayIndex = dayOrder.indexOf(a.dayOfWeek);
    const bDayIndex = dayOrder.indexOf(b.dayOfWeek);
    
    if (aDayIndex !== bDayIndex) {
      return aDayIndex - bDayIndex;
    }
    
    // If same day, sort by time slot
    const aTimeSlot = TIME_SLOTS[a.timeSlotName || ''];
    const bTimeSlot = TIME_SLOTS[b.timeSlotName || ''];
    
    if (aTimeSlot && bTimeSlot) {
      return aTimeSlot.startTime.localeCompare(bTimeSlot.startTime);
    }
    
    return 0;
  });

  // Calculate total hours per week
  const totalMinutesPerWeek = sortedSchedules.reduce((total, schedule) => {
    const timeSlot = TIME_SLOTS[schedule.timeSlotName || ''];
    if (timeSlot) {
      const start = new Date(`2000-01-01 ${timeSlot.startTime}`);
      const end = new Date(`2000-01-01 ${timeSlot.endTime}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      return total + duration;
    }
    return total;
  }, 0);

  const totalHours = Math.floor(totalMinutesPerWeek / 60);
  const remainingMinutes = totalMinutesPerWeek % 60;

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-1 lg:gap-2 overflow-hidden ${className}`}>
        {sortedSchedules.slice(0, 3).map((schedule) => {
          const timeSlot = TIME_SLOTS[schedule.timeSlotName || ''];
          if (!timeSlot) return null;
          
          return (
            <ScheduleItem 
              key={schedule.id} 
              schedule={schedule} 
              timeSlot={timeSlot} 
              compact={true} 
            />
          );
        })}
        {sortedSchedules.length > 3 && (
          <div className="flex items-center gap-1 text-xs bg-gray-50 px-1.5 lg:px-2 py-1 rounded-md border border-gray-200 min-w-0 flex-shrink-0">
            <span className="text-gray-600 whitespace-nowrap">+{sortedSchedules.length - 3} more</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Schedule Summary */}
      <div className="rounded-lg p-4 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Classes per week</p>
              <p className="font-semibold text-gray-900">{sortedSchedules.length} sessions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total time per week</p>
              <p className="font-semibold text-gray-900">
                {totalHours}h {remainingMinutes > 0 ? `${remainingMinutes}min` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Schedule type</p>
              <p className="font-semibold text-gray-900">Regular classes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Weekly Schedule</h4>
        </div>
        
        <div className="grid gap-3">
          {sortedSchedules.map((schedule, index) => {
            const timeSlot = TIME_SLOTS[schedule.timeSlotName || ''];
            if (!timeSlot) return null;
            
            const slotColor = index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'green' : 'purple';
            const colorClasses = {
              blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
              green: 'from-green-50 to-green-100 border-green-200 text-green-700',
              purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700'
            };
            
            return (
              <div 
                key={schedule.id} 
                className={`bg-white ${colorClasses[slotColor]} rounded-lg p-4 border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold text-lg">{schedule.dayOfWeek}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-sm">{timeSlot.displayTime}</span>
                    </div>
                    <div className="bg-white/60 px-3 py-1 rounded-full">
                      <span className="font-medium text-sm">{schedule.timeSlotName || timeSlot.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm opacity-80">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>In-person class</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Classroom TBA</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="font-medium text-gray-900 mb-2">📝 Schedule Notes</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Please arrive 10 minutes before class starts</li>
          <li>• Classroom locations will be announced one week before course begins</li>
          <li>• Make-up classes available for missed sessions</li>
        </ul>
      </div>
    </div>
  );
}
