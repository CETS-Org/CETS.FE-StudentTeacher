export interface ChatMemberDetail {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface ChatRoom {
  id: string;
  name?: string | null;
  type: 'private' | 'group';
  memberIds: string[];
  members: ChatMemberDetail[]; // Quan trọng: Dùng để hiển thị tên
  lastMessageAt: string; // ISO Date string
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'assignment_link' | 'image' | 'file';
  metadata?: {
    assignmentId?: string;
    title?: string;
    redirectUrl?: string;
    dueDate?: string;
    [key: string]: string | undefined;
  } | null;
  createdAt: string;
}

// DTO Requests
export interface CreateChatRoomRequest {
  name?: string | null;
  memberIds: string[];
  type: "private" | "group";
}

export interface SendMessageRequest {
  roomId: string;
  senderId: string;
  content: string;
  type: "text" | "assignment_link" | "image" | "file";
  metadata?: Record<string, string> | null;
}