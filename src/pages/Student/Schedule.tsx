import React, { useState } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User
} from "lucide-react";

// Schedule interfaces
interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  instructor: string;
  location?: string;
  type: "class" | "exam" | "assignment" | "break";
  color: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  events: ScheduleEvent[];
}

interface WeekSchedule {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
}

// Mock data for December 2023
const mockScheduleData: WeekSchedule = {
  weekStart: "December 12, 2023",
  weekEnd: "December 17, 2023", 
  days: [
    {
      date: "12 December 2023",
      dayName: "Day 1",
      events: [
        {
          id: "event1-1",
          title: "Your first Test",
          time: "14:00 - 15:00",
          instructor: "Dr. Smith",
          type: "exam",
          color: "bg-primary-500"
        },
        {
          id: "event2-1",
          title: "Your first Test",
          time: "08:00 - 13:00",
          instructor: "Prof. Johnson",
          location: "Room 101",
          type: "class",
          color: "bg-warning-500"
        }
      ]
    },
    {
      date: "13 December 2023", 
      dayName: "Day 2",
      events: [
        
      ]
    },
    {
      date: "14 December 2023",
      dayName: "Day 3", 
      events: [
        {
          id: "event3-1",
          title: "Your first Test",
          time: "14:00 - 15:00",
          instructor: "Dr. Wilson",
          type: "exam",
          color: "bg-warning-500"
        }
      ]
    },
    {
      date: "15 December 2023",
      dayName: "Day 4",
      events: [
        {
          id: "event4-1", 
          title: "Your first Test",
          time: "14:00 - 17:00",
          instructor: "Prof. Davis",
          location: "Lab 205",
          type: "class",
          color: "bg-error-500"
        }
      ]
    },
    {
      date: "16 December 2023",
      dayName: "Day 5", 
      events: [
        {
          id: "event5-1",
          title: "Your first Test", 
          time: "14:00 - 15:00",
          instructor: "Dr. Brown",
          type: "exam",
          color: "bg-primary-500"
        }
      ]
    },
    {
      date: "17 December 2023",
      dayName: "Day 6",
      events: [
        {
          id: "event6-1",
          title: "Your first Test",
          time: "11:00 - 12:00", 
          instructor: "Prof. Miller",
          type: "assignment",
          color: "bg-success-500"
        }
      ]
    },
    {
      date: "18 December 2023",
      dayName: "Day 7",
      events: []
    }
  ]
};

const ScheduleEventCard: React.FC<{ event: ScheduleEvent }> = ({ event }) => {
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "class": return "Class";
      case "exam": return "Exam";
      case "assignment": return "Assignment";
      case "break": return "Break";
      default: return "Event";
    }
  };

  return (
    <div className={`${event.color} text-white p-2 rounded-md text-xs`}>
      <div className="font-medium mb-1 text-xs truncate">{event.title}</div>
      <div className="flex items-center gap-1 mb-1">
        <Clock className="w-2.5 h-2.5" />
        <span className="text-xs">{event.time}</span>
      </div>
      <div className="flex items-center gap-1 mb-1">
        <User className="w-2.5 h-2.5" />
        <span className="text-xs truncate">{event.instructor}</span>
      </div>
      {event.location && (
        <div className="flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          <span className="text-xs truncate">{event.location}</span>
        </div>
      )}
    </div>
  );
};

const WeeklyCalendar: React.FC<{ schedule: WeekSchedule }> = ({ schedule }) => {
  return (
    <Card>
      <div className="p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="bg-primary-500 text-white px-3 py-1.5 rounded-md">
              <span className="text-sm font-medium">December 2023</span>
            </div>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left p-2 font-medium text-neutral-700 w-24">
                  <div className="text-xs">Schedule date</div>
                </th>
                {schedule.days.map((day, index) => (
                  <th key={day.date} className="text-center p-2 font-medium text-neutral-700 min-w-20">
                    <div className="text-xs">{day.dayName}</div>
                  </th>
                ))}
                <th className="text-left p-2 font-medium text-neutral-700 w-20">
                  <div className="text-xs">Notes</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.days.map((day, dayIndex) => (
                <tr key={day.date} className="border-b border-neutral-100">
                  {/* Date Column */}
                  <td className="p-2 text-xs text-neutral-600 align-top">
                    <div className="font-medium text-xs">{day.date.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-xs text-neutral-500">14:00-15:00</div>
                  </td>
                  
                  {/* Event Columns */}
                  {schedule.days.map((_, colIndex) => (
                    <td key={colIndex} className="p-1 align-top">
                      {colIndex === dayIndex && day.events.length > 0 ? (
                        <div className="space-y-1">
                          {day.events.map((event) => (
                            <ScheduleEventCard key={event.id} event={event} />
                          ))}
                        </div>
                      ) : colIndex === dayIndex ? (
                        <div className="h-12 flex items-center justify-center text-neutral-400 text-xs">
                          No events
                        </div>
                      ) : null}
                    </td>
                  ))}
                  
                  {/* Notes Column */}
                  <td className="p-2 text-xs text-neutral-500 align-top">
                    <div className="text-xs">Insert Your Statement</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default function Schedule() {
  const [currentWeek] = useState(mockScheduleData);

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Page Header - Compact */}
        <div className="mb-6">
          <PageHeader
            title="Van A's Schedule"
            subtitle="Manage your class schedule and upcoming events"
            actions={
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" iconLeft={<Calendar className="w-3 h-3" />}>
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button variant="primary" size="sm">
                  <span className="hidden sm:inline">Add Event</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            }
          />
        </div>

        {/* Schedule Title - Compact */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Schedule Agenda Company
          </h2>
        </div>

        {/* Weekly Calendar - Compact */}
        <WeeklyCalendar schedule={currentWeek} />
      </div>
    </StudentLayout>
  );
}