// Wishlist-related types and interfaces

export interface TeacherDetail {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  yearsExperience: number;
}

export interface WishlistItem {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  description?: string;
  courseImageUrl?: string;
  standardPrice: number;
  courseLevel: string;
  courseFormat: string;
  categoryName: string;
  duration: string;
  rating: number;
  studentsCount: number;
  teacherDetails: TeacherDetail[];
  createdAt: string;
}

export interface AddToWishlistRequest {
  studentId: string;
  courseId: string;
}

export interface RemoveFromWishlistParams {
  studentId: string;
  courseId: string;
}

