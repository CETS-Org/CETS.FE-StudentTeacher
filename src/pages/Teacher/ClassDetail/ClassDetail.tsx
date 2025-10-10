// src/pages/teacher/classes/[classId]/index.tsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { Users, Calendar } from "lucide-react";

// Import các component cho từng tab
import SessionsTab from "@/pages/Teacher/ClassDetail/Component/SessionsTab";

// Mock sessions data (should match SessionsTab data)
const mockSessions = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Session ${i + 1}`,
}));

// Định nghĩa các tab
const tabs = [
  { id: "sessions", label: "Sessions", badge: mockSessions.length, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
];

// Breadcrumbs
const crumbs: Crumb[] = [
  { label: "Classes", to: "/teacher/classes" },
  { label: "English For Beginner" }, // Tên khóa học, có thể lấy động
];

export default function ClassDetailPage() {
  const { id: classId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const renderTabContent = () => {
    switch (activeTab) {
      case "sessions":
        return <SessionsTab classId={classId} />;

      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title="English For Beginner"
        description="Manage class sessions, materials, and student progress"
        icon={<Users className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: '22/24 Students',
            variant: 'secondary',
            icon: <Users className="w-4 h-4" />,
            className: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0'
          },
          {
            type: 'button',
            label: 'Mon, Wed - 18:30',
            variant: 'secondary',
            icon: <Calendar className="w-4 h-4" />,
            className: 'bg-gradient-to-br from-accent-500 to-accent-600 text-white border-0'
          }
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