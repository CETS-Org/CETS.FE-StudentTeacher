// src/Shared/sidebarConfigs.ts
import {
  BookOpen, Calendar, ClipboardCheck, MessageCircle,
  FileText, ListChecks, Heart, AlertTriangle, Wrench, BookText, Clock, GraduationCap
} from "lucide-react";
import type { SidebarConfig } from "./GenericSidebar";

export const studentSidebarConfig: SidebarConfig = {
  title: "Student",
  submenuPathPrefix: "/student/request-issue",
  showUpcomingDeadlines: true,
  items: [
    { id: "my-classes", label: "My Classes", icon: BookOpen, path: "/student/my-classes" },
    { id: "wishlist", label: "Wishlist", icon: Heart, path: "/student/wishlist" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/student/schedule" },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck, path: "/student/attendance" },
    { id: "academic-results", label: "Academic Results", icon: GraduationCap, path: "/student/academic-results" },
    { id: "materials", label: "Materials", icon: FileText, path: "/student/materials" },
    { id: "homework", label: "Homework", icon: ListChecks, path: "/student/homework", badge: 3 },
    { id: "feedback", label: "Feedback", icon: MessageCircle, path: "/student/feedback" },
    {
      id: "request",
      label: "Send Request",
      icon: AlertTriangle,
      subItems: [
        { id: "request-technical", label: "Technical", icon: Wrench, path: "/student/request-issue/technical" },
        { id: "request-academic", label: "Academic", icon: BookText, path: "/student/request-issue/academic" },
      ],
    },
  ],
};

export const teacherSidebarConfig: SidebarConfig = {
  title: "Teacher",
  submenuPathPrefix: "/teacher/request-issue",
  items: [
    { id: "classes", label: "Classes", icon: BookOpen, path: "/teacher/classes" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/teacher/schedule" },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck, path: "/teacher/attendance" },
    { id: "materials", label: "Materials", icon: BookOpen, path: "/teacher/materials" },
    { id: "feedback", label: "Feedback", icon: MessageCircle, path: "/teacher/feedback" },
    {
      id: "request",
      label: "Send Request",
      icon: Clock,
      subItems: [
        { id: "request-technical", label: "Technical", icon: Wrench, path: "/teacher/request-issue/technical" },
        { id: "request-academic", label: "Academic", icon: BookText, path: "/teacher/request-issue/academic" },
      ],
    },
  ],
};
