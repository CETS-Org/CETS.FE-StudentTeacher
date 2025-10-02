import { api } from '@/lib/config';

// Time Slot Lookup interface based on the API response
export interface TimeSlotLookup {
  lookUpId: string;
  lookUpTypeId: string;
  lookUpTypeCode: string;
  code: string;        // e.g., "Slot1", "Slot2"
  name: string;        // e.g., "09:00", "13:30" (start time)
  isActive: boolean;
}

// Transformed TimeSlot interface for use in the app
export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

// Cache for time slots to avoid repeated API calls
let timeSlotsCache: TimeSlot[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to add 90 minutes to a time string
function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  
  const newHours = date.getHours().toString().padStart(2, '0');
  const newMins = date.getMinutes().toString().padStart(2, '0');
  return `${newHours}:${newMins}`;
}

// Helper function to format display time (e.g., "09:00" -> "9h", "13:30" -> "13h30")
function formatDisplayTime(startTime: string, endTime: string): string {
  const formatTime = (time: string): string => {
    const [hours, mins] = time.split(':');
    if (mins === '00') {
      return `${parseInt(hours)}h`;
    }
    return `${parseInt(hours)}h${mins}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// Transform lookup to TimeSlot
function transformLookupToTimeSlot(lookup: TimeSlotLookup): TimeSlot {
  const startTime = lookup.name; // The name is the start time (e.g., "09:00")
  const endTime = addMinutes(startTime, 90); // Add 90 minutes
  
  return {
    id: lookup.lookUpId,
    name: lookup.code, // e.g., "Slot1"
    startTime,
    endTime,
    displayTime: formatDisplayTime(startTime, endTime)
  };
}

// Service functions for time slots
export const timeSlotService = {
  // Get all time slots with caching
  getTimeSlots: async (): Promise<TimeSlot[]> => {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (timeSlotsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return timeSlotsCache;
    }

    try {
      const response = await api.getTimeSlots();
      const lookups: TimeSlotLookup[] = response.data;
      
      // Transform and filter active lookups
      const timeSlots = lookups
        .filter(lookup => lookup.isActive)
        .map(transformLookupToTimeSlot);
      
      // Update cache
      timeSlotsCache = timeSlots;
      cacheTimestamp = now;
      
      return timeSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  },

  // Get time slots as a map (code -> TimeSlot) for easy lookup
  getTimeSlotsMap: async (): Promise<Record<string, TimeSlot>> => {
    const timeSlots = await timeSlotService.getTimeSlots();
    return timeSlots.reduce((acc, slot) => {
      acc[slot.name] = slot;
      return acc;
    }, {} as Record<string, TimeSlot>);
  },

  // Clear cache (useful for testing or when data might have changed)
  clearCache: (): void => {
    timeSlotsCache = null;
    cacheTimestamp = 0;
  }
};

