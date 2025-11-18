import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FeedbackDialog from "./components/FeedbackDialog";
import { 
  ChevronRight,
  MessageSquare,
  BookOpen,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getStudentFeedbackClasses } from "@/api/classes.api";
import { getUserInfo } from "@/lib/utils";
import type { FeedbackCourse as Course } from "@/types/course";

interface ClassResponse {
  courseId: string;
  courseName: string;
  teacherId?: string;
  teacherName?: string;
  hasSubmittedFeedback: boolean;
}

// Course List Item
const CourseListItem: React.FC<{
  course: Course;
  onClick: () => void;
  hasSubmittedFeedback: boolean;
}> = ({ course, onClick, hasSubmittedFeedback }) => {
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
          <div className="flex gap-2">
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}>
              {course.status === "completed" ? "Completed" : "Active"}
            </span>
            {hasSubmittedFeedback && (
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                ✓ Feedback Submitted
              </span>
            )}
          </div>
        </div>
      </div>
      {!hasSubmittedFeedback && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.icon} bg-accent-50`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default function Feedback() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        setError("User not authenticated");
        return;
      }

      const response = await getStudentFeedbackClasses(userInfo.id);
      const classes: ClassResponse[] = response.data;

      // Transform to Course format with feedback status
      const transformedCourses: Course[] = classes.map(cls => ({
        id: cls.courseId,
        title: cls.courseName || "Unknown Course",
        instructor: cls.teacherName || "Unknown",
        teacherId: cls.teacherId || "",
        status: "active", // All feedback classes are active
        hasSubmittedFeedback: cls.hasSubmittedFeedback
      }));

      setCourses(transformedCourses);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setError("Failed to load your classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    // Don't open dialog if feedback already submitted
    if (course.hasSubmittedFeedback) {
      return;
    }
    setSelectedCourse(course);
    setOpenFeedbackDialog(true);
  };

  const handleFeedbackComplete = () => {
    alert("Feedback submitted successfully!");
    setSelectedCourse(null);
    // Refresh the course list to update feedback status
    fetchStudentClasses();
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
            <div className="text-sm text-info-700 flex items-center gap-2">
              <div className="w-4 h-4 bg-info-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">!</span>
              </div>
              <span>Select a course below to provide detailed feedback and help us improve</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
              <p className="text-sm text-neutral-600">Loading your classes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button
                variant="secondary"
                onClick={fetchStudentClasses}
                className="text-sm"
              >
                Try Again
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-600">You don't have any classes yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseListItem
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseSelect(course)}
                  hasSubmittedFeedback={course.hasSubmittedFeedback || false}
                />
              ))}
            </div>
          )}
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