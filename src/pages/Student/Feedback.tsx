import React, { useState } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FeedbackDialog from "./components/FeedbackDialog";
import { 
  ChevronRight,
  MessageSquare,
  BookOpen
} from "lucide-react";

// Feedback interfaces
interface Course {
  id: string;
  title: string;
  instructor: string;
  status: "active" | "completed";
}

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
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors"
    >
      <div>
        <h4 className="font-medium text-neutral-900">{course.title}</h4>
        <p className="text-sm text-neutral-600">Instructor: {course.instructor}</p>
        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
          course.status === "completed" 
            ? "bg-green-100 text-green-800" 
            : "bg-blue-100 text-blue-800"
        }`}>
          {course.status === "completed" ? "Completed" : "Active"}
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-neutral-400" />
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
    <StudentLayout>
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <PageHeader
            title="Feedback"
            subtitle="Share your feedback to help us improve your learning experience"
            actions={
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-500" />
              </div>
            }
          />
        </div>

        {/* Course List */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-neutral-900">Course Feedback</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-6">
              Select a course to provide feedback
            </p>
            
            <div className="space-y-3">
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
    </StudentLayout>
  );
}