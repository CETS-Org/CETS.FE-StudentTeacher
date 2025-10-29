import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';
import type { AddToWishlistRequest, RemoveFromWishlistParams, WishlistItem } from '@/types/wishlist';

/**
 * Add a course to student's wishlist
 */
export const addToWishlist = (
  request: AddToWishlistRequest,
  config?: AxiosRequestConfig
) => api.post<WishlistItem>(`${endpoint.wishlist}`, request, config);

/**
 * Remove a course from student's wishlist
 */
export const removeFromWishlist = (
  params: RemoveFromWishlistParams,
  config?: AxiosRequestConfig
) => api.delete(`${endpoint.wishlist}`, {
  ...config,
  params: {
    studentId: params.studentId,
    courseId: params.courseId,
  },
});

/**
 * Get all wishlist items for a student
 */
export const getStudentWishlist = (
  studentId: string,
  config?: AxiosRequestConfig
) => api.get<WishlistItem[]>(`${endpoint.wishlist}/student/${studentId}`, config);

/**
 * Check if a course is in student's wishlist
 */
export const isCourseInWishlist = (
  studentId: string,
  courseId: string,
  config?: AxiosRequestConfig
) => api.get<boolean>(`${endpoint.wishlist}/check`, {
  ...config,
  params: { studentId, courseId },
});

