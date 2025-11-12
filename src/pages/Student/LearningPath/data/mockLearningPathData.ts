import type { StudentAttendanceReport } from "@/types/attendance";
import type { AcademicResultsApiResponse, CourseDetailResponse } from "@/types/academicResults";
import type { AcademicStats } from "@/types/academicResults";
import type { MyClass } from "@/types/class";
import type { ClassMeeting } from "@/api/classMeetings.api";
import type { MeetingAssignment } from "@/services/teachingClassesService";

// Mock Attendance Data
export const mockAttendanceData: StudentAttendanceReport = {
  studentId: "student-1",
  studentName: "John Doe",
  reportPeriod: {
    startDate: "2024-01-15",
    endDate: "2024-04-15"
  },
  overallStats: {
    totalClasses: 4,
    totalSessions: 48,
    totalAttended: 42,
    totalAbsent: 6,
    overallAttendanceRate: 87.5
  },
  classSummaries: [
    {
      classId: "1",
      className: "Advanced Business English - Class A1",
      courseCode: "ABE101",
      courseName: "Advanced Business English",
      instructor: "Sarah Johnson",
      totalSessions: 18,
      attendedSessions: 16,
      absentSessions: 2,
      attendanceRate: 88.9,
      records: [
        {
          id: "att-1",
          meetingId: "meeting-1",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-15T19:00:00Z",
          meeting: {
            id: "meeting-1",
            startsAt: "2024-02-15T19:00:00Z",
            endsAt: "2024-02-15T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Business Communication Fundamentals"
          }
        },
        {
          id: "att-2",
          meetingId: "meeting-2",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-17T19:00:00Z",
          meeting: {
            id: "meeting-2",
            startsAt: "2024-02-17T19:00:00Z",
            endsAt: "2024-02-17T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Email Writing Skills"
          }
        },
        {
          id: "att-3",
          meetingId: "meeting-3",
          studentId: "student-1",
          attendanceStatusId: "status-2",
          attendanceStatus: "Absent",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-19T19:00:00Z",
          notes: "Student was sick",
          meeting: {
            id: "meeting-3",
            startsAt: "2024-02-19T19:00:00Z",
            endsAt: "2024-02-19T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Meeting and Presentation Skills"
          }
        }
      ]
    },
    {
      classId: "2",
      className: "IELTS Test Preparation - Class B2",
      courseCode: "IELTS201",
      courseName: "IELTS Test Preparation",
      instructor: "Michael Chen",
      totalSessions: 12,
      attendedSessions: 11,
      absentSessions: 1,
      attendanceRate: 91.7,
      records: []
    },
    {
      classId: "3",
      className: "English Conversation Club - Class C1",
      courseCode: "ECC101",
      courseName: "English Conversation Club",
      instructor: "Emma Wilson",
      totalSessions: 15,
      attendedSessions: 2,
      absentSessions: 13,
      attendanceRate: 13.3,
      records: []
    },
    {
      classId: "4",
      className: "Grammar Fundamentals - Class F1",
      courseCode: "GF101",
      courseName: "Grammar Fundamentals",
      instructor: "James Miller",
      totalSessions: 10,
      attendedSessions: 8,
      absentSessions: 2,
      attendanceRate: 80.0,
      records: []
    }
  ]
};

// Mock Academic Results Data
export const mockAcademicResultsData: AcademicResultsApiResponse = {
  totalCourses: 5,
  passedCourses: 4,
  failedCourses: 1,
  inProgressCourses: 0,
  items: [
    {
      courseId: "course-1",
      courseCode: "ABE101",
      courseName: "Advanced Business English",
      teacherNames: ["Sarah Johnson"],
      statusCode: "Passed",
      statusName: "Passed"
    },
    {
      courseId: "course-2",
      courseCode: "IELTS201",
      courseName: "IELTS Test Preparation",
      teacherNames: ["Michael Chen"],
      statusCode: "Passed",
      statusName: "Passed"
    },
    {
      courseId: "course-3",
      courseCode: "ECC101",
      courseName: "English Conversation Club",
      teacherNames: ["Emma Wilson"],
      statusCode: "Passed",
      statusName: "Passed"
    },
    {
      courseId: "course-4",
      courseCode: "GF101",
      courseName: "Grammar Fundamentals",
      teacherNames: ["James Miller"],
      statusCode: "Passed",
      statusName: "Passed"
    },
    {
      courseId: "course-5",
      courseCode: "WR101",
      courseName: "Academic Writing",
      teacherNames: ["Dr. Lisa Anderson"],
      statusCode: "Failed",
      statusName: "Failed"
    }
  ]
};

