import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { 
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  User,
  MessageCircle,
  ArrowLeft
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
}

interface SubmissionTask {
  id: string;
  title: string;
  sessionId: string;
  isSubmitted: boolean;
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
}

// Mock data cho course detail
const mockCourseDetail: CourseDetail = {
  id: "1",
  title: "English For Beginner",
  instructor: "Sarah Johnson",
  duration: "12 weeks", 
  nextClass: "Jan 28, 2025",
  progress: 95,
  status: "Registered",
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
      ]
    },
    {
      id: "session2",
      title: "Session 2",
      topic: "Greetings and Introduction",
      date: "09-30 23/08/2025 - 11:45 23/08/2025",
      duration: "1h 45m",
      isCompleted: false,
      submissionTasks: [
        {
          id: "task2-1",
          title: "Submit: exercise 1 session 2", 
          sessionId: "session2",
          isSubmitted: false
        }
      ]
    },
    {
      id: "session3",
      title: "Session 3",
      topic: "Greetings and Introduction",
      date: "09-30 23/08/2025 - 11:45 23/08/2025",
      duration: "1h 45m",
      isCompleted: false,
      submissionTasks: []
    }
  ]
};

const SessionCard: React.FC<{ 
  session: CourseSession; 
  isExpanded: boolean; 
  onToggle: () => void 
}> = ({ session, isExpanded, onToggle }) => {
  return (
    <Card className="mb-4">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            session.isCompleted ? 'bg-success-100' : 'bg-neutral-100'
          }`}>
            {session.isCompleted ? (
              <CheckCircle className="w-4 h-4 text-success-600" />
            ) : (
              <Play className="w-4 h-4 text-neutral-400" />
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-900">{session.title}</h3>
            <p className="text-sm text-neutral-600">Topic: {session.topic}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{session.date}</span>
            </div>
          </div>
          
          <div className="text-neutral-400">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <div className="pt-4">
            {/* Submission Tasks */}
            {session.submissionTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900 mb-3">Submissions:</h4>
                {session.submissionTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-md">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      task.isSubmitted ? 'bg-success-500' : 'bg-neutral-300'
                    }`}>
                      {task.isSubmitted && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      task.isSubmitted ? 'text-neutral-700' : 'text-neutral-600'
                    }`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {session.submissionTasks.length === 0 && (
              <p className="text-sm text-neutral-500 italic">No submissions for this session</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default function CourseSession() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  
  // In real app, fetch course data based on courseId
  const course = mockCourseDetail;
  
  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const goBack = () => {
    navigate('/student/my-courses');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-success-100 text-success-700";
      case "In Progress": return "bg-primary-100 text-primary-700";
      case "Registered": return "bg-info-100 text-info-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">My Courses</span>
          </button>
          <span className="text-neutral-400">›</span>
          <span className="text-sm text-neutral-900 font-medium">{course.title}</span>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Course Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                  <CheckCircle className="w-4 h-4 text-success-500" />
                </div>
              </div>
              
              <Button variant="primary">
                Go to Class
              </Button>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {course.sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedSessions.has(session.id)}
                  onToggle={() => toggleSession(session.id)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Course Info</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-600">Instructor</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-900">{course.instructor}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-neutral-600">Duration</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-900">{course.duration}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-neutral-600">Next Class</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-900">{course.nextClass}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-700">Progress</span>
                    <span className="text-sm font-semibold text-neutral-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div 
                      className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Contact Advisor */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    iconLeft={<MessageCircle className="w-4 h-4" />}
                  >
                    Contact Advisor
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}