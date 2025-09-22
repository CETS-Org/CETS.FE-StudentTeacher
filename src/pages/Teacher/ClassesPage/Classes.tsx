import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/Shared/TeacherLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ExternalLink,
  MoreVertical,
  CheckCircle,
  Users,
  MapPin,
  GraduationCap,
  Star,
  Search as SearchIcon
} from "lucide-react";

type ClassStatus = "ongoing" | "upcoming" | "completed";

interface TeacherClass {
  id: string;
  className: string;
  classNum: number;
  description: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  classStatus: string;
  courseFormat: "Online" | "In-person" | "Hybrid";
  courseName: string;
  courseCode: string;
  category: string;
  enrolledDate: string;
  startDate: string;
  endDate: string;
  status: ClassStatus;
  capacity: number;
  enrolledCount: number;
  isActive: boolean;
  certificate?: boolean;
  attendanceRate?: number;
  rating?: number;
  nextMeeting?: {
    id: string;
    startsAt: string;
    endsAt: string;
    roomId?: string;
    roomName?: string;
    onlineMeetingUrl?: string;
    passcode?: string;
    coveredTopic: string;
  };
}

const mockTeacherClasses: TeacherClass[] = [
  {
    id: "1",
    className: "Advanced Business English - Class A1",
    classNum: 1,
    description: "Master professional communication skills for the corporate world. Learn presentations, negotiations, and business writing.",
    instructor: "You",
    level: "Advanced",
    classStatus: "Ongoing",
    courseFormat: "In-person",
    courseName: "Advanced Business English",
    courseCode: "ABE101",
    category: "Business English",
    enrolledDate: "2024-01-10",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    status: "ongoing",
    capacity: 25,
    enrolledCount: 18,
    isActive: true,
    certificate: true,
    attendanceRate: 92,
    rating: 4.7,
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
    instructor: "You",
    level: "Intermediate",
    classStatus: "Completed",
    courseFormat: "In-person",
    courseName: "IELTS Test Preparation",
    courseCode: "IELTS-INT-2024.02",
    category: "Test Preparation",
    enrolledDate: "2023-11-05",
    startDate: "2023-11-10",
    endDate: "2024-01-10",
    status: "completed",
    capacity: 20,
    enrolledCount: 20,
    isActive: false,
    certificate: true,
    attendanceRate: 95,
    rating: 4.9
  },
  {
    id: "3",
    className: "English Conversation Club - Class C1",
    classNum: 1,
    description: "Practice speaking English in a relaxed, supportive environment with native speakers and fellow learners.",
    instructor: "You",
    level: "Beginner",
    classStatus: "Upcoming",
    courseFormat: "Hybrid",
    courseName: "English Conversation Club",
    courseCode: "ECC101",
    category: "Conversation",
    enrolledDate: "2024-01-25",
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    status: "upcoming",
    capacity: 15,
    enrolledCount: 8,
    isActive: true,
    certificate: false,
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
    instructor: "You",
    level: "Advanced",
    classStatus: "Completed",
    courseFormat: "Online",
    courseName: "Academic Writing Workshop",
    courseCode: "AWW301",
    category: "Academic English",
    enrolledDate: "2023-09-25",
    startDate: "2023-10-01",
    endDate: "2023-12-20",
    status: "completed",
    capacity: 12,
    enrolledCount: 10,
    isActive: false,
    certificate: true,
    attendanceRate: 88,
    rating: 4.6
  },
  {
    id: "5",
    className: "Pronunciation Masterclass - Class E1",
    classNum: 1,
    description: "Perfect your English pronunciation with phonetics, stress patterns, and intonation techniques.",
    instructor: "You",
    level: "Intermediate",
    classStatus: "Ongoing",
    courseFormat: "Online",
    courseName: "Pronunciation Masterclass",
    courseCode: "PM201",
    category: "Pronunciation",
    enrolledDate: "2024-01-20",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    status: "ongoing",
    capacity: 16,
    enrolledCount: 12,
    isActive: true,
    certificate: false,
    attendanceRate: 85,
    rating: 4.4,
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
    instructor: "You",
    level: "Beginner",
    classStatus: "Ongoing",
    courseFormat: "In-person",
    courseName: "Grammar Fundamentals",
    courseCode: "GF101",
    category: "Grammar",
    enrolledDate: "2024-01-05",
    startDate: "2024-01-10",
    endDate: "2024-03-15",
    status: "ongoing",
    capacity: 22,
    enrolledCount: 19,
    isActive: true,
    certificate: true,
    attendanceRate: 90,
    rating: 4.5,
    nextMeeting: {
      id: "meeting-6",
      startsAt: "2024-02-15T17:30:00Z",
      endsAt: "2024-02-15T19:00:00Z",
      roomId: "room-102",
      roomName: "Room 102, CETS Center",
      coveredTopic: "Present Perfect Tense"
    }
  }
];