// Mock Course Details Data
export const mockCourseDetails: Record<string, CourseDetailResponse> = {
  "course-1": {
    courseId: "course-1",
    courseCode: "ABE101",
    courseName: "Advanced Business English",
    description: "Master professional communication skills for the corporate world. Learn presentations, negotiations, and business writing.",
    teacherNames: ["Sarah Johnson"],
    statusCode: "Passed",
    statusName: "Passed",
    assignments: [
      {
        assignmentId: "ass-1",
        title: "Business Communication Assignment",
        description: "Write a professional business email and prepare a short presentation on a business topic.",
        dueAt: "2024-02-15T23:59:59Z",
        submittedAt: "2024-02-15T10:00:00Z",
        score: 85,
        feedback: "Excellent business writing skills. Your email was professional and well-structured. The presentation was clear and engaging.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-2",
        title: "Meeting Skills Assessment",
        description: "Participate in a mock business meeting and demonstrate effective communication skills.",
        dueAt: "2024-03-10T23:59:59Z",
        submittedAt: "2024-03-10T14:30:00Z",
        score: 82,
        feedback: "Good participation. Showed strong negotiation skills. Could improve on time management during discussions.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-3",
        title: "Final Business Presentation",
        description: "Prepare and deliver a comprehensive business presentation on a topic of your choice.",
        dueAt: "2024-04-05T23:59:59Z",
        submittedAt: "2024-04-05T14:00:00Z",
        score: 88,
        feedback: "Outstanding presentation! Clear structure, excellent use of visual aids, and confident delivery.",
        submissionStatus: "Submitted"
      }
    ]
  },
  "course-2": {
    courseId: "course-2",
    courseCode: "IELTS201",
    courseName: "IELTS Test Preparation",
    description: "Comprehensive IELTS preparation covering all four skills: listening, reading, writing, and speaking with practice tests.",
    teacherNames: ["Michael Chen"],
    statusCode: "Passed",
    statusName: "Passed",
    assignments: [
      {
        assignmentId: "ass-4",
        title: "Listening Practice Test",
        description: "Complete a full IELTS listening practice test with 40 questions.",
        dueAt: "2024-02-20T23:59:59Z",
        submittedAt: "2024-02-20T10:00:00Z",
        score: 90,
        feedback: "Excellent listening skills demonstrated. Maintain focus throughout the entire test.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-5",
        title: "Writing Task 1 & 2",
        description: "Write essays for both Task 1 (graph/chart description) and Task 2 (argumentative essay).",
        dueAt: "2024-03-20T23:59:59Z",
        submittedAt: "2024-03-20T14:00:00Z",
        score: 95,
        feedback: "Outstanding writing! Both tasks were well-structured with excellent vocabulary and grammar. Your arguments were clear and persuasive.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-6",
        title: "Mock IELTS Test",
        description: "Complete a full mock IELTS test covering all four sections: Listening, Reading, Writing, and Speaking.",
        dueAt: "2024-04-28T23:59:59Z",
        submittedAt: "2024-04-28T09:00:00Z",
        score: 94,
        feedback: "Excellent overall performance! You are well-prepared for the actual IELTS test. Keep practicing to maintain this level.",
        submissionStatus: "Submitted"
      }
    ]
  },
  "course-3": {
    courseId: "course-3",
    courseCode: "ECC101",
    courseName: "English Conversation Club",
    description: "Improve your speaking and listening skills through interactive conversations and discussions.",
    teacherNames: ["Emma Wilson"],
    statusCode: "Passed",
    statusName: "Passed",
    assignments: [
      {
        assignmentId: "ass-7",
        title: "Weekly Participation",
        description: "Active participation in weekly conversation sessions.",
        dueAt: "2024-04-30T23:59:59Z",
        submittedAt: "2024-04-30T17:00:00Z",
        score: 75,
        feedback: "Good participation throughout the course. Continue practicing to improve fluency.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-8",
        title: "Group Discussion Project",
        description: "Participate in a group discussion on a current topic and demonstrate effective communication skills.",
        dueAt: "2024-04-15T23:59:59Z",
        submittedAt: "2024-04-15T14:00:00Z",
        score: 80,
        feedback: "Contributed well to group discussions. Good listening skills and respectful communication.",
        submissionStatus: "Submitted"
      }
    ]
  },
  "course-4": {
    courseId: "course-4",
    courseCode: "GF101",
    courseName: "Grammar Fundamentals",
    description: "Build a strong foundation in English grammar with comprehensive exercises and practice.",
    teacherNames: ["James Miller"],
    statusCode: "Passed",
    statusName: "Passed",
    assignments: [
      {
        assignmentId: "ass-9",
        title: "Grammar Exercises Set 1",
        description: "Complete exercises covering basic grammar rules: tenses, articles, and prepositions.",
        dueAt: "2024-02-10T23:59:59Z",
        submittedAt: "2024-02-10T10:00:00Z",
        score: 95,
        feedback: "Perfect! Excellent understanding of basic grammar concepts.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-10",
        title: "Grammar Exercises Set 2",
        description: "Complete exercises covering advanced grammar: conditionals, passive voice, and reported speech.",
        dueAt: "2024-03-01T23:59:59Z",
        submittedAt: "2024-03-01T10:00:00Z",
        score: 92,
        feedback: "Very good work! Minor errors in complex structures, but overall excellent.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-11",
        title: "Final Grammar Exam",
        description: "Comprehensive grammar exam covering all topics studied throughout the course.",
        dueAt: "2024-04-30T23:59:59Z",
        submittedAt: "2024-04-30T09:00:00Z",
        score: 94,
        feedback: "Outstanding performance! You have mastered grammar fundamentals.",
        submissionStatus: "Submitted"
      }
    ]
  },
  "course-5": {
    courseId: "course-5",
    courseCode: "WR101",
    courseName: "Academic Writing",
    description: "Develop academic writing skills including research, citation, and formal essay writing.",
    teacherNames: ["Dr. Lisa Anderson"],
    statusCode: "Failed",
    statusName: "Failed",
    assignments: [
      {
        assignmentId: "ass-12",
        title: "Essay Writing Assignment 1",
        description: "Write a 500-word argumentative essay on a given topic with proper academic structure.",
        dueAt: "2024-02-20T23:59:59Z",
        submittedAt: "2024-02-20T10:00:00Z",
        score: 60,
        feedback: "Basic structure present but needs improvement in argument development and citation style.",
        submissionStatus: "Submitted"
      },
      {
        assignmentId: "ass-13",
        title: "Research Paper Draft",
        description: "Submit a draft of your research paper with proper citations and bibliography.",
        dueAt: "2024-03-15T23:59:59Z",
        submittedAt: "2024-03-15T14:00:00Z",
        score: 0,
        feedback: "Draft was not submitted on time and did not meet minimum requirements.",
        submissionStatus: "Overdue"
      },
      {
        assignmentId: "ass-14",
        title: "Final Research Paper",
        description: "Submit the final research paper (1500 words) with proper academic formatting and citations.",
        dueAt: "2024-04-30T23:59:59Z",
        submittedAt: "2024-04-30T14:00:00Z",
        score: 0,
        feedback: "Paper was submitted late and did not meet the academic writing standards required.",
        submissionStatus: "Late"
      }
    ]
  }
};

