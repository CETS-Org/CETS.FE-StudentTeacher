import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "@/Shared/TeacherLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import ClassActionsMenu from "@/pages/Teacher/ClassesPage/ClassActionsMenu";
import type { Crumb } from "@/components/ui/Breadcrumbs";


import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Star,
  Search as SearchIcon,
} from "lucide-react";

/* =========================
   Types & Mock Data
========================= */

type ClassStatus = "ongoing" | "upcoming" | "completed";

interface TeacherClass {
  id: string;
  title: string;
  courseCode: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "In-person" | "Hybrid";
  category: string;

  // scheduling
  schedule: string;
  location?: string;
  startDate: string;
  endDate: string;
  nextSession?: string;
  totalHours: number;
  sessionsPerWeek: number;

  // roster & progress
  instructor: string;
  assistants?: string[];
  enrolled: number;
  capacity: number;
  attendanceRate?: number;
  rating?: number;

  status: ClassStatus;
  image: string;
}

const mockClasses: TeacherClass[] = [
  {
    id: "c-101",
    title: "English for Beginners - A1",
    courseCode: "ENG-A1-2024.03",
    level: "Beginner",
    format: "In-person",
    category: "General English",
    schedule: "Mon, Wed - 18:30",
    location: "Room 203, CETS Center",
    startDate: "2024-03-01",
    endDate: "2024-05-20",
    nextSession: "2024-03-06T18:30:00",
    totalHours: 48,
    sessionsPerWeek: 2,
    instructor: "You",
    enrolled: 22,
    capacity: 24,
    attendanceRate: 92,
    rating: 4.7,
    status: "ongoing",
    image: "/api/placeholder/400/240",
  },
  {
    id: "c-202",
    title: "IELTS Intensive - Band 6.5+",
    courseCode: "IELTS-INT-2024.02",
    level: "Intermediate",
    format: "Hybrid",
    category: "Test Preparation",
    schedule: "Tue, Thu - 19:00",
    location: "Room 105 / Zoom",
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    totalHours: 40,
    sessionsPerWeek: 2,
    instructor: "You",
    assistants: ["Alex Nguyen"],
    enrolled: 18,
    capacity: 20,
    attendanceRate: 88,
    rating: 4.8,
    status: "ongoing",
    image: "/api/placeholder/400/240",
  },
  {
    id: "c-303",
    title: "Business English Presentations",
    courseCode: "BUS-PRE-2024.04",
    level: "Advanced",
    format: "Online",
    category: "Business English",
    schedule: "Saturday - 09:00",
    location: "Google Meet",
    startDate: "2024-04-10",
    endDate: "2024-06-05",
    nextSession: "2024-04-13T09:00:00",
    totalHours: 24,
    sessionsPerWeek: 1,
    instructor: "You",
    enrolled: 12,
    capacity: 16,
    status: "upcoming",
    image: "/api/placeholder/400/240",
  },
  {
    id: "c-404",
    title: "Academic Writing Workshop",
    courseCode: "ACAD-WRI-2023.10",
    level: "Advanced",
    format: "Online",
    category: "Academic English",
    schedule: "Sun - 10:00",
    location: "Zoom",
    startDate: "2023-10-05",
    endDate: "2023-12-20",
    totalHours: 30,
    sessionsPerWeek: 1,
    instructor: "You",
    enrolled: 20,
    capacity: 20,
    attendanceRate: 95,
    rating: 4.9,
    status: "completed",
    image: "/api/placeholder/400/240",
  },
];

/* =========================
   Helpers
========================= */

const badgeByStatus: Record<ClassStatus, string> = {
  ongoing: "bg-gradient-to-r from-accent-400 to-accent-500 text-white shadow-lg shadow-accent-500/25",
  upcoming: "bg-gradient-to-r from-warning-400 to-warning-500 text-white shadow-lg shadow-warning-500/25",
  completed: "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/25",
};

