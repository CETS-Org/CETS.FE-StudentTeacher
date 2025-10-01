import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle,
  ArrowLeft,
  Circle
} from "lucide-react";
import { getClassMeetingsByClassId, type ClassMeeting } from "@/services/teachingClassesService";
import type { MyClass } from "@/types/class";

// Session interface
interface CourseSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration: string;
  isCompleted: boolean;
  isStudy: boolean;
  submissionTasks: SubmissionTask[];
  // Session Context fields
  topicTitle: string;
  totalSlots: number;
  required: boolean;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
}

interface SubmissionTask {
  id: string;
  title: string;
  sessionId: string;
  isSubmitted: boolean;
}

// CourseMaterial type removed (not used)

// Assignment type removed (not used)

// Minimal course detail removed; sessions are directly derived from meetings

// Helper to map API meeting to UI session
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

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!classId) {
        setError("Missing classId");
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

  const goBack = () => {
    navigate('/student/my-classes');
  };

  return (
    <div className="p-6 max-w-full space-y-8">
      <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">My Classes</span>
          </button>
        </div>

        {/* Class Header (mirrors session header style) */}
        <div className="flex items-center justify-between mb-8 p-6 border border-accent-200 rounded-xl bg-white">
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-800 mb-1">
                {classNameHeader ?? 'Class Sessions'}
              </h1>
              {courseTitleHeader && (
                <p className="text-accent-600 text-base">{courseTitleHeader}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-accent-100 px-3 py-2 rounded-lg mb-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-primary-700">
                {(() => {
                  const next = (meetings || []).find(m => m.date && m.date !== '0001-01-01');
                  return next ? next.date : 'N/A';
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-100 px-3 py-2 rounded-lg w-fit ml-auto">
              <Clock className="w-4 h-4 text-neutral-600" />
              <span className="font-medium text-neutral-700">{sessions.length} session{sessions.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">Class Sessions</h2>
          {loading && (
            <div className="text-sm text-neutral-600">Loading sessions...</div>
          )}
          {error && !loading && (
            <div className="text-sm text-danger-600">{error}</div>
          )}
          {!loading && !error && sessions.length === 0 && (
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
      </div>
    </div>
  );
}