import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
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
  Star,
  MapPin
} from "lucide-react";

// Course interface for center-based classes
interface MyCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "In-person" | "Hybrid";
  category: string;
  
  // Enrollment info
  enrolledDate: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  
  // Class schedule info
  schedule: string; // e.g., "Mon, Wed, Fri - 7:00 PM"
  location?: string;
  totalHours: number;
  sessionsPerWeek: number;
  
  // Additional info
  certificate?: boolean;
  rating?: number;
  price: number;
}

const mockMyCourses: MyCourse[] = [
  {
    id: "1",
    title: "Advanced Business English",
    description: "Master professional communication skills for the corporate world. Learn presentations, negotiations, and business writing.",
    image: "/api/placeholder/400/240",
    instructor: "Sarah Johnson",
    level: "Advanced",
    format: "In-person",
    category: "Business English",
    enrolledDate: "2024-01-15",
    startDate: "2024-01-20",
    endDate: "2024-04-15",
    status: "active",
    schedule: "Mon, Wed, Fri - 7:00 PM",
    location: "Room 201, CETS Center",
    totalHours: 60,
    sessionsPerWeek: 3,
    certificate: true,
    rating: 4.8,
    price: 299
  },
  {
    id: "2",
    title: "IELTS Test Preparation",
    description: "Comprehensive IELTS preparation covering all four skills: listening, reading, writing, and speaking with practice tests.",
    image: "/api/placeholder/400/240",
    instructor: "Michael Chen",
    level: "Intermediate",
    format: "In-person",
    category: "Test Preparation",
    enrolledDate: "2023-11-10",
    startDate: "2023-11-15",
    endDate: "2024-01-10",
    status: "completed",
    schedule: "Tue, Thu - 6:30 PM",
    location: "Room 105, CETS Center",
    totalHours: 40,
    sessionsPerWeek: 2,
    certificate: true,
    rating: 4.9,
    price: 199
  },
  {
    id: "3",
    title: "English Conversation Club",
    description: "Practice speaking English in a relaxed, supportive environment with native speakers and fellow learners.",
    image: "/api/placeholder/400/240",
    instructor: "Emma Wilson",
    level: "Beginner",
    format: "Hybrid",
    category: "Conversation",
    enrolledDate: "2024-02-05",
    startDate: "2024-02-15",
    endDate: "2024-03-15",
    status: "upcoming",
    schedule: "Saturday - 2:00 PM",
    location: "Room 301, CETS Center",
    totalHours: 20,
    sessionsPerWeek: 1,
    certificate: false,
    price: 89
  },
  {
    id: "4",
    title: "Academic Writing Workshop",
    description: "Improve your academic writing skills with focus on essay structure, research techniques, and citation styles.",
    image: "/api/placeholder/400/240",
    instructor: "Dr. Robert Taylor",
    level: "Advanced",
    format: "Online",
    category: "Academic English",
    enrolledDate: "2023-10-01",
    startDate: "2023-10-05",
    endDate: "2023-12-20",
    status: "completed",
    schedule: "Sunday - 10:00 AM",
    location: "Online Zoom Meeting",
    totalHours: 30,
    sessionsPerWeek: 1,
    certificate: true,
    rating: 4.7,
    price: 249
  },
  {
    id: "5",
    title: "Pronunciation Masterclass",
    description: "Perfect your English pronunciation with phonetics, stress patterns, and intonation techniques.",
    image: "/api/placeholder/400/240",
    instructor: "Linda Garcia",
    level: "Intermediate",
    format: "Online",
    category: "Pronunciation",
    enrolledDate: "2024-01-25",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    status: "active",
    schedule: "Wed, Fri - 8:00 PM",
    location: "Online Google Meet",
    totalHours: 24,
    sessionsPerWeek: 2,
    certificate: false,
    price: 149
  },
  {
    id: "6",
    title: "Grammar Fundamentals",
    description: "Build a solid foundation in English grammar with clear explanations and practical exercises.",
    image: "/api/placeholder/400/240",
    instructor: "James Miller",
    level: "Beginner",
    format: "In-person",
    category: "Grammar",
    enrolledDate: "2024-01-10",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    status: "active",
    schedule: "Tue, Thu - 5:30 PM",
    location: "Room 102, CETS Center",
    totalHours: 32,
    sessionsPerWeek: 2,
    certificate: true,
    rating: 4.6,
    price: 179
  },
  {
    id: "7",
    title: "English for Presentations",
    description: "Learn to deliver confident and effective presentations in English for professional settings.",
    image: "/api/placeholder/400/240",
    instructor: "Rachel Brown",
    level: "Intermediate",
    format: "Hybrid",
    category: "Speaking",
    enrolledDate: "2023-12-01",
    startDate: "2023-12-10",
    endDate: "2024-02-10",
    status: "completed",
    schedule: "Saturday - 10:00 AM",
    location: "Room 205, CETS Center",
    totalHours: 24,
    sessionsPerWeek: 1,
    certificate: true,
    rating: 4.7,
    price: 219
  },
  {
    id: "8",
    title: "Travel English Essentials",
    description: "Essential English phrases and vocabulary for traveling confidently in English-speaking countries.",
    image: "/api/placeholder/400/240",
    instructor: "Mark Davis",
    level: "Beginner",
    format: "Online",
    category: "Travel",
    enrolledDate: "2024-02-20",
    startDate: "2024-03-01",
    endDate: "2024-04-01",
    status: "upcoming",
    schedule: "Mon, Wed - 6:00 PM",
    location: "Online Teams Meeting",
    totalHours: 16,
    sessionsPerWeek: 2,
    certificate: false,
    rating: 4.4,
    price: 129
  }
];

