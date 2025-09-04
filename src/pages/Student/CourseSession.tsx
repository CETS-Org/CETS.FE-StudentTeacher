import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import { 
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  User,
  MessageCircle,
  ArrowLeft,
  FileText,
  Download,
  Upload,
  X,
  AlertCircle,
  Clock as ClockIcon,
  Star
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

interface Instructor {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalReviews: number;
  experience: string;
  specialties: string[];
  bio: string;
  email?: string;
  courses?: number;
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
  instructorDetails: Instructor;
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
      title: "English for Beginners.pdf",
      fileName: "English for Beginners.pdf",
      uploadDate: "Jan 30, 2025",
      size: "1.8 MB"
    },
    {
      id: "material3",
      title: "English for Beginners.pdf", 
      fileName: "English for Beginners.pdf",
      uploadDate: "Jan 30, 2025",
      size: "3.2 MB"
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
      instructorRemarks: "Good work on the responsive design! The JavaScript functionality is well implemented. Consider improving the accessibility features for better user experience. Overall, solid project execution."
    },
    {
      id: "assignment2",
      title: "Assignment First Term - Unit 4, 5, 6", 
      dueDate: "Jan 30, 2025",
      status: "pending"
    },
    {
      id: "assignment3",
      title: "Assignment First Term - Unit 6, 7, 8",
      dueDate: "Feb 5, 2025", 
      status: "locked",
      availableDate: "Feb 5, 2025"
    }
  ],
  instructorDetails: {
    id: "instructor1",
    name: "Dr. Sarah Johnson",
    avatar: "/api/placeholder/100/100",
    rating: 4.9,
    totalReviews: 127,
    experience: "5 years experience",
    specialties: ["TOEIC", "IELTS"],
    bio: "Passionate educator with expertise in STEM subjects. I believe in making complex concepts simple and engaging for students. My teaching approach focuses on practical applications and interactive learning.",
    email: "sarah.johnson@cets.edu",
    courses: 15
  },
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

const MaterialCard: React.FC<{ material: CourseMaterial }> = ({ material }) => {
  const handleDownload = () => {
    // In real app, this would trigger file download
    console.log(`Downloading ${material.fileName}`);
  };

  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-neutral-600" />
        </div>
        <div>
          <h4 className="font-medium text-neutral-900">{material.title}</h4>
          <p className="text-sm text-neutral-500">{material.uploadDate}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {material.size && (
          <span className="text-sm text-neutral-500">{material.size}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          iconLeft={<Download className="w-4 h-4" />}
        >
          Download
        </Button>
      </div>
    </div>
  );
};

const FileUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Upload file</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-neutral-300 hover:border-neutral-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-neutral-500" />
          </div>
          
          {selectedFile ? (
            <div className="mb-4">
              <p className="font-medium text-neutral-900">{selectedFile.name}</p>
              <p className="text-sm text-neutral-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <>
              <p className="text-neutral-700 mb-2">Drag & drop your files here</p>
              <p className="text-sm text-neutral-500 mb-4">or click to browse from your computer</p>
            </>
          )}

          <input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.ppt,.mp4,.mp3"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="secondary" className="cursor-pointer">
              Choose File
            </Button>
          </label>
        </div>

        <div className="mt-4 p-3 bg-neutral-50 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-neutral-500 mt-0.5" />
            <div className="text-xs text-neutral-600">
              <p className="font-medium mb-1">Allowed file types:</p>
              <p>PDF, DOCX, PPT, MP4, MP3 (Maximum file size: 50MB)</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!selectedFile}
            className="flex-1"
          >
            Submit Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

const AssignmentCard: React.FC<{ 
  assignment: Assignment;
  onSubmit: (assignmentId: string) => void;
}> = ({ assignment, onSubmit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded": return "bg-success-100 text-success-700";
      case "submitted": return "bg-primary-100 text-primary-700"; 
      case "pending": return "bg-warning-100 text-warning-700";
      case "late": return "bg-error-100 text-error-700";
      case "locked": return "bg-neutral-100 text-neutral-500";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "graded": return "Graded";
      case "submitted": return "Submitted";
      case "pending": return "Pending";
      case "late": return "Late";
      case "locked": return "Locked";
      default: return status;
    }
  };

  const canSubmit = assignment.status === "pending";
  const isLocked = assignment.status === "locked";

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {assignment.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Due: {assignment.dueDate}</span>
            </div>
            {assignment.status === "pending" && (
              <div className="flex items-center gap-1 text-warning-600">
                <ClockIcon className="w-4 h-4" />
                <span>3 days left</span>
              </div>
            )}
          </div>
        </div>
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
          {getStatusLabel(assignment.status)}
        </span>
      </div>

      {/* Score Display */}
      {assignment.score && (
        <div className="mb-4 p-3 bg-success-50 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-success-700">Score: {assignment.score}</span>
            <CheckCircle className="w-4 h-4 text-success-500" />
          </div>
        </div>
      )}

      {/* Submitted File */}
      {assignment.submittedFile && (
        <div className="mb-4 p-3 bg-neutral-50 rounded-md">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-900">
              {assignment.submittedFile.name}
            </span>
            <span className="text-sm text-neutral-500">
              ({assignment.submittedFile.size})
            </span>
          </div>
        </div>
      )}

      {/* Instructor Remarks */}
      {assignment.instructorRemarks && (
        <div className="mb-4 p-4 bg-neutral-50 rounded-md">
          <h4 className="text-sm font-medium text-neutral-900 mb-2">Instructor Remarks:</h4>
          <p className="text-sm text-neutral-700">{assignment.instructorRemarks}</p>
        </div>
      )}

      {/* Locked State */}
      {isLocked && assignment.availableDate && (
        <div className="mb-4 p-3 bg-neutral-100 rounded-md text-center">
          <p className="text-sm text-neutral-600">
            Available {assignment.availableDate}
          </p>
          <Button disabled className="mt-2">
            Coming Soon
          </Button>
        </div>
      )}

      {/* Action Button */}
      {canSubmit && (
        <div className="flex justify-end">
          <Button 
            variant="primary"
            onClick={() => onSubmit(assignment.id)}
            iconLeft={<Upload className="w-4 h-4" />}
          >
            Submit Assignment
          </Button>
        </div>
      )}
    </Card>
  );
};

