// src/components/Teacher/CourseCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";
import ClassActionsMenu from "@/pages/Teacher/ClassesPage/ClassActionsMenu";
import { Clock, Users, Star, ExternalLink } from "lucide-react";

/* =========================
   Types
========================= */


import type { TeacherCourse } from "@/types/course";

export type { TeacherCourse };

/* =========================
   Helpers
========================= */


// (date helper removed as it's unused)

function svgPlaceholder(title: string, w = 400, h = 240) {
  const t = encodeURIComponent(title.substring(0, 22));
  return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'%3e%3crect width='${w}' height='${h}' fill='%23666'/%3e%3ctext x='${w / 2}' y='${h / 2}' text-anchor='middle' fill='white' font-size='16'%3e${t}%3c/text%3e%3c/svg%3e`;
}

/* =========================
   Component
========================= */
const CourseCard: React.FC<{ course: TeacherCourse }> = ({ course }) => {
  const navigate = useNavigate();

  const openCourse = () => {
    navigate(`/teacher/courses/${course.id}/classes`);
  };
  // extra navigations removed as they're unused
  

  const onEdit = () => navigate(`/teacher/courses/${course.id}/edit`);
  const onDuplicate = () => alert(`Duplicated course ${course.title}`);
  const onDelete = () => {
    if (confirm(`Delete course "${course.title}"?`)) alert("Deleted (mock)");
  };

  const imgSrc = course.image || svgPlaceholder(course.title);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-primary-200 shadow-lg bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row">
        {/* Image + gradients */}
        <div className="lg:w-64 h-48 lg:h-48 relative flex-shrink-0">
          <img
            src={imgSrc}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = svgPlaceholder(course.title);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <span className="bg-gradient-to-r from-accent-400 to-accent-500  text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
              {course.level}
            </span>
            <span className="bg-white/90 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-primary-200 shadow-sm">
              {course.format}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-3">
              <h3 className="text-lg font-semibold text-neutral-900">
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  {course.title}
                </span>
              </h3>
              <p className="text-xs mt-1">
                <span className="inline-flex items-center gap-1 bg-warning-200 text-primary-700 px-2 py-1 rounded-md border border-primary-100">
                  <span className="font-semibold">{course.courseCode}</span>
                </span>
              </p>
              {course.category && (
                <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{course.category}</p>
              )}
            </div>

            {/* Quick actions */}
            <ClassActionsMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} align="right" />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-700 mb-4">
            {typeof course.totalHours === "number" && (
              <div className="flex items-center gap-1 bg-accent-50 text-accent-700 px-2.5 py-1 rounded-md border border-accent-100">
                <Clock className="w-4 h-4" />
                <span>{course.totalHours}h total</span>
              </div>
            )}
            {typeof course.enrolled === "number" && (
              <div className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md border border-primary-100">
                <Users className="w-4 h-4" />
                <span>{course.enrolled} enrolled</span>
              </div>
            )}
            {typeof course.activeClassCount === "number" && (
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100">
                <Users className="w-4 h-4" />
                <span>{course.activeClassCount} Ongoing Classes</span>
              </div>
            )}
            {typeof course.rating === "number" && (
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-md border border-yellow-100">
                <Star className="w-4 h-4" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              className="flex-1 sm:flex-initial btn-primary"
              iconRight={<ExternalLink className="w-4 h-4" />}
              onClick={openCourse}
            >
              View Classes
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
