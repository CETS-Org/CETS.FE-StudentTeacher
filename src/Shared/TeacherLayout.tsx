// src/Shared/TeacherLayout.tsx
import React, { useState } from "react";
import Navbar from "./TeacherNavbar";
import TeacherSidebar from "./TeacherSidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import ChatPopup from "@/pages/Teacher/ChatPage/ChatPopup"; // ⬅️ thêm import

type Props = {
  children: React.ReactNode;
  className?: string;
  crumbs?: Crumb[];
};

export default function TeacherLayout({ children, className = "", crumbs }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ⬇️ state để bật/tắt chat popup
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 ">
      <Navbar collapsed={collapsed} mobileOpen={mobileOpen} />

      <TeacherSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
      />

<main
        className={cn(
          "flex-1 transition-[margin] duration-300 overflow-hidden mt-16",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <div className={cn("p-6 max-w-full space-y-8", className)}>
          {crumbs && <Breadcrumbs items={crumbs} />}
          {children}
        </div>

             
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