const InstructorCard: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
  const handleMessageTeacher = () => {
    console.log(`Messaging instructor: ${instructor.name}`);
  };

  const handleViewCourses = () => {
    console.log(`Viewing courses by: ${instructor.name}`);
  };

  const generateAvatarPlaceholder = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <div className="w-16 h-16 bg-neutral-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
        {initials}
      </div>
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-warning-400 text-warning-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-warning-200 text-warning-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-neutral-300" />
      );
    }

    return stars;
  };

  return (
    <Card className="p-6">
      <div className="flex gap-4 mb-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {instructor.avatar ? (
            <img 
              src={instructor.avatar}
              alt={instructor.name}
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={instructor.avatar ? 'hidden' : ''}>
            {generateAvatarPlaceholder(instructor.name)}
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {instructor.name}
          </h2>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(instructor.rating)}
            </div>
            <span className="font-medium text-neutral-900">
              {instructor.rating}
            </span>
            <span className="text-sm text-neutral-600">
              ({instructor.totalReviews} reviews)
            </span>
          </div>

          {/* Experience */}
          <p className="text-sm text-neutral-600 mb-3">
            {instructor.experience}
          </p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2">
            {instructor.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-md"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <p className="text-neutral-700 leading-relaxed">
          {instructor.bio}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="secondary"
          className="flex-1"
          onClick={handleViewCourses}
        >
          View Courses
        </Button>
        <Button 
          variant="primary"
          className="flex-1"
          iconLeft={<MessageCircle className="w-4 h-4" />}
          onClick={handleMessageTeacher}
        >
          Message Teacher
        </Button>
      </div>
    </Card>
  );
};

export default function CourseSession() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("sessions");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  
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
    navigate('/student/myCourses');
  };

  const handleAssignmentSubmit = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setShowUploadModal(true);
  };

  const handleFileSubmit = (file: File) => {
    // In real app, upload file to server
    console.log(`Uploading file for assignment ${selectedAssignmentId}:`, file);
    setShowUploadModal(false);
    setSelectedAssignmentId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-success-100 text-success-700";
      case "In Progress": return "bg-primary-100 text-primary-700";
      case "Registered": return "bg-info-100 text-info-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  const tabs = [
    { id: "sessions", label: "Sessions", badge: course.sessions.length },
    { id: "materials", label: "Course Materials", badge: course.materials.length },
    { id: "homework", label: "Homework/Quiz" },
    { id: "assignments", label: "Assignment Submission", badge: course.assignments.length },
    { id: "instructor", label: "Instructor" }
  ];

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

            {/* Tabs Navigation */}
            <Card className="mb-6">
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </Card>

            {/* Tab Content */}
            <TabContent activeTab={activeTab} tabId="sessions">
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
            </TabContent>

            <TabContent activeTab={activeTab} tabId="materials">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Course Materials</h2>
                {course.materials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
                {course.materials.length === 0 && (
                  <Card className="text-center py-12">
                    <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                      No materials available
                    </h3>
                    <p className="text-neutral-600">
                      Course materials will be uploaded by your instructor.
                    </p>
                  </Card>
                )}
              </div>
            </TabContent>

            <TabContent activeTab={activeTab} tabId="homework">
              <Card className="text-center py-12">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Homework/Quiz
                </h3>
                <p className="text-neutral-600">
                  Coming soon...
                </p>
              </Card>
            </TabContent>

            <TabContent activeTab={activeTab} tabId="assignments">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900">Assignment Submission</h2>
                {course.assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onSubmit={handleAssignmentSubmit}
                  />
                ))}
                {course.assignments.length === 0 && (
                  <Card className="text-center py-12">
                    <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                      No assignments available
                    </h3>
                    <p className="text-neutral-600">
                      Assignments will be posted by your instructor.
                    </p>
                  </Card>
                )}
              </div>
            </TabContent>

            <TabContent activeTab={activeTab} tabId="instructor">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-900">Instructor</h2>
                <InstructorCard instructor={course.instructorDetails} />
              </div>
            </TabContent>
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

        {/* File Upload Modal */}
        <FileUploadModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedAssignmentId(null);
          }}
          onSubmit={handleFileSubmit}
        />
      </div>
    </StudentLayout>
  );
}