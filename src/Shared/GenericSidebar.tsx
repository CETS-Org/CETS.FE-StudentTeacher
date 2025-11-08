// src/Shared/GenericSidebar.tsx
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, X, ChevronDown, Clock, AlertCircle
} from "lucide-react";
import { cn, getStudentId } from "@/lib/utils";
import { getUpcomingAssignmentsForStudent } from "@/api/assignments.api";
import type { UpcomingAssignment } from "@/types/assignment";

export interface SubItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  badge?: number;
  subItems?: SubItem[];
}

export interface SidebarConfig {
  title: string;
  items: SidebarItem[];
  submenuPathPrefix?: string; // Used to auto-open submenus based on current path
  showUpcomingDeadlines?: boolean; // Show the upcoming deadlines section
}

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
  config: SidebarConfig;
};

export default function GenericSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
  config,
}: Props) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState<UpcomingAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    if (config.submenuPathPrefix) {
      const currentItem = config.items.find(item => 
        item.subItems && location.pathname.startsWith(config.submenuPathPrefix!)
      );
      if (currentItem) {
        setOpenSubmenu(currentItem.id);
      }
    }
  }, [location.pathname, config.submenuPathPrefix, config.items]);

  // Fetch upcoming assignments if enabled
  useEffect(() => {
    if (!config.showUpcomingDeadlines) return;

    const fetchUpcomingAssignments = async () => {
      const studentId = getStudentId();
      if (!studentId) return;

      try {
        setLoadingAssignments(true);
        const assignments = await getUpcomingAssignmentsForStudent(studentId, 3);
        setUpcomingAssignments(assignments);
      } catch (error) {
        console.error('Error fetching upcoming assignments:', error);
        setUpcomingAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchUpcomingAssignments();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUpcomingAssignments, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [config.showUpcomingDeadlines]);

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
              <span className="text-sm font-semibold text-white">{config.title}</span>
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
          <div className="flex-1 overflow-y-auto sidebar-scrollbar p-3 pt-0">
            <ul className="space-y-2">
              {config.items.map((item) => {
                if (item.subItems) {
                  const isSubmenuActive = item.subItems.some(sub => isActive(sub.path));
                  const isOpen = openSubmenu === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleSubmenuToggle(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-sidebar-hover",
                          isSubmenuActive && "bg-sidebar-active font-semibold shadow-md",
                          collapsed && "lg:justify-center lg:px-2"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
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
                                 <div className="flex items-center gap-3 w-full">
                                   <subItem.icon className="h-4 w-4 shrink-0 text-white" />
                                   <span className="truncate flex-1">{subItem.label}</span>
                                 </div>
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
                        )}
                    >
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="h-4 w-4 shrink-0 text-white" />
                          <span className={cn("truncate flex-1", collapsed && "lg:hidden")}>{item.label}</span>
                          {item.badge && item.badge > 0 && !collapsed && (
                            <span className={cn(
                              "text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center",
                              active ? "bg-white text-primary" : "bg-white/20 text-white"
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
          <div className="sticky bottom-0 z-10 bg-sidebar-primary">
            {config.showUpcomingDeadlines && (!collapsed || mobileOpen) && (
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Upcoming Deadlines
                  </h2>
                  {loadingAssignments && (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto sidebar-scrollbar">
                  {!loadingAssignments && upcomingAssignments.length === 0 && (
                    <div className="rounded-lg p-3 bg-white/10 text-center">
                      <p className="text-xs text-white/70">No upcoming deadlines</p>
                    </div>
                  )}
                  {upcomingAssignments.map((assignment) => (
                    <NavLink
                      key={assignment.id}
                      to={`/student/my-classes/${assignment.classId}/session/${assignment.classMeetingId}`}
                      onClick={onNavigate}
                      className={cn(
                        "rounded-lg p-2 transition-all duration-200 hover:bg-white/30",
                        assignment.isOverdue ? "bg-red-500/20 border border-red-500/30" : "bg-white/20"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {assignment.isOverdue && (
                          <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-white truncate" title={assignment.title}>
                            {assignment.title}
                          </h3>
                          <p className="text-[10px] text-white/70 truncate" title={assignment.className}>
                            {assignment.className}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-white/50" />
                            <p className={cn(
                              "text-[10px]",
                              assignment.isOverdue ? "text-red-300 font-medium" : "text-white/70"
                            )}>
                              {assignment.isOverdue ? "Overdue" : "Due"} {new Date(assignment.dueAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          {assignment.hasSubmission && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[9px] text-green-300">
                              Submitted
                            </span>
                          )}
                        </div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3 text-center text-[11px] text-white/70">
              © 2025 CETS
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
