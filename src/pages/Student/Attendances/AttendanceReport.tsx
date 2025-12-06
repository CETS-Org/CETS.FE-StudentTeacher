import React, { useState, useMemo, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/ui/Spinner";
import {
  ClipboardCheck,
  Download,
  Filter,
  AlertCircle,
  RefreshCw
} from "lucide-react";

import type { ClassAttendanceSummary } from "@/types/attendance";
import { attendanceService } from "@/services/attendanceService";
import { getStudentId } from "@/lib/utils";
import OverallStatsCard from "./components/OverallStatsCard";
import AttendanceSummaryCard from "./components/AttendanceSummaryCard";
import AttendanceDetailsModal from "./components/AttendanceDetailsModal";

export default function AttendanceReport() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<ClassAttendanceSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any>({
    overallStats: {
      totalClasses: 0,
      totalSessions: 0,
      totalAttended: 0,
      totalAbsent: 0,
      overallAttendanceRate: 0
    },
    classSummaries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from authentication
        const studentId = getStudentId();
        if (!studentId) {
          setError('User not authenticated. Please login again.');
          setAttendanceData({
          overallStats: {
            totalClasses: 0,
            totalSessions: 0,
            totalAttended: 0,
            totalAbsent: 0,
            overallAttendanceRate: 0
          },
          classSummaries: []
        });
          return;
        }
        
        const { data, error: fetchError } = await attendanceService.getStudentAttendanceReportSafe(studentId);
        
        if (fetchError) {
          setError(fetchError);
          setAttendanceData({
            overallStats: {
              totalClasses: 0,
              totalSessions: 0,
              totalAttended: 0,
              totalAbsent: 0,
              overallAttendanceRate: 0
            },
            classSummaries: []
          });
        } else {
          setAttendanceData(data || {
            overallStats: {
              totalClasses: 0,
              totalSessions: 0,
              totalAttended: 0,
              totalAbsent: 0,
              overallAttendanceRate: 0
            },
            classSummaries: []
          });
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
        setAttendanceData({
          overallStats: {
            totalClasses: 0,
            totalSessions: 0,
            totalAttended: 0,
            totalAbsent: 0,
            overallAttendanceRate: 0
          },
          classSummaries: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Retry function
  const handleRetry = () => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from authentication
        const studentId = getStudentId();
        if (!studentId) {
          setError('User not authenticated. Please login again.');
          setAttendanceData({
          overallStats: {
            totalClasses: 0,
            totalSessions: 0,
            totalAttended: 0,
            totalAbsent: 0,
            overallAttendanceRate: 0
          },
          classSummaries: []
        });
          return;
        }
        
        const { data, error: fetchError } = await attendanceService.getStudentAttendanceReportSafe(studentId);
        
        if (fetchError) {
          setError(fetchError);
          setAttendanceData({
          overallStats: {
            totalClasses: 0,
            totalSessions: 0,
            totalAttended: 0,
            totalAbsent: 0,
            overallAttendanceRate: 0
          },
          classSummaries: []
        });
        } else {
          // Set the attendance data from API
          if (data) {
            setAttendanceData(data);
          } else {
            setAttendanceData({
          overallStats: {
            totalClasses: 0,
            totalSessions: 0,
            totalAttended: 0,
            totalAbsent: 0,
            overallAttendanceRate: 0
          },
          classSummaries: []
        });
          }
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
        setAttendanceData({
          overallStats: {
            totalClasses: 0,
            totalSessions: 0,
            totalAttended: 0,
            totalAbsent: 0,
            overallAttendanceRate: 0
          },
          classSummaries: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  };

  // Filter classes based on active tab
  const filteredClasses = useMemo(() => {
    let filtered = attendanceData.classSummaries || [];
    
    switch (activeTab) {
      case "excellent":
        return filtered.filter((cls: any) => cls.attendanceRate >= 90);
      case "good":
        return filtered.filter((cls: any) => cls.attendanceRate >= 80 && cls.attendanceRate < 90);
      case "needs-improvement":
        return filtered.filter((cls: any) => cls.attendanceRate < 80);
      case "overview":
      default:
        return filtered;
    }
  }, [activeTab, attendanceData.classSummaries]);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (classId: string) => {
    const classData = attendanceData.classSummaries?.find((cls: any) => cls.classId === classId);
    if (classData) {
      setSelectedClass(classData);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const summaries = attendanceData.classSummaries || [];
    return {
      overview: summaries.length,
      excellent: summaries.filter((c: any) => c.attendanceRate >= 90).length,
      good: summaries.filter((c: any) => c.attendanceRate >= 80 && c.attendanceRate < 90).length,
      needsImprovement: summaries.filter((c: any) => c.attendanceRate < 80).length
    };
  }, [attendanceData.classSummaries]);

  const tabs = [
    { id: "overview", label: "Overview", badge: tabCounts.overview, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "excellent", label: "Excellent (90%+)", badge: tabCounts.excellent, color: "bg-gradient-to-r from-success-500 to-success-600 text-white" },
    { id: "good", label: "Good (80-89%)", badge: tabCounts.good, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" },
    { id: "needs-improvement", label: "Needs Improvement (<80%)", badge: tabCounts.needsImprovement, color: "bg-gradient-to-r from-error-500 to-error-600 text-white" }
  ];

  const breadcrumbItems = [
    { label: "Attendance Report" }
  ];

  return (
    <div className="p-6 max-w-full space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Attendance Report"
        description="Track your attendance across all enrolled classes and monitor your progress"
        icon={<ClipboardCheck className="w-5 h-5 text-white" />}
      />

      {/* Overall Statistics */}
      {!loading && !error && <OverallStatsCard stats={attendanceData.overallStats} />}

      {/* Actions Bar */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant="secondary" 
            iconLeft={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
          <Button 
            variant="ghost" 
            iconLeft={<Filter className="w-4 h-4" />}
          >
            Filter
          </Button>
        </div>
      )}

      {/* Tabs and Content */}
      <Card className="shadow-lg border border-accent-100">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-neutral-600">Loading attendance data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to Load Attendance Data</h3>
            <p className="text-neutral-600 text-center mb-4">{error}</p>
            <Button
              onClick={handleRetry}
              iconLeft={<RefreshCw className="w-4 h-4" />}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            {tabs.map(tab => (
              <TabContent key={tab.id} activeTab={activeTab} tabId={tab.id}>
                <div className="space-y-6">
                  {paginatedClasses.map((classSummary: any) => (
                    <AttendanceSummaryCard 
                      key={classSummary.classId} 
                      summary={classSummary} 
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </TabContent>
            ))}

            {/* Empty State */}
            {filteredClasses.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardCheck className="w-12 h-12 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-3">
                  No attendance data found
                </h3>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  {activeTab === "overview" 
                    ? "No attendance records available for the selected period." 
                    : `No classes found in the ${activeTab.replace('-', ' ')} category.`
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredClasses.length > 0 && totalPages > 1 && (
              <div className="pt-8 border-t border-accent-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredClasses.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Attendance Details Modal */}
      {selectedClass && (
        <AttendanceDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classData={selectedClass}
        />
      )}
    </div>
  );
}