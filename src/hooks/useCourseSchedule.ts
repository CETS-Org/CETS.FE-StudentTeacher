import { useState, useEffect } from 'react';
import { api } from '@/api';
import type { CourseSchedule } from '@/types/course';

export function useCourseSchedule(courseId?: string) {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.getCourseSchedules(courseId);
        setSchedules(response.data || []);
      } catch (err) {
        console.error('Error fetching course schedules:', err);
        setError('Failed to fetch course schedules');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [courseId]);

  return { schedules, loading, error };
}

export function useAllCourseSchedules() {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSchedules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.getAllCourseSchedules();
        setSchedules(response.data || []);
      } catch (err) {
        console.error('Error fetching all course schedules:', err);
        setError('Failed to fetch course schedules');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSchedules();
  }, []);

  return { schedules, loading, error };
}
