import React from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import { 
  Calendar,
  Clock,
  CheckCircle,
  Play,
  ArrowLeft,
  User
} from "lucide-react";

// Session interface
interface CourseSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration: string;
  isCompleted: boolean;
  submissionTasks: SubmissionTask[];
  // Session Context fields
  topicTitle: string;
  estimatedMinutes: number;
  required: boolean;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
}

interface SubmissionTask {
  id: string;
  title: string;
  sessionId: string;
  isSubmitted: boolean;
}

interface CourseMaterial {
  id: string;
  title: string;
  fileName: string;
  uploadDate: string;
  size?: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "late" | "submitted" | "graded" | "locked";
  score?: string;
  submittedFile?: {
    name: string;
    size: string;
  };
  instructorRemarks?: string;
  availableDate?: string;
}

interface CourseDetail {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  nextClass: string;
  progress: number;
  status: "Registered" | "In Progress" | "Completed";
  sessions: CourseSession[];
  materials: CourseMaterial[];
  assignments: Assignment[];
}

// Mock data
const mockCourseDetail: CourseDetail = {
  id: "1",
  title: "English For Beginner",
  instructor: "Sarah Johnson",
  duration: "12 weeks", 
  nextClass: "Jan 28, 2025",
  progress: 95,
  status: "Registered",
  materials: [
    {
      id: "material1",
      title: "English for Beginners.pdf",
      fileName: "English for Beginners.pdf",
      uploadDate: "Jan 30, 2025",
      size: "2.4 MB"
    },
    {
      id: "material2", 
      title: "Grammar Basics.pdf",
      fileName: "Grammar Basics.pdf",
      uploadDate: "Jan 30, 2025",
      size: "1.8 MB"
    }
  ],
  assignments: [
    {
      id: "assignment1",
      title: "Assignment First Term - Unit 1, 2, 3",
      dueDate: "Jan 29, 2025",
      status: "graded",
      score: "95/100",
      submittedFile: {
        name: "project_v2.pdf",
        size: "2.4 MB"
      },
      instructorRemarks: "Good work on the responsive design! The JavaScript functionality is well implemented."
    },
    {
      id: "assignment2",
      title: "Assignment First Term - Unit 4, 5, 6", 
      dueDate: "Jan 30, 2025",
      status: "pending"
    }
  ],
  sessions: [
    {
      id: "session1",
      title: "Session 1",
      topic: "Greetings and Introduction",
      date: "09-30 23/08/2025 - 11:45 23/08/2025",
      duration: "1h 45m",
      isCompleted: true,
      submissionTasks: [
        {
          id: "task1-1",
          title: "Submit: exercise 1 session 1",
          sessionId: "session1",
          isSubmitted: true
        },
        {
          id: "task1-2", 
          title: "Submit: exercise 2 session 1",
          sessionId: "session1",
          isSubmitted: true
        }
      ],
      topicTitle: "Basic Greetings and Self-Introduction",
      estimatedMinutes: 105,
      required: true,
      objectives: [
        "Learn basic greeting phrases in English",
        "Practice introducing yourself and others",
        "Understand cultural differences in greetings",
        "Build confidence in speaking English"
      ],
      contentSummary: "This session covers fundamental English greetings, including formal and informal ways to say hello, goodbye, and introduce yourself. Students will practice pronunciation and learn about cultural context.",
      preReadingUrl: "https://example.com/greetings-reading"
    },
    {
      id: "session2",
      title: "Session 2",
      topic: "Numbers and Time",
      date: "09-30 25/08/2025 - 11:45 25/08/2025",
      duration: "1h 45m",
      isCompleted: false,
      submissionTasks: [
        {
          id: "task2-1",
          title: "Submit: exercise 1 session 2", 
          sessionId: "session2",
          isSubmitted: false
        }
      ],
      topicTitle: "Numbers, Time, and Daily Schedules",
      estimatedMinutes: 105,
      required: true,
      objectives: [
        "Master numbers 1-100 in English",
        "Learn to tell time in different formats",
        "Practice describing daily routines",
        "Understand time-related vocabulary"
      ],
      contentSummary: "Students will learn cardinal and ordinal numbers, how to tell time using both 12-hour and 24-hour formats, and vocabulary related to daily schedules and routines.",
      preReadingUrl: "https://example.com/numbers-time-reading"
    },
    {
      id: "session3",
      title: "Session 3",
      topic: "Family and Relationships",
      date: "09-30 27/08/2025 - 11:45 27/08/2025",
      duration: "1h 45m",
      isCompleted: false,
      submissionTasks: [],
      topicTitle: "Family Members and Relationships",
      estimatedMinutes: 105,
      required: true,
      objectives: [
        "Learn family member vocabulary",
        "Practice describing family relationships",
        "Understand possessive forms",
        "Discuss family traditions and customs"
      ],
      contentSummary: "This session introduces vocabulary for family members, teaches possessive forms (my, your, his, her), and provides practice in describing family relationships and traditions.",
      preReadingUrl: "https://example.com/family-reading"
    }
  ]
};

// Simple Session Card Component
const SessionCard: React.FC<{ 
  session: CourseSession;
  onNavigate: (sessionId: string) => void;
}> = ({ session, onNavigate }) => {
  return (
    <div 
      className="mb-4 border border-accent-200 bg-white hover:bg-accent-25 hover:shadow-lg transition-all duration-200 cursor-pointer rounded-lg"
      onClick={() => onNavigate(session.id)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            session.isCompleted 
              ? 'bg-success-500' 
              : 'bg-accent-500'
          }`}>
            {session.isCompleted ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-primary-800 text-lg">{session.title}</h3>
            <p className="text-sm text-accent-600 font-medium">{session.topic}</p>
            <p className="text-xs text-neutral-500 mt-1">{session.topicTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 ">
          <div className="flex flex-col  text-sm ">
            <div className="flex items-center gap-2 bg-accent-100 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-primary-700">{session.date}</span>
            </div>
            <div className="flex items-center ml-auto gap-2 bg-neutral-100 px-3 py-1 rounded-lg mt-2 w-fit">
              <Clock className="w-4 h-4 text-neutral-600" />
              <span className="font-medium text-neutral-700">{session.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ClassSession() {
  const navigate = useNavigate();
  
  // In real app, fetch course data based on classId
  const course = mockCourseDetail;
  
  const handleSessionClick = (sessionId: string) => {
    navigate(`/student/class/${course.id}/session/${sessionId}`);
  };

  const goBack = () => {
    navigate('/student/my-classes');
  };

  return (
    <StudentLayout>
      <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">My Classes</span>
          </button>
          <span className="text-neutral-400">›</span>
          <span className="text-sm text-neutral-900 font-medium">{course.title}</span>
        </div>

        {/* Course Header */}
        <div className="flex items-center justify-between mb-8 p-6 border border-accent-200 rounded-xl bg-white">
          <div>
            <h1 className="text-3xl font-bold text-primary-800 mb-3">
              {course.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-accent-50 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">{course.instructor}</span>
              </div>
              <div className="flex items-center gap-2 bg-success-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success-600" />
                <span className="text-sm font-medium text-success-700">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">Course Sessions</h2>
          {course.sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onNavigate={handleSessionClick}
            />
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}