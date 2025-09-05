// src/Shared/StudentSidebar.tsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen, Calendar, ClipboardCheck, MessageCircle, User,
  ChevronLeft, ChevronRight, X, FileText, ListChecks,
  Heart, AlertTriangle, Wrench, BookText, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
};

const items = [
  { id: "my-courses", label: "My Courses", icon: BookOpen, path: "/student/myCourses" },
  { id: "wishlist", label: "Wishlist", icon: Heart, path: "/student/wishlist" },
  { id: "schedule", label: "Schedule", icon: Calendar, path: "/student/schedule" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, path: "/student/attendance" },
  { id: "materials", label: "Materials", icon: FileText, path: "/student/materials" },
  { id: "homework", label: "Homework", icon: ListChecks, path: "/student/homework", badge: 3 },
  { id: "feedback", label: "Feedback", icon: MessageCircle, path: "/student/feedback" },
  {
    id: "report",
    label: "Report Issue",
    icon: AlertTriangle,
    subItems: [
      { id: "report-technical", label: "Technical", icon: Wrench, path: "/student/report-issue/technical" },
      { id: "report-academic", label: "Academic", icon: BookText, path: "/student/report-issue/academic" },
    ],
  },
  { id: "profile", label: "Profile", icon: User, path: "/student/profile" },
];

export default function StudentSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: Props) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const currentItem = items.find(item => item.subItems && location.pathname.startsWith("/student/report-issue"));
    if (currentItem) {
      setOpenSubmenu(currentItem.id);
    }
  }, [location.pathname]);

  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  const handleSubmenuToggle = (id: string) => {
    setOpenSubmenu(prev => (prev === id ? null : id));
  };

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar backdrop"
        />
      )}
      <aside
        aria-label="Sidebar"
        className={cn(
          "fixed top-16 bottom-0 left-0 z-50 border-r border-sky-100 bg-sky-50 shadow-sm transition-all duration-300",
          "w-72 lg:w-64",
          collapsed && "lg:w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={cn(
              "sticky top-0 z-10 flex h-12 items-center border-b border-sky-100 bg-sky-50/95 px-3 backdrop-blur",
              (!collapsed || mobileOpen) ? "justify-between" : "justify-center"
            )}
          >
            {(!collapsed || mobileOpen) && (
              <span className="text-sm font-semibold text-sky-700">Student</span>
            )}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            {mobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-2">
              {items.map((item) => {
                if (item.subItems) {
                  const isSubmenuActive = item.subItems.some(sub => isActive(sub.path));
                  const isOpen = openSubmenu === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSubmenuToggle(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors border border-sky-200 hover:bg-sky-200/70",
                          isSubmenuActive && "bg-sky-500 text-white font-semibold shadow-md shadow-sky-200 border-sky-500",
                          collapsed && "lg:justify-center lg:px-2"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn("h-4 w-4 shrink-0", isSubmenuActive ? "text-white" : "text-slate-600")} />
                          <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180", collapsed && "lg:hidden")} />
                      </button>
                      {isOpen && !collapsed && (
                        <ul className="pl-6 pt-2 space-y-2">
                          {item.subItems.map(subItem => (
                             <li key={subItem.id}>
                               <NavLink
                                 to={subItem.path}
                                 onClick={onNavigate}
                                 className={({ isActive: isNavItemActive }) =>
                                   cn(
                                     "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-200/70",
                                     isNavItemActive && "bg-white font-semibold text-sky-600 shadow-sm"
                                   )
                                 }
                               >
                                 <subItem.icon className="h-4 w-4 shrink-0 text-slate-600" />
                                 <span>{subItem.label}</span>
                               </NavLink>
                             </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
                
                const active = isActive(item.path);
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path!}
                      onClick={onNavigate}
                      className={({ isActive: isNavItemActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors border border-sky-200 hover:bg-sky-200/70",
                          (active || isNavItemActive) && "bg-sky-500 text-white font-semibold shadow-md shadow-sky-200 border-sky-500",
                          collapsed && "lg:justify-center lg:px-2"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-600")} />
                          <span className={cn("truncate flex-1", collapsed && "lg:hidden")}>{item.label}</span>
                          {item.badge && item.badge > 0 && !collapsed && (
                            <span className={cn(
                              "text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center",
                              active ? "bg-white text-sky-500" : "bg-sky-200 text-sky-700"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="sticky bottom-0 z-10 border-t border-sky-100 bg-sky-50/95 p-3 text-center text-[11px] text-slate-500">
            © 2025 CETS
          </div>
        </div>
      </aside>
    </>
  );
}