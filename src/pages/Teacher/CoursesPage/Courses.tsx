// src/pages/Teacher/Courses.tsx
import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/card";
import Pagination from "@/Shared/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import CourseCard, { type TeacherCourse } from "@/pages/Teacher/CoursesPage/CourseCard";
import { api } from "@/api";
import { apiResponseToTeacherCourse, type TeachingCourseApiResponse } from "@/types/course";
import { getTeacherId } from "@/lib/utils";

import { BookOpen, Search as SearchIcon, AlertCircle } from "lucide-react";

/* =========================
   Constants
========================= */
const crumbs: Crumb[] = [{ label: "Courses" }];

/* =========================
   Local Types (mở rộng ở FE)
========================= */
// Mở rộng TeacherCourse để dùng thêm activeClassCount chỉ ở FE
type TeacherCourseWithClass = TeacherCourse & {
  /** Số lớp đang dạy (IsActive = true). FE mặc định 0 nếu API chưa trả về. */
  activeClassCount?: number;
};

/* =========================
   Page
========================= */

export default function Courses() {
  const [courses, setCourses] = useState<TeacherCourseWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [formatFilter, setFormatFilter] = useState<"All" | "Online" | "Offline" | "Hybrid">("All");

  // NEW: Filter theo trạng thái lớp
  const [classStatusFilter, setClassStatusFilter] = useState<"All" | "HaveClass" | "NoClass">("HaveClass");

  const itemsPerPage = 3;

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get teacher ID from localStorage
        const teacherId = getTeacherId();

        if (!teacherId) {
          setError("Teacher ID not found. Please login again.");
          return;
        }

        console.log("Fetching courses for teacher ID:", teacherId);
        const response = await api.getTeachingCourses(teacherId);

        // Convert API response to TeacherCourse format
        const teacherCourses: TeacherCourseWithClass[] = response.data.map((apiCourse: TeachingCourseApiResponse) => {
          const base = apiResponseToTeacherCourse(apiCourse) as TeacherCourseWithClass;

          // Front-end only: nếu API chưa có field activeClassCount thì mặc định 0
          // Nếu backend có, chỉ cần đảm bảo key đúng là 'activeClassCount'
          const possibleCount =
            (apiCourse as any).activeClassCount ??
            (apiCourse as any).ActiveClassCount ?? // phòng khi backend đặt PascalCase
            0;

          base.activeClassCount = Number.isFinite(possibleCount) ? Number(possibleCount) : 0;
          return base;
        });

        setCourses(teacherCourses);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let res = courses;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.courseCode.toLowerCase().includes(q)
      );
    }

    // Level
    if (levelFilter !== "All") res = res.filter((c) => c.level === levelFilter);

    // Format
    if (formatFilter !== "All") res = res.filter((c) => c.format === formatFilter);

    // NEW: Class status (front-end only)
    if (classStatusFilter !== "All") {
      res = res.filter((c) => {
        const count = c.activeClassCount ?? 0;
        if (classStatusFilter === "HaveClass") return count >= 1;
        if (classStatusFilter === "NoClass") return count < 1;
        return true;
      });
    }

    return res;
  }, [courses, searchQuery, levelFilter, formatFilter, classStatusFilter]);

  // Reset về page 1 khi đổi filter/search
  useEffect(() => setCurrentPage(1), [searchQuery, levelFilter, formatFilter, classStatusFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="px-4 py-6 space-y-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title="My Courses"
        description="Explore, manage, and track your classes"
        icon={<BookOpen className="w-5 h-5 text-white" />}
      />

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
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
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        {/* NEW: Bộ lọc trạng thái lớp */}
        <select
          value={classStatusFilter}
          onChange={(e) => setClassStatusFilter(e.target.value as any)}
          className="border border-primary-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
        >
          <option value="All">All</option>
          <option value="HaveClass">Have Class</option>
          <option value="NoClass">No Class </option>
        </select>
      </div>

      {/* Course list */}
      <Card
        className="border border-primary-200 shadow-lg bg-white/90 backdrop-blur-sm"
        title={
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Courses List
            </span>
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Loading courses...
            </h3>
            <p className="text-neutral-600">
              Please wait while we fetch your teaching courses.
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Error loading courses
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-6 min-h-[707px]">
            {pageItems.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}

            {totalPages > 1 && (
              <div className="pt-6 border-t border-neutral-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No courses found
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || levelFilter !== "All" || formatFilter !== "All" || classStatusFilter !== "All"
                ? "No courses match your current filters."
                : "You don't have any courses yet."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
