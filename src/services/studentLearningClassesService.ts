import { api } from '@/api';
import type { StudentLearningClassResponse, MyClass } from '@/types/class';

// Time slot calculation function - automatically adds 90 minutes to start time
export const calculateTimeSlot = (slot: string | null | undefined): { startTime: string; endTime: string } => {
  try {
    // Handle null, undefined, or empty slot values
    if (!slot || typeof slot !== 'string') {
      console.warn(`Invalid time slot value: ${slot}`);
      return { startTime: '00:00', endTime: '01:30' }; // Default 90-minute slot
    }

    const [hoursStr, minutesStr] = slot.split(':');
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`Invalid time slot format: ${slot}`);
      return { startTime: '00:00', endTime: '01:30' }; // Default 90-minute slot
    }

    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Add 90 minutes
    minutes += 90;

    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }

    if (hours >= 24) {
      hours = hours % 24;
    }

    const endTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return { startTime, endTime };
  } catch (error) {
    console.error(`Error calculating time slot for ${slot}:`, error);
    return { startTime: '00:00', endTime: '01:30' }; // Default 90-minute slot
  }
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
  },

  // Get student learning classes filtered by courseCode
  getStudentLearningClassesByCourseCode: async (studentId: string, courseCode: string): Promise<MyClass[]> => {
    try {
      const classes = await studentLearningClassesService.getStudentLearningClasses(studentId);
      return classes.filter(classItem => classItem.courseCode === courseCode);
    } catch (error) {
      console.error('Error fetching student learning classes by course code:', error);
      throw error;
    }
  },

  // Get student learning classes by courseCode with error handling
  getStudentLearningClassesByCourseCodeSafe: async (studentId: string, courseCode: string): Promise<{ data: MyClass[] | null; error: string | null }> => {
    try {
      const classes = await studentLearningClassesService.getStudentLearningClassesByCourseCode(studentId, courseCode);
      return { data: classes, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch student learning classes by course code';
      return { data: null, error: errorMessage };
    }
  }
};
