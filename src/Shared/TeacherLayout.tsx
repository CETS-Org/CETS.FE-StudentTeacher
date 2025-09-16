// src/Shared/TeacherLayout.tsx
import React, { useState } from "react";
import Navbar from "./TeacherNavbar";
import TeacherSidebar from "./TeacherSidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHeader from "@/components/ui/PageHeader";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import type { PageHeaderProps } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import ChatPopup from "@/pages/Teacher/ChatPage/ChatPopup"; // ⬅️ thêm import

type Props = {
  children: React.ReactNode;
  className?: string;
  crumbs?: Crumb[];
  pageHeader?: PageHeaderProps;
};

export default function TeacherLayout({ children, className = "", crumbs, pageHeader }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ⬇️ state để bật/tắt chat popup
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <TeacherSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
      />

      <main
        className={cn(
          "flex-1 pt-16 transition-[margin] duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
       <div className={cn("p-6", className)}>
          {crumbs && <Breadcrumbs items={crumbs} />}
          {pageHeader && (
            <div className="mb-2">
              <PageHeader 
                {...pageHeader}
                title={
                  typeof pageHeader.title === 'string' ? (
                    <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                      {pageHeader.title}
                    </span>
                  ) : pageHeader.title
                }
                subtitle={
                  typeof pageHeader.subtitle === 'string' ? (
                    <span className="text-sm text-neutral-600">{pageHeader.subtitle}</span>
                  ) : pageHeader.subtitle
                }
              />
            </div>
          )}
          {children}

          
          {!isChatOpen && (
            <div className="fixed bottom-8 right-8">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
                aria-label="Open chat"
              >
                <MessageSquare size={24} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Popup chat */}
      {isChatOpen && (
        <ChatPopup
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
