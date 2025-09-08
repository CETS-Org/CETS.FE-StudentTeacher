// src/pages/teacher/classes/[classId]/index.tsx

import React, { useState } from "react";
import TeacherLayout from "@/Shared/TeacherLayout";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/card";

// Import các component cho từng tab
import SessionsTab from "@/pages/Teacher/ClassDetail/Component/SessionsTab";


// Định nghĩa các tab
const tabs = [
  { id: "sessions", label: "Sessions" },
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
    <TeacherLayout crumbs={crumbs}>
      <div className="p-4 md:p-6">
        {/* Breadcrumbs và Header */}
       

        {/* Tabs */}
        <Card className="border border-gray-200 shadow-md">
        <div className="bg-white p-1 rounded-lg shadow-sm">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId)}
            />
            <div className="mt-4 p-4 min-h-[607px] ">
                {renderTabContent()}
            </div>
        </div>
        </Card>
      </div>
      
    </TeacherLayout>
  );
}