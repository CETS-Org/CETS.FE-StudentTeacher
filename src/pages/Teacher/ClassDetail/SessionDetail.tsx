// src/pages/teacher/classes/[classId]/index.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { getClassMeetingCoveredTopic } from "@/api/classMeetings.api";
// Import các component cho từng tab

import CourseMaterialsTab from "@/pages/Teacher/ClassDetail/Component/CourseMaterialsTab";

import StudentsTab from "@/pages/Teacher/ClassDetail/Component/StudentsTab";
import SessionContentTab from "@/pages/Teacher/ClassDetail/Component/SessionContentTab";
import SessionAssignmentsTab from "@/pages/Teacher/ClassDetail/Component/SessionAssignmentsTab";


type SessionContent = {
  topicTitle: string;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
};


const tabs = [
  { id: "sessionContent", label: "Session Content" },
  { id: "sessionAssignment", label: "Assignments" },
  { id: "materials", label: "Course Materials" },
  { id: "students", label: "Classes" }, // "Classes" ở đây là danh sách sinh viên trong lớp
];

// Breadcrumbs
const crumbs: Crumb[] = [
  { label: "Classes", to: "/teacher/classes" },
  { label: "English For Beginner", to: "/teacher/classDetail" }, 
  { label: "Session 01" }, 
];

export default function ClassDetailPage() {
  const { id: classId, sessionId: classMeetingId } = useParams<{ id: string; sessionId: string }>();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [loadingContext, setLoadingContext] = useState(false);
  const [errorContext, setErrorContext] = useState<string | null>(null);
  const [sessionContent, setSessionContent] = useState<SessionContent | null>(null);

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

  const renderTabContent = () => {
    switch (activeTab) {
        
      case "sessionContent":
        if (loadingContext) {
          return (
            <div className="text-sm text-neutral-600">Loading session content...</div>
          );
        }
        if (errorContext) {
          return (
            <div className="text-sm text-danger-600">{errorContext}</div>
          );
        }
        if (sessionContent) {
          return <SessionContentTab content={sessionContent} />
        }
        return null;
      case "sessionAssignment":
        return <SessionAssignmentsTab classMeetingId={classMeetingId} />
      case "materials":
        return <CourseMaterialsTab />;
      case "students":
        // Kiểm tra classId và classMeetingId có tồn tại không
        if (!classId) {
          return (
            <div className="flex items-center justify-center py-12">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
                <p className="text-warning-700 font-medium">
                  Class ID is missing. Please check the URL.
                </p>
              </div>
            </div>
          );
        }
        if (!classMeetingId) {
          return (
            <div className="flex items-center justify-center py-12">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
                <p className="text-warning-700 font-medium">
                  Class Meeting ID is missing. Please check the URL.
                </p>
              </div>
            </div>
          );
        }
        return <StudentsTab classId={classId} classMeetingId={classMeetingId} />;
      default:
        return null;
    }
  };

  return (
    <div className=" px-4 py-6 sm:px-6 lg:px-8 space-y-8 ">
      <Breadcrumbs items={crumbs} />
      {/* Page Header */}
      <PageHeader
        title="English for Beginer - Session 01"
        description="Manage session content, assignments, materials, and student list."
       
      />

      {/* Tabs + Card */}
      <Card className="bg-white p-1 rounded-lg border border-gray-200 shadow-md ">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
        />
        <div className="mt-4 p-4 min-h-[607px]">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
}