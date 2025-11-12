// src/pages/student/classes/[classId]/SessionsTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  NotebookPen,
  Globe,
  MapPin,
  Video,
  Sparkles,
  CheckCircle,
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

/* ------------ Helpers ------------- */
const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const formatDateLong = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ------------ Session Card ------------- */
const SessionCard: React.FC<{
  session: ClassMeeting;
  sessionNumber: number;       // -> luôn là số thứ tự theo ngày
  onNavigate: (sessionId: string) => void;
  isNext?: boolean;
  isCompleted?: boolean;
}> = ({ session, sessionNumber, onNavigate, isNext, isCompleted }) => {
  return (
    <Card
      className={[
        "p-6 border bg-white transition-all duration-300 hover:shadow-lg",
        isNext
          ? "relative border-2 border-primary-500 ring-2 ring-primary-300 shadow-xl"
          : "border-accent-100 shadow-md",
      ].join(" ")}
    >
      {/* Ribbon NEXT */}
      {isNext && (
        <div className="absolute -top-2 -left-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-primary-600 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Next session
            <span className="relative ml-1 inline-flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={[
              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
              isNext ? "bg-primary-600 shadow-md" : "bg-gradient-to-br from-primary-500 to-primary-600",
            ].join(" ")}
          >
            <NotebookPen className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-primary-800 text-lg">
                Session {sessionNumber}
              </h3>

              {session.isStudy && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                  Up Comming
                </span>
              )}

              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-success-600 text-white">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span>{formatDateLong(session.date)}</span>
              </div>

              {session.onlineMeetingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>Online meeting</span>
                  {session.passcode && (
                    <span className="ml-2 px-2 py-1 bg-neutral-100 rounded text-xs font-semibold text-primary-800">
                      Code: {session.passcode}
                    </span>
                  )}
                </div>
              )}

              {session.roomID && !session.onlineMeetingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>Room: {session.roomID}</span>
                </div>
              )}

              {!session.roomID && session.onlineMeetingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>Online</span>
                </div>
              )}

              {session.recordingUrl && (
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Video className="w-4 h-4 text-primary-600" />
                  <span>Recording Available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {session.onlineMeetingUrl && !isCompleted && (
            <Button
              variant="secondary"
              className="border-primary-300 text-primary-700 hover:bg-primary-50"
              onClick={() => window.open(session.onlineMeetingUrl!, "_blank")}
              iconLeft={<Globe className="w-4 h-4" />}
            >
              Join
            </Button>
          )}

          <Button variant="primary" onClick={() => onNavigate(session.id)}>
            Go to Session
          </Button>
        </div>
      </div>
    </Card>
  );
};

/* ------------ Page ------------- */
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
        // sort tăng dần theo ngày (thứ tự CHRONOLOGICAL)
        const sorted = [...data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setMeetings(sorted);
      } catch (e: any) {
        console.error("Error fetching class meetings:", e);
        setError(e?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [classId]);

  // Map: meetingId -> sessionNumber (theo thứ tự ngày)
  const numberById = useMemo(() => {
    const map: Record<string, number> = {};
    (meetings ?? []).forEach((m, i) => {
      map[m.id] = i + 1; // Session number theo chronological order
    });
    return map;
  }, [meetings]);

  // Ghim BUỔI HỌC TIẾP THEO (date >= hôm nay & isActive === true). Nếu không có, không ghim.
  const ordered = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];
    const today = stripTime(new Date());
    const nextIdx = meetings.findIndex(
      (m) => stripTime(new Date(m.date)) >= today && m.isActive
    );
    if (nextIdx < 0) return meetings; // không có next trong tương lai
    const next = meetings[nextIdx];
    const rest = meetings.filter((_, i) => i !== nextIdx);
    return [next, ...rest];
  }, [meetings]);

  const nextId = useMemo(() => ordered[0]?.id ?? null, [ordered]);

  // Completed = isActive === false
  const completedCount = useMemo(
    () => (meetings ? meetings.filter((m) => !m.isStudy).length : 0),
    [meetings]
  );

  // Load header from localStorage cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem("selectedClass");
      if (!cached) return;
      if (cached.startsWith("{")) {
        const parsed = JSON.parse(cached) as Partial<MyClass>;
        if (parsed?.className) setClassNameHeader(parsed.className);
        if (parsed?.courseName) setCourseTitleHeader(parsed.courseName);
      } else {
        setClassNameHeader(cached);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSessionClick = (sessionId: string) => {
    navigate(`/student/class/${classId}/session/${sessionId}`);
  };

  // Breadcrumbs
  const crumbs: Crumb[] =
    courseTitleHeader && classNameHeader
      ? [
          { label: "My Classes", to: "/student/my-classes" },
          { label: courseTitleHeader, to: "#" },
          { label: classNameHeader },
        ]
      : [
          { label: "My Classes", to: "/student/my-classes" },
          { label: "Loading..." },
        ];

  const tabs = [
    {
      id: "sessions",
      label: "Sessions",
      badge: meetings?.length || 0,
      color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white",
    },
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
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  const total = meetings?.length ?? 0;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={
          (courseTitleHeader && classNameHeader
            ? `${courseTitleHeader} - ${classNameHeader}`
            : "Class Sessions") as string
        }
        description={"Manage class sessions and materials"}
        icon={<Calendar className="w-5 h-5 text-white" />}
        controls={[
          {
            type: "button",
            label: `${total} Session${total === 1 ? "" : "s"}`,
            variant: "secondary",
            icon: <Clock className="w-4 h-4" />,
            className:
              "bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0",
          },
        ]}
      />

      {/* Progress completed / total */}
      <Card className="border border-accent-100 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-primary-800 font-semibold">
            <CheckCircle className="w-4 h-4 text-success-600" />
            Session Progress: {completedCount} / {total}
          </div>
        </div>
        <div className="h-2 w-full bg-neutral-200 rounded">
          <div
            className="h-2 bg-success-500 rounded"
            style={{ width: `${percent}%` }}
          />
        </div>
      </Card>

      <Card className="shadow-lg border border-accent-100 bg-white">
        <div className="bg-white p-1 rounded-lg">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-4 p-4 min-h-[607px]">
            {activeTab === "sessions" && (
              <div className="space-y-4">
                {ordered.length === 0 && (
                  <div className="text-sm text-neutral-600">No sessions found.</div>
                )}
                {ordered.map((meeting) => (
                  <SessionCard
                    key={meeting.id}
                    session={meeting}
                    // số thứ tự LUÔN lấy theo chronological order
                    sessionNumber={numberById[meeting.id]}
                    isNext={meeting.id === nextId}
                    isCompleted={!meeting.isStudy}
                    onNavigate={handleSessionClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
