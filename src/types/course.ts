// Shared Course-related types
// This file contains all course-related interfaces used across the application

export interface SyllabusItem {
  id: string;
  sessionNumber: number;
  topicTitle: string;
  totalSlots?: number;
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

export interface CourseFeedback {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
}

export interface CourseSkill {
  id: string;
  courseID: string;
  courseName: string;
  skillID: string;
  skillName: string;
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

  teacherDetails?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    bio: string;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    yearsExperience: number;
  }[];

  // Course details
  duration: string;
  courseLevel: string;
  formatName: string;
  categoryName: string;
  
  // Pricing
  standardPrice: number;
  originalPrice?: number;
  standardScore?: number;
  
  // Metrics
  rating: number;
  studentsCount: number;
  enrolledCount?: number;
  
  // Start date
  startDate?: string;
  
  // Additional features
  benefits?: Benefit[];
  syllabusItems?: SyllabusItem[];
  requirements?: Requirement[];
  courseSkills?: CourseSkill[];
  feedbacks?: CourseFeedback[];
  schedules?: CourseSchedule[];
  
  // Status flags
  isPopular?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string | null;
}

// Teacher detail for SimpleCourse
export interface SimpleCourseTeacher {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

// Simplified Course interface for basic components that don't need all properties
export interface SimpleCourse {
  id: string;
  title: string;
  code: string;
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
  teachers?: SimpleCourseTeacher[];
}

// Props interfaces for components
export interface CourseCardProps {
  course: Course;
  onEnroll: (course: Course) => void;
  onToggleWishlist?: (courseId: string) => void;
  isInWishlist?: boolean;
  isRecommended?: boolean;
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

// Course Schedule interfaces
export interface CourseSchedule {
  id: string;
  courseID: string;
  timeSlotID: string;
  dayOfWeek: string;
  courseName?: string;
  timeSlotName?: string;
  createdAt: string;
  updatedAt?: string | null;
}

// Time slot interface
export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

// Days of week mapping
export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Teacher-specific course interface
export interface TeacherCourse {
  id: string;
  title: string;
  courseCode: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "Offline" | "Hybrid";
  category?: string;
  activeClassCount?: number;
  
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

// API response interface for teaching courses
export interface TeachingCourseApiResponse {
  id: string;
  courseCode: string;
  courseName: string;
  courseImageUrl: string;
  categoryName: string;
  courseLevel: string;
  formatName: string;
  activeClassCount: number;
}

// Utility function to convert API response to TeacherCourse
export function apiResponseToTeacherCourse(apiCourse: TeachingCourseApiResponse): TeacherCourse {
  // Map Vietnamese level names to English
  const levelMap: { [key: string]: "Beginner" | "Intermediate" | "Advanced" } = {
    "Cơ bản": "Beginner",
    "Trung cấp": "Intermediate", 
    "Nâng cao": "Advanced",
    "Beginner": "Beginner",
    "Intermediate": "Intermediate",
    "Advanced": "Advanced"
  };

  // Map Vietnamese format names to English
  const formatMap: { [key: string]: "Online" | "Offline" | "Hybrid" } = {
    "Học trực tiếp": "Offline",
    "Học online": "Online",
    "Học kết hợp": "Hybrid",
    "Online": "Online",
    "Offline": "Offline", 
    "Hybrid": "Hybrid"
  };

  return {
    id: apiCourse.id,
    title: apiCourse.courseName,
    courseCode: apiCourse.courseCode,
    level: levelMap[apiCourse.courseLevel] || "Beginner",
    format: formatMap[apiCourse.formatName] || "Offline",
    category: apiCourse.categoryName,
    image: apiCourse.courseImageUrl,
    activeClassCount: apiCourse.activeClassCount
  };
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
    code: course.courseCode,
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
  label?: string | null;
  count: number;
  selected: boolean;
}

export interface CourseSearchResult {
  page: number;
  pageSize: number;
  total: number;
  items: Course[];
  facets: {
    levels?: FacetItem[];
    categories?: FacetItem[];
    skills?: FacetItem[];
    requirements?: FacetItem[];
    benefits?: FacetItem[];
    daysOfWeek?: FacetItem[];
    timeSlots?: FacetItem[];
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
    teacherDetails: additionalData?.teacherDetails || [{
      id: "unknown",
      fullName: "Unknown Teacher",
      bio: "",
      rating: 0,
      totalStudents: 0,
      totalCourses: 0,
      yearsExperience: 0
    }],
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
