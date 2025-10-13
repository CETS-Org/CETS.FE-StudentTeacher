import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  NotebookPen,
  Globe,
  MapPin,
  Video
} from "lucide-react";
import { getClassMeetingsByClassId, type ClassMeeting } from "@/api/classMeetings.api";
import type { MyClass } from "@/types/class";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Loader from "@/components/ui/Loader";

// Session Card Component (matching teacher's design)
const SessionCard: React.FC<{ 
  session: ClassMeeting;
  sessionNumber: number;
  onNavigate: (sessionId: string) => void;
}> = ({ session, sessionNumber, onNavigate }) => {
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-6 border border-accent-100 shadow-lg bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <NotebookPen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-primary-800 text-lg">
                Session {sessionNumber}
              </h3>
              {session.isStudy && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-success-400 to-success-500 text-white">
                  Study Session
                </span>
              )}
              {!session.isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-neutral-400 to-neutral-500 text-white">
                  Inactive
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar className="w-4 h-4 text-accent-500" />
                <span className="font-medium">{formatDate(session.date)}</span>
              </div>
              
              {session.onlineMeetingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Globe className="w-4 h-4 text-accent-500" />
                  <span className="font-medium">Online Meeting</span>
                  {session.passcode && (
                    <span className="ml-2 px-2 py-1 bg-accent-100 rounded text-xs font-semibold text-accent-700">
                      Code: {session.passcode}
                    </span>
                  )}
                </div>
              )}
              
              {session.roomID && !session.onlineMeetingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-accent-500" />
                  <span className="font-medium">In-person</span>
                </div>
              )}
              
              {session.recordingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Video className="w-4 h-4 text-accent-500" />
                  <span className="font-medium">Recording Available</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 lg:flex-shrink-0">
          {session.onlineMeetingUrl && (
            <Button 
              variant="secondary" 
              className="border-accent-300 text-accent-700 hover:bg-accent-50"
              onClick={() => window.open(session.onlineMeetingUrl!, '_blank')}
              iconLeft={<Globe className="w-4 h-4" />}
            >
              Join
            </Button>
          )}
          <Button 
            variant="primary" 
            className="btn-secondary"
            onClick={() => onNavigate(session.id)}
          >
            Go to Session
          </Button>
        </div>
      </div>
    </Card>
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
    const fetchMeetings = async () => {
      if (!classId) {
        setError("Missing classId");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await getClassMeetingsByClassId(classId);
        setMeetings(data);
      } catch (e: any) {
        console.error('Error fetching class meetings:', e);
        setError(e?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
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
    { id: "sessions", label: "Sessions", badge: meetings?.length || 0, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
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
            {(!meetings || meetings.length === 0) && (
              <div className="text-sm text-neutral-600">No sessions found.</div>
            )}
            {meetings && meetings.map((meeting, index) => (
              <SessionCard
                key={meeting.id}
                session={meeting}
                sessionNumber={index + 1}
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
            label: `${meetings?.length || 0} Session${(meetings?.length || 0) === 1 ? '' : 's'}`,
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