import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocation, useNavigate } from "react-router-dom";
import TechnicalIssueReportPopup from "@/pages/Common/components/TechnicalIssueReportPopup";
import AcademicChangeRequestPopup from "@/pages/Common/components/AcademicChangeRequestPopup";

interface ReportItem {
  id: string;
  title: string;
  type: "Technical" | "Academic";
  date: string;
  status: "Pending" | "Resolved" | "Responsed";
}

const sampleReports: ReportItem[] = [
  {
    id: "1",
    title: "Classroom Projector Not Working",
    type: "Technical",
    date: "Jan 15, 2025",
    status: "Pending"
  },
  {
    id: "2", 
    title: "Student Attendance Issue",
    type: "Academic",
    date: "Jan 12, 2025",
    status: "Pending"
  },
  {
    id: "3",
    title: "Wi-Fi Connection Problems",
    type: "Technical", 
    date: "Jan 10, 2025",
    status: "Responsed"
  }
];

const ReportIssue: React.FC = () => {
  usePageTitle("Report Issues");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [showTechnicalPopup, setShowTechnicalPopup] = useState(false);
  const [showAcademicPopup, setShowAcademicPopup] = useState(false);
  const [reports, setReports] = useState(sampleReports);

  // Determine current report type from URL
  const currentReportType = location.pathname.includes("technical") ? "Technical" : "Academic";
  const pageTitle = currentReportType === "Technical" ? "Technical Issues" : "Academic Change Requests";
  const filteredReports = reports.filter(report => report.type === currentReportType);

  const pendingReports = filteredReports.filter(report => report.status === "Pending");
  const resolvedReports = filteredReports.filter(report => report.status === "Resolved");

  const handleTechnicalSubmit = (data: any) => {
    const newReport: ReportItem = {
      id: Date.now().toString(),
      title: data.title,
      type: "Technical",
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: "Pending"
    };
    setReports(prev => [newReport, ...prev]);
  };

  const handleAcademicSubmit = (data: any) => {
    const newReport: ReportItem = {
      id: Date.now().toString(),
      title: `Class Change: ${data.fromClass} → ${data.toClass}`,
      type: "Academic",
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: "Pending"
    };
    setReports(prev => [newReport, ...prev]);
  };

  const handleReportClick = () => {
    if (currentReportType === "Technical") {
      setShowTechnicalPopup(true);
    } else {
      setShowAcademicPopup(true);
    }
  };

  const handleViewDetails = (reportId: string) => {
    navigate(`/student/report-issue/detail/${reportId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Responsed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Technical" 
      ? "bg-gray-100 text-gray-700" 
      : "bg-blue-100 text-blue-700";
  };

  const renderReports = (reports: ReportItem[]) => {
    if (reports.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No reports found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">{report.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                    {report.type}
                  </span>
                  <span>{report.date}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleViewDetails(report.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <button 
            onClick={handleReportClick}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {currentReportType === "Technical" ? "Report Issue" : "Request Change"}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending Reports
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "resolved"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Resolved Reports
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === "pending" ? renderReports(pendingReports) : renderReports(resolvedReports)}
        </div>

        {/* Popups */}
        <TechnicalIssueReportPopup
          isOpen={showTechnicalPopup}
          onClose={() => setShowTechnicalPopup(false)}
          onSubmit={handleTechnicalSubmit}
        />
        
        <AcademicChangeRequestPopup
          isOpen={showAcademicPopup}
          onClose={() => setShowAcademicPopup(false)}
          onSubmit={handleAcademicSubmit}
        />
      </div>
    </div>
  );
};

export default ReportIssue;