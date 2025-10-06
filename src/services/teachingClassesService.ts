import { api } from '@/api';

// Class Meetings (Sessions) for a given class
export interface ClassMeeting {
  id: string;
  classID: string;
  date: string; // ISO date (may be "0001-01-01" from API)
  isStudy: boolean;
  roomID: string;
  onlineMeetingUrl?: string | null;
  passcode?: string | null;
  recordingUrl?: string | null;
  progressNote?: string | null;
  isActive: boolean;
  isDeleted: boolean;
}

export const getClassMeetingsByClassId = async (classId: string): Promise<ClassMeeting[]> => {
  const res = await api.getClassMeetingsByClassId(classId);
  return res.data as ClassMeeting[];
};

// Covered Topic (Session Context)
export interface CoveredTopic {
  id: string;
  sessionNumber: number;
  topicTitle: string;
  totalSlots: number; // minutes
  required: boolean;
  objectives: string[] | null;
  contentSummary: string | null;
  preReadingUrl: string | null;
}

export const getCoveredTopicByMeetingId = async (classMeetingId: string): Promise<CoveredTopic> => {
  const res = await api.getClassMeetingCoveredTopic(classMeetingId);
  return res.data as CoveredTopic;
};

// Assignments for meeting + student
export interface AssignmentSubmission {
  id: string;
  assignmentID: string;
  studentID: string;
  storeUrl: string | null;
  content: string | null;
  score: number | null;
  feedback: string | null;
  createdAt: string;
}

export interface MeetingAssignment {
  id: string;
  classMeetingId: string;
  teacherId: string;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  submissions: AssignmentSubmission[];
}

export const getAssignmentsByMeetingAndStudent = async (classMeetingId: string, studentId: string): Promise<MeetingAssignment[]> => {
  const res = await api.getAssignmentsByMeetingAndStudent(classMeetingId, studentId);
  return res.data as MeetingAssignment[];
};

// API Response Types
export interface ClassSession {
  classMeetingsId: string;
  slot: string;
  roomCode: string;
  topicName: string;
  date: string;
  isStudyingDay: boolean;
}

export interface TeachingClassResponse {
  classId: string;
  statusName: string;
  capacity: number;
  enrolledCount: number;
  isActive: boolean;
  classFormatName: string;
  className: string;
  classNumber: string;
  classSession: ClassSession;
}

// Time slot mapping function
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

// Transform API response to component format
export const transformTeachingClass = (apiClass: TeachingClassResponse) => {
  const { startTime, endTime } = calculateTimeSlot(apiClass.classSession.slot);
  
  // Determine class status based on statusName
  const getClassStatus = (statusName: string): 'ongoing' | 'upcoming' | 'completed' => {
    switch (statusName.toLowerCase()) {
      case 'đang diễn ra':
      case 'ongoing':
        return 'ongoing';
      case 'sắp diễn ra':
      case 'upcoming':
        return 'upcoming';
      case 'đã kết thúc':
      case 'completed':
        return 'completed';
      default:
        return 'ongoing';
    }
  };

  // Determine class format
  const getClassFormat = (formatName: string): 'Online' | 'In-person' | 'Hybrid' => {
    switch (formatName.toLowerCase()) {
      case 'học trực tiếp':
      case 'in-person':
        return 'In-person';
      case 'học online':
      case 'online':
        return 'Online';
      case 'học kết hợp':
      case 'hybrid':
        return 'Hybrid';
      default:
        return 'In-person';
    }
  };

  const classStatus = getClassStatus(apiClass.statusName);
  const classFormat = getClassFormat(apiClass.classFormatName);

  // Create next meeting info if class is active
  const nextMeeting = apiClass.isActive ? {
    id: apiClass.classSession.classMeetingsId,
    startsAt: `${apiClass.classSession.date}T${startTime}:00`,
    endsAt: `${apiClass.classSession.date}T${endTime}:00`,
    roomId: apiClass.classSession.roomCode,
    roomName: `Room ${apiClass.classSession.roomCode}`,
    coveredTopic: apiClass.classSession.topicName
  } : undefined;

  return {
    id: apiClass.classId,
    className: apiClass.className || `Class ${apiClass.classNumber}`,
    classNum: parseInt(apiClass.classNumber) || 1,
    description: `Class for ${apiClass.classSession.topicName}`,
    instructor: "You",
    level: "Intermediate" as const, // Default level, can be enhanced later
    classStatus: apiClass.statusName,
    courseFormat: classFormat,
    courseName: apiClass.className || "Course",
    courseCode: apiClass.classNumber || "N/A",
    category: "General", // Default category, can be enhanced later
    enrolledDate: apiClass.classSession.date,
    startDate: apiClass.classSession.date,
    endDate: apiClass.classSession.date,
    status: classStatus,
    capacity: apiClass.capacity,
    enrolledCount: apiClass.enrolledCount,
    isActive: apiClass.isActive,
    certificate: classStatus === 'completed',
    attendanceRate: classStatus === 'completed' ? Math.floor(Math.random() * 20) + 80 : undefined,
    rating: classStatus === 'completed' ? 4.0 + Math.random() * 1.0 : undefined,
    nextMeeting
  };
};

// Service functions
export const teachingClassesService = {
  // Get teaching classes for a specific teacher and course
  getTeachingClasses: async (teacherId: string, courseId: string) => {
    try {
      const response = await api.getTeachingClasses(teacherId, courseId);
      const apiClasses: TeachingClassResponse[] = response.data;
      
      // Transform API response to component format
      return apiClasses.map(transformTeachingClass);
    } catch (error) {
      console.error('Error fetching teaching classes:', error);
      throw error;
    }
  },

  // Get all teaching classes for a teacher (if you have a different endpoint)
  getAllTeachingClasses: async (teacherId: string) => {
    try {
      // This would need a different API endpoint that returns all classes for a teacher
      // For now, we'll use the existing endpoint structure
      const response = await api.getTeachingClasses(teacherId, 'default');
      const apiClasses: TeachingClassResponse[] = response.data;
      
      return apiClasses.map(transformTeachingClass);
    } catch (error) {
      console.error('Error fetching all teaching classes:', error);
      throw error;
    }
  }
};
