import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Users
} from "lucide-react";
import { getClassMeetingsByClassId, type ClassMeeting } from "@/services/teachingClassesService";
import type { MyClass } from "@/types/class";
import type { CourseSession } from "@/types/session";
import { getStudentId } from "@/lib/utils";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Loader from "@/components/ui/Loader";


function mapMeetingToCourseSession(meeting: ClassMeeting, index: number): CourseSession {
  const title = meeting.passcode || `Session ${index + 1}`;
  const dateDisplay = meeting.date && meeting.date !== "0001-01-01" ? meeting.date : "N/A";
  return {
    id: `${meeting.id}`,
    title,
    topic: meeting.isStudy ? "Study Session" : "Non-study Day",
    date: dateDisplay,
    duration: "",
    isCompleted: !meeting.isActive,
    isStudy: !!meeting.isStudy,
    submissionTasks: [],
    topicTitle: "",
    totalSlots: 0,
    required: true,
    objectives: [],
    contentSummary: "",
  };
}

// Simple Session Card Component
const SessionCard: React.FC<{ 
  session: CourseSession;
  onNavigate: (sessionId: string) => void;
}> = ({ session, onNavigate }) => {
  return (
    <div 
      className={`mb-4 border ${session.isStudy ? 'border-success-300 bg-success-50 hover:bg-success-100' : 'border-accent-200 bg-white hover:bg-accent-25'} hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg`}
      onClick={() => onNavigate(session.id)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${session.isStudy ? 'bg-success-500' : 'bg-accent-500'}`}>
            {session.isStudy ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Circle className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-primary-800 text-lg">{session.title}</h3>
            <p className="text-sm text-accent-600 font-medium">{session.topic}</p>
            <p className="text-xs text-neutral-500 mt-1">{session.topicTitle}</p>
          </div>
        </div>
        
        <div />
      </div>
    </div>
  );
};

export default function ClassSession() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [meetings, setMeetings] = useState<ClassMeeting[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [classNameHeader, setClassNameHeader] = useState<string | null>(null);
  const [courseTitleHeader, setCourseTitleHeader] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sessions");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!classId) {
        setError("Missing classId");
        setLoading(false);
        return;
      }
      
      // Check if user is authenticated
      const studentId = getStudentId();
      if (!studentId) {
        setError("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }
      
      try {
        const data = await getClassMeetingsByClassId(classId);
        if (isMounted) {
          setMeetings(data);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load sessions");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [classId]);

  // Load class name from localStorage cache `selectedClass`
  useEffect(() => {
    try {
      const cached = localStorage.getItem('selectedClass');
      if (!cached) return;
      if (cached.startsWith('{')) {
        const parsed = JSON.parse(cached) as Partial<MyClass>;
        if (parsed && typeof parsed.className === 'string' && parsed.className) {
          setClassNameHeader(parsed.className);
        }
        if (parsed && typeof parsed.courseName === 'string' && parsed.courseName) {
          setCourseTitleHeader(parsed.courseName);
        }
      } else {
        setClassNameHeader(cached);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const sessions: CourseSession[] = useMemo(() => {
    if (!meetings) return [];
    return meetings.map((m, idx) => mapMeetingToCourseSession(m, idx));
  }, [meetings]);

  const handleSessionClick = (sessionId: string) => {
    navigate(`/student/class/${classId}/session/${sessionId}`);
  };

  // Breadcrumbs - using real data when available
  const crumbs: Crumb[] = courseTitleHeader && classNameHeader
    ? [
        { label: "My Classes", to: "/student/my-classes" },
        { label: courseTitleHeader, to: "#" },
        { label: classNameHeader },
      ]
    : [
        { label: "My Classes", to: "/student/my-classes" },
        { label: "Loading..." },
      ];

  // Define tabs
  const tabs = [
    { id: "sessions", label: "Sessions", badge: sessions.length, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "sessions":
        return (
          <div className="space-y-4">
            {sessions.length === 0 && (
              <div className="text-sm text-neutral-600">No sessions found.</div>
            )}
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onNavigate={handleSessionClick}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={courseTitleHeader + ' - ' + classNameHeader || 'Class Sessions'}
        description={ 'Manage class sessions and materials'}
        icon={<Calendar className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: `${sessions.length} Session${sessions.length === 1 ? '' : 's'}`,
            variant: 'secondary',
            icon: <Clock className="w-4 h-4" />,
            className: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0'
          },
        ]}
      />
      {/* Tabs */}
      <Card className="shadow-lg border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
        <div className="bg-white p-1 rounded-lg">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId)}
          />
          <div className="mt-4 p-4 min-h-[607px]">
            {renderTabContent()}
          </div>
        </div>
      </Card>
    </div>
  );
}