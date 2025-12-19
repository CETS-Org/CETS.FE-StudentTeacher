// src/pages/teacher/classes/[classId]/index.tsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import type { ClassDetail } from "@/types/class";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import { Users, Calendar } from "lucide-react";
import { api } from "@/api";
import { getClassMeetingsByClassId } from "@/api/classMeetings.api";
import Loader from "@/components/ui/Loader";

// Import các component cho từng tab
import SessionsTab from "@/pages/Teacher/ClassDetail/Component/SessionsTab";

export default function ClassDetailPage() {
  const { id: classId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("sessions");
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch class details and sessions count
  useEffect(() => {
    const fetchClassDetail = async () => {
      if (!classId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class details
        const response = await api.getClassDetailsById(classId);
        setClassDetail(response.data);
        
        // Fetch sessions count
        const meetings = await getClassMeetingsByClassId(classId);
        setSessionsCount(meetings.length);
      } catch (err) {
        console.error('Error fetching class detail:', err);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]);

  // Định nghĩa các tab
  const tabs = [
    { id: "sessions", label: "Sessions", badge: sessionsCount, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
  ];

  // Breadcrumbs - using real data when available
  const crumbs: Crumb[] = classDetail
    ? [
        { label: "My Courses", to: "/teacher/courses" },
        { label: classDetail.courseName, to: `/teacher/courses/${classDetail.courseId}/classes` },
        { label: `Class ${classDetail.className}` },
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
          {error || 'Class not found'}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "sessions":
        return <SessionsTab classId={classId} />;

      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`${classDetail.courseName} - Class ${classDetail.className}`}
        description="Manage class sessions, materials, and student progress"
        icon={<Users className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'badge',
            label: `${classDetail.enrolledCount} Students`,
            icon: <Users className="w-4 h-4" />,
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