import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Spinner from "@/components/ui/Spinner";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ExternalLink,
  MoreVertical,
  CheckCircle,
  MapPin,
  AlertCircle,
  RefreshCw
} from "lucide-react";

import type { MyClass } from "@/types/class";
import { studentLearningClassesService } from "@/services/studentLearningClassesService";
import { getStudentId } from "@/lib/utils";

// Fallback mock data for development/testing
const mockMyClasses: MyClass[] = [
  {
    id: "1",
    className: "Advanced Business English - Class A1",
    classNum: 1,
    description: "Master professional communication skills for the corporate world. Learn presentations, negotiations, and business writing.",
    instructor: "Sarah Johnson",
    level: "Advanced",
    classStatus: "Active",
    courseFormat: "In-person",
    courseName: "Advanced Business English",
    courseCode: "ABE101",
    category: "Business English",
    enrolledDate: "2024-01-15",
    startDate: "2024-01-20",
    endDate: "2024-04-15",
    status: "active",
    capacity: 25,
    enrolledCount: 18,
    isActive: true,
    totalHours: 60,
    sessionsPerWeek: 3,
    certificate: true,
    price: 299,
    nextMeeting: {
      id: "meeting-1",
      startsAt: "2024-02-15T19:00:00Z",
      endsAt: "2024-02-15T21:00:00Z",
      roomId: "room-201",
      roomName: "Room 201, CETS Center",
      coveredTopic: "Business Communication Fundamentals"
    }
  },
  {
    id: "2",
    className: "IELTS Test Preparation - Class B2",
    classNum: 2,
    description: "Comprehensive IELTS preparation covering all four skills: listening, reading, writing, and speaking with practice tests.",
    instructor: "Michael Chen",
    level: "Intermediate",
    classStatus: "Completed",
    courseFormat: "In-person",
    courseName: "IELTS Test Preparation",
    courseCode: "IELTS201",
    category: "Test Preparation",
    enrolledDate: "2023-11-10",
    startDate: "2023-11-15",
    endDate: "2024-01-10",
    status: "completed",
    capacity: 20,
    enrolledCount: 20,
    isActive: false,
    totalHours: 40,
    sessionsPerWeek: 2,
    certificate: true,
    price: 199
  },
  {
    id: "3",
    className: "English Conversation Club - Class C1",
    classNum: 1,
    description: "Practice speaking English in a relaxed, supportive environment with native speakers and fellow learners.",
    instructor: "Emma Wilson",
    level: "Beginner",
    classStatus: "Upcoming",
    courseFormat: "Hybrid",
    courseName: "English Conversation Club",
    courseCode: "ECC101",
    category: "Conversation",
    enrolledDate: "2024-02-05",
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    status: "upcoming",
    capacity: 15,
    enrolledCount: 8,
    isActive: true,
    totalHours: 20,
    sessionsPerWeek: 1,
    certificate: false,
    price: 89,
    nextMeeting: {
      id: "meeting-3",
      startsAt: "2024-02-15T14:00:00Z",
      endsAt: "2024-02-15T16:00:00Z",
      roomId: "room-301",
      roomName: "Room 301, CETS Center",
      coveredTopic: "Conversation Practice - Daily Activities"
    }
  },
  {
    id: "4",
    className: "Academic Writing Workshop - Class D1",
    classNum: 1,
    description: "Improve your academic writing skills with focus on essay structure, research techniques, and citation styles.",
    instructor: "Dr. Robert Taylor",
    level: "Advanced",
    classStatus: "Completed",
    courseFormat: "Online",
    courseName: "Academic Writing Workshop",
    courseCode: "AWW301",
    category: "Academic English",
    enrolledDate: "2023-10-01",
    startDate: "2023-10-05",
    endDate: "2023-12-20",
    status: "completed",
    capacity: 12,
    enrolledCount: 10,
    isActive: false,
    totalHours: 30,
    sessionsPerWeek: 1,
    certificate: true,
    price: 249
  },
  {
    id: "5",
    className: "Pronunciation Masterclass - Class E1",
    classNum: 1,
    description: "Perfect your English pronunciation with phonetics, stress patterns, and intonation techniques.",
    instructor: "Linda Garcia",
    level: "Intermediate",
    classStatus: "Active",
    courseFormat: "Online",
    courseName: "Pronunciation Masterclass",
    courseCode: "PM201",
    category: "Pronunciation",
    enrolledDate: "2024-01-25",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    status: "active",
    capacity: 16,
    enrolledCount: 12,
    isActive: true,
    totalHours: 24,
    sessionsPerWeek: 2,
    certificate: false,
    price: 149,
    nextMeeting: {
      id: "meeting-5",
      startsAt: "2024-02-16T20:00:00Z",
      endsAt: "2024-02-16T21:30:00Z",
      onlineMeetingUrl: "https://meet.google.com/abc-defg-hij",
      passcode: "PRON123",
      coveredTopic: "Phonetics and Sound Patterns"
    }
  },
  {
    id: "6",
    className: "Grammar Fundamentals - Class F1",
    classNum: 1,
    description: "Build a solid foundation in English grammar with clear explanations and practical exercises.",
    instructor: "James Miller",
    level: "Beginner",
    classStatus: "Active",
    courseFormat: "In-person",
    courseName: "Grammar Fundamentals",
    courseCode: "GF101",
    category: "Grammar",
    enrolledDate: "2024-01-10",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    status: "active",
    capacity: 22,
    enrolledCount: 19,
    isActive: true,
    totalHours: 32,
    sessionsPerWeek: 2,
    certificate: true,
    price: 179,
    nextMeeting: {
      id: "meeting-6",
      startsAt: "2024-02-15T17:30:00Z",
      endsAt: "2024-02-15T19:00:00Z",
      roomId: "room-102",
      roomName: "Room 102, CETS Center",
      coveredTopic: "Present Perfect Tense"
    }
  },
  {
    id: "7",
    className: "English for Presentations - Class G1",
    classNum: 1,
    description: "Learn to deliver confident and effective presentations in English for professional settings.",
    instructor: "Rachel Brown",
    level: "Intermediate",
    classStatus: "Completed",
    courseFormat: "Hybrid",
    courseName: "English for Presentations",
    courseCode: "EP201",
    category: "Speaking",
    enrolledDate: "2023-12-01",
    startDate: "2023-12-10",
    endDate: "2024-02-10",
    status: "completed",
    capacity: 18,
    enrolledCount: 16,
    isActive: false,
    totalHours: 24,
    sessionsPerWeek: 1,
    certificate: true,
    price: 219
  },
  {
    id: "8",
    className: "Travel English Essentials - Class H1",
    classNum: 1,
    description: "Essential English phrases and vocabulary for traveling confidently in English-speaking countries.",
    instructor: "Mark Davis",
    level: "Beginner",
    classStatus: "Upcoming",
    courseFormat: "Online",
    courseName: "Travel English Essentials",
    courseCode: "TEE101",
    category: "Travel",
    enrolledDate: "2024-02-20",
    startDate: "2024-03-01",
    endDate: "2024-04-01",
    status: "upcoming",
    capacity: 20,
    enrolledCount: 14,
    isActive: true,
    totalHours: 16,
    sessionsPerWeek: 2,
    certificate: false,
    price: 129,
    nextMeeting: {
      id: "meeting-8",
      startsAt: "2024-03-01T18:00:00Z",
      endsAt: "2024-03-01T19:30:00Z",
      onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/xyz123",
      passcode: "TRAVEL2024",
      coveredTopic: "Airport and Hotel Vocabulary"
    }
  }
];