const labelByStatus: Record<ClassStatus, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
};


function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

function placeholder(title: string) {
  const t = encodeURIComponent(title.substring(0, 22));
  return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3e%3crect width='400' height='240' fill='%23666'/%3e%3ctext x='200' y='120' text-anchor='middle' fill='white' font-size='16'%3e${t}%3c/text%3e%3c/svg%3e`;
}

/* =========================
   Class Card (teacher)
========================= */
  const crumbs: Crumb[] = [
  { label: "Courses", to: "/teacher/courses" },
  { label: "Classes" },
];
const TeacherClassCard: React.FC<{ cls: TeacherClass }> = ({ cls }) => {
  const navigate = useNavigate();

  /*const openClass = () => navigate(`/teacher/classes/${cls.id}`);*/
  const openClass = () => navigate(`/teacher/classesDetail`);
  const openRoster = () => navigate(`/teacher/classes/${cls.id}/roster`);


  const onEdit = () => navigate(`/teacher/classes/${cls.id}/edit`);
  const onDuplicate = () => alert(`Duplicated class ${cls.title}`);
  const onDelete = () => {
    if (confirm(`Delete class "${cls.title}"?`)) alert("Deleted (mock)");
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:via-white hover:to-accent-25">
      <div className="flex flex-col lg:flex-row">
        {/* Image + status */}
        <div className="lg:w-64 h-48 lg:h-auto bg-gradient-to-br from-primary-600 to-primary-800 relative flex-shrink-0">
          <img
            src={cls.image}
            alt={cls.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = placeholder(cls.title);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm ${badgeByStatus[cls.status]}`}>
              {cls.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {labelByStatus[cls.status]}
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 text-primary-700 backdrop-blur-sm border border-primary-200 shadow-sm">
              {cls.format}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-3">
              <h3 className="text-xl font-bold text-primary-800 mb-2 leading-tight">
                {cls.title}
              </h3>
              <p className="text-xs mt-1">
                <span className="inline-flex items-center gap-1 bg-warning-200 text-primary-700 px-2 py-1 rounded-md border border-primary-100">
                  <span className="font-semibold">{cls.courseCode}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 px-2 py-1 rounded-md border border-accent-100 ml-2">
                  <GraduationCap className="w-3 h-3" />
                  <span>{cls.level}</span>
                </span>
              </p>
              <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{cls.category}</p>
            </div>

            {/* Quick actions (file riêng) */}
            <ClassActionsMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} align="right" />
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
                {cls.schedule}
              </p>
              {cls.location && (
                <div className="flex items-center gap-2 text-xs text-accent-600 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-medium">{cls.location}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-white/60 text-accent-700 px-2 py-1 rounded-md text-xs font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{fmtDate(cls.startDate)} → {fmtDate(cls.endDate)}</span>
                </div>
                {cls.nextSession && (
                  <div className="flex items-center gap-1 bg-warning-100 text-warning-700 px-2 py-1 rounded-md text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Next: {new Date(cls.nextSession).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Class Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <div className="flex items-center gap-2 bg-neutral-200 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">{cls.enrolled}/{cls.capacity} Students</span>
            </div>
            <div className="flex items-center gap-2 bg-info-100 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-info-600" />
              <span className="text-xs font-semibold text-info-700">{cls.totalHours}h</span>
            </div>
            {cls.attendanceRate && (
              <div className="flex items-center gap-2 bg-success-50 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span className="text-xs font-semibold text-success-700">{cls.attendanceRate}% Attendance</span>
              </div>
            )}
            {cls.rating && (
              <div className="flex items-center gap-2 bg-warning-50 px-3 py-2 rounded-lg">
                <Star className="w-4 h-4 fill-warning-500 text-warning-500" />
                <span className="text-xs font-semibold text-warning-700">{cls.rating.toFixed(1)} Rating</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="primary" 
              className="flex-1 sm:flex-initial bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200" 
              iconRight={<ExternalLink className="w-4 h-4" />} 
              onClick={openClass}
            >
              Open Class
            </Button>
            <Button variant="secondary" className="flex-1 sm:flex-initial" iconLeft={<Users className="w-4 h-4" />} onClick={openRoster}>
              Roster
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

/* =========================
   Page: Teacher → Classes
========================= */

export default function Classes() {



  const [activeTab, setActiveTab] = useState<"all" | ClassStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [formatFilter, setFormatFilter] = useState<"All" | "Online" | "In-person" | "Hybrid">("All");
  const itemsPerPage = 3;

  // Filter
  const filtered = useMemo(() => {
    let res = mockClasses;
    if (activeTab !== "all") res = res.filter((c) => c.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter((c) => c.title.toLowerCase().includes(q) || c.courseCode.toLowerCase().includes(q));
    }
    if (levelFilter !== "All") res = res.filter((c) => c.level === levelFilter);
    if (formatFilter !== "All") res = res.filter((c) => c.format === formatFilter);
    return res;
  }, [activeTab, searchQuery, levelFilter, formatFilter]);

  useEffect(() => setCurrentPage(1), [activeTab, searchQuery, levelFilter, formatFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  const onPageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tabs
  const counts = useMemo(
    () => ({
      all: mockClasses.length,
      ongoing: mockClasses.filter((c) => c.status === "ongoing").length,
      upcoming: mockClasses.filter((c) => c.status === "upcoming").length,
      completed: mockClasses.filter((c) => c.status === "completed").length,
    }),
    []
  );

  const tabs = [
    { id: "all", label: "All", badge: counts.all, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "ongoing", label: "Ongoing", badge: counts.ongoing, color: "bg-gradient-to-r from-accent-500 to-accent-600 text-white" },
    { id: "upcoming", label: "Upcoming", badge: counts.upcoming, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" },
    { id: "completed", label: "Completed", badge: counts.completed, color: "bg-gradient-to-r from-success-500 to-success-600 text-white" },
  ];

  return (
    <TeacherLayout 
      crumbs={crumbs}
      pageHeader={{
        title: "My Classes",
        subtitle: "Manage and track your teaching sessions",
        actions: (
          <div className="flex gap-3">
            <Button 
              variant="primary"
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
            >
              Open Today's Schedule
            </Button>
          </div>
        )
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center rounded-xl ">
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-primary-200 rounded-lg pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 bg-white"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
          >
            <option value="All">All Formats</option>
            <option value="Online">Online</option>
            <option value="In-person">In-person</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Tabs + Content */}
        <Card className="shadow-lg border border-accent-100 bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as any)} />

          {/* All */}
          <TabContent activeTab={activeTab} tabId="all">
            <div className="space-y-6">
              {pageItems.map((cls) => (
                <TeacherClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          </TabContent>

          {/* Ongoing */}
          <TabContent activeTab={activeTab} tabId="ongoing">
            <div className="space-y-6">
              {pageItems.map((cls) => (
                <TeacherClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          </TabContent>

          {/* Upcoming */}
          <TabContent activeTab={activeTab} tabId="upcoming">
            <div className="space-y-6">
              {pageItems.map((cls) => (
                <TeacherClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          </TabContent>

          {/* Completed */}
          <TabContent activeTab={activeTab} tabId="completed">
            <div className="space-y-6">
              {pageItems.map((cls) => (
                <TeacherClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          </TabContent>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No classes found</h3>
              <p className="text-neutral-600 mb-6">
                {activeTab === "all" ? "You don't have any classes yet." : `No ${activeTab} classes available.`}
              </p>
              <Button 
                variant="primary"
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
              >
                Create Class
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && totalPages > 1 && (
            <div className="pt-6 border-t border-neutral-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </Card>
      </div>
    </TeacherLayout>
  );
}
