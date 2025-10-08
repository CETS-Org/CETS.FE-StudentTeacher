// src/pages/Teacher/SchedulePage.tsx
import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TeacherWeekSchedule from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";
import ScheduleRegistrationDialog, { type DaySchedule } from "@/pages/Teacher/SchedulePage/Component/ScheduleRegistrationDialog";
import { api } from "@/api";
import { getTeacherId } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar, BookOpen, Plus } from "lucide-react";
import type { Session } from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";
import { getTeacherSchedule } from "@/api/classMeetings.api";
import { getTeacherId } from "@/lib/utils";
import Loader from "@/components/ui/Loader";

/* ===== Types ===== */
interface TeacherScheduleApiResponse {
  date: string;
  dayOfWeek: string;
  slot: string;
  startTime: string;
  endTime: string;
  className: string;
  courseName: string;
  room: string;
  enrolledCount: number;
  capacity: number;
  onlineMeetingUrl: string | null;
}

/* ===== Helpers ===== */
function transformScheduleToSessions(scheduleData: TeacherScheduleApiResponse[]): Session[] {
  return scheduleData.map((item, index) => {
    // Combine date and time to create ISO format: "YYYY-MM-DDTHH:mm:ss"
    const dateOnly = item.date.split('T')[0]; // "2025-10-05"
    const startDateTime = `${dateOnly}T${item.startTime}:00`; // "2025-10-05T09:00:00"
    
    // Calculate duration from start and end time
    const [startHour, startMin] = item.startTime.split(':').map(Number);
    const [endHour, endMin] = item.endTime.split(':').map(Number);
    const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    // Determine attendance status based on date
    const sessionDate = new Date(item.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendanceStatus: "attended" | "absent" | "upcoming" = "upcoming";
    if (sessionDate < today) {
      // For past sessions, randomly set attended or absent (you can modify this logic)
      attendanceStatus = Math.random() > 0.3 ? "attended" : "absent";
    }

    return {
      id: `${item.className}-${item.slot}-${index}`,
      title: item.courseName,
      classCode: item.className,
      room: item.room,
      start: startDateTime,
      durationMin: durationMin,
      attendanceStatus: attendanceStatus,
    };
  });
}

export default function SchedulePage() {
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: "Schedule" }
  ];

  // Fetch teacher schedule on component mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const teacherId = getTeacherId();
        if (!teacherId) {
          setError("Teacher ID not found. Please login again.");
          return;
        }

        console.log("Fetching schedule for teacher ID:", teacherId);
        const response = await getTeacherSchedule(teacherId);
        
        const transformedSessions = transformScheduleToSessions(response.data);
        setSessions(transformedSessions);
        
      } catch (err: any) {
        console.error("Error fetching teacher schedule:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleRegisterClick = () => {
    setIsRegistrationDialogOpen(true);
  };

  const handleRegistrationDialogClose = () => {
    setIsRegistrationDialogOpen(false);
  };

  const handleRegistrationSubmit = async (daySchedules: DaySchedule) => {
    const teacherId = getTeacherId();
    if (!teacherId) {
      console.error('Missing teacher id');
      return;
    }

    // Map dialog values -> backend payloads
    const toDayOfWeekEnum = (label: string): number => {
      const map: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };
      return map[label.toLowerCase()] ?? 0;
    };

    try {
      const entries = Object.entries(daySchedules);
      for (const [day, slots] of entries) {
        const dayEnum = toDayOfWeekEnum(day);
        // For each selected slot, create an availability. In a real app, slots should be TimeSlot IDs
        for (const timeSlotId of slots) {
          await api.createTeacherAvailability({
            teacherID: teacherId,
            teachDay: dayEnum,
            timeSlotID: timeSlotId,
          });
        }
      }
      console.log('Schedule registration submitted');
    } catch (err) {
      console.error('Failed to register schedule', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

        
        <PageHeader
          title="My Teaching Schedule"
          description="View and manage your weekly teaching schedule"
          icon={<Calendar className="w-5 h-5 text-white" />}
          controls={[
            {
              type: 'button',
              label: 'Register for Schedule',
              variant: 'primary',
              icon: <Plus className="w-4 h-4" />,
              onClick: handleRegisterClick
            },
           
            {
              type: 'button',
              label: 'View All Classes',
              variant: 'secondary',
              icon: <BookOpen className="w-4 h-4" />
            }
          ]}
        />

        {/* Schedule Grid */}
        <div className="bg-white rounded-xl border border-accent-200 shadow-lg">
          <TeacherWeekSchedule sessions={sessions} startHour={9} slots={5} slotMinutes={90} />
        </div>

        {/* Schedule Registration Dialog */}
        <ScheduleRegistrationDialog
          isOpen={isRegistrationDialogOpen}
          onClose={handleRegistrationDialogClose}
          onSubmit={handleRegistrationSubmit}
        />
    </div>
  );
}

