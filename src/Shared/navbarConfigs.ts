import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Heart, 
  User, 
  Award, 
  Users, 
  FileText, 
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";
import type { NavbarConfig } from "@/types/navbar";

// Student Navbar Configuration
export const studentNavbarConfig: NavbarConfig = {
  userInfo: { name: "Guest", email: "guest@cets.edu", role: "Student", initials: "GU", avatar: undefined },
  portalName: "Learning Platform",
  navigationItems: [
    { name: "Home", href: "/", icon: Home, description: "Go to homepage" },
    { name: "All Courses", href: "/courses", icon: BookOpen, description: "Browse all available courses" },
    { name: "My Classes", href: "/student/my-classes", icon: GraduationCap, description: "View your enrolled classes" },
    { name: "Schedule", href: "/student/schedule", icon: Calendar, description: "Check your class schedule" },
    { name: "Wishlist", href: "/student/wishlist", icon: Heart, description: "View saved courses" }
  ],
  userMenuItems: [
    { name: "Dashboard", href: "/student/dashboard", icon: Home, description: "Student dashboard" },
    { name: "My Profile", href: "/student/profile", icon: User, description: "Manage your profile" },
    { name: "Academic Results", href: "/student/academic-results", icon: Award, description: "View your grades and certificates" },
    { name: "Attendance", href: "/student/attendance", icon: Users, description: "Check attendance records" },
    { name: "Feedback", href: "/student/feedback", icon: MessageSquare, description: "Provide course feedback" }
  ],
  quickStats: [
    { label: "Courses", value: "12", color: "bg-gradient-to-br from-primary-50 to-accent-50" },
    { label: "Progress", value: "85%", color: "bg-gradient-to-br from-success-50 to-warning-50" }
  ]
};

// Teacher Navbar Configuration
export const teacherNavbarConfig: NavbarConfig = {
  userInfo: { name: "Guest", email: "guest@cets.edu", role: "Teacher", initials: "GU", avatar: undefined },
  portalName: "Teacher Portal",
  navigationItems: [
    { name: "Home", href: "/", icon: Home, description: "Go to homepage" },
    { name: "My Classes", href: "/teacher/classes", icon: GraduationCap, description: "Manage your classes" },
    { name: "My Courses", href: "/teacher/courses", icon: BookOpen, description: "View your courses" },
    { name: "Schedule", href: "/teacher/schedule", icon: Calendar, description: "Check your teaching schedule" },
    { name: "Reports", href: "/teacher/request-issue", icon: BarChart3, description: "View reports and analytics" }
  ],
  userMenuItems: [
    { name: "Dashboard", href: "/teacher/dashboard", icon: Home, description: "Teacher dashboard" },
    { name: "My Profile", href: "/teacher/teacherProfile", icon: User, description: "Manage your profile" },
    { name: "Class Management", href: "/teacher/classes", icon: Users, description: "Manage your classes" },
    { name: "Course Materials", href: "/teacher/materials", icon: FileText, description: "Upload and manage materials" },
    { name: "Student Progress", href: "/teacher/progress", icon: Award, description: "Track student progress" },
    { name: "Messages", href: "/teacher/messages", icon: MessageSquare, description: "Communication with students" }
  ],
  quickStats: [
    { label: "Classes", value: "8", color: "bg-gradient-to-br from-primary-50 to-accent-50" },
    { label: "Students", value: "124", color: "bg-gradient-to-br from-success-50 to-warning-50" }
  ]
};

// Admin Navbar Configuration (example for future use)
export const adminNavbarConfig: NavbarConfig = {
  userInfo: { name: "Guest", email: "guest@cets.edu", role: "Administrator", initials: "GU", avatar: undefined },
  portalName: "Admin Portal",
  navigationItems: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home, description: "Admin dashboard" },
    { name: "Users", href: "/admin/users", icon: Users, description: "Manage users" },
    { name: "Courses", href: "/admin/courses", icon: BookOpen, description: "Manage courses" },
    { name: "Reports", href: "/admin/reports", icon: BarChart3, description: "System reports" },
    { name: "Settings", href: "/admin/settings", icon: Settings, description: "System settings" }
  ],
  userMenuItems: [
    { name: "System Overview", href: "/admin/overview", icon: Home, description: "System overview" },
    { name: "User Management", href: "/admin/users", icon: Users, description: "Manage all users" },
    { name: "Course Management", href: "/admin/courses", icon: BookOpen, description: "Manage courses" },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3, description: "View analytics" }
  ],
  quickStats: [
    { label: "Users", value: "1.2K", color: "bg-gradient-to-br from-primary-50 to-accent-50" },
    { label: "Courses", value: "156", color: "bg-gradient-to-br from-success-50 to-warning-50" }
  ]
};

// Guest Navbar Configuration (for non-authenticated users)
export const guestNavbarConfig: NavbarConfig = {
  userInfo: { name: "Guest", email: "", role: "Guest", initials: "GU", avatar: undefined },
  portalName: "CETS Platform",
  navigationItems: [
    { name: "Home", href: "/", icon: Home, description: "Go to homepage" },
    { name: "All Courses", href: "/courses", icon: BookOpen, description: "Browse all available courses" }
  ],
  userMenuItems: [
    { name: "Login", href: "/login", icon: User, description: "Sign in to your account" },
    { name: "Register", href: "/register", icon: Users, description: "Create a new account" }
  ],
  quickStats: []
};