// Mock Learning Performance Metrics (for Learning Path dashboard)
export const mockLearningPerformance = {
  weeklyScores: [
    { week: "W1", score: 68 },
    { week: "W2", score: 72 },
    { week: "W3", score: 75 },
    { week: "W4", score: 70 },
    { week: "W5", score: 78 },
    { week: "W6", score: 82 },
    { week: "W7", score: 79 },
    { week: "W8", score: 84 }
  ],
  assignmentCompletion: {
    total: 24,
    completed: 19,
    pending: 3,
    overdue: 2
  },
  earlyWarning: {
    riskLevel: "low", // low | medium | high
    reasons: [
      // Example reasons; will filter in UI based on thresholds
      { code: "SCORE_DROP", label: "Điểm tuần giảm liên tiếp" },
      { code: "LOW_COMPLETION", label: "Tỷ lệ hoàn thành bài tập thấp" },
      { code: "ABSENCE", label: "Vắng học nhiều buổi" }
    ]
  }
};

// Mock Classes Data by CourseCode
export const mockClassesByCourseCode: Record<string, MyClass[]> = {
  "ABE101": [
    {
      id: "class-abe101-1",
      className: "Advanced Business English - Class A1",
      classNum: 1,
      description: "Master professional communication skills for the corporate world",
      instructor: "Sarah Johnson",
      level: "Advanced",
      classStatus: "Ongoing",
      courseFormat: "In-person",
      courseName: "Advanced Business English",
      courseCode: "ABE101",
      category: "Business English",
      startDate: "2024-01-20",
      endDate: "2024-04-15",
      status: "active",
      capacity: 25,
      enrolledCount: 18,
      isActive: true,
    },
    {
      id: "class-abe101-2",
      className: "Advanced Business English - Class A2",
      classNum: 2,
      description: "Master professional communication skills for the corporate world",
      instructor: "Sarah Johnson",
      level: "Advanced",
      classStatus: "Upcoming",
      courseFormat: "Online",
      courseName: "Advanced Business English",
      courseCode: "ABE101",
      category: "Business English",
      startDate: "2024-05-01",
      endDate: "2024-07-30",
      status: "upcoming",
      capacity: 30,
      enrolledCount: 12,
      isActive: false,
    }
  ],
  "IELTS201": [
    {
      id: "class-ielts201-1",
      className: "IELTS Test Preparation - Class B2",
      classNum: 1,
      description: "Comprehensive IELTS preparation covering all four skills",
      instructor: "Michael Chen",
      level: "Intermediate",
      classStatus: "Completed",
      courseFormat: "In-person",
      courseName: "IELTS Test Preparation",
      courseCode: "IELTS201",
      category: "Test Preparation",
      startDate: "2023-11-15",
      endDate: "2024-01-10",
      status: "completed",
      capacity: 20,
      enrolledCount: 20,
      isActive: false,
    },
    {
      id: "class-ielts201-2",
      className: "IELTS Test Preparation - Class B3",
      classNum: 2,
      description: "Comprehensive IELTS preparation covering all four skills",
      instructor: "Michael Chen",
      level: "Intermediate",
      classStatus: "Ongoing",
      courseFormat: "Hybrid",
      courseName: "IELTS Test Preparation",
      courseCode: "IELTS201",
      category: "Test Preparation",
      startDate: "2024-02-01",
      endDate: "2024-04-30",
      status: "active",
      capacity: 25,
      enrolledCount: 22,
      isActive: true,
    }
  ],
  "ECC101": [
    {
      id: "class-ecc101-1",
      className: "English Conversation Club - Class C1",
      classNum: 1,
      description: "Improve your speaking and listening skills through interactive conversations",
      instructor: "Emma Wilson",
      level: "Beginner",
      classStatus: "Completed",
      courseFormat: "In-person",
      courseName: "English Conversation Club",
      courseCode: "ECC101",
      category: "Conversation",
      startDate: "2024-01-10",
      endDate: "2024-03-30",
      status: "completed",
      capacity: 15,
      enrolledCount: 15,
      isActive: false,
    }
  ],
  "GF101": [
    {
      id: "class-gf101-1",
      className: "Grammar Fundamentals - Class F1",
      classNum: 1,
      description: "Build a strong foundation in English grammar",
      instructor: "James Miller",
      level: "Beginner",
      classStatus: "Ongoing",
      courseFormat: "In-person",
      courseName: "Grammar Fundamentals",
      courseCode: "GF101",
      category: "Grammar",
      startDate: "2024-02-01",
      endDate: "2024-05-30",
      status: "active",
      capacity: 20,
      enrolledCount: 16,
      isActive: true,
    }
  ],
  "WR101": [
    {
      id: "class-wr101-1",
      className: "Academic Writing - Class W1",
      classNum: 1,
      description: "Develop academic writing skills including research and citation",
      instructor: "Dr. Lisa Anderson",
      level: "Advanced",
      classStatus: "Completed",
      courseFormat: "In-person",
      courseName: "Academic Writing",
      courseCode: "WR101",
      category: "Writing",
      startDate: "2024-01-15",
      endDate: "2024-04-30",
      status: "completed",
      capacity: 18,
      enrolledCount: 15,
      isActive: false,
    }
  ]
};

