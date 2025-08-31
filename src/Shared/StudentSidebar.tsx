import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  ListChecks,
  MessageCircle,
  User,
  Heart
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "my-courses",
    label: "My Courses",
    icon: <BookOpen className="w-5 h-5" />,
    path: "/student/myCourses"
  },
  {
    id: "wishlist",
    label: "Wishlist",
    icon: <Heart className="w-5 h-5" />,
    path: "/student/wishlist"
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: <Calendar className="w-5 h-5" />,
    path: "/student/schedule"
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: <ClipboardCheck className="w-5 h-5" />,
    path: "/student/attendance"
  },
  {
    id: "materials",
    label: "Materials",
    icon: <FileText className="w-5 h-5" />,
    path: "/student/materials"
  },
  {
    id: "homework",
    label: "Homework",
    icon: <ListChecks className="w-5 h-5" />,
    path: "/student/homework",
    badge: 3
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: <MessageCircle className="w-5 h-5" />,
    path: "/student/feedback"
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="w-5 h-5" />,
    path: "/student/profile"
  }
];

interface StudentSidebarProps {
  className?: string;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ className = "" }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== "/student/my-courses" && location.pathname.startsWith(path));
  };

  return (
    <aside className={`w-64 bg-white border-r border-neutral-200 min-h-screen ${className}`}>
      <nav className="p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active || isActive
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }
                  `}
                >
                  <span className={`shrink-0 ${active ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default StudentSidebar;