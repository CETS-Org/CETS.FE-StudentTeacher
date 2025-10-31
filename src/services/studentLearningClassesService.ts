import { api } from '@/api';
import type { StudentLearningClassResponse, MyClass } from '@/types/class';

// Time slot mapping function (reused from teachingClassesService)
export const calculateTimeSlot = (slot: string): { startTime: string; endTime: string } => {
  const timeSlotMap: { [key: string]: { startTime: string; endTime: string } } = {
    '9:00': { startTime: '09:00', endTime: '10:30' },
    '13:30': { startTime: '13:30', endTime: '14:30' },
    '15:30': { startTime: '15:30', endTime: '17:00' },
    '18:00': { startTime: '18:00', endTime: '19:30' },
    '20:00': { startTime: '20:00', endTime: '21:30' }
  };

  const slotInfo = timeSlotMap[slot];
  if (!slotInfo) {
    // Default fallback
    return { startTime: slot, endTime: slot };
  }

  return slotInfo;
};

// Transform student learning class API response to MyClass format
export const transformStudentLearningClass = (apiClass: StudentLearningClassResponse): MyClass => {
  // Calculate time slot information
  const { startTime, endTime } = calculateTimeSlot(apiClass.timeSlot);
  
  // Determine class status based on statusName
  const getClassStatus = (statusName: string): 'upcoming' | 'active' | 'completed' | 'cancelled' => {
    switch (statusName.toLowerCase()) {
      case 'ongoing':
      case 'đang diễn ra':
        return 'active';
      case 'upcoming':
      case 'sắp diễn ra':
        return 'upcoming';
      case 'completed':
      case 'đã kết thúc':
        return 'completed';
      case 'cancelled':
      case 'đã hủy':
        return 'cancelled';
      default:
        return 'active';
    }
  };

  const classStatus = getClassStatus(apiClass.statusName);
  
  // Create next meeting info if class is active
  const nextMeeting = apiClass.isActive ? {
    id: apiClass.id,
    startsAt: `${apiClass.startDate}T${startTime}:00`,
    endsAt: `${apiClass.startDate}T${endTime}:00`,
    roomId: apiClass.roomCode,
    roomName: `Room ${apiClass.roomCode}`,
    coveredTopic: apiClass.courseName
  } : undefined;

  return {
    id: apiClass.id,
    className: apiClass.className,
    classNum: 1, // Default value, can be enhanced if available in API
    description: `Learning ${apiClass.courseName}`,
    instructor: apiClass.teacherName,
    level: "Intermediate" as const, // Default level, can be enhanced later
    classStatus: apiClass.statusName,
    courseFormat: "In-person" as const, // Default format, can be enhanced later
    courseName: apiClass.courseName,
    courseCode: apiClass.courseCode, // Will be undefined if not provided by API
    category: "General", // Default category, can be enhanced later
    startDate: apiClass.startDate,
    endDate: apiClass.endDate,
    status: classStatus,
    capacity: 30, // Default capacity, can be enhanced if available in API
    enrolledCount: 1, // Default enrolled count, can be enhanced if available in API
    isActive: apiClass.isActive,
    certificate: classStatus === 'completed',
    nextMeeting
  };
};

// Service functions for student learning classes
export const studentLearningClassesService = {
  // Get student learning classes
  getStudentLearningClasses: async (studentId: string): Promise<MyClass[]> => {
    try {
      const response = await api.getStudentLearningClasses(studentId);
      const apiClasses: StudentLearningClassResponse[] = response.data;
      
      // Transform API response to component format
      return apiClasses.map(transformStudentLearningClass);
    } catch (error) {
      console.error('Error fetching student learning classes:', error);
      throw error;
    }
  },

  // Get student learning classes with error handling
  getStudentLearningClassesSafe: async (studentId: string): Promise<{ data: MyClass[] | null; error: string | null }> => {
    try {
      const classes = await studentLearningClassesService.getStudentLearningClasses(studentId);
      return { data: classes, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch student learning classes';
      return { data: null, error: errorMessage };
    }
  }
};
