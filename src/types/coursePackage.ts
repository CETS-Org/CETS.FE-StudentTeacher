export interface CoursePackage {
  id: string;
  packageCode: string;
  name: string;
  description?: string;
  packageImageUrl?: string;
  totalPrice: number;
  totalIndividualPrice: number;
  courseNames: string[];
  isActive?: boolean;
}

export interface CourseInPackage {
  id: string;
  courseId: string;
  packageID: string;
  courseName: string;
  sequence: number;
  standardPrice: number;
  description?: string;
  duration?: string;
  courseLevel?: string;
  categoryName?: string;
  courseObjective?: string[];
  rating: number;
  studentsCount: number;
}

export interface PackageFeedback {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
}

export interface CoursePackageDetail extends CoursePackage {
  courses: CourseInPackage[];
  feedbacks?: PackageFeedback[];
  rating?: number;
  studentsCount?: number;
}

export interface CoursePackageCardProps {
  coursePackage: CoursePackage;
  onEnroll: (coursePackage: CoursePackage) => void;
  onToggleWishlist?: (coursePackageId: string) => void;
  isInWishlist?: boolean;
}

export interface CoursePackageFacetItem {
  key: string;
  label?: string | null;
  count: number;
  selected: boolean;
}

export interface CoursePackageSearchResult {
  items: CoursePackage[];
  page: number;
  pageSize: number;
  total: number;
  facets: {
    levels?: CoursePackageFacetItem[];
    categories?: CoursePackageFacetItem[];
    skills?: CoursePackageFacetItem[];
    daysOfWeek?: CoursePackageFacetItem[];
    timeSlots?: CoursePackageFacetItem[];
  };
}

export interface CoursePackageSearchQuery {
  q?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  levelIds?: string[];
  categoryIds?: string[];
  skillIds?: string[];
  daysOfWeek?: string[];
  timeSlotNames?: string[];
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  minCourseCount?: number;
  maxCourseCount?: number;
}
