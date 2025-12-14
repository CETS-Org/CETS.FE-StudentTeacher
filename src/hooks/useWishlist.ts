import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist, getStudentWishlist, isCourseInWishlist } from '@/api/wishlist.api';
import type { WishlistItem } from '@/types/wishlist';

interface UseWishlistOptions {
  studentId: string | null;
  autoFetch?: boolean;
}

export const useWishlist = ({ studentId, autoFetch = true }: UseWishlistOptions) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getStudentWishlist(studentId);
      setWishlistItems(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch wishlist';
      setError(errorMessage);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && studentId) {
      fetchWishlist();
    }
  }, [autoFetch, studentId, fetchWishlist]);

  // Add course to wishlist
  const addCourse = useCallback(async (courseId: string) => {
    if (!studentId) {
      console.warn('Please log in to add courses to wishlist');
      return false;
    }

    try {
      const response = await addToWishlist({ studentId, courseId });
      setWishlistItems(prev => [...prev, response.data]);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Failed to add course to wishlist';
      console.error('Error adding to wishlist:', errorMessage, err);
      return false;
    }
  }, [studentId]);

  // Remove course from wishlist
  const removeCourse = useCallback(async (courseId: string) => {
    if (!studentId) {
      console.warn('Please log in to manage wishlist');
      return false;
    }

    try {
      await removeFromWishlist({ studentId, courseId });
      setWishlistItems(prev => prev.filter(item => item.courseId !== courseId));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove course from wishlist';
      console.error('Error removing from wishlist:', errorMessage, err);
      return false;
    }
  }, [studentId]);

  // Toggle course in wishlist
  const toggleCourse = useCallback(async (courseId: string) => {
    if (!studentId) {
      console.warn('Please log in to manage wishlist');
      return false;
    }

    const isInWishlist = wishlistItems.some(item => item.courseId === courseId);
    
    if (isInWishlist) {
      return await removeCourse(courseId);
    } else {
      return await addCourse(courseId);
    }
  }, [studentId, wishlistItems, addCourse, removeCourse]);

  // Check if a course is in wishlist
  const checkCourseInWishlist = useCallback((courseId: string) => {
    return wishlistItems.some(item => item.courseId === courseId);
  }, [wishlistItems]);

  // Check if a course is in wishlist (async from API)
  const checkCourseInWishlistAsync = useCallback(async (courseId: string) => {
    if (!studentId) return false;
    
    try {
      const response = await isCourseInWishlist(studentId, courseId);
      return response.data;
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      return false;
    }
  }, [studentId]);

  return {
    wishlistItems,
    loading,
    error,
    fetchWishlist,
    addCourse,
    removeCourse,
    toggleCourse,
    checkCourseInWishlist,
    checkCourseInWishlistAsync,
    wishlistCount: wishlistItems.length,
  };
};

