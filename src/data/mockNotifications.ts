import type { Notification } from "@/components/ui/NotificationDialog";

export const mockNotifications: Notification[] = [
  {
    id: "1",
    content: "Your course 'React Advanced Patterns' has been approved and is now live!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isPush: true,
    isRead: false,
  },
  {
    id: "2",
    content: "New student enrolled in your 'JavaScript Fundamentals' course.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isPush: false,
    isRead: false,
  },
  {
    id: "3",
    content: "Payment received for course enrollment. Amount: $299.99",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    isPush: true,
    isRead: false,
  },
  {
    id: "4",
    content: "Your profile has been successfully updated with new certification information.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isPush: false,
    isRead: true,
  },
  {
    id: "5",
    content: "Reminder: Course 'Web Development Bootcamp' starts tomorrow at 9:00 AM.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isPush: true,
    isRead: true,
  },
  {
    id: "6",
    content: "New message from student John Doe regarding assignment submission.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    isPush: false,
    isRead: true,
  },
  {
    id: "7",
    content: "Course materials for 'Database Design' have been updated. Please review the changes.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    isPush: false,
    isRead: true,
  },
  {
    id: "8",
    content: "System maintenance scheduled for this weekend. Some features may be temporarily unavailable.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    isPush: true,
    isRead: true,
  }
];