// Mock Sessions/Meetings by ClassId
export const mockClassMeetings: Record<string, ClassMeeting[]> = {
  "class-abe101-1": [
    {
      id: "meeting-abe101-1-session1",
      classID: "class-abe101-1",
      date: "2024-01-20",
      isStudy: true,
      roomID: "room-201",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-abe101-1-session2",
      classID: "class-abe101-1",
      date: "2024-01-22",
      isStudy: true,
      roomID: "room-201",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-abe101-1-session3",
      classID: "class-abe101-1",
      date: "2024-01-25",
      isStudy: true,
      roomID: "room-201",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-abe101-1-session4",
      classID: "class-abe101-1",
      date: "2024-01-27",
      isStudy: false,
      roomID: "room-201",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-abe101-1-session5",
      classID: "class-abe101-1",
      date: "2024-02-01",
      isStudy: true,
      roomID: "room-201",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-abe101-1-session6",
      classID: "class-abe101-1",
      date: "2024-02-03",
      isStudy: true,
      roomID: "room-201",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    }
  ],
  "class-ielts201-1": [
    {
      id: "meeting-ielts201-1-session1",
      classID: "class-ielts201-1",
      date: "2023-11-15",
      isStudy: true,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    },
    {
      id: "meeting-ielts201-1-session2",
      classID: "class-ielts201-1",
      date: "2023-11-17",
      isStudy: true,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    },
    {
      id: "meeting-ielts201-1-session3",
      classID: "class-ielts201-1",
      date: "2023-11-20",
      isStudy: true,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    }
  ],
  "class-ielts201-2": [
    {
      id: "meeting-ielts201-2-session1",
      classID: "class-ielts201-2",
      date: "2024-02-01",
      isStudy: true,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-ielts201-2-session2",
      classID: "class-ielts201-2",
      date: "2024-02-03",
      isStudy: true,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-ielts201-2-session3",
      classID: "class-ielts201-2",
      date: "2024-02-05",
      isStudy: true,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-ielts201-2-session4",
      classID: "class-ielts201-2",
      date: "2024-02-08",
      isStudy: false,
      roomID: "room-301",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    }
  ],
  "class-ecc101-1": [
    {
      id: "meeting-ecc101-1-session1",
      classID: "class-ecc101-1",
      date: "2024-01-10",
      isStudy: true,
      roomID: "room-102",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    },
    {
      id: "meeting-ecc101-1-session2",
      classID: "class-ecc101-1",
      date: "2024-01-12",
      isStudy: true,
      roomID: "room-102",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    }
  ],
  "class-gf101-1": [
    {
      id: "meeting-gf101-1-session1",
      classID: "class-gf101-1",
      date: "2024-02-01",
      isStudy: true,
      roomID: "room-205",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-gf101-1-session2",
      classID: "class-gf101-1",
      date: "2024-02-03",
      isStudy: true,
      roomID: "room-205",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-gf101-1-session3",
      classID: "class-gf101-1",
      date: "2024-02-05",
      isStudy: true,
      roomID: "room-205",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    },
    {
      id: "meeting-gf101-1-session4",
      classID: "class-gf101-1",
      date: "2024-02-08",
      isStudy: false,
      roomID: "room-205",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: true,
      isDeleted: false
    }
  ],
  "class-wr101-1": [
    {
      id: "meeting-wr101-1-session1",
      classID: "class-wr101-1",
      date: "2024-01-15",
      isStudy: true,
      roomID: "room-304",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    },
    {
      id: "meeting-wr101-1-session2",
      classID: "class-wr101-1",
      date: "2024-01-17",
      isStudy: true,
      roomID: "room-304",
      onlineMeetingUrl: null,
      passcode: null,
      recordingUrl: null,
      progressNote: null,
      isActive: false,
      isDeleted: false
    }
  ]
};

