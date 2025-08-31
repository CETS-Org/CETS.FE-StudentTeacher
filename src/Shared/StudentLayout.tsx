import React from "react";
import StudentSidebar from "./StudentSidebar";

interface StudentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <StudentSidebar />
      
      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;