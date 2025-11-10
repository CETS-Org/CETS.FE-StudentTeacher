import { api } from '@/api';

// Class Meetings (Sessions) for a given class
export interface ClassMeeting {
  id: string;
  classID: string;
  date: string; // ISO date (may be "0001-01-01" from API)
  isStudy: boolean;
  roomID: string | null;
  onlineMeetingUrl?: string | null;
  passcode?: string | null;
  recordingUrl?: string | null;
  progressNote?: string | null;
  isActive: boolean;
  isDeleted: boolean;
}

export const getClassMeetingsByClassId = async (classId: string): Promise<ClassMeeting[]> => {
  return await api.getClassMeetingsByClassId(classId);
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
  isAiScore?: boolean; // API returns lowercase 'i'
}

export interface MeetingAssignment {
  id: string;
  classMeetingId: string;
  teacherId: string;
  title: string;
  description: string | null;
  fileUrl?: string | null;
  questionUrl?: string | null; // File path for question JSON (for Quiz assignments)
  dueDate: string;
  createdAt: string;
  submissions: AssignmentSubmission[];
  skillID?: string | null;
  skillName?: string | null;
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
  classSession: ClassSession | null;
  endDate : string
}



// Time slot calculation function 
export const calculateTimeSlot = (slot: string): { startTime: string; endTime: string } => {
  try {
    // Parse the slot time (e.g., "09:00" or "9:00")
    const [hoursStr, minutesStr] = slot.split(':');
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    // Validate parsed values
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`Invalid time slot format: ${slot}`);
      return { startTime: slot, endTime: slot };
    }

    // Format start time (ensure 2-digit format)
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Add 90 minutes
    minutes += 90;
    
    // Handle minute overflow (e.g., 09:30 + 90 = 11:00)
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    
    // Handle hour overflow (e.g., 23:00 + 90 = 00:30 next day)
    if (hours >= 24) {
      hours = hours % 24;
    }

    // Format end time (ensure 2-digit format)
    const endTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return { startTime, endTime };
  } catch (error) {
    console.error(`Error calculating time slot for ${slot}:`, error);
    return { startTime: slot, endTime: slot };
  }
};

// Transform API response to component format
export const transformTeachingClass = (apiClass: TeachingClassResponse) => {
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

  // Create next meeting info if class is active and has classSession
  let nextMeeting = undefined;
  if (apiClass.isActive && apiClass.classSession) {
    const { startTime, endTime } = calculateTimeSlot(apiClass.classSession.slot);
    nextMeeting = {
      id: apiClass.classSession.classMeetingsId,
      startsAt: `${apiClass.classSession.date}T${startTime}:00`,
      endsAt: `${apiClass.classSession.date}T${endTime}:00`,
      roomId: apiClass.classSession.roomCode,
      roomName: `Room ${apiClass.classSession.roomCode}`,
      coveredTopic: apiClass.classSession.topicName
    };
  }

  // Get date info safely
  const sessionDate = apiClass.classSession?.date || new Date().toISOString().split('T')[0];
  const topicName = apiClass.classSession?.topicName || 'No topic assigned';

  return {
    id: apiClass.classId,
    className: apiClass.className || `Class ${apiClass.classNumber}`,
    classNum: parseInt(apiClass.classNumber) || 1,
    description: `Class for ${topicName}`,
    instructor: "You",
    level: "Intermediate" as const, // Default level, can be enhanced later
    classStatus: apiClass.statusName,
    courseFormat: classFormat,
    courseName: apiClass.className || "Course",
    courseCode: apiClass.classNumber || "N/A",
    category: "General", // Default category, can be enhanced later
    enrolledDate: sessionDate,
    startDate: sessionDate,
    endDate: apiClass.endDate,
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


