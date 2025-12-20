import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/ui/Spinner";
import {
  BookOpen,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

import type { ClassAttendanceSummary } from "@/types/attendance";
import { getStudentId } from "@/lib/utils";
import { getLearningPathOverview } from "@/api/academicResults.api";
import type { LearningPathOverviewResponse } from "@/api/academicResults.api";
import { getStudentEnrollments } from "@/api/enrollment.api";
import type { CourseEnrollment } from "@/api/enrollment.api";
import CourseCard, { type CourseItem } from "@/pages/Student/LearningPath/components/CourseCard";
import ClassDetailsView from "@/pages/Student/LearningPath/components/ClassDetailsView";
import type { MyClass } from "@/types/class";
import { getStudentLearningClasses } from "@/api/classes.api";

export default function LearningPath() {
  // Learning Path Overview state
  const [learningPathData, setLearningPathData] = useState<LearningPathOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Classes data for mapping course to class
  const [classesData, setClassesData] = useState<MyClass[]>([]);

  // Enrollment data
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);

  // View state: 'courseList' or 'classDetails'
  const [currentView, setCurrentView] = useState<'courseList' | 'classDetails'>('courseList');
  const [selectedClass, setSelectedClass] = useState<MyClass | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

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

  // Fetch Learning Path Overview and Classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!studentId) {
          throw new Error('Student ID not found. Please log in again.');
        }

        // Fetch learning path overview
        const overviewData = await getLearningPathOverview(studentId);
        
        if (overviewData && overviewData.courses) {
          setLearningPathData(overviewData);
        } else {
          throw new Error('Invalid response data: courses array not found');
        }
        
        // Fetch classes to map courses to classes
        try {
          const classesResponse = await getStudentLearningClasses(studentId);
          const classes = classesResponse.data || [];
          setClassesData(Array.isArray(classes) ? classes : []);
        } catch (classError) {
          console.warn('Error fetching classes, continuing without class data:', classError);
          setClassesData([]);
        }

        // Fetch enrollments to get enrollment status and expected start date
        try {
          const enrollmentsData = await getStudentEnrollments(studentId);
          // Filter out only cancelled enrollments (keep dropped for student records)
          const visibleEnrollments = Array.isArray(enrollmentsData) 
            ? enrollmentsData.filter(e => {
                const status = (e.enrollmentStatus || '').toLowerCase();
                return status !== 'cancelled'; // Only exclude cancelled, keep dropped
              })
            : [];
          setEnrollments(visibleEnrollments);
        } catch (enrollmentError) {
          console.warn('Error fetching enrollments, continuing without enrollment data:', enrollmentError);
          setEnrollments([]);
        }
      } catch (err: any) {
        console.error('Error fetching learning path data:', err);
        console.error('Error details:', {
          message: err?.message,
          response: err?.response,
          stack: err?.stack
        });
        setError(err?.response?.data?.message || err?.message || 'Failed to load learning path data. Please try again later.');
        setLearningPathData(null);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    } else {
      console.warn('No studentId found, cannot fetch data');
      setLoading(false);
      setError('Student ID not found. Please log in again.');
    }
  }, [studentId]);

  // Parse courseProgress "x/y" format to extract sessions
  const parseCourseProgress = (progress: string): { attendedSessions: number; totalSessions: number } => {
    const parts = progress.split('/');
    if (parts.length === 2) {
      const attended = parseInt(parts[0], 10) || 0;
      const total = parseInt(parts[1], 10) || 0;
      return { attendedSessions: attended, totalSessions: total };
    }
    return { attendedSessions: 0, totalSessions: 0 };
  };

  // Map statusCode from API to filter format
  const mapStatusCode = (statusCode: string): string => {
    const status = statusCode.toLowerCase();
    if (status === "inprogress" || status === "in-progress") {
      return "in-progress";
    }
    if (status === "passed" || status === "completed") {
      return "passed";
    }
    if (status === "failed" || status === "not passed") {
      return "failed";
    }
    return status;
  };

  // Transform learning path data to course list
  const allCourseList = useMemo(() => {
    if (!learningPathData || !learningPathData.courses) {
      return [];
    }

    try {
      return learningPathData.courses.map((course) => {
        const progress = parseCourseProgress(course.courseProgress || "0/0");
        
        // Find matching class by courseCode
        const classItem = classesData.find(
          (cls) => cls.courseCode === course.courseCode
        );

        // Find matching enrollment to get className
        const matchingEnrollment = enrollments.find(
          (enrollment) => 
            enrollment.courseId === course.courseId ||
            enrollment.courseCode === course.courseCode
        );

        const finalClassName = matchingEnrollment?.className || classItem?.className || undefined;

        return {
          courseId: course.courseId,
          courseCode: course.courseCode,
          courseName: course.courseName,
          instructor: course.instructor || (course.teacherNames && course.teacherNames.length > 0 ? course.teacherNames.join(', ') : 'Unknown'),
          attendanceRate: progress.totalSessions > 0 
            ? (progress.attendedSessions / progress.totalSessions) * 100 
            : 0,
          status: mapStatusCode(course.statusCode || ''),
          attendanceData: {
            totalSessions: progress.totalSessions,
            attendedSessions: progress.attendedSessions
          },
          classItem: classItem || null, // Store class item for navigation
          className: finalClassName, // Get className from enrollment or classItem
          expectedStartDate: course.expectedStartDate || matchingEnrollment?.tentativeStartDate || undefined
        } as CourseItem & { classItem: MyClass | null };
      });
    } catch (err) {
      console.error('Error transforming course list:', err);
      return [];
    }
  }, [learningPathData, classesData, enrollments]);

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
          return status === "enrolled" || status === "in-progress" || status === "active" || status === "inprogress";
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
    
    // Find matching course from learningPathData to get statusCode
    const matchingCourse = learningPathData?.courses.find(
      (course) => course.courseCode === classItem.courseCode
    );
    
    // Find matching enrollment for this course
    const matchingEnrollment = enrollments.find(
      (enrollment) => 
        enrollment.courseId === classItem.courseCode || 
        enrollment.courseCode === classItem.courseCode ||
        enrollment.courseId === matchingCourse?.courseId
    );
    
    if (matchingEnrollment) {
      // Set courseId from enrollment if available
      if (matchingEnrollment.courseId) {
        setSelectedCourseId(matchingEnrollment.courseId);
      }
    } else if (matchingCourse?.courseId) {
      setSelectedCourseId(matchingCourse.courseId);
    }
  };

  const handleBackToCourseList = () => {
    setCurrentView('courseList');
    setSelectedClass(null);
    setSelectedCourseId(null);
  };

  // Retry function
  const handleRetry = () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!studentId) {
          throw new Error('Student ID not found. Please log in again.');
        }
        
        const overviewData = await getLearningPathOverview(studentId);
        if (overviewData && overviewData.courses) {
          setLearningPathData(overviewData);
        } else {
          throw new Error('Invalid response data: courses array not found');
        }
        
        try {
          const classesResponse = await getStudentLearningClasses(studentId);
          const classes = classesResponse.data || [];
          setClassesData(Array.isArray(classes) ? classes : []);
        } catch (classError) {
          console.warn('Error fetching classes, continuing without class data:', classError);
          setClassesData([]);
        }
      } catch (err: any) {
        console.error('Error fetching learning path data:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load learning path data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  };

  const breadcrumbItems = [
    { label: "Learning Path" }
  ];


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
          courseId={selectedCourseId || undefined}
          onBack={handleBackToCourseList}
          enrollmentStatus={
            (() => {
              // First try to get from enrollment API
              const matchingEnrollment = enrollments.find(
                (enrollment) => 
                  enrollment.courseId === selectedClass.courseCode || 
                  enrollment.courseCode === selectedClass.courseCode ||
                  enrollment.courseId === selectedCourseId
              );
              
              if (matchingEnrollment?.enrollmentStatus) {
                return matchingEnrollment.enrollmentStatus;
              }
              
              // Fallback to statusCode from learning path data
              const matchingCourse = learningPathData?.courses.find(
                (course) => course.courseCode === selectedClass.courseCode
              );
              
              // Map statusCode to enrollmentStatus format
              if (matchingCourse?.statusCode) {
                const statusCode = matchingCourse.statusCode.toLowerCase();
                if (statusCode === "pending") {
                  return "waiting for class";
                }
                return matchingCourse.statusCode;
              }
              
              return undefined;
            })()
          }
          expectedStartDate={
            enrollments.find(
              (enrollment) => 
                enrollment.courseId === selectedClass.courseCode || 
                enrollment.courseCode === selectedClass.courseCode ||
                enrollment.courseId === selectedCourseId
            )?.tentativeStartDate as string | undefined
          }
          enrollmentDate={
            (() => {
              const matchingEnrollment = enrollments.find(
                (enrollment) => 
                  enrollment.courseId === selectedClass.courseCode || 
                  enrollment.courseCode === selectedClass.courseCode ||
                  enrollment.courseId === selectedCourseId
              );
              return matchingEnrollment?.enrollmentDate || matchingEnrollment?.createdAt;
            })()
          }
        />
      ) : (
        /* Course List View */
        <>
          {/* Loading State */}
          {loading && (
            <Card className="shadow-lg border border-accent-100">
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" />
                <p className="mt-4 text-neutral-600">Loading course data...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && !learningPathData && (
            <Card className="shadow-lg border border-accent-100">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-3">
                  You haven't enrolled in any course yet
                </h3>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto text-center">
                  Start your learning journey by enrolling in a course.
                </p>
              </div>
            </Card>
          )}

          {/* Course List */}
          {!loading && learningPathData && (
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
                      {allCourseList.length === 0 && !searchQuery && statusFilter === "all"
                        ? "You haven't enrolled in any course yet"
                        : "No courses found"}
                    </h3>
                    <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                      {allCourseList.length === 0 && !searchQuery && statusFilter === "all"
                        ? "Start your learning journey by enrolling in a course."
                        : searchQuery || statusFilter !== "all" 
                        ? "No courses match your search or filter criteria."
                        : "No courses available at this time."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {courseList.map((course) => (
                      <CourseCard 
                        key={course.courseId} 
                        course={course}
                        onCourseClick={(classItem) => {
                          setSelectedClass(classItem);
                          setSelectedCourseId(course.courseId);
                          setCurrentView('classDetails');
                        }}
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

