import { useState } from "react";
import CourseCatalog from "./components/CourseCatalog";
import CourseDetail from "./CourseDetail";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  image: string;
  category: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  detailedDescription?: string;
  curriculum?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  instructorBio?: string;
  instructorImage?: string;
  instructorRating?: number;
  instructorStudents?: number;
  instructorCourses?: number;
}

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };


  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
      />
    );
  }

  return (
    <CourseCatalog onCourseSelect={handleCourseSelect} />
  );
}