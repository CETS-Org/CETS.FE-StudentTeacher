import React from "react";
import { BookOpen, User } from "lucide-react";
import type { AcademicResultItem } from "@/types/academicResults";

interface SimpleCourseCardProps {
  course: AcademicResultItem;
  onClick?: (courseId: string) => void;
}

const SimpleCourseCard: React.FC<SimpleCourseCardProps> = ({ course, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enrolled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(course.courseId);
    }
  };

  return (
    <div 
      className="p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer bg-white rounded-lg shadow-sm"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Course Code and Name */}
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {course.courseCode} - {course.courseName}
            </h3>
          </div>
          
          {/* Teachers */}
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Instructor: {course.teacherNames.join(', ')}
            </span>
          </div>
        </div>
        
        {/* Status */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(course.statusCode)}`}>
          {course.statusName}
        </div>
      </div>
    </div>
  );
};

export default SimpleCourseCard;