const MyClassCard: React.FC<{ classItem: MyClass }> = ({ classItem }) => {
  const navigate = useNavigate();
  
  const handleOpenClass = () => {
    try {
      localStorage.setItem('selectedClass', JSON.stringify(classItem));
    } catch {}
    navigate(`/student/class/${classItem.id}`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/25";
      case "active": return "bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-lg shadow-accent-500/25";
      case "upcoming": return "bg-gradient-to-r from-warning-400 to-warning-500 text-white shadow-lg shadow-warning-500/25";
      default: return "bg-gradient-to-r from-neutral-400 to-neutral-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "active": return <BookOpen className="w-4 h-4" />;
      case "upcoming": return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "active": return "Active";
      case "upcoming": return "Upcoming";
      default: return status;
    }
  };


  return (
    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:via-white hover:to-accent-25">
      {/* Class Content */}
      <div className="p-6 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
        {/* Header with Status and Certificate Badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-primary-800 leading-tight">
               {classItem.className}
              </h3>
              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(classItem.status)}`}>
                {getStatusIcon(classItem.status)}
                {getStatusLabel(classItem.status)}
              </span>
              {/* Certificate Badge */}
              {classItem.certificate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-warning-400 to-warning-500 text-white shadow-lg shadow-warning-500/25">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Certificate
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* <p className="text-xs mt-1">
                <span className="inline-flex items-center gap-1 bg-warning-200 text-primary-700 px-2 py-1 rounded-md border border-primary-100">
                  <span className="text-xs font-semibold">{classItem.courseCode}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-accent-100 text-accent-700 px-2 py-1 rounded-md border border-accent-100 ml-2">
                  <GraduationCap className="w-3 h-3" />
                  <span className="text-xs font-semibold">{classItem.level}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-secondary-200 text-accent-700 px-2 py-1 rounded-md border border-accent-100 ml-2">
                  <span className="text-xs font-semibold text-accent-700">{classItem.courseFormat || 'N/A'}</span>
                </span>
              </p> */}

            </div>

            <div className="flex items-center gap-2 mb-1 mt-4">
              <div className="w-8 h-8 bg-accent-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{classItem.instructor?.charAt(0) || 'T'}</span>
              </div>
              <p className="text-sm font-medium text-accent-700">
                by {classItem.instructor || 'TBA'}
              </p>
            </div>
           
           
          </div>
          <button className="p-2 hover:bg-accent-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Next Meeting Section */}
        {classItem.nextMeeting && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-secondary-200 to-secondary-300 border border-accent-200 p-4 rounded-xl">
              {/* <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-accent-400 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-accent-800 text-sm">
                  Next Meeting
                </span>
              </div> */}
              
              {/* Meeting Time */}
              <div className="mb-3">
                <p className="text-sm font-medium text-accent-700">
                  {new Date(classItem.nextMeeting.startsAt).toLocaleDateString()} • {new Date(classItem.nextMeeting.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(classItem.nextMeeting.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Location/Online Info */}
              {classItem.nextMeeting.roomName && (
                <div className="flex items-center gap-2 text-xs text-accent-600 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-medium">{classItem.nextMeeting.roomName}</span>
                </div>
              )}
              
              {classItem.nextMeeting.onlineMeetingUrl && (
                <div className="flex items-center gap-2 text-xs text-accent-600 mb-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="font-medium">Online Meeting</span>
                  {classItem.nextMeeting.passcode && (
                    <span className="ml-2 px-2 py-1 bg-accent-100 rounded text-xs">
                      Code: {classItem.nextMeeting.passcode}
                    </span>
                  )}
                </div>
              )}

              {/* Topic */}
              {classItem.nextMeeting.coveredTopic && (
                <div className="flex items-center gap-2 text-xs text-accent-600 mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-medium">Course: {classItem.nextMeeting.coveredTopic}</span>
                </div>
              )}

            </div>
          </div>
        )}

        {/* No Meeting Info for Completed/Inactive Classes */}
        {!classItem.nextMeeting && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-neutral-100 to-neutral-200 border border-neutral-300 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-neutral-400 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-neutral-700 text-sm">
                  No Upcoming Meetings
                </span>
              </div>
            </div>
          </div>
        )}



        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="primary" 
            className="flex-1 sm:flex-initial btn-secondary"
            iconRight={<ExternalLink className="w-4 h-4" />}
            onClick={handleOpenClass}
          >
            Open Class
          </Button>
          {classItem.status === "completed" && classItem.certificate && (
            <Button 
              variant="secondary" 
              iconLeft={<CheckCircle className="w-4 h-4" />}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-success-400 to-success-500 text-success-700 border-success-300 hover:from-success-200 hover:to-success-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Certificate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default function MyClasses() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [myClasses, setMyClasses] = useState<MyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 3; // Number of classes per page

  // Fetch student learning classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from authentication
        const studentId = getStudentId();
        if (!studentId) {
          setError('User not authenticated. Please login again.');
          setMyClasses([]);
          return;
        }
        
        const { data, error: fetchError } = await studentLearningClassesService.getStudentLearningClassesSafe(studentId);
        
        if (fetchError) {
          setError(fetchError);
          // Fallback to mock data if API fails
          setMyClasses(mockMyClasses);
        } else {
          setMyClasses(data || []);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
        // Fallback to mock data
        setMyClasses(mockMyClasses);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Retry function
  const handleRetry = () => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from authentication
        const studentId = getStudentId();
        if (!studentId) {
          setError('User not authenticated. Please login again.');
          setMyClasses([]);
          return;
        }
        
        const { data, error: fetchError } = await studentLearningClassesService.getStudentLearningClassesSafe(studentId);
        
        if (fetchError) {
          setError(fetchError);
          setMyClasses(mockMyClasses);
        } else {
          setMyClasses(data || []);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
        setMyClasses(mockMyClasses);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  };

  // Filter classes based on active tab
  const filteredClasses = useMemo(() => {
    switch (activeTab) {
      case "active":
        return myClasses.filter(classItem => classItem.status === "active");
      case "completed":
        return myClasses.filter(classItem => classItem.status === "completed");
      case "upcoming":
        return myClasses.filter(classItem => classItem.status === "upcoming");
      case "all":
      default:
        return myClasses;
    }
  }, [activeTab, myClasses]);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of class list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      all: myClasses.length,
      active: myClasses.filter(c => c.status === "active").length,
      completed: myClasses.filter(c => c.status === "completed").length,
      upcoming: myClasses.filter(c => c.status === "upcoming").length
    };
    return counts;
  }, [myClasses]);

  const tabs = [
    { id: "all", label: "All Classes", badge: tabCounts.all, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "active", label: "Active", badge: tabCounts.active, color: "bg-gradient-to-r from-accent-500 to-accent-600 text-white" },
    { id: "completed", label: "Completed", badge: tabCounts.completed, color: "bg-gradient-to-r from-success-500 to-success-600 text-white" },
    { id: "upcoming", label: "Upcoming", badge: tabCounts.upcoming, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" }
  ];
  

  const breadcrumbItems = [
    { label: "My Classes" }
  ];

  return (
    <div className="p-6 max-w-full space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />
        
        <PageHeader
          title="My Classes"
          description="Manage and track your class enrollments and progress"
          icon={<BookOpen className="w-5 h-5 text-white" />}
        />

        {/* Tabs Navigation */}
        <Card className="shadow-lg border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="mt-4 text-neutral-600">Loading your classes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to Load Classes</h3>
              <p className="text-neutral-600 text-center mb-4">{error}</p>
              <Button
                onClick={handleRetry}
                iconLeft={<RefreshCw className="w-4 h-4" />}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredClasses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Classes Found</h3>
              <p className="text-neutral-600 text-center">
                {activeTab === "all" 
                  ? "You haven't enrolled in any classes yet." 
                  : `You don't have any ${activeTab} classes.`
                }
              </p>
            </div>
          )}

          {/* Tab Content */}
          {!loading && !error && filteredClasses.length > 0 && (
            <>
              <TabContent activeTab={activeTab} tabId="all">
                <div className="space-y-6">
                  {paginatedClasses.map((classItem) => (
                    <MyClassCard key={classItem.id} classItem={classItem} />
                  ))}
                </div>
              </TabContent>

              <TabContent activeTab={activeTab} tabId="active">
                <div className="space-y-6">
                  {paginatedClasses.map((classItem) => (
                    <MyClassCard key={classItem.id} classItem={classItem} />
                  ))}
                </div>
              </TabContent>

              <TabContent activeTab={activeTab} tabId="completed">
                <div className="space-y-6">
                  {paginatedClasses.map((classItem) => (
                    <MyClassCard key={classItem.id} classItem={classItem} />
                  ))}
                </div>
              </TabContent>

              <TabContent activeTab={activeTab} tabId="upcoming">
                <div className="space-y-6">
                  {paginatedClasses.map((classItem) => (
                    <MyClassCard key={classItem.id} classItem={classItem} />
                  ))}
                </div>
              </TabContent>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && filteredClasses.length > 0 && totalPages > 1 && (
            <div className="pt-8 border-t border-accent-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredClasses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Card>
    </div>
  );
}