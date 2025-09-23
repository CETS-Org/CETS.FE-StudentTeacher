// src/Shared/StudentSidebar.tsx
import GenericSidebar from "./GenericSidebar";
import { studentSidebarConfig } from "./sidebarConfigs";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
};

export default function StudentSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: Props) {
  return (
    <GenericSidebar
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onToggleCollapse={onToggleCollapse}
      onCloseMobile={onCloseMobile}
      onNavigate={onNavigate}
      config={studentSidebarConfig}
    />
  );
}