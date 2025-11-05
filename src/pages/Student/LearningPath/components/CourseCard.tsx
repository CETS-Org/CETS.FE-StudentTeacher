import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { BookOpen, User, TrendingUp, GraduationCap, Calendar } from "lucide-react";
import type { MyClass } from "@/types/class";
import Spinner from "@/components/ui/Spinner";
import { mockClassesByCourseCode } from "@/pages/Student/LearningPath/data/mockLearningPathData";

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
      // Use mock data directly - 1 course = 1 class (fallback)
      const mockClasses = mockClassesByCourseCode[course.courseCode] || [];
      const firstClass = mockClasses[0] || null;
      setClassItem(firstClass);
    } catch (err) {
      console.error('Error fetching class:', err);
      const mockClasses = mockClassesByCourseCode[course.courseCode] || [];
      setClassItem(mockClasses[0] || null);
    } finally {
      setLoadingClass(false);
    }
  };

  // Extract short class name (e.g., "Advanced Business English - Class A1" -> "A1")
  const getShortClassName = (className: string): string => {
    if (!className) return '';
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
    return '';
  };

  const getProgressColor = (progressPercentage: number) => {
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
        return "bg-blue-100 text-blue-800 border-blue-200";
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

  const handleCourseClick = () => {
    if (classItem) {
      onCourseClick(classItem);
    }
  };

  const canClick = !loadingClass && classItem !== null;

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
      onClick={canClick ? handleCourseClick : undefined}
    >
      <Card 
        className="border border-accent-100 hover:shadow-lg"
      >
      {/* Course Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md font-medium text-sm">
                {course.courseCode}
              </span>
            </div>
            <h3 className="text-lg font-bold text-primary-800 mb-1">
              {course.courseName}
            </h3>
            {classItem && classItem.className && (
              <p className="text-sm text-accent-600 mb-2">
                Class: {getShortClassName(classItem.className)}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-accent-600">
              <User className="w-4 h-4" />
              <span>{course.instructor}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
            {course.status}
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
              ? (course.attendanceData.attendedSessions / course.attendanceData.totalSessions) * 100
              : course.attendanceRate}
            variant={getProgressColor(course.attendanceData 
              ? (course.attendanceData.attendedSessions / course.attendanceData.totalSessions) * 100
              : course.attendanceRate) as any}
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

