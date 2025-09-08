// src/components/Teacher/CourseCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import ClassActionsMenu from "@/pages/Teacher/ClassesPage/ClassActionsMenu";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Star,
  FileText,
  FolderOpen,
  MapPin,
  GraduationCap,
  ExternalLink,
} from "lucide-react";

/* =========================
   Types
========================= */


export interface TeacherCourse {
  id: string;
  title: string;
  courseCode: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  format: "Online" | "Offline" | "Hybrid";
  category?: string;

  // schedule-ish (optional cho Course)
  schedule?: string;
  location?: string;
  startDate?: string;
  endDate?: string;

  // meta
  enrolled?: number;
  capacity?: number;
  totalHours?: number;
  rating?: number;

 
  image?: string; // cho phép rỗng
}

/* =========================
   Helpers
========================= */


function fmtDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

function svgPlaceholder(title: string, w = 400, h = 240) {
  const t = encodeURIComponent(title.substring(0, 22));
  return `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'%3e%3crect width='${w}' height='${h}' fill='%23666'/%3e%3ctext x='${w / 2}' y='${h / 2}' text-anchor='middle' fill='white' font-size='16'%3e${t}%3c/text%3e%3c/svg%3e`;
}

/* =========================
   Component
========================= */
const CourseCard: React.FC<{ course: TeacherCourse }> = ({ course }) => {
  const navigate = useNavigate();

  const openCourse = () => {navigate("/teacher/classes");};
  const openSyllabus = () => navigate(`/teacher/courses/${course.id}/syllabus`);
  const openMaterials = () => navigate(`/teacher/courses/${course.id}/materials`);
  

  const onEdit = () => navigate(`/teacher/courses/${course.id}/edit`);
  const onDuplicate = () => alert(`Duplicated course ${course.title}`);
  const onDelete = () => {
    if (confirm(`Delete course "${course.title}"?`)) alert("Deleted (mock)");
  };

  const imgSrc = course.image || svgPlaceholder(course.title);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200 shadow-md">
      <div className="flex flex-col lg:flex-row">
        {/* Image + status */}
        <div className="lg:w-64 h-48 lg:h-auto bg-neutral-600 relative flex-shrink-0">
          <img
            src={imgSrc}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = svgPlaceholder(course.title);
            }}
          />
     
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-3">
              <h3 className="text-lg font-semibold text-neutral-900">{course.title}</h3>
              <p className="text-sm text-neutral-600">
                Code: {course.courseCode} • {course.level} • {course.format}
              </p>
              {course.category && (
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{course.category}</p>
              )}
            </div>

            {/* Quick actions */}
            <ClassActionsMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} align="right" />
          </div>

    

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-4">
            {typeof course.totalHours === "number" && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.totalHours}h total</span>
              </div>
            )}
        
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              className="flex-1 sm:flex-initial"
              iconRight={<ExternalLink className="w-4 h-4" />}
              onClick={openCourse}
            >
              View Classes
            </Button>
           {/*   <Button
              variant="secondary"
              className="flex-1 sm:flex-initial"
              iconLeft={<FileText className="w-4 h-4" />}
              onClick={openSyllabus}
            >
              Syllabus
            </Button>  */}
          {/*  <Button
              variant="secondary"
              className="flex-1 sm:flex-initial"
              iconLeft={<FolderOpen className="w-4 h-4" />}
              onClick={openMaterials}
            >
              Materials
            </Button> */}
         
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