const TeacherClassCard: React.FC<{ classItem: TeacherClass }> = ({ classItem }) => {
  const navigate = useNavigate();
  
  const handleOpenClass = () => {
    navigate(`/teacher/class/${classItem.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/25";
      case "ongoing": return "bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-lg shadow-accent-500/25";
      case "upcoming": return "bg-gradient-to-r from-warning-400 to-warning-500 text-white shadow-lg shadow-warning-500/25";
      default: return "bg-gradient-to-r from-neutral-400 to-neutral-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "ongoing": return <BookOpen className="w-4 h-4" />;
      case "upcoming": return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "ongoing": return "Ongoing";
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
              <p className="text-xs mt-1">
                <span className="inline-flex items-center gap-1 bg-warning-200 text-primary-700 px-2 py-1 rounded-md border border-primary-100">
                  <span className="text-xs font-semibold">{classItem.courseCode}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-accent-100 text-accent-700 px-2 py-1 rounded-md border border-accent-100 ml-2">
                  <GraduationCap className="w-3 h-3" />
                  <span className="text-xs font-semibold">{classItem.level}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-secondary-200 text-accent-700 px-2 py-1 rounded-md border border-accent-100 ml-2">
                  <Users className="w-3 h-3 text-accent-600" />
                  <span className="text-xs font-semibold text-accent-700">{classItem.courseFormat || 'N/A'}</span>
                </span>
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-accent-400 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-accent-800 text-sm">
                  Next Session
                </span>
              </div>
              
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
                  <span className="font-medium">Topic: {classItem.nextMeeting.coveredTopic}</span>
                </div>
              )}

              {/* Class Stats */}
              <div className="flex flex-wrap gap-2 text-xs text-accent-600 mt-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-medium">{classItem.enrolledCount}/{classItem.capacity} students</span>
                </div>
                {classItem.attendanceRate && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-medium">{classItem.attendanceRate}% attendance</span>
                  </div>
                )}
                {classItem.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
                    <span className="font-medium">{classItem.rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>
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
                  No Upcoming Sessions
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-medium">{classItem.enrolledCount}/{classItem.capacity} students</span>
                </div>
                {classItem.attendanceRate && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="font-medium">{classItem.attendanceRate}% attendance</span>
                  </div>
                )}
                {classItem.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
                    <span className="font-medium">{classItem.rating.toFixed(1)} rating</span>
                  </div>
                )}
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
          <Button 
            variant="secondary" 
            iconLeft={<Users className="w-4 h-4" />}
            className="flex-1 sm:flex-initial"
            onClick={() => navigate(`/teacher/class/${classItem.id}/roster`)}
          >
            Students
          </Button>
          {classItem.status === "completed" && classItem.certificate && (
            <Button 
              variant="secondary" 
              iconLeft={<CheckCircle className="w-4 h-4" />}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-success-100 to-success-200 text-success-700 border-success-300 hover:from-success-200 hover:to-success-300 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Certificate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default function Classes() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [formatFilter, setFormatFilter] = useState<"All" | "Online" | "In-person" | "Hybrid">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const itemsPerPage = 3; // Number of classes per page

  // Filter classes based on active tab, search, and filters
  const filteredClasses = useMemo(() => {
    let result = mockTeacherClasses;

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter(classItem => classItem.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(classItem => 
        classItem.className.toLowerCase().includes(query) ||
        classItem.courseCode.toLowerCase().includes(query) ||
        classItem.courseName.toLowerCase().includes(query) ||
        classItem.category.toLowerCase().includes(query) ||
        classItem.instructor.toLowerCase().includes(query)
      );
    }

    // Filter by level
    if (levelFilter !== "All") {
      result = result.filter(classItem => classItem.level === levelFilter);
    }

    // Filter by format
    if (formatFilter !== "All") {
      result = result.filter(classItem => classItem.courseFormat === formatFilter);
    }

    // Filter by category
    if (categoryFilter !== "All") {
      result = result.filter(classItem => classItem.category === categoryFilter);
    }

    return result;
  }, [activeTab, searchQuery, levelFilter, formatFilter, categoryFilter]);

  // Reset to page 1 when any filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, levelFilter, formatFilter, categoryFilter]);

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
      all: mockTeacherClasses.length,
      ongoing: mockTeacherClasses.filter(c => c.status === "ongoing").length,
      completed: mockTeacherClasses.filter(c => c.status === "completed").length,
      upcoming: mockTeacherClasses.filter(c => c.status === "upcoming").length
    };
    return counts;
  }, []);

  // Get unique categories for filter
  const availableCategories = useMemo(() => {
    const categories = [...new Set(mockTeacherClasses.map(c => c.category))];
    return categories.sort();
  }, []);

  const tabs = [
    { id: "all", label: "All Classes", badge: tabCounts.all, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "ongoing", label: "Ongoing", badge: tabCounts.ongoing, color: "bg-gradient-to-r from-accent-500 to-accent-600 text-white" },
    { id: "completed", label: "Completed", badge: tabCounts.completed, color: "bg-gradient-to-r from-success-500 to-success-600 text-white" },
    { id: "upcoming", label: "Upcoming", badge: tabCounts.upcoming, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" }
  ];

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">My Classes</h1>
          <p className="text-neutral-600">Manage and track your teaching sessions</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <Card className="p-4 border border-accent-100 bg-white">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[280px]">
                <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder="Search by title, code, course name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-primary-200 rounded-lg pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 bg-white"
                />
              </div>

              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 min-w-[120px]"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Format Filter */}
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 min-w-[120px]"
              >
                <option value="All">All Formats</option>
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 min-w-[140px]"
              >
                <option value="All">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {(searchQuery || levelFilter !== "All" || formatFilter !== "All" || categoryFilter !== "All") && (
                <Button
                  variant="secondary"
                  className="text-xs px-3 py-2"
                  onClick={() => {
                    setSearchQuery("");
                    setLevelFilter("All");
                    setFormatFilter("All");
                    setCategoryFilter("All");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            {(searchQuery || levelFilter !== "All" || formatFilter !== "All" || categoryFilter !== "All") && (
              <div className="mt-3 pt-3 border-t border-accent-100">
                <p className="text-sm text-neutral-600">
                  Showing {filteredClasses.length} of {mockTeacherClasses.length} classes
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Card className="shadow-lg border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <TabContent activeTab={activeTab} tabId="all">
            <div className="space-y-6">
              {paginatedClasses.map((classItem) => (
                <TeacherClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="ongoing">
            <div className="space-y-6">
              {paginatedClasses.map((classItem) => (
                <TeacherClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="completed">
            <div className="space-y-6">
              {paginatedClasses.map((classItem) => (
                <TeacherClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="upcoming">
            <div className="space-y-6">
              {paginatedClasses.map((classItem) => (
                <TeacherClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          </TabContent>

          {/* Empty State */}
          {filteredClasses.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">
                No classes found
              </h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                {activeTab === "all" 
                  ? "You don't have any classes assigned yet." 
                  : `No ${activeTab} classes available. Check other categories or create a new class.`
                }
              </p>
              <Button 
                variant="primary" 
                className="btn-secondary"
              >
                Create New Class
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredClasses.length > 0 && totalPages > 1 && (
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
    </TeacherLayout>
  );
}