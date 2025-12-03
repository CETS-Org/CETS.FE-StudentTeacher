import { api, endpoint } from './api';

export interface CourseEnrollment {
  id: string; // This is the enrollmentID
  courseId: string; // This is the courseID 
  courseCode: string;
  courseName: string;
  description?: string | null;
  courseImageUrl?: string | null;
  teacherName?: string; 
  enrollmentStatus: string;
  enrollmentDate?: string; 
  tentativeStartDate?: string; // Tentative start date for pending enrollments (from backend)
  className?: string; // Class name if student is assigned to a class
  isActive: boolean;
  createdAt: string;
  teachers?: string[]; 
}

export interface ClassReservation {
  id: string;
  studentID: string;
  coursePackageID?: string | null;
  packageCode?: string | null;
  packageName?: string | null;
  packageImageUrl?: string | null;
  totalPrice?: number | null;
  description?: string | null;
  reservationStatus: string;
  expiresAt: string;
  createdAt: string;
}

export interface ReservationItemResponse {
  id: string;
  paymentSequence?: number | null;
  courseId: string;
  courseCode: string;
  courseName: string;
  courseImageUrl?: string;
  description?: string;
  standardPrice: number;
  categoryName?: string;
  invoiceId?: string | null;
  invoiceStatus?: string | null;
  planType?: string;
  classReservationId: string;
}

/**
 * Get all course enrollments for a student
 * @param studentId - The student ID to get enrollments for
 * @returns Promise<CourseEnrollment[]>
 */
export const getStudentEnrollments = async (studentId: string): Promise<CourseEnrollment[]> => {
  try {
    const response = await api.get(`${endpoint.enrollment}/CoursesByStudent/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    throw error;
  }
};

/**
 * Check if a student is enrolled in a specific course
 * @param studentId - The student ID
 * @param courseId - The course ID to check
 * @returns Promise<boolean>
 */
export const isStudentEnrolledInCourse = async (studentId: string, courseId: string): Promise<boolean> => {
  try {
    const enrollments = await getStudentEnrollments(studentId);
    return enrollments.some(enrollment => enrollment.courseId === courseId && enrollment.isActive);
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    // If there's an error fetching enrollments, assume not enrolled
    return false;
  }
};

/**
 * Check if a course is in any active (pending) reservation for a student
 * @param studentId - The student ID
 * @param courseId - The course ID to check
 * @returns Promise<boolean>
 */
export const isCourseInActiveReservation = async (studentId: string, courseId: string): Promise<boolean> => {
  try {
    // Get all reservations for the student
    const reservationsResponse = await api.get(`${endpoint.classReservations}/student/${studentId}`);
    const reservations: ClassReservation[] = reservationsResponse.data;

    // Filter for active reservations (not completed)
    const activeReservations = reservations.filter(
      res => res.reservationStatus !== 'Complete' && res.reservationStatus !== 'Cancelled'
    );

    // Check each active reservation for the course
    for (const reservation of activeReservations) {
      try {
        const itemsResponse = await api.get(`${endpoint.reservationItems}/by-reservation/${reservation.id}`);
        const items: ReservationItemResponse[] = itemsResponse.data;
        
        // Check if any item has the matching courseId
        const hasCourse = items.some(item => item.courseId === courseId);
        if (hasCourse) {
          return true;
        }
      } catch (err) {
        console.error(`Error fetching items for reservation ${reservation.id}:`, err);
        // Continue checking other reservations
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking reservation status:', error);
    // If there's an error, assume not in reservation
    return false;
  }
};

/**
 * Check if student is enrolled or has course in active reservation
 * @param studentId - The student ID
 * @param courseId - The course ID to check
 * @returns Promise<{ isEnrolled: boolean; inReservation: boolean }>
 */
export const checkCourseStatus = async (
  studentId: string,
  courseId: string
): Promise<{ isEnrolled: boolean; inReservation: boolean }> => {
  try {
    const [isEnrolled, inReservation] = await Promise.all([
      isStudentEnrolledInCourse(studentId, courseId),
      isCourseInActiveReservation(studentId, courseId)
    ]);

    return { isEnrolled, inReservation };
  } catch (error) {
    console.error('Error checking course status:', error);
    return { isEnrolled: false, inReservation: false };
  }
};