// Mock Assignments by MeetingId
export const mockAssignmentsByMeeting: Record<string, MeetingAssignment[]> = {
  "meeting-abe101-1-session1": [
    {
      id: "ass-abe101-1-1",
      classMeetingId: "meeting-abe101-1-session1",
      teacherId: "teacher-1",
      title: "Business Communication Assignment",
      description: "Write a professional business email and prepare a short presentation on a business topic",
      fileUrl: null,
      dueDate: "2024-01-27",
      createdAt: "2024-01-20",
      submissions: [
        {
          id: "sub-1",
          assignmentID: "ass-abe101-1-1",
          studentID: "student-1",
          storeUrl: "https://example.com/file1.pdf",
          content: null,
          score: 85,
          feedback: "Excellent business writing skills. Your email was professional and well-structured.",
          createdAt: "2024-01-25"
        }
      ]
    }
  ],
  "meeting-abe101-1-session2": [
    {
      id: "ass-abe101-1-2",
      classMeetingId: "meeting-abe101-1-session2",
      teacherId: "teacher-1",
      title: "Email Writing Skills Practice",
      description: "Complete exercises on professional email writing",
      fileUrl: null,
      dueDate: "2024-02-03",
      createdAt: "2024-01-22",
      submissions: [
        {
          id: "sub-2",
          assignmentID: "ass-abe101-1-2",
          studentID: "student-1",
          storeUrl: "https://example.com/file2.pdf",
          content: null,
          score: null,
          feedback: null,
          createdAt: "2024-02-01"
        }
      ]
    }
  ],
  "meeting-abe101-1-session3": [],
  "meeting-abe101-1-session4": [],
  "meeting-abe101-1-session5": [
    {
      id: "ass-abe101-1-3",
      classMeetingId: "meeting-abe101-1-session5",
      teacherId: "teacher-1",
      title: "Meeting Skills Assessment",
      description: "Participate in a mock business meeting and demonstrate effective communication skills",
      fileUrl: null,
      dueDate: "2024-02-10",
      createdAt: "2024-02-01",
      submissions: []
    }
  ],
  "meeting-abe101-1-session6": [],
  "meeting-ielts201-2-session1": [
    {
      id: "ass-ielts201-2-1",
      classMeetingId: "meeting-ielts201-2-session1",
      teacherId: "teacher-2",
      title: "Listening Practice Test",
      description: "Complete a full IELTS listening practice test with 40 questions",
      fileUrl: null,
      dueDate: "2024-02-05",
      createdAt: "2024-02-01",
      submissions: [
        {
          id: "sub-3",
          assignmentID: "ass-ielts201-2-1",
          studentID: "student-1",
          storeUrl: "https://example.com/file3.pdf",
          content: null,
          score: 90,
          feedback: "Excellent listening skills demonstrated. Maintain focus throughout the entire test.",
          createdAt: "2024-02-04"
        }
      ]
    }
  ],
  "meeting-ielts201-2-session2": [
    {
      id: "ass-ielts201-2-2",
      classMeetingId: "meeting-ielts201-2-session2",
      teacherId: "teacher-2",
      title: "Reading Comprehension Exercise",
      description: "Complete reading comprehension exercises from IELTS practice book",
      fileUrl: null,
      dueDate: "2024-02-08",
      createdAt: "2024-02-03",
      submissions: []
    }
  ],
  "meeting-ielts201-2-session3": [],
  "meeting-ielts201-2-session4": [],
  "meeting-gf101-1-session1": [
    {
      id: "ass-gf101-1-1",
      classMeetingId: "meeting-gf101-1-session1",
      teacherId: "teacher-4",
      title: "Grammar Exercises Set 1",
      description: "Complete exercises covering basic grammar rules: tenses, articles, and prepositions",
      fileUrl: null,
      dueDate: "2024-02-05",
      createdAt: "2024-02-01",
      submissions: [
        {
          id: "sub-4",
          assignmentID: "ass-gf101-1-1",
          studentID: "student-1",
          storeUrl: "https://example.com/file4.pdf",
          content: null,
          score: 95,
          feedback: "Perfect! Excellent understanding of basic grammar concepts.",
          createdAt: "2024-02-04"
        }
      ]
    }
  ],
  "meeting-gf101-1-session2": [
    {
      id: "ass-gf101-1-2",
      classMeetingId: "meeting-gf101-1-session2",
      teacherId: "teacher-4",
      title: "Verb Tenses Practice",
      description: "Complete exercises on verb tenses",
      fileUrl: null,
      dueDate: "2024-02-08",
      createdAt: "2024-02-03",
      submissions: []
    }
  ],
  "meeting-gf101-1-session3": [],
  "meeting-gf101-1-session4": []
};

