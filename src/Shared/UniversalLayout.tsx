// src/Shared/UniversalLayout.tsx
import React, { useState, useEffect } from "react";
import { getUserRole, getUserInfo, isTokenValid } from "@/lib/utils";
import StudentSidebar from "./StudentSidebar";
import TeacherSidebar from "./TeacherSidebar";
import Navbar from "./GenericNavbar";
import { studentNavbarConfig, teacherNavbarConfig, guestNavbarConfig } from "./navbarConfigs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
  crumbs?: Crumb[];
  forceNoLayout?: boolean; // For pages that should never show sidebar (login, register, etc.)
};

// Pages that should never show sidebar/navbar
const PUBLIC_PAGES = [
  '/login',
  '/register',
  '/gateway',
  '/forgotPassword',
  '/otpVerification',
  '/resetPassword',
  '/google-callback'
];

export default function UniversalLayout({ 
  children, 
  className = "", 
  crumbs, 
  forceNoLayout = false 
}: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfoTick, setUserInfoTick] = useState(0);
  const location = useLocation();
 // Get user info for navbar
const userInfo = getUserInfo();
  // Check authentication and role on mount and when location changes
  useEffect(() => {
    const checkAuth = () => {
      const tokenValid = isTokenValid();
      const role = getUserRole();
      
      setIsAuthenticated(tokenValid);
      setUserRole(role);
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  // Re-render when userInfo in localStorage changes (avatar/name updates)
  useEffect(() => {
    const handler = () => setUserInfoTick((v) => v + 1);
    window.addEventListener('userInfoUpdated', handler as EventListener);
    return () => window.removeEventListener('userInfoUpdated', handler as EventListener);
  }, []);

  // Determine if we should show layout
  const shouldShowLayout = !forceNoLayout && !PUBLIC_PAGES.includes(location.pathname);
  
  // Determine if we should show sidebar (only for authenticated users)
  const shouldShowSidebar = shouldShowLayout && isAuthenticated && userRole;

  // If no layout should be shown, render children directly
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

 
  
  // Configure navbar based on role and authentication status
  let navbarConfig;
  
  if (!isAuthenticated || !userRole) {
    // Guest user (not logged in)
    navbarConfig = guestNavbarConfig;
  } else if (userRole?.toLowerCase() === 'student') {
    navbarConfig = {
      ...studentNavbarConfig,
      userInfo: {
        name: userInfo?.fullName || userInfo?.email || 'Student',
        email: userInfo?.email || '',
        role: 'Student',
        initials: userInfo?.fullName ? 
          userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
          'ST',
        avatar: userInfo?.avatarUrl 
      }
    };
  } else if (userRole?.toLowerCase() === 'teacher') {
    navbarConfig = {
      ...teacherNavbarConfig,
      userInfo: {
        name: userInfo?.fullName || userInfo?.email || 'Teacher',
        email: userInfo?.email || '',
        role: 'Teacher',
        initials: userInfo?.fullName ? 
          userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
          'TE',
        avatar: userInfo?.avatarUrl 
      }
    };
  } else {
    // Fallback for unknown roles
    navbarConfig = guestNavbarConfig;
  }

  // Render appropriate sidebar based on role
  const renderSidebar = () => {
    const sidebarProps = {
      collapsed,
      mobileOpen,
      onToggleCollapse: () => setCollapsed((v) => !v),
      onCloseMobile: () => setMobileOpen(false),
      onNavigate: () => setMobileOpen(false),
    };

    switch (userRole?.toLowerCase()) {
      case 'student':
        return <StudentSidebar {...sidebarProps} />;
      case 'teacher':
        return <TeacherSidebar {...sidebarProps} />;
      default:
        return <StudentSidebar {...sidebarProps} />; // Fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar 
        collapsed={shouldShowSidebar ? collapsed : false} 
        mobileOpen={shouldShowSidebar ? mobileOpen : false} 
        config={navbarConfig}
        fullWidth={!shouldShowSidebar}
      />
      
      {shouldShowSidebar && renderSidebar()}

      <main
        className={cn(
          "flex-1 flex flex-col transition-[margin] duration-300 mt-16",
          shouldShowSidebar ? (collapsed ? "lg:ml-16" : "lg:ml-64") : "lg:ml-0"
        )}
      >
        {crumbs && (
          <div className="p-6 pb-0">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
