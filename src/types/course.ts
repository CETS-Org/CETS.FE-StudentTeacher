// Shared Course-related types
// This file contains all course-related interfaces used across the application

export interface SyllabusItem {
  id: string;
  sessionNumber: number;
  topicTitle: string;
  estimatedMinutes?: number;
  required: boolean;
  objectives?: string;
  contentSummary?: string;
  preReadingUrl?: string | null;
}

export interface Benefit {
  id: string;
  courseID: string;
  courseName: string | null;
  benefitID: string;
  benefitName: string;
}

export interface Requirement {
  id: string;
  courseID: string;
  courseName: string;
  requirementID: string;
  requirementName: string;
}

// Main Course interface combining all properties from different components
export interface Course {
  // Core properties
  id: string;
  courseCode: string;
  courseName: string;
  courseImageUrl: string;
  description: string;
  courseObjective: string | string[] | null;
  
  // Teacher information
  teacher?: string; // Keep for backward compatibility
  teacherDetail?: {
    id: string;
    fullName: string;
    bio: string;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    yearsExperience: number;
  };
  teacherBio?: string;
  teacherImage?: string;
  teacherRating?: number;
  teacherStudents?: number;
  teacherCourses?: number;
  
  // Course details
  duration: string;
  courseLevel: string;
  formatName: string;
  categoryName: string;
  
  // Pricing
  standardPrice: number;
  originalPrice?: number;
  
  // Metrics
  rating: number;
  studentsCount: number;
  
  // Additional features
  benefits?: Benefit[];
  syllabusItems?: SyllabusItem[];
  requirements?: Requirement[];
  
  // Status flags
  isPopular?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string | null;
}

// Simplified Course interface for basic components that don't need all properties
export interface SimpleCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "In-person" | "Hybrid";
  timeOfDay?: "Morning" | "Evening" | "Weekend";
  price: number;
  originalPrice?: number;
  duration: string;
  rating?: number;
  students?: number;
}

// Props interfaces for components
export interface CourseCardProps {
  course: Course;
  onEnroll: (course: Course) => void;
}

export interface SimpleCourseCardProps {
  course: SimpleCourse;
  onRemoveFromWishlist?: (id: string) => void;
  onEnroll?: (course: SimpleCourse) => void;
  onViewDetails?: (course: SimpleCourse) => void;
  showWishlistButton?: boolean;
  isWishlisted?: boolean;
  className?: string;
}

export interface CourseDetailProps {
  course: Course;
}

// Teacher-specific course interface
export interface TeacherCourse {
  id: string;
  title: string;
  courseCode: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "Offline" | "Hybrid";
  category?: string;
  
  // Schedule information
  schedule?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  
  // Metrics
  enrolled?: number;
  capacity?: number;
  totalHours?: number;
  rating?: number;
  
  // Optional image
  image?: string;
}

// Student-specific course interface for enrolled courses
export interface MyCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "In-person" | "Hybrid";
  category: string;
  
  // Enrollment information
  enrolledDate: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  
  // Schedule information
  schedule: string;
  location?: string;
  totalHours: number;
  sessionsPerWeek: number;
  
  // Additional properties
  certificate?: boolean;
  rating?: number;
  price: number;
}

// Utility function to convert Course to SimpleCourse
export function courseToSimpleCourse(course: Course): SimpleCourse {
  return {
    id: course.id,
    title: course.courseName,
    description: course.description,
    image: course.courseImageUrl,
    level: course.courseLevel as "Beginner" | "Intermediate" | "Advanced",
    format: course.formatName as "Online" | "In-person" | "Hybrid",
    price: course.standardPrice,
    originalPrice: course.originalPrice,
    duration: course.duration,
    rating: course.rating,
    students: course.studentsCount,
  };
}

// Course interface for feedback purposes
export interface FeedbackCourse {
  id: string;
  title: string;
  instructor: string;
  status: "active" | "completed";
}

export interface FacetItem {
  key: string;
  label: string;
  count: number;
  selected: boolean;
}

export interface CourseSearchResult {
  page: number;
  pageSize: number;
  total: number;
  items: Course[];
  facets: {
    levels: FacetItem[];
    categories: FacetItem[];
  };
}




// Utility function to convert SimpleCourse to Course (with default values)
export function simpleCourseToCourse(simpleCourse: SimpleCourse, additionalData?: Partial<Course>): Course {
  return {
    id: simpleCourse.id,
    courseCode: additionalData?.courseCode || simpleCourse.id,
    courseName: simpleCourse.title,
    courseImageUrl: simpleCourse.image,
    description: simpleCourse.description,
    courseObjective: additionalData?.courseObjective || null,
    teacher: additionalData?.teacher,
    teacherDetail: additionalData?.teacherDetail || {
      id: "unknown",
      fullName: "Unknown Teacher",
      bio: "",
      rating: 0,
      totalStudents: 0,
      totalCourses: 0,
      yearsExperience: 0
    },
    duration: simpleCourse.duration,
    courseLevel: simpleCourse.level,
    formatName: simpleCourse.format,
    categoryName: additionalData?.categoryName || "General",
    standardPrice: simpleCourse.price,
    originalPrice: simpleCourse.originalPrice,
    rating: simpleCourse.rating || 0,
    studentsCount: simpleCourse.students || 0,
    ...additionalData,
  };

  
}
