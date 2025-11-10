import { api as axiosInstance } from './api';
import {
  loginStudent,
  loginTeacher,
  googleLogin,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
} from './account.api';
import { getCourses, getCourseDetail, searchCourses } from './course.api';
import { getTeachingCourses, getTeachingClasses } from './teacher.api';
import {
  createLearningMaterial,
  getLearningMaterialsByClassMeeting,
  deleteLearningMaterial,
} from './learningMaterial.api';
import { getCourseSchedules, getAllCourseSchedules } from './courseSchedule.api';
import {
  getCoursePackages,
  getActiveCoursePackages,
  searchCoursePackages,
  getCoursePackageDetail,
  getCoursePackageById,
} from './coursePackage.api';
import { uploadToPresignedUrl, uploadJsonToPresignedUrl } from './file.api';
import { createMonthlyPayment, createFullPayment } from './payment.api';
import {
  getReservationItems,
  getClassReservations,
  createCompleteReservation,
} from './reservation.api';
import { getStudentLearningClasses, getClassDetailsById } from './classes.api';
import { getPlanTypes, getTimeSlots } from './lookup.api';
import {
  createTeacherAvailability,
  updateTeacherAvailability,
  deleteTeacherAvailability,
  getTeacherAvailabilityByTeacher,
  getTeacherAvailabilityByTeacherAndDate,
} from './teacherAvailability.api';
import {
  getClassMeetingsByClassId,
  getClassMeetingCoveredTopic,
  getTeacherSchedule,
} from './classMeetings.api';
import { getAssignmentsByMeetingAndStudent, submitAssignment, createSubmissionWithPresignedUrl, getUpcomingAssignmentsForStudent, downloadAssignment, downloadSubmission, getAssignmentById, submitAssignmentAnswers, startAttempt, getSpeakingSubmissionUploadUrls, submitSpeakingSubmission, createSpeakingAssignment, createQuizAssignment, createAssignment, deleteAssignment,  getAudioUploadUrl  } from './assignments.api';
import { getStudentsInClass } from './attendance.api';
import { getAcademicResults, getCourseDetails } from './academicResults.api';
import { 
  addToWishlist, 
  removeFromWishlist, 
  getStudentWishlist, 
  isCourseInWishlist 
} from './wishlist.api';
import {
  getStudentEnrollments,
  isStudentEnrolledInCourse,
  isCourseInActiveReservation,
  checkCourseStatus,
} from './enrollment.api';

// Export axios instance under a clear name for direct HTTP usage
export const apiClient = axiosInstance;
export { endpoint } from './api';

// Backward-compatible API facade matching previous usage: api.someMethod()
export const api = {
  // Courses
  getCourses,
  getCourseDetail,
  searchCourses,

  // Authentication
  loginStudent,
  loginTeacher,
  googleLogin,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,

  // Teacher
  getTeachingCourses,
  getTeachingClasses,

  // Learning Materials
  createLearningMaterial,
  getLearningMaterialsByClassMeeting,
  deleteLearningMaterial,

  // Course Schedules
  getCourseSchedules,
  getAllCourseSchedules,

  // Course Packages
  getCoursePackages,
  getActiveCoursePackages,
  searchCoursePackages,
  getCoursePackageDetail,
  getCoursePackageById,

  // File upload
  uploadToPresignedUrl,
  uploadJsonToPresignedUrl,

  // Payments
  createMonthlyPayment,
  createFullPayment,

  // Reservations
  getReservationItems,
  getClassReservations,
  createCompleteReservation,

  // Student classes
  getStudentLearningClasses,
  getClassDetailsById,

  // Lookups
  getPlanTypes,
  getTimeSlots,

  // Class meetings and assignments
  getClassMeetingsByClassId,
  getClassMeetingCoveredTopic,
  getTeacherSchedule,
  getAssignmentsByMeetingAndStudent,
  submitAssignment,
  createSubmissionWithPresignedUrl,
  getUpcomingAssignmentsForStudent,
  downloadAssignment,
  downloadSubmission,
  getAssignmentById,
  submitAssignmentAnswers,
  startAttempt,
  getSpeakingSubmissionUploadUrls,
  submitSpeakingSubmission,
  createSpeakingAssignment,
  createQuizAssignment,
  createAssignment,
  deleteAssignment,
  getAudioUploadUrl,
  // HR Teacher Availability
  createTeacherAvailability,
  updateTeacherAvailability,
  deleteTeacherAvailability,
  getTeacherAvailabilityByTeacher,
  getTeacherAvailabilityByTeacherAndDate,
  // Attendance
  getStudentsInClass,
  // Academic Results
  getAcademicResults,
  getCourseDetails,
  // Wishlist
  addToWishlist,
  removeFromWishlist,
  getStudentWishlist,
  isCourseInWishlist,
  // Enrollment
  getStudentEnrollments,
  isStudentEnrolledInCourse,
  isCourseInActiveReservation,
  checkCourseStatus,
};

// Also export individual functions for direct import usage
export {
  loginStudent,
  loginTeacher,
  googleLogin,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  getCourses,
  getCourseDetail,
  searchCourses,
  getTeachingCourses,
  getTeachingClasses,
  createLearningMaterial,
  getLearningMaterialsByClassMeeting,
  deleteLearningMaterial,
  getCourseSchedules,
  getAllCourseSchedules,
  getCoursePackages,
  getActiveCoursePackages,
  searchCoursePackages,
  getCoursePackageDetail,
  getCoursePackageById,
  uploadToPresignedUrl,
  uploadJsonToPresignedUrl,
  createMonthlyPayment,
  createFullPayment,
  getReservationItems,
  getClassReservations,
  createCompleteReservation,
  getStudentLearningClasses,
  getClassDetailsById,
  getPlanTypes,
  getTimeSlots,
  getClassMeetingsByClassId,
  getClassMeetingCoveredTopic,
  getTeacherSchedule,
  getAssignmentsByMeetingAndStudent,
  submitAssignment,
  createSubmissionWithPresignedUrl,
  getUpcomingAssignmentsForStudent,
  downloadAssignment,
  downloadSubmission,
  getAssignmentById,
  submitAssignmentAnswers,
  startAttempt,
  getSpeakingSubmissionUploadUrls,
  submitSpeakingSubmission,
  createSpeakingAssignment,
  createQuizAssignment,
  createAssignment,
  getAudioUploadUrl,
  createTeacherAvailability,
  updateTeacherAvailability,
  deleteTeacherAvailability,
  getTeacherAvailabilityByTeacher,
  getTeacherAvailabilityByTeacherAndDate,
  getStudentsInClass,
  getAcademicResults,
  getCourseDetails,
  addToWishlist,
  removeFromWishlist,
  getStudentWishlist,
  isCourseInWishlist,
  getStudentEnrollments,
  isStudentEnrolledInCourse,
  isCourseInActiveReservation,
  checkCourseStatus,
};


