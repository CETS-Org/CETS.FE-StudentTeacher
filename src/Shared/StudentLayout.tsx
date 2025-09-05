// src/Shared/StudentLayout.tsx
import React, { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";
import Navbar from "./StudentNavbar";

type Props = {
  children: React.ReactNode;
  className?: string;
  crumbs?: Crumb[];
};

export default function StudentLayout({ children, className = "", crumbs }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar/>
      <StudentSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
      />

      <main
        className={cn(
          "flex-1 pt-7 transition-[margin] duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <div className={cn("p-6", className)}>
          {crumbs && <Breadcrumbs items={crumbs} />}
          {children}
        </div>
      </main>
    </div>
  );
}