import React, { useState, useEffect } from "react";
import Card from "@/components/ui/card";
import ProgressBar from "@/components/ui/ProgressBar";
import { BookOpen, User, TrendingUp, GraduationCap, Calendar } from "lucide-react";
import type { MyClass } from "@/types/class";
import Spinner from "@/components/ui/Spinner";
import { getStudentLearningClasses } from "@/api/classes.api";
import { getStudentId } from "@/lib/utils";

export interface CourseItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  attendanceRate: number;
  status: string;
  attendanceData?: {
    totalSessions: number;
    attendedSessions: number;
  };
  classItem?: MyClass | null;
  className?: string; // Class name from enrollment data
  expectedStartDate?: string; // Expected start date for pending courses
}

interface CourseCardProps {
  course: CourseItem;
  onCourseClick: (classItem: MyClass) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onCourseClick }) => {
  // Use classItem from course data if available, otherwise try to fetch
  const [classItem, setClassItem] = useState<MyClass | null>(course.classItem || null);
  const [loadingClass, setLoadingClass] = useState(false);

  useEffect(() => {
    // If classItem is already provided in course, use it
    if (course.classItem) {
      setClassItem(course.classItem);
      return;
    }
    
    // Otherwise try to fetch from mock data (fallback)
    fetchClass();
  }, [course.courseCode, course.classItem]);

  const fetchClass = async () => {
    try {
      setLoadingClass(true);
      const studentId = getStudentId();
      if (!studentId) throw new Error('Student ID not found');
      
      // Fetch classes for this student from API
      const response = await getStudentLearningClasses(studentId);
      const classes = response.data || [];
      const courseClass = classes.find((c: MyClass) => c.courseCode === course.courseCode);
      setClassItem(courseClass || null);
    } catch (err) {
      console.error('Error fetching class:', err);
      setClassItem(null);
    } finally {
      setLoadingClass(false);
    }
  };

  // Extract short class name (e.g., "CLS0009" -> "CLS0009", "Advanced Business English - Class A1" -> "A1")
  const getShortClassName = (className: string): string => {
    if (!className) return '';
    
    // If className is already in format like "CLS0009", return it directly
    if (/^[A-Z]{3}\d+$/i.test(className.trim())) {
      return className.trim();
    }
    
    // Try to find pattern like "Class A1", "Class C1", etc.
    const match = className.match(/Class\s+([A-Z]\d+)/i);
    if (match) {
      return match[1];
    }
    // Fallback: extract last part after dash
    const parts = className.split('-');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim();
      // Try to extract class identifier
      const classMatch = lastPart.match(/([A-Z]\d+)/i);
      if (classMatch) {
        return classMatch[1];
      }
      return lastPart;
    }
    // If no pattern matches, return the className as is
    return className.trim();
  };

  const getProgressColor = (progressPercentage: number, totalSessions?: number) => {
    // If totalSessions is 0 (0/0 sessions), use gray
    if (totalSessions !== undefined && totalSessions === 0) return "neutral";
    // If progress is less than 20%, use blue (xanh dương sáng)
    if (progressPercentage < 20) return "primary";
    // Otherwise use success (xanh lá cây)
    return "success";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "enrolled":
      case "in-progress":
        // Tất cả course "Enrolled" dùng cùng một màu
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
      case "waiting for class":
      case "waitingforclass":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getClassStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return '';
    const lowerStatus = status.toLowerCase();
    // Change "pending" to "Waiting for class"
    if (lowerStatus === 'pending') {
      return 'Waiting for class';
    }
    // Uppercase first letter of the status
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Check if course can be clicked: allow all courses to be clicked
  const statusLower = course.status?.toLowerCase() || '';
  const isPending = statusLower === 'pending' || statusLower === 'waiting for class' || statusLower === 'waitingforclass';
  
  // Allow all courses to be clicked (including Pending status)
  const canClick = !loadingClass;

  const handleCourseClick = () => {
    // If no classItem OR status is "Pending", create a minimal one for viewing learning timeline
    if (!classItem || isPending) {
      const minimalClassItem: MyClass = {
        id: `temp-${course.courseId}`,
        className: `${course.courseName} - Waiting for class`,
        classNum: 0,
        description: '',
        instructor: course.instructor,
        level: 'Beginner',
        classStatus: 'active',
        courseFormat: 'In-person',
        courseName: course.courseName,
        courseCode: course.courseCode,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: 'active',
        isActive: true,
        certificate: false
      };
      onCourseClick(minimalClassItem);
      return;
    }
    
    onCourseClick(classItem);
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
      onClick={(e) => {
        if (!canClick) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handleCourseClick();
      }}
      style={!canClick ? { pointerEvents: 'auto' } : undefined}
    >
      <Card 
        className={`border border-accent-100 ${canClick ? 'hover:shadow-lg' : 'hover:shadow-none'}`}
      >
      {/* Course Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span className="bg-accent2-200 text-primary-700 px-2 py-1 rounded-md font-medium text-sm">
                {course.courseCode}
              </span>
            </div>
            <h3 className="text-lg font-bold text-primary-800 mb-1">
              {course.courseName}
            </h3>
            {(course.className || classItem?.className) && (
              <p className="text-sm text-accent-600 mb-2">
                Class: {getShortClassName(course.className || classItem?.className || '')}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-accent-600">
              <User className="w-4 h-4" />
              <span>{course.instructor}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
              {formatStatus(course.status)}
            </div>
            {isPending && !classItem && course.expectedStartDate && (
              <div className="flex items-center gap-1 text-xs text-accent-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>Expected: {formatDate(course.expectedStartDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success-600" />
              <span className="text-sm font-medium text-neutral-700">Course Progress</span>
            </div>
            {course.attendanceData ? (
              <span className="text-sm font-semibold text-neutral-900">
                {course.attendanceData.attendedSessions}/{course.attendanceData.totalSessions} sessions
              </span>
            ) : (
              <span className="text-sm font-semibold text-neutral-900">
                {course.attendanceRate.toFixed(1)}%
              </span>
            )}
          </div>
          <ProgressBar
            progress={course.attendanceData 
              ? course.attendanceData.totalSessions > 0
                ? (course.attendanceData.attendedSessions / course.attendanceData.totalSessions) * 100
                : 0
              : course.attendanceRate}
            variant={getProgressColor(
              course.attendanceData 
                ? course.attendanceData.totalSessions > 0
                  ? (course.attendanceData.attendedSessions / course.attendanceData.totalSessions) * 100
                  : 0
                : course.attendanceRate,
              course.attendanceData?.totalSessions
            ) as any}
            size="md"
            showLabel={false}
          />
        </div>
      </div>
      </Card>
    </div>
  );
};

export default CourseCard;

