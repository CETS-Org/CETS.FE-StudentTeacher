// src/pages/teacher/classes/[classId]/index.tsx

import React, { useState } from "react";
import TeacherLayout from "@/Shared/TeacherLayout";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/card";
import PageHeader from "@/pages/Teacher/ClassDetail/Component/PageHeader";

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
  { label: "My Courses", to: "/teacher/courses" },
  { label: "Classes", to: "/teacher/classes" },
  { label: "English For Beginner", to: "/teacher/classDetail" }, 
  { label: "Session 01" }, 
];

export default function ClassDetailPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const renderTabContent = () => {
    switch (activeTab) {
        
      case "sessionContent":
        return <SessionContentTab content={mockSessionContent} />
      case "sessionAssignment":
        return <SessionAssignmentsTab />
      case "materials":
        return <CourseMaterialsTab />;
      case "students":
        return <StudentsTab />;
      default:
        return null;
    }
  };

  return (
  <TeacherLayout crumbs={crumbs}>
      <div className="p-4 md:p-6">
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
    </TeacherLayout>

  );
}