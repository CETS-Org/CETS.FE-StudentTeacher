import type React from "react";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown-menu";
import { cn } from "@/lib/utils";
import type { UserNotification } from "@/types/notification";

// Notification type based on backend structure
export type Notification = UserNotification;

const NOTIFICATION_TYPE_STYLES: Record<string, string> = {
  info: "bg-sky-100 text-sky-800",
  warning: "bg-red-100 text-red-800 ",
  system: "bg-amber-100 text-amber-800 ",
  chat: "bg-emerald-100 text-emerald-800 ",
  default: "bg-gray-100 text-gray-700",
};

interface NotificationDialogProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleSelect = (e: { preventDefault: () => void }) => {
    e.preventDefault(); // Prevent dropdown from closing
    handleClick();
  };

  const badgeClasses =
    NOTIFICATION_TYPE_STYLES[notification.type] ?? NOTIFICATION_TYPE_STYLES.default;
  const badgeLabel =
    notification.type && typeof notification.type === "string"
      ? `${notification.type.charAt(0)}${notification.type.slice(1)}`
      : "Info";

  return (
    <DropdownMenuItem 
      className={`p-3 cursor-pointer focus:bg-sky-100 focus:text-blue-900 ${
        !notification.isRead ? 'bg-blue-50' : 'bg-white'
      }`}
      onSelect={handleSelect}
    >
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium tracking-wide",
                badgeClasses
              )}
            >
              {badgeLabel}
            </span>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400/70">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </DropdownMenuItem>
  );
}


export default function NotificationDialog({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationDialogProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative p-2 rounded-xl hover:bg-sky-100 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-shadow",
            unreadCount > 0 && "shadow-md bg-accent2-100"
          )}
          type="button"
        >
          <Bell className="h-5 w-5 text-blue-900/70" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="notification-dialog-content w-90 max-h-96 border-sky-100 bg-white z-[60] rounded-xl shadow-xl flex flex-col overflow-hidden overscroll-contain"
      >
        <DropdownMenuLabel className="font-medium text-blue-900 flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sky-100" />

        <div
          className="max-h-72 w-full overflow-y-auto overflow-x-hidden overscroll-contain pr-1"
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                  {index < notifications.length - 1 && (
                    <DropdownMenuSeparator className="bg-gray-100" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-sky-100" />
            <div className="p-2 text-center">
              <p className="text-xs text-gray-500">
                {unreadCount === 0 
                  ? "All caught up!" 
                  : `${unreadCount} unread`
                }
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
