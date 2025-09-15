// src/Shared/TeacherSidebar.tsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen, Calendar, ClipboardCheck, MessageCircle, User,
  ChevronLeft, ChevronRight, X,
  Clock, Wrench, BookText, ChevronDown
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
  { id: "classes", label: "Classes", icon: BookOpen, path: "/teacher/courses" },
  { id: "schedule", label: "Schedule", icon: Calendar, path: "/teacher/teacherSchedule" },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck, path: "/teacher/attendance" },
  { id: "materials", label: "Materials", icon: BookOpen, path: "/teacher/materials" },
  { id: "feedback", label: "Feedback", icon: MessageCircle, path: "/teacher/feedback" },
  {
    id: "report",
    label: "Report Issue",
    icon: Clock,
    subItems: [
      { id: "report-technical", label: "Technical", icon: Wrench, path: "/teacher/TeacherReport/technical" },
      { id: "report-academic", label: "Academic", icon: BookText, path: "/teacher/TeacherReport/academic" },
    ],
  },
  { id: "profile", label: "Profile", icon: User, path: "/teacher/teacherProfile" },

];

export default function TeacherSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: Props) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const currentItem = items.find(item => item.subItems && location.pathname.startsWith("/teacher/report"));
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
          "fixed top-0 bottom-0 left-0 z-[60] bg-sidebar-primary shadow-sm transition-all duration-300",
          "w-72 lg:w-64",
          collapsed && "lg:w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={cn(
              "sticky top-0 z-10 flex h-16 items-center bg-sidebar-primary px-3 backdrop-blur",
              (!collapsed || mobileOpen) ? "justify-between" : "justify-center"
            )}
          >
            {(!collapsed || mobileOpen) && (
              <span className="text-sm font-semibold text-white">Teacher</span>
            )}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/20"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            {mobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/20 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 pt-0">
            <ul className="space-y-2">
              {items.map((item) => {
                // SỬA ĐIỀU KIỆN KIỂM TRA TẠI ĐÂY
                if (item.subItems) {
                  const isSubmenuActive = item.subItems.some(sub => isActive(sub.path));
                  const isOpen = openSubmenu === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSubmenuToggle(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sidebar-hover",
                          isSubmenuActive && "bg-sidebar-active font-semibold shadow-md",
                          collapsed && "lg:justify-center lg:px-2"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 shrink-0 text-white" />
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
                                     "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sidebar-hover",
                                     isNavItemActive && "bg-sidebar-active font-semibold shadow-sm"
                                   )
                                 }
                               >
                                 <subItem.icon className="h-4 w-4 shrink-0 text-white" />
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
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sidebar-hover",
                          (active || isNavItemActive) && "bg-sidebar-active font-semibold shadow-md",
                          collapsed && "lg:justify-center lg:px-2"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-white" />
                      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="sticky bottom-0 z-10 bg-sidebar-primary p-3 text-center text-[11px] text-white/70">
            © 2025 CETS
          </div>
        </div>
      </aside>
    </>
  );
}