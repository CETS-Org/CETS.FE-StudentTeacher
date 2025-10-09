// src/pages/teacher/classes/[classId]/index.tsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
// Import các component cho từng tab

import CourseMaterialsTab from "@/pages/Teacher/ClassDetail/Component/CourseMaterialsTab";

import StudentsTab from "@/pages/Teacher/ClassDetail/Component/StudentsTab";
import SessionContentTab from "@/pages/Teacher/ClassDetail/Component/SessionContentTab";
import SessionAssignmentsTab from "@/pages/Teacher/ClassDetail/Component/SessionAssignmentsTab";


const mockSessionContent = {
  topicTitle: "Unit 3: Introduction to Present Perfect Tense",
  objectives: [
    "Understand the structure of the present perfect tense.",
    "Differentiate between present perfect and simple past.",
    "Use 'for' and 'since' correctly.",
    "Apply the tense in real-life conversation scenarios."
  ],
  contentSummary: `This session will cover the fundamentals of the present perfect tense. 
We will start with the basic formula (have/has + past participle) and explore common use cases. 
Key activities will include interactive exercises, group discussions, and role-playing to practice conversational English.`,
  preReadingUrl: "https://www.example-english-grammar.com/present-perfect"
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

  // Debug: Log để kiểm tra
  console.log("SessionDetail - classId:", classId, "classMeetingId:", classMeetingId);

  const renderTabContent = () => {
    switch (activeTab) {
        
      case "sessionContent":
        return <SessionContentTab content={mockSessionContent} />
      case "sessionAssignment":
        return <SessionAssignmentsTab />
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
    <div className="p-4 md:p-6">
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