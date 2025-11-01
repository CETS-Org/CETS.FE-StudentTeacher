// src/pages/Teacher/SchedulePage.tsx
import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TeacherWeekSchedule from "@/pages/Teacher/SchedulePage/Component/TeacherWeekSchedule";
import ScheduleRegistrationDialog from "@/pages/Teacher/SchedulePage/Component/ScheduleRegistrationDialog";
import { api } from "@/api";
import { getTeacherId } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar, BookOpen, Plus } from "lucide-react";
import { getTeacherSchedule } from "@/api/classMeetings.api";
import Loader from "@/components/ui/Loader";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import type { 
  DaySchedule, 
  Session, 
  TeacherScheduleApiResponse 
} from "@/types/teacherSchedule";

function getErrorMessage(error: any, fallback = 'An error occurred'): string {
  const data = error.response?.data;
  return data;
 
}

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
      attendanceStatus = "attended";
    }

    return {
      id: `${item.className}-${item.slot}-${index}`,
      title: item.courseName,
      classCode: item.className,
      classId: item.classId, 
      room: item.room,
      start: startDateTime,
      durationMin: durationMin,
      attendanceStatus: attendanceStatus,
      onlineMeetingUrl: item.onlineMeetingUrl,
    };
  });
}

export default function SchedulePage() {
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, hideToast, success, error: showError } = useToast();

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
        setError(getErrorMessage(err, "Failed to fetch schedule"));
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
      showError('Missing teacher ID. Please login again.');
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
      let successCount = 0;
      let failedCount = 0;
      let lastError = '';

      for (const [day, slots] of entries) {
        const dayEnum = toDayOfWeekEnum(day);
        for (const timeSlotId of slots) {
          try {
            await api.createTeacherAvailability({
              teacherID: teacherId,
              teachDay: dayEnum,
              timeSlotID: timeSlotId,
            });
            successCount++;
          } catch (slotErr: any) {
            failedCount++;
            lastError = getErrorMessage(slotErr, 'Unknown error');
            console.error('Failed to register time slot', slotErr);
          }
        }
      }

      // Show appropriate toast based on results
      if (failedCount === 0) {
        success(`Successfully registered ${successCount} time slot${successCount !== 1 ? 's' : ''}!`);
      } else if (successCount > 0) {
        showError(`Registered ${successCount} slot${successCount !== 1 ? 's' : ''}, but ${failedCount} failed. ${lastError}`);
      } else {
        showError(`Failed to register schedule: ${lastError}`);
      }
    } catch (err: any) {
      console.error('Failed to register schedule', err);
      showError(getErrorMessage(err, 'Failed to register schedule'));
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

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
    </div>
  );
}

