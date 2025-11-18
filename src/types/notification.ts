export type NotificationType = 'info' | 'warning' | 'system' | 'chat' | string;

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
