import React from "react";
import StudentLayout from "../../Shared/StudentLayout";
import ReportIssue from "./ReportIssue";

const AcademicReport: React.FC = () => {
  return (
    <StudentLayout>
      <ReportIssue />
    </StudentLayout>
  );
};

export default AcademicReport;