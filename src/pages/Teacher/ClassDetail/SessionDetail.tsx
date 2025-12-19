// src/pages/teacher/classes/[classId]/index.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import type { ClassDetail } from "@/types/class";
import type { SessionContent } from "@/types/session";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import Loader from "@/components/ui/Loader";
import { getClassMeetingCoveredTopic, getClassMeetingsByClassId, type ClassMeeting } from "@/api/classMeetings.api";
import { api } from "@/api";
// Import các component cho từng tab

import CourseMaterialsTab from "@/pages/Teacher/ClassDetail/Component/CourseMaterialsTab";

import StudentsTab from "@/pages/Teacher/ClassDetail/Component/StudentsTab";
import SessionContentTab from "@/pages/Teacher/ClassDetail/Component/SessionContentTab";
import SessionAssignmentsTab from "@/pages/Teacher/ClassDetail/Component/SessionAssignmentsTab";


const tabs = [
  { id: "sessionContent", label: "Session Content" },
  { id: "sessionAssignment", label: "Assignments" },
  { id: "materials", label: "Materials" },
  { id: "students", label: "Classes" }, // "Classes" ở đây là danh sách sinh viên trong lớp
];

export default function ClassDetailPage() {
  const { id: classId, sessionId: classMeetingId } = useParams<{ id: string; sessionId: string }>();
  
  // Persist active tab in localStorage
  const getInitialTab = () => {
    if (typeof window !== 'undefined' && classMeetingId) {
      const saved = localStorage.getItem(`sessionTab_${classMeetingId}`);
      // Validate that the saved tab exists in tabs array
      if (saved && tabs.some(tab => tab.id === saved)) {
        return saved;
      }
    }
    return tabs[0].id;
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (classMeetingId && activeTab) {
      localStorage.setItem(`sessionTab_${classMeetingId}`, activeTab);
    }
  }, [activeTab, classMeetingId]);
  const [loadingContext, setLoadingContext] = useState(false);
  const [errorContext, setErrorContext] = useState<string | null>(null);
  const [sessionContent, setSessionContent] = useState<SessionContent | null>(null);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [currentMeeting, setCurrentMeeting] = useState<ClassMeeting | null>(null);
  const [sessionNumber, setSessionNumber] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log để kiểm tra
  // console.log("SessionDetail - classId:", classId, "classMeetingId:", classMeetingId);

  // Helper to parse objectives string from API to string[]
  const parseObjectives = (raw?: string | null): string[] => {
    if (!raw) return [];
    const trimmed = raw.trim();
    try {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      }
    } catch {}
    return trimmed
      .split(/\r?\n|;|•|,/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  // Fetch class details and meeting info
  useEffect(() => {
    const loadClassAndMeetingDetails = async () => {
      if (!classId || !classMeetingId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class details
        const classResponse = await api.getClassDetailsById(classId);
        setClassDetail(classResponse.data);
        
        // Fetch all meetings to find the current one and its session number
        const meetings = await getClassMeetingsByClassId(classId);
        const meetingIndex = meetings.findIndex(m => m.id === classMeetingId);
        const meeting = meetings.find(m => m.id === classMeetingId);
        
        if (meeting) {
          setCurrentMeeting(meeting);
          // Use passcode if available, otherwise use session number
          const sessionNum = meeting.passcode || `Session ${meetingIndex + 1}`;
          setSessionNumber(sessionNum);
        }
      } catch (err) {
        console.error('Error fetching class/meeting details:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    loadClassAndMeetingDetails();
  }, [classId, classMeetingId]);

  // Fetch covered topic for this session
  useEffect(() => {
    const loadCoveredTopic = async () => {
      if (!classMeetingId) return;
      try {
        setLoadingContext(true);
        setErrorContext(null);
        const res = await getClassMeetingCoveredTopic(classMeetingId);
        const data = res.data as any;
        const content: SessionContent = {
          topicTitle: data?.topicTitle ?? "",
          objectives: parseObjectives(data?.objectives),
          contentSummary: data?.contentSummary ?? "",
          preReadingUrl: data?.preReadingUrl ?? undefined,
        };
        setSessionContent(content);
      } catch (err) {
        console.error("Failed to load covered topic:", err);
        setErrorContext("Failed to load session content. Please try again later.");
        setSessionContent(null);
      } finally {
        setLoadingContext(false);
      }
    };

    loadCoveredTopic();
  }, [classMeetingId]);

  // Render all tabs but show/hide based on activeTab
  const renderAllTabs = () => {
    return (
      <>
        {/* Session Content Tab */}
        <div className={activeTab === "sessionContent" ? "block" : "hidden"}>
          {loadingContext ? (
            <div className="text-sm text-neutral-600">Loading session content...</div>
          ) : errorContext ? (
            <div className="text-sm text-danger-600">{errorContext}</div>
          ) : sessionContent ? (
            <SessionContentTab content={sessionContent} />
          ) : null}
        </div>

        {/* Assignments Tab */}
        <div className={activeTab === "sessionAssignment" ? "block" : "hidden"}>
          <SessionAssignmentsTab classMeetingId={classMeetingId} />
        </div>

        {/* Materials Tab */}
        <div className={activeTab === "materials" ? "block" : "hidden"}>
          <CourseMaterialsTab />
        </div>

        {/* Students Tab */}
        <div className={activeTab === "students" ? "block" : "hidden"}>
          {!classId ? (
            <div className="flex items-center justify-center py-12">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
                <p className="text-warning-700 font-medium">
                  Class ID is missing. Please check the URL.
                </p>
              </div>
            </div>
          ) : !classMeetingId ? (
            <div className="flex items-center justify-center py-12">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
                <p className="text-warning-700 font-medium">
                  Class Meeting ID is missing. Please check the URL.
                </p>
              </div>
            </div>
          ) : (
            <StudentsTab classId={classId} classMeetingId={classMeetingId} className={classDetail?.className} />
          )}
        </div>
      </>
    );
  };

  // Breadcrumbs - using real data when available
  const crumbs: Crumb[] = classDetail
    ? [
        { label: "My Courses", to: "/teacher/courses" },
        { label: classDetail.courseName, to: `/teacher/courses/${classDetail.courseId}/classes` },
        { label: `Class ${classDetail.className}`, to: `/teacher/class/${classId}` },
        { label: sessionNumber || "Session" },
      ]
    : [
        { label: "My Courses", to: "/teacher/courses" },
        { label: "Loading..." },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !classDetail) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">
          {error || 'Session not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs items={crumbs} />
      {/* Page Header */}
      <PageHeader
        title={`${classDetail.courseName} - ${sessionNumber || 'Session'}`}
        description="Manage session content, assignments, materials, and student list."
      />

      {/* Tabs + Card */}
      <Card className="shadow-lg border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
        <div className="bg-white p-1 rounded-lg">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId)}
          />
          <div className="mt-4 p-4 min-h-[607px]">
            {renderAllTabs()}
          </div>
        </div>
      </Card>
    </div>
  );
}