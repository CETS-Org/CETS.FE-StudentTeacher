import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { UserNotification } from '@/types/notification';
import { getUserInfo } from '@/lib/utils';

export type NotificationHandler = (notification: UserNotification) => void;

export function useNotificationSocket(onNotification: NotificationHandler) {
  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    const url = import.meta.env.VITE_NOTIFICATION_SOCKET_URL || 'http://localhost:5001';

    const socket: Socket = io(url, {
      transports: ['websocket'],
      query: {
        userId: userInfo.id,
      },
    });

    socket.on('notification', (notification: UserNotification) => {
      // Double-check user is still logged in before processing notification
      const currentUserInfo = getUserInfo();
      if (!currentUserInfo?.id) {
        socket.disconnect();
        return;
      }
      onNotification(notification);
    });

    socket.on('connect_error', (err) => {
      console.error('Notification socket connection error', err);
    });

    // Listen for logout event and disconnect socket
    const handleLogout = () => {
      socket.disconnect();
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      socket.disconnect();
    };
  }, [onNotification]);
}
