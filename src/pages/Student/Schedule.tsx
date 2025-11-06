import React, { useState, useEffect } from "react";
import StudentWeekSchedule from "@/pages/Student/components/StudentWeekSchedule";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/ui/Spinner";
import { Calendar, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import type { StudentSession } from "@/pages/Student/components/StudentWeekSchedule";
import { useNavigate } from "react-router-dom";
import { scheduleService } from "@/services/scheduleService";
import { getStudentId } from "@/lib/utils";

/* ===== Helpers: tuần hiện tại + format yyyy:MM:dd:HH:mm ===== */
const mondayOfThisWeek = (() => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
})();

function dateOfThisWeek(offsetDay: number, h: number, m: number) {
  const d = new Date(mondayOfThisWeek);
  d.setDate(d.getDate() + offsetDay);
  d.setHours(h, m, 0, 0);
  return d;
}

function fmtCustom(d: Date) {
  const zp = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}:${zp(d.getMonth() + 1)}:${zp(d.getDate())}:${zp(d.getHours())}:${zp(
    d.getMinutes()
  )}`;
}

// Empty sessions array - will be populated from API
const emptySessions: StudentSession[] = [];

export default function Schedule() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StudentSession[]>(emptySessions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const breadcrumbItems = [
    { label: "Schedule" }
  ];

  // Fetch schedule data from API
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from authentication
        const studentId = getStudentId();
        if (!studentId) {
          setError('User not authenticated. Please login again.');
          setSessions(emptySessions);
          return;
        }
        
        const { data, error: fetchError } = await scheduleService.getStudentScheduleSafe(studentId);
        
        if (fetchError) {
          setError(fetchError);
          setSessions(emptySessions);
        } else {
          setSessions((data as StudentSession[]) || emptySessions);
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to load schedule data');
        setSessions(emptySessions);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  // Retry function
  const handleRetry = () => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from authentication
        const studentId = getStudentId();
        if (!studentId) {
          setError('User not authenticated. Please login again.');
          setSessions(emptySessions);
          return;
        }
        
        const { data, error: fetchError } = await scheduleService.getStudentScheduleSafe(studentId);
        
        if (fetchError) {
          setError(fetchError);
          setSessions(emptySessions);
        } else {
          setSessions((data as StudentSession[]) || emptySessions);
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to load schedule data');
        setSessions(emptySessions);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  };

  return (
    <div className="p-6 max-w-full space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <PageHeader
          title="My Schedule"
          description="View and manage your weekly class schedule"
          icon={<Calendar className="w-5 h-5 text-white" />}
          controls={[
            {
              type: 'button',
              label: 'View My Classes',
              variant: 'secondary',
              icon: <BookOpen className="w-4 h-4" />,
              onClick: () => {
                navigate('/student/my-classes');
              }
            }
          ]}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-neutral-600">Loading your schedule...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to Load Schedule</h3>
            <p className="text-neutral-600 text-center mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Schedule Grid */}
        {!loading && !error && (
          <div className="bg-white rounded-xl border border-accent-200 shadow-lg">
            <StudentWeekSchedule
              sessions={sessions}
              startHour={9}
              slots={5}
              slotMinutes={90}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Schedule Found</h3>
            <p className="text-neutral-600 text-center">You don't have any scheduled classes yet.</p>
          </div>
        )}
    </div>
  );
}