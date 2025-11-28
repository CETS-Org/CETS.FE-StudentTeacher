import type { AxiosRequestConfig } from "axios";
// Đảm bảo file cấu hình api chung của bạn có key 'chat' trỏ tới '/COM_Chat'
import { endpoint } from "@/api"; 
import { api } from "@/api/api";
import type { 
  ChatRoom, 
  ChatMessage, 
  CreateChatRoomRequest, 
  SendMessageRequest 
} from "./chat.types";

export const createChatRoom = (
  payload: CreateChatRoomRequest,
  config?: AxiosRequestConfig
) => api.post<ChatRoom>(`${endpoint.chat}/room`, payload, config);

export const getUserRooms = (
  userId: string,
  config?: AxiosRequestConfig
) => api.get<ChatRoom[]>(`${endpoint.chat}/user/${userId}/rooms`, config);

export const getMessagesByRoom = (
  roomId: string,
  limit: number = 50,
  skip: number = 0,
  config?: AxiosRequestConfig
) =>
  api.get<ChatMessage[]>(
    `${endpoint.chat}/room/${roomId}/messages?limit=${limit}&skip=${skip}`,
    config
  );

export const sendMessage = (
  payload: SendMessageRequest,
  config?: AxiosRequestConfig
) => api.post<ChatMessage>(`${endpoint.chat}/message`, payload, config);

// --- HELPER FUNCTIONS ---

export const sendTextMessage = (
  args: { roomId: string; senderId: string; content: string },
  config?: AxiosRequestConfig
) => {
  return sendMessage({
    roomId: args.roomId,
    senderId: args.senderId,
    content: args.content,
    type: "text",
    metadata: null
  }, config);
};

export const sendAssignmentMessage = (
  args: {
    roomId: string;
    senderId: string;
    assignmentTitle: string;
    assignmentId: string;
    redirectUrl: string;
    dueDate?: string;
  },
  config?: AxiosRequestConfig
) => {
  return sendMessage({
    roomId: args.roomId,
    senderId: args.senderId,
    content: `Bài tập: ${args.assignmentTitle}`,
    type: "assignment_link",
    metadata: {
      assignmentId: args.assignmentId,
      title: args.assignmentTitle,
      redirectUrl: args.redirectUrl,
      dueDate: args.dueDate || "",
    }
  }, config);
};