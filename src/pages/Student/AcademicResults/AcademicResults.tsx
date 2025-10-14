import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { GraduationCap, AlertCircle } from "lucide-react";

import type { AcademicResultsApiResponse } from "@/types/academicResults";
import { getAcademicResults } from "@/api/academicResults.api";
import SimpleStatsCard from "./components/SimpleStatsCard";
import SimpleCourseCard from "./components/SimpleCourseCard";
import CourseDetailModal from "./components/CourseDetailModal";

export default function AcademicResults() {
  const [academicData, setAcademicData] = useState<AcademicResultsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Student ID - in a real app, this would come from authentication context
  const studentId = "77437EAE-7B33-4858-B8E2-522776B2475A";

  useEffect(() => {
    const fetchAcademicResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiResponse = await getAcademicResults(studentId);
        setAcademicData(apiResponse);
      } catch (err) {
        console.error('Error fetching academic results:', err);
        setError('Failed to load academic results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicResults();
  }, [studentId]);

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourseId(null);
  };

  const breadcrumbItems = [
    { label: "Academic Results" }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <PageHeader
          title="Academic Results"
          description="View your academic performance and course information"
          icon={<GraduationCap className="w-5 h-5 text-white" />}
        />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading academic results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <PageHeader
          title="Academic Results"
          description="View your academic performance and course information"
          icon={<GraduationCap className="w-5 h-5 text-white" />}
        />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Error Loading Data</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!academicData) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <PageHeader
          title="Academic Results"
          description="View your academic performance and course information"
          icon={<GraduationCap className="w-5 h-5 text-white" />}
        />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">No Data Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              No academic results found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Academic Results"
        description="View your academic performance and course information"
        icon={<GraduationCap className="w-5 h-5 text-white" />}
      />

      {/* Overall Statistics */}
      <SimpleStatsCard stats={academicData} />

      {/* Course List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course List</h2>
        {academicData.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No courses available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {academicData.items.map((course) => (
              <SimpleCourseCard 
                key={course.courseId} 
                course={course} 
                onClick={handleCourseClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourseId && (
        <CourseDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          courseId={selectedCourseId}
          studentId={studentId}
        />
      )}
    </div>
  );
}