const MyCourseCard: React.FC<{ course: MyCourse }> = ({ course }) => {
  const navigate = useNavigate();
  
  const handleOpenCourse = () => {
    navigate(`/student/course/${course.id}`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success-100 text-success-700";
      case "active": return "bg-primary-100 text-primary-700";
      case "upcoming": return "bg-info-100 text-info-700";
      default: return "bg-neutral-100 text-neutral-700";
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

  const generatePlaceholderImage = (title: string) => {
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3e%3crect width='400' height='240' fill='%23666'/%3e%3ctext x='200' y='120' text-anchor='middle' fill='white' font-size='16'%3e${encodedTitle}%3c/text%3e%3c/svg%3e`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row">
        {/* Course Image */}
        <div className="lg:w-64 h-48 lg:h-auto bg-neutral-600 relative flex-shrink-0">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generatePlaceholderImage(course.title);
            }}
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(course.status)}`}>
              {getStatusIcon(course.status)}
              {getStatusLabel(course.status)}
            </span>
          </div>
          {/* Certificate Badge */}
          {course.certificate && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-warning-100 text-warning-700">
                <CheckCircle className="w-3 h-3" />
                Certificate
              </span>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {course.title}
              </h3>
              <p className="text-sm text-neutral-600 mb-2">
                by {course.instructor}
              </p>
              <p className="text-sm text-neutral-600 line-clamp-2">
                {course.description}
              </p>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-md">
              <MoreVertical className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Schedule Section */}
          <div className="mb-4">
            <div className="bg-neutral-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span className="font-medium text-neutral-900 text-sm">
                  Class Schedule
                </span>
              </div>
              <p className="text-sm text-neutral-700 mb-1">
                {course.schedule}
              </p>
              {course.location && (
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <MapPin className="w-3 h-3" />
                  <span>{course.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.format}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.totalHours}h total</span>
            </div>
            {course.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                <span>{course.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(course.startDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              className="flex-1 sm:flex-initial"
              iconRight={<ExternalLink className="w-4 h-4" />}
              onClick={handleOpenCourse}
            >
              Open Course
            </Button>
            {course.status === "completed" && course.certificate && (
              <Button 
                variant="secondary" 
                iconLeft={<CheckCircle className="w-4 h-4" />}
                className="flex-1 sm:flex-initial"
              >
                Certificate
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function MyCourses() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Number of courses per page

  // Filter courses based on active tab
  const filteredCourses = useMemo(() => {
    switch (activeTab) {
      case "active":
        return mockMyCourses.filter(course => course.status === "active");
      case "completed":
        return mockMyCourses.filter(course => course.status === "completed");
      case "upcoming":
        return mockMyCourses.filter(course => course.status === "upcoming");
      case "all":
      default:
        return mockMyCourses;
    }
  }, [activeTab]);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of course list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      all: mockMyCourses.length,
      active: mockMyCourses.filter(c => c.status === "active").length,
      completed: mockMyCourses.filter(c => c.status === "completed").length,
      upcoming: mockMyCourses.filter(c => c.status === "upcoming").length
    };
    return counts;
  }, []);

  const tabs = [
    { id: "all", label: "All Courses", badge: tabCounts.all },
    { id: "active", label: "Active", badge: tabCounts.active },
    { id: "completed", label: "Completed", badge: tabCounts.completed },
    { id: "upcoming", label: "Upcoming", badge: tabCounts.upcoming }
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <PageHeader
            title="My Courses"
            subtitle="Manage and track your learning progress"
            actions={
              <div className="flex gap-3">
                <Button variant="secondary">
                  Browse Courses
                </Button>
                <Button variant="primary">
                  Continue Learning
                </Button>
              </div>
            }
          />
        </div>

        {/* Tabs Navigation */}
        <Card>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <TabContent activeTab={activeTab} tabId="all">
            <div className="space-y-6">
              {paginatedCourses.map((course) => (
                <MyCourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="active">
            <div className="space-y-6">
              {paginatedCourses.map((course) => (
                <MyCourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="completed">
            <div className="space-y-6">
              {paginatedCourses.map((course) => (
                <MyCourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="upcoming">
            <div className="space-y-6">
              {paginatedCourses.map((course) => (
                <MyCourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabContent>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No courses found
              </h3>
              <p className="text-neutral-600 mb-6">
                              {activeTab === "all" 
                ? "You haven't enrolled in any courses yet." 
                : `No ${activeTab} courses available.`
              }
              </p>
              <Button variant="primary">
                Browse Courses
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredCourses.length > 0 && totalPages > 1 && (
            <div className="pt-6 border-t border-neutral-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCourses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
}