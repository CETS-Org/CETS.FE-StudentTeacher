import React, { useState, useEffect } from "react";
import { AlertTriangle, Calendar, FileText, ChevronRight } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TechnicalIssueReportPopup from "@/pages/Common/components/TechnicalIssueReportPopup";
import AcademicChangeRequestPopup from "@/pages/Common/components/AcademicChangeRequestPopup";
import AcademicRequestDetailPopup from "@/pages/Common/components/AcademicRequestDetailPopup";
import { getMyAcademicRequests } from "@/api/report.api";
import { getStudentId } from "@/lib/utils";
import type { AcademicReportResponse } from "@/types/report";

const ReportIssue: React.FC = () => {
  usePageTitle("Report Issues");
  const location = useLocation();
  const navigate = useNavigate();
  const userId = getStudentId();
  
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [showTechnicalPopup, setShowTechnicalPopup] = useState(false);
  const [showAcademicPopup, setShowAcademicPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [academicReports, setAcademicReports] = useState<AcademicReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Determine current report type from URL
  const currentReportType = location.pathname.includes("technical") ? "Technical" : "Academic";
  const pageTitle = currentReportType === "Technical" ? "Technical Issues" : "Academic Requests";

  // Fetch academic requests on mount and when switching to academic tab
  useEffect(() => {
    if (currentReportType === "Academic" && userId) {
      fetchAcademicReports();
    }
  }, [currentReportType, userId]);

  const fetchAcademicReports = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await getMyAcademicRequests(userId);
      setAcademicReports(response.data);
    } catch (error) {
      console.error('Error fetching academic reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechnicalSubmit = () => {
    // TODO: Refresh technical reports after submission when API is ready
    // For now, just close the popup
  };

  const handleAcademicSubmit = () => {
    // Refresh academic reports after submission
    fetchAcademicReports();
  };

  const handleReportClick = () => {
    if (currentReportType === "Technical") {
      setShowTechnicalPopup(true);
    } else {
      setShowAcademicPopup(true);
    }
  };

  const handleViewDetails = (reportId: string) => {
    setSelectedRequestId(reportId);
    setShowDetailPopup(true);
  };

  const getStatusConfig = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === "pending" || statusLower === "submitted") {
      return {
        badge: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm",
        border: "border-orange-200",
        hover: "hover:bg-gradient-to-r hover:from-orange-25 hover:to-orange-50 hover:border-orange-300",
        icon: "text-orange-500"
      };
    }
    
    if (statusLower === "approved" || statusLower === "resolved") {
      return {
        badge: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm",
        border: "border-green-200",
        hover: "hover:bg-gradient-to-r hover:from-green-25 hover:to-green-50 hover:border-green-300",
        icon: "text-green-500"
      };
    }
    
    if (statusLower === "rejected") {
      return {
        badge: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm",
        border: "border-red-200",
        hover: "hover:bg-gradient-to-r hover:from-red-25 hover:to-red-50 hover:border-red-300",
        icon: "text-red-500"
      };
    }
    
    return {
      badge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm",
      border: "border-blue-200",
      hover: "hover:bg-gradient-to-r hover:from-blue-25 hover:to-blue-50 hover:border-blue-300",
      icon: "text-blue-500"
    };
  };

  const renderTechnicalReports = () => {
    // For now, show empty state until Technical Reports API is implemented
    return (
      <div className="text-center py-12 text-neutral-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="mb-2">No technical reports found</p>
        <p className="text-xs text-neutral-400">Technical report tracking coming soon</p>
      </div>
    );
  };

  const renderAcademicReports = (isPending: boolean) => {
    if (isLoading) {
      return (
        <div className="text-center py-12 text-neutral-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p>Loading academic requests...</p>
        </div>
      );
    }

    // Filter based on status
    const filtered = academicReports.filter(report => {
      const statusLower = report.statusName?.toLowerCase() || '';
      if (isPending) {
        return statusLower === 'pending' || statusLower === 'submitted';
      } else {
        return statusLower === 'approved' || statusLower === 'rejected' || statusLower === 'resolved';
      }
    });

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-neutral-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
          <p>No {isPending ? 'pending' : 'resolved'} academic requests found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((report) => {
          const statusConfig = getStatusConfig(report.statusName || 'Pending');
          return (
            <div
              key={report.id}
              onClick={() => handleViewDetails(report.id)}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 border-l-4
                ${statusConfig.border} ${statusConfig.hover} hover:shadow-md`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-primary-800 mb-1">{report.title}</h4>
                  <p className="text-sm text-neutral-600 mb-2 line-clamp-1">{report.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {report.courseName && (
                      <span className="text-xs text-neutral-600">
                        {report.courseCode}: {report.courseName}
                      </span>
                    )}
                    {report.className && (
                      <span className="text-xs text-neutral-500">
                        • {report.className}
                      </span>
                    )}
                    <span className="text-xs text-neutral-500">
                      • {new Date(report.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}>
                      {report.statusName || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.icon} bg-accent-50`}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <PageHeader
          title={pageTitle}
          description={currentReportType === "Academic" 
            ? "Submit various academic requests such as schedule changes, class drops, academic purchases, and more" 
            : "Report technical issues and track their resolution"}
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="p-6">
          {/* Card Header with Action Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                currentReportType === "Academic"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}>
                {currentReportType === "Academic" ? (
                  <Calendar className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-800">
                  {currentReportType === "Academic" ? "Academic Requests" : "Technical Reports"}
                </h3>
                <p className="text-sm text-accent-600">
                  {currentReportType === "Academic" 
                    ? "View and manage all your academic requests" 
                    : "View and track technical issue reports"}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleReportClick}
              className="btn-primary"
            >
              {currentReportType === "Technical" ? "Report Issue" : "Create Request"}
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-info-50 border border-info-200 rounded-lg p-3 mb-6">
            <div className="text-sm text-info-700 flex items-center gap-2">
              <div className="w-4 h-4 bg-info-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white">!</span>
              </div>
              <span>
                {currentReportType === "Academic" 
                  ? "Academic requests are reviewed by staff within 3-5 business days. You will be notified of any updates."
                  : "Technical issues are prioritized based on severity. Critical issues are addressed within 24 hours."}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "pending"
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Pending {currentReportType === "Academic" ? "Requests" : "Reports"}
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "resolved"
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                }`}
              >
                Resolved {currentReportType === "Academic" ? "Requests" : "Reports"}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div>
            {currentReportType === "Academic" 
              ? renderAcademicReports(activeTab === "pending")
              : renderTechnicalReports()
            }
          </div>
        </div>
      </Card>

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

      <AcademicRequestDetailPopup
        isOpen={showDetailPopup}
        onClose={() => {
          setShowDetailPopup(false);
          setSelectedRequestId(null);
        }}
        requestId={selectedRequestId}
      />
    </div>
  );
};

export default ReportIssue;