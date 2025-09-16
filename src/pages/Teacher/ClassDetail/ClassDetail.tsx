// src/pages/teacher/classes/[classId]/index.tsx

import { useState } from "react";
import TeacherLayout from "@/Shared/TeacherLayout";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
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
  { label: "My Courses", to: "/teacher/courses" },
  { label: "Classes", to: "/teacher/classes" },
  { label: "English For Beginner" }, // Tên khóa học, có thể lấy động
];

export default function ClassDetailPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const renderTabContent = () => {
    switch (activeTab) {
      case "sessions":
        return <SessionsTab />;

      default:
        return null;
    }
  };

  return (
    <TeacherLayout 
      crumbs={crumbs}
      pageHeader={{
        title: "English For Beginner",
        subtitle: "Manage class sessions, materials, and student progress",
        actions: (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-neutral-700 font-medium">22/24 Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-neutral-700 font-medium">Mon, Wed - 18:30</span>
              </div>
            </div>
          </div>
        )
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
    </TeacherLayout>
  );
}