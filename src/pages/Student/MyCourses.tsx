import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
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
  Star,
  MapPin
} from "lucide-react";

import type { MyCourse } from "@/types/course";

const mockMyCourses: MyCourse[] = [
  {
    id: "1",
    title: "Advanced Business English",
    description: "Master professional communication skills for the corporate world. Learn presentations, negotiations, and business writing.",
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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
    image: "https://static.vecteezy.com/system/resources/previews/049/855/259/non_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-photo.jpg",
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

  const generatePlaceholderImage = (title: string) => {
    const encodedTitle = encodeURIComponent(title.substring(0, 20));
    return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23152259;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%232D88D4;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='400' height='240' fill='url(%23grad)'/%3e%3ctext x='200' y='120' text-anchor='middle' fill='white' font-size='16' font-weight='600'%3e${encodedTitle}%3c/text%3e%3c/svg%3e`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-accent-100 bg-gradient-to-br from-white via-white to-accent-25">
      <div className="flex flex-col lg:flex-row">
        {/* Course Image */}
        <div className="lg:w-64 h-48 lg:h-auto bg-gradient-to-br from-primary-600 to-primary-800 relative flex-shrink-0">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generatePlaceholderImage(course.title);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm ${getStatusColor(course.status)}`}>
              {getStatusIcon(course.status)}
              {getStatusLabel(course.status)}
            </span>
          </div>
          {/* Certificate Badge */}
          {course.certificate && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-warning-400 to-warning-500 text-white shadow-lg shadow-warning-500/25 backdrop-blur-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                Certificate
              </span>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="flex-1 p-6 bg-gradient-to-br from-white to-accent-25/30">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-primary-800 mb-2 leading-tight">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{course.instructor.charAt(0)}</span>
                </div>
                <p className="text-sm font-medium text-accent-700">
                  by {course.instructor}
                </p>
              </div>
              <p className="text-sm text-neutral-700 line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            </div>
            <button className="p-2 hover:bg-accent-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Schedule Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-accent-800 text-sm">
                  Class Schedule
                </span>
              </div>
              <p className="text-sm font-medium text-accent-700 mb-2">
                {course.schedule}
              </p>
              {course.location && (
                <div className="flex items-center gap-2 text-xs text-accent-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-medium">{course.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="flex items-center gap-2 bg-primary-25 px-3 py-2 rounded-lg">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">{course.level}</span>
            </div>
            <div className="flex items-center gap-2 bg-accent-50 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 text-accent-600" />
              <span className="text-xs font-semibold text-accent-700">{course.format}</span>
            </div>
            <div className="flex items-center gap-2 bg-info-100 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-info-600" />
              <span className="text-xs font-semibold text-info-700">{course.totalHours}h</span>
            </div>
            {course.rating && (
              <div className="flex items-center gap-2 bg-warning-50 px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 fill-warning-500 text-warning-500" />
                <span className="text-xs font-semibold text-warning-700">{course.rating}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-success-50 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-success-600" />
              <span className="text-xs font-semibold text-success-700">{new Date(course.startDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              className="flex-1 sm:flex-initial bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
              iconRight={<ExternalLink className="w-4 h-4" />}
              onClick={handleOpenCourse}
            >
              Open Course
            </Button>
            {course.status === "completed" && course.certificate && (
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
    { id: "all", label: "All Courses", badge: tabCounts.all, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "active", label: "Active", badge: tabCounts.active, color: "bg-gradient-to-r from-accent-500 to-accent-600 text-white" },
    { id: "completed", label: "Completed", badge: tabCounts.completed, color: "bg-gradient-to-r from-success-500 to-success-600 text-white" },
    { id: "upcoming", label: "Upcoming", badge: tabCounts.upcoming, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" }
  ];
  

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">My Courses</h1>
          <p className="text-neutral-600">Manage and track your learning progress</p>
        </div>

        {/* Tabs Navigation */}
        <Card className="shadow-lg border border-accent-100 bg-gradient-to-br from-white to-accent-25/30">
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
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">
                No courses found
              </h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                {activeTab === "all" 
                  ? "Start your learning journey by exploring our comprehensive course catalog." 
                  : `No ${activeTab} courses available. Explore other categories or browse new courses.`
                }
              </p>
              <Button 
                variant="primary" 
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
              >
                Browse Courses
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredCourses.length > 0 && totalPages > 1 && (
            <div className="pt-8 border-t border-accent-200">
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