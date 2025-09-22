import React, { useState, useMemo } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  GraduationCap,
  Download,
  Filter,
  Award,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from "lucide-react";

import type { CourseResultSummary } from "@/types/academicResults";
import { mockAcademicResultsReport } from "./data/mockAcademicResultsData";
import OverallStatsCard from "./components/OverallStatsCard";
import AcademicResultSummaryCard from "./components/AcademicResultSummaryCard";
import AcademicResultDetailsModal from "./components/AcademicResultDetailsModal";

export default function AcademicResults() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<CourseResultSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  const academicData = mockAcademicResultsReport;

  // Filter courses based on active tab
  const filteredCourses = useMemo(() => {
    let filtered = academicData.courseSummaries;
    
    switch (activeTab) {
      case "excellent":
        return filtered.filter(course => course.gpa >= 3.7);
      case "good":
        return filtered.filter(course => course.gpa >= 3.0 && course.gpa < 3.7);
      case "satisfactory":
        return filtered.filter(course => course.gpa >= 2.0 && course.gpa < 3.0);
      case "needs-improvement":
        return filtered.filter(course => course.gpa < 2.0);
      case "overview":
      default:
        return filtered;
    }
  }, [activeTab, academicData.courseSummaries]);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (courseId: string) => {
    const courseData = academicData.courseSummaries.find(course => course.courseId === courseId);
    if (courseData) {
      setSelectedCourse(courseData);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const summaries = academicData.courseSummaries;
    return {
      overview: summaries.length,
      excellent: summaries.filter(c => c.gpa >= 3.7).length,
      good: summaries.filter(c => c.gpa >= 3.0 && c.gpa < 3.7).length,
      satisfactory: summaries.filter(c => c.gpa >= 2.0 && c.gpa < 3.0).length,
      needsImprovement: summaries.filter(c => c.gpa < 2.0).length
    };
  }, [academicData.courseSummaries]);

  const tabs = [
    { 
      id: "overview", 
      label: "Overview", 
      badge: tabCounts.overview, 
      color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" 
    },
    { 
      id: "excellent", 
      label: "Excellent (3.7+)", 
      badge: tabCounts.excellent, 
      color: "bg-gradient-to-r from-success-500 to-success-600 text-white" 
    },
    { 
      id: "good", 
      label: "Good (3.0-3.6)", 
      badge: tabCounts.good, 
      color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" 
    },
    { 
      id: "satisfactory", 
      label: "Satisfactory (2.0-2.9)", 
      badge: tabCounts.satisfactory, 
      color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" 
    },
    { 
      id: "needs-improvement", 
      label: "Needs Improvement (<2.0)", 
      badge: tabCounts.needsImprovement, 
      color: "bg-gradient-to-r from-error-500 to-error-600 text-white" 
    }
  ];

  const breadcrumbItems = [
    { label: "Academic Results" }
  ];

  return (
    <StudentLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Academic Results"
        description="View your academic performance, grades, and course results"
        icon={<GraduationCap className="w-5 h-5 text-white" />}
      />

      {/* Overall Statistics */}
      <OverallStatsCard stats={academicData.overallStats} />

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          variant="secondary" 
          iconLeft={<Download className="w-4 h-4" />}
        >
          Export Transcript
        </Button>
        <Button 
          variant="ghost" 
          iconLeft={<Filter className="w-4 h-4" />}
        >
          Filter by Semester
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
              {paginatedCourses.map((courseSummary) => (
                <AcademicResultSummaryCard 
                  key={courseSummary.courseId} 
                  summary={courseSummary} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </TabContent>
        ))}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-12 h-12 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-primary-800 mb-3">
              No academic results found
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              {activeTab === "overview" 
                ? "No academic results available for the selected period." 
                : `No courses found in the ${activeTab.replace('-', ' ')} category.`
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredCourses.length > 0 && totalPages > 1 && (
          <div className="pt-8 border-t border-accent-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCourses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      {/* Academic Result Details Modal */}
      {selectedCourse && (
        <AcademicResultDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          courseData={selectedCourse}
        />
      )}
    </StudentLayout>
  );
}
