// src/Shared/sidebarConfigs.ts
import {
  BookOpen, Calendar, ClipboardCheck, MessageCircle,
  FileText, Heart, AlertTriangle, Wrench, BookText, Clock, GraduationCap, CreditCard, Route, FileCheck
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
    { id: "learning-path", label: "Learning Path", icon: Route, path: "/student/learning-path" },
    { id: "placement-test", label: "Placement Test", icon: FileCheck, path: "/student/placement-test" },
    { id: "choose-paid-item", label: "Choose Paid Item", icon: CreditCard, path: "/student/choose-paid-item" },
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
    { id: "courses", label: "My Courses", icon: BookOpen, path: "/teacher/courses" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/teacher/schedule" },
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
