import React, { useState, useMemo } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  ClipboardCheck,
  Download,
  Filter
} from "lucide-react";

import type { ClassAttendanceSummary } from "@/types/attendance";
import { mockAttendanceReport } from "./data/mockAttendanceData";
import OverallStatsCard from "./components/OverallStatsCard";
import AttendanceSummaryCard from "./components/AttendanceSummaryCard";
import AttendanceDetailsModal from "./components/AttendanceDetailsModal";

export default function AttendanceReport() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<ClassAttendanceSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  const attendanceData = mockAttendanceReport;

  // Filter classes based on active tab
  const filteredClasses = useMemo(() => {
    let filtered = attendanceData.classSummaries;
    
    switch (activeTab) {
      case "excellent":
        return filtered.filter(cls => cls.attendanceRate >= 90);
      case "good":
        return filtered.filter(cls => cls.attendanceRate >= 80 && cls.attendanceRate < 90);
      case "needs-improvement":
        return filtered.filter(cls => cls.attendanceRate < 80);
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
    const classData = attendanceData.classSummaries.find(cls => cls.classId === classId);
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
    const summaries = attendanceData.classSummaries;
    return {
      overview: summaries.length,
      excellent: summaries.filter(c => c.attendanceRate >= 90).length,
      good: summaries.filter(c => c.attendanceRate >= 80 && c.attendanceRate < 90).length,
      needsImprovement: summaries.filter(c => c.attendanceRate < 80).length
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
    <StudentLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Attendance Report"
        description="Track your attendance across all enrolled classes and monitor your progress"
        icon={<ClipboardCheck className="w-5 h-5 text-white" />}
      />

      {/* Overall Statistics */}
      <OverallStatsCard stats={attendanceData.overallStats} />

      {/* Actions Bar */}
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

      {/* Tabs and Content */}
      <Card className="shadow-lg border border-accent-100">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {tabs.map(tab => (
          <TabContent key={tab.id} activeTab={activeTab} tabId={tab.id}>
            <div className="space-y-6">
              {paginatedClasses.map((classSummary) => (
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
      </Card>

      {/* Attendance Details Modal */}
      {selectedClass && (
        <AttendanceDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classData={selectedClass}
        />
      )}
    </StudentLayout>
  );
}