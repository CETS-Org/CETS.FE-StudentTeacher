import { useState, useEffect } from 'react';
import { timeSlotService, type TimeSlot } from '@/services/timeSlotService';

export function useTimeSlots() {
  const [timeSlots, setTimeSlots] = useState<Record<string, TimeSlot>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const slots = await timeSlotService.getTimeSlotsMap();
        setTimeSlots(slots);
      } catch (err) {
        console.error('Failed to fetch time slots:', err);
        setError('Failed to load time slots');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, []);

  return { timeSlots, loading, error };
}

