import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/ui/Spinner";
import {
  BookOpen,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

import type { ClassAttendanceSummary } from "@/types/attendance";
import type { AcademicResultsApiResponse } from "@/types/academicResults";
import { getStudentId } from "@/lib/utils";
import { mockAttendanceData, mockAcademicResultsData } from "@/pages/Student/LearningPath/data/mockLearningPathData";
import CourseCard, { type CourseItem } from "@/pages/Student/LearningPath/components/CourseCard";
import ClassDetailsView from "@/pages/Student/LearningPath/components/ClassDetailsView";
import type { MyClass } from "@/types/class";

export default function LearningPath() {
  // Attendance state
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
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Academic Results state
  const [academicData, setAcademicData] = useState<AcademicResultsApiResponse | null>(null);
  const [academicLoading, setAcademicLoading] = useState(true);
  const [academicError, setAcademicError] = useState<string | null>(null);

  // View state: 'courseList' or 'classDetails'
  const [currentView, setCurrentView] = useState<'courseList' | 'classDetails'>('courseList');
  const [selectedClass, setSelectedClass] = useState<MyClass | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "passed", "not passed", "in progress"
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);

  const studentId = getStudentId();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showStatusDropdown]);

  // Fetch Attendance Data (using mock data)
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setAttendanceLoading(true);
        setAttendanceError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data
        setAttendanceData(mockAttendanceData);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setAttendanceError('Failed to load attendance data');
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
        setAttendanceLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Fetch Academic Results (using mock data)
  useEffect(() => {
    const fetchAcademicResults = async () => {
      try {
        setAcademicLoading(true);
        setAcademicError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data
        setAcademicData(mockAcademicResultsData);
      } catch (err) {
        console.error('Error fetching academic results:', err);
        setAcademicError('Failed to load academic results. Please try again later.');
      } finally {
        setAcademicLoading(false);
      }
    };

    fetchAcademicResults();
  }, []);

  // Merge attendance and academic data into course list
  const allCourseList = useMemo(() => {
    if (!academicData || !attendanceData.classSummaries) return [];

    return academicData.items.map((academicItem) => {
      // Find matching attendance data by courseCode
      const attendanceItem = attendanceData.classSummaries.find(
        (classSummary: any) => classSummary.courseCode === academicItem.courseCode
      );

      return {
        courseId: academicItem.courseId,
        courseCode: academicItem.courseCode,
        courseName: academicItem.courseName,
        instructor: attendanceItem 
          ? attendanceItem.instructor 
          : academicItem.teacherNames.join(', '),
        attendanceRate: attendanceItem ? attendanceItem.attendanceRate : 0,
        status: academicItem.statusCode,
        attendanceData: attendanceItem ? {
          totalSessions: attendanceItem.totalSessions,
          attendedSessions: attendanceItem.attendedSessions
        } : undefined
      } as CourseItem;
    });
  }, [academicData, attendanceData.classSummaries]);

  // Filter and search course list
  const courseList = useMemo(() => {
    let filtered = [...allCourseList];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((course) => {
        const status = course.status.toLowerCase();
        if (statusFilter === "passed") {
          return status === "passed" || status === "completed";
        } else if (statusFilter === "not passed") {
          return status === "failed";
        } else if (statusFilter === "in progress") {
          return status === "enrolled" || status === "in-progress" || status === "active";
        }
        return true;
      });
    }

    // Search by course name or code
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((course) => {
        return (
          course.courseName.toLowerCase().includes(query) ||
          course.courseCode.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [allCourseList, statusFilter, searchQuery]);

  const handleCourseClick = (classItem: MyClass) => {
    setSelectedClass(classItem);
    setCurrentView('classDetails');
  };

  const handleBackToCourseList = () => {
    setCurrentView('courseList');
    setSelectedClass(null);
  };

  // Retry functions (using mock data)
  const handleRetryAttendance = () => {
    const fetchAttendanceData = async () => {
      try {
        setAttendanceLoading(true);
        setAttendanceError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data
        setAttendanceData(mockAttendanceData);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setAttendanceError('Failed to load attendance data');
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendanceData();
  };

  const handleRetryAcademic = () => {
    const fetchAcademicResults = async () => {
      try {
        setAcademicLoading(true);
        setAcademicError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data
        setAcademicData(mockAcademicResultsData);
      } catch (err) {
        console.error('Error fetching academic results:', err);
        setAcademicError('Failed to load academic results. Please try again later.');
      } finally {
        setAcademicLoading(false);
      }
    };

    fetchAcademicResults();
  };

  const breadcrumbItems = [
    { label: "Learning Path" }
  ];

  const isLoading = attendanceLoading || academicLoading;
  const hasError = attendanceError || academicError;

  return (
    <div className="p-6 max-w-full space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Learning Path"
        description="Track your attendance and academic performance to monitor your learning progress"
        icon={<BookOpen className="w-5 h-5 text-white" />}
      />

      {/* Conditional Rendering: Course List or Class Details */}
      {currentView === 'classDetails' && selectedClass ? (
        /* Class Details View */
        <ClassDetailsView
          classItem={selectedClass}
          onBack={handleBackToCourseList}
        />
      ) : (
        /* Course List View */
        <>
          {/* Loading State */}
          {isLoading && (
            <Card className="shadow-lg border border-accent-100">
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" />
                <p className="mt-4 text-neutral-600">Loading course data...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <Card className="shadow-lg border border-accent-100">
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to Load Data</h3>
                <p className="text-neutral-600 text-center mb-4">
                  {attendanceError || academicError || "Failed to load course data"}
                </p>
                <div className="flex gap-3">
                  {attendanceError && (
                    <Button
                      onClick={handleRetryAttendance}
                      iconLeft={<RefreshCw className="w-4 h-4" />}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Retry Attendance
                    </Button>
                  )}
                  {academicError && (
                    <Button
                      onClick={handleRetryAcademic}
                      iconLeft={<RefreshCw className="w-4 h-4" />}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Retry Academic
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Course List */}
          {!isLoading && !hasError && (
            <Card className="shadow-lg border border-accent-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Course List</h2>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 flex items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent-500" />
                    <input
                      type="text"
                      placeholder="Search by course name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-accent-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-500 hover:text-accent-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative status-dropdown-container">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="flex items-center gap-2 px-4 py-2 border border-accent-300 rounded-lg bg-white hover:bg-accent-50 transition-colors min-w-[160px] justify-between"
                    >
                      <span className="text-sm font-medium text-neutral-700">
                        {statusFilter === "all" ? "All Status" : 
                         statusFilter === "passed" ? "Passed" :
                         statusFilter === "not passed" ? "Not Passed" :
                         statusFilter === "in progress" ? "In Progress" : "All Status"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-accent-500 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showStatusDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-accent-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setStatusFilter("all");
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              statusFilter === "all"
                                ? "bg-primary-50 text-primary-700 font-medium"
                                : "text-neutral-700 hover:bg-accent-50"
                            }`}
                          >
                            All Status
                          </button>
                          <button
                            onClick={() => {
                              setStatusFilter("passed");
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              statusFilter === "passed"
                                ? "bg-success-50 text-success-700 font-medium"
                                : "text-neutral-700 hover:bg-accent-50"
                            }`}
                          >
                            Passed
                          </button>
                          <button
                            onClick={() => {
                              setStatusFilter("not passed");
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              statusFilter === "not passed"
                                ? "bg-error-50 text-error-700 font-medium"
                                : "text-neutral-700 hover:bg-accent-50"
                            }`}
                          >
                            Not Passed
                          </button>
                          <button
                            onClick={() => {
                              setStatusFilter("in progress");
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              statusFilter === "in progress"
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-neutral-700 hover:bg-accent-50"
                            }`}
                          >
                            In Progress
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {courseList.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-accent-600" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-800 mb-3">
                      No courses found
                    </h3>
                    <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                      No courses available at this time.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {courseList.map((course) => (
                      <CourseCard 
                        key={course.courseId} 
                        course={course} 
                        onCourseClick={handleCourseClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

