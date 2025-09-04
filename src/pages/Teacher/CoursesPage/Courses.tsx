// src/pages/Teacher/Courses.tsx
import React, { useEffect, useMemo, useState } from "react";
import TeacherLayout from "@/Shared/TeacherLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import CourseCard, { type TeacherCourse } from "@/pages/Teacher/CoursesPage/CourseCard";

import { BookOpen, Search as SearchIcon } from "lucide-react";

/* =========================
   Mock Data
========================= */

type CourseStatus = "ongoing" | "upcoming" | "archived";
const crumbs: Crumb[] = [{ label: "Courses" }];
const mockCourses: TeacherCourse[] = [
  {
    id: "course-001",
    title: "English for Beginners - A1",
    courseCode: "ENG-A1-2024.03",
    level: "Beginner",
    format: "Offline",
    category: "General English",
   
  },
  {
    id: "course-002",
    title: "IELTS Intensive - Band 6.5+",
    courseCode: "IELTS-INT-2024.02",
    level: "Intermediate",
    format: "Hybrid",
    category: "Test Preparation",
    
  },
  {
    id: "course-003",
    title: "Business English Presentations",
    courseCode: "BUS-PRE-2024.04",
    level: "Advanced",
    format: "Online",
    category: "Business English",
   
  },
  {
    id: "course-004",
    title: "Academic Writing Workshop",
    courseCode: "ACAD-WRI-2023.10",
    level: "Advanced",
    format: "Online",
    category: "Academic English",
    
  },
];

/* =========================
   Page
========================= */

export default function Courses() {

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [formatFilter, setFormatFilter] = useState<"All" | "Online" | "Offline" | "Hybrid">("All");
  const itemsPerPage = 3;

  // Filter
  const filtered = useMemo(() => {
    let res = mockCourses;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.courseCode.toLowerCase().includes(q)
      );
    }
    if (levelFilter !== "All") res = res.filter((c) => c.level === levelFilter);
    if (formatFilter !== "All") res = res.filter((c) => c.format === formatFilter);
    return res;
  }, [searchQuery, levelFilter, formatFilter]);

  useEffect(() => setCurrentPage(1), [searchQuery, levelFilter, formatFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  return (
    <TeacherLayout crumbs={crumbs}>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
             <div className="mb-6">
                  <PageHeader
                    title="My Courses"
                    
                  
                  />
                </div>
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Formats</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Course list */}
        <Card>
          {filtered.length > 0 ? (
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
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No courses found
              </h3>
              <p className="text-neutral-600 mb-6">
                You don’t have any courses yet.
              </p>
              
            </div>
          )}
        </Card>
      </div>
    </TeacherLayout>
  );
}
