import React, { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FeedbackDialog from "./components/FeedbackDialog";
import { 
  ChevronRight,
  MessageSquare,
  BookOpen
} from "lucide-react";

import type { FeedbackCourse as Course } from "@/types/course";

// Mock courses data
const mockCourses: Course[] = [
  {
    id: "1",
    title: "English for beginner",
    instructor: "Dr. Smith",
    status: "completed"
  },
  {
    id: "2", 
    title: "English for Interviews & CV Writing",
    instructor: "Prof. Johnson",
    status: "active"
  },
  {
    id: "3",
    title: "Business English Communication",
    instructor: "Ms. Wilson",
    status: "completed"
  }
];


// Course List Item
const CourseListItem: React.FC<{
  course: Course;
  onClick: () => void;
}> = ({ course, onClick }) => {
  const getStatusConfig = (status: string) => {
    if (status === "completed") {
      return {
        badge: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm",
        border: "border-green-200",
        hover: "hover:bg-gradient-to-r hover:from-green-25 hover:to-green-50 hover:border-green-300",
        icon: "text-green-500"
      };
    }
    return {
      badge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm",
      border: "border-blue-200", 
      hover: "hover:bg-gradient-to-r hover:from-blue-25 hover:to-blue-50 hover:border-blue-300",
      icon: "text-blue-500"
    };
  };

  const statusConfig = getStatusConfig(course.status);

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 border-l-4
        ${statusConfig.border} ${statusConfig.hover} hover:shadow-md`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          course.status === "completed" 
            ? "bg-gradient-to-br from-green-500 to-green-600" 
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        } shadow-md`}>
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-primary-800">{course.title}</h4>
          <p className="text-sm text-neutral-600 mb-1">Instructor: {course.instructor}</p>
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}>
            {course.status === "completed" ? "Completed" : "Active"}
          </span>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.icon} bg-accent-50`}>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default function Feedback() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setOpenFeedbackDialog(true);
  };

  const handleFeedbackComplete = () => {
    alert("Feedback submitted successfully!");
    setSelectedCourse(null);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <PageHeader
          title="Feedback"
          description="Share your feedback to help us improve your learning experience"
        />
      </div>

      {/* Course List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-800">Course Feedback</h3>
              <p className="text-sm text-accent-600">Share your learning experience</p>
            </div>
          </div>
          <div className="bg-info-50 border border-info-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-info-700 flex items-center gap-2">
              <div className="w-4 h-4 bg-info-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">!</span>
              </div>
              Select a course below to provide detailed feedback and help us improve
            </p>
          </div>
          
          <div className="space-y-4">
            {mockCourses.map((course) => (
              <CourseListItem
                key={course.id}
                course={course}
                onClick={() => handleCourseSelect(course)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={openFeedbackDialog}
        onOpenChange={setOpenFeedbackDialog}
        course={selectedCourse}
        onComplete={handleFeedbackComplete}
      />
    </div>
  );
}