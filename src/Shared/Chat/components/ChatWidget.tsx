import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send, Minimize2, Search, MoreVertical, FileText } from 'lucide-react';
import { getUserInfo } from '@/lib/utils';
import { 
  getUserRooms, 
  getMessagesByRoom, 
  sendTextMessage, 
  sendAssignmentMessage 
} from '@/Shared/Chat/api/chatApi'; 
import type { ChatRoom, ChatMessage } from '@/Shared/Chat/api/chat.types';
import MessageItem from '@/Shared/Chat/components/MessageItem';

const envSocketUrl = import.meta.env.VITE_NOTIFICATION_SOCKET_URL;
const SOCKET_URL = envSocketUrl || "http://localhost:5001";

// --- GLOBAL TRIGGER ---
let openChatWidget: (() => void) | null = null;

export const triggerChatWidget = () => {
  if (openChatWidget) {
    openChatWidget();
  }
};

const ChatWidget: React.FC = () => {
  const userInfo = getUserInfo();
  const currentUserId = userInfo?.id; 

  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadRoomIds, setUnreadRoomIds] = useState<string[]>([]);

  // --- REFS ---
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const currentRoomRef = useRef(currentRoom);

  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { currentRoomRef.current = currentRoom; }, [currentRoom]);
  
  useEffect(() => {
    openChatWidget = () => setIsOpen(true);
    return () => {
      openChatWidget = null;
    };
  }, []);

  // --- SETUP SOCKET ---
  useEffect(() => {
    if (!currentUserId) return;
    fetchRooms();

    socketRef.current = io(SOCKET_URL, {
      query: { userId: currentUserId },
      transports: ['websocket']
    });

    socketRef.current.on("receive_message", (rawMessage: any) => {
      const newMessage: ChatMessage = {
          ...rawMessage,
          id: rawMessage.id || rawMessage.Id,
          roomId: rawMessage.roomId || rawMessage.RoomId,
          senderId: rawMessage.senderId || rawMessage.SenderId,
          content: rawMessage.content || rawMessage.Content,
          type: rawMessage.type || rawMessage.Type,
          createdAt: rawMessage.createdAt || rawMessage.CreatedAt,
          metadata: rawMessage.metadata || rawMessage.Metadata
      };

      const incomingRoomId = newMessage.roomId.toString().toLowerCase();
      const activeRoomId = currentRoomRef.current?.id.toString().toLowerCase();
      const isWidgetOpen = isOpenRef.current;
      
      // Logic Unread
      if (!isWidgetOpen || activeRoomId !== incomingRoomId) {
          setUnreadRoomIds(prev => {
              if (!prev.includes(incomingRoomId)) return [...prev, incomingRoomId];
              return prev;
          });
      }
      
      // Update Chat UI
      if (activeRoomId === incomingRoomId) {
          setMessages(prevMsgs => [...prevMsgs, newMessage]);
      }
      
      // Update Sidebar
      setRooms(prevRooms => {
        const roomIndex = prevRooms.findIndex(r => r.id.toString().toLowerCase() === incomingRoomId);
        if (roomIndex === -1) { fetchRooms(); return prevRooms; }
        
        const updatedRooms = [...prevRooms];
        updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], lastMessageAt: newMessage.createdAt };
        return updatedRooms.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    });

    return () => { socketRef.current?.disconnect(); };
  }, [currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, currentRoom]);

  // --- API ACTIONS ---
  const fetchRooms = async () => {
    if (!currentUserId) return;
    try {
      const res = await getUserRooms(currentUserId);
      setRooms(res.data);
    } catch (error) { console.error("Failed to load rooms", error); }
  };

  const handleSelectRoom = async (room: ChatRoom) => {
    if (currentRoom?.id === room.id) return;
    setUnreadRoomIds(prev => prev.filter(id => id !== room.id.toString().toLowerCase()));
    setIsLoading(true);
    setCurrentRoom(room);
    try {
      const res = await getMessagesByRoom(room.id);
      const normalizedMessages = res.data.map((raw: any) => ({
        ...raw,
        id: raw.id || raw.Id,
        roomId: raw.roomId || raw.RoomId,
        senderId: raw.senderId || raw.SenderId, 
        content: raw.content || raw.Content,
        type: raw.type || raw.Type,
        createdAt: raw.createdAt || raw.CreatedAt,
        metadata: raw.metadata || raw.Metadata
      }));
      setMessages(normalizedMessages.reverse()); 
    } catch (error) { console.error("Failed to load messages", error); } 
    finally { setIsLoading(false); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentRoom || !currentUserId) return;
    try {
      await sendTextMessage({ roomId: currentRoom.id, senderId: currentUserId, content: inputText });
      setInputText("");
    } catch (error) { console.error("Failed to send", error); }
  };

  // --- HELPERS ---
  const getRoomName = (room: ChatRoom) => {
    if (room.type === 'group') return room.name;
    const otherMember = room.members?.find(m => m.id.toString().toLowerCase() !== (currentUserId || "").toString().toLowerCase());
    return otherMember ? otherMember.fullName : "Anonymous Users";
  };

  const getAvatarChar = (room: ChatRoom) => {
      const name = getRoomName(room);
      return (name || "U").charAt(0).toUpperCase();
  };

  // --- RENDER SIDEBAR ---
  const renderSidebar = () => {
    const filteredRooms = rooms.filter(r => getRoomName(r)?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Chat</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" placeholder="Search..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 text-sm pl-9 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredRooms.length === 0 && <div className="text-center text-gray-400 text-sm mt-10">Chat Room Not Found</div>}
          {filteredRooms.map((room) => {
            const hasUnread = unreadRoomIds.includes(room.id.toString().toLowerCase());
            return (
              <div 
                key={room.id} onClick={() => handleSelectRoom(room)}
                className={`p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all flex items-center gap-3 group relative ${
                  currentRoom?.id === room.id ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 relative ${
                  currentRoom?.id === room.id ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                }`}>
                   {getAvatarChar(room)}
                   {hasUnread && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${currentRoom?.id === room.id ? 'text-blue-700' : 'text-gray-800'} ${hasUnread ? 'font-bold' : ''}`}>
                      {getRoomName(room)}
                  </h4>
                  <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-900 font-semibold' : (currentRoom?.id === room.id ? 'text-blue-500 font-medium' : 'text-gray-500')}`}>
                     {hasUnread ? 'New Message' : 'View Message'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- RENDER MAIN CHAT ---
  const renderMainChat = () => {
    if (!currentRoom) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-6 select-none">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">Welcome to CETS Chat</h3>
          <p className="text-gray-500 mt-2 max-w-xs">Select a conversation to start</p>
        </div>
      );
    }
    return (
      <div className="flex-1 flex flex-col bg-white h-full min-w-0">
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 shadow-sm z-10 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
               {getAvatarChar(currentRoom)}
            </div>
            <div>
               <h3 className="font-bold text-gray-800 text-sm md:text-base">{getRoomName(currentRoom)}</h3>
               <span className="text-xs text-green-500 flex items-center gap-1 font-medium">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
               </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => {
                   if (!currentUserId) return;
                   sendAssignmentMessage({
                       roomId: currentRoom.id, senderId: currentUserId,
                       assignmentTitle: "Bài tập Demo Sidebar", assignmentId: "ASG_SIDEBAR",
                       redirectUrl: "/assignment/ASG_SIDEBAR", dueDate: new Date().toISOString()
                   });
                }}
                className="hidden md:flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
                <FileText size={14} /> <span className="hidden lg:inline">Test Assignment</span>
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><MoreVertical size={20} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 custom-scrollbar">
          {isLoading ? (
             <div className="flex justify-center mt-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            messages.map((msg) => {
              const isMe = !!currentUserId && (msg.senderId || "").toString().toLowerCase() === currentUserId.toString().toLowerCase();
              const sender = currentRoom.members?.find(m => m.id.toString().toLowerCase() === (msg.senderId || "").toString().toLowerCase());
              return <MessageItem key={msg.id} message={msg} isOwnMessage={isMe} senderName={isMe ? "You" : (sender?.fullName || "User")} senderAvatar={sender?.avatarUrl} />;
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-inner">
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter message..." className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm px-2 text-gray-700 placeholder-gray-400" />
            <button type="submit" disabled={!inputText.trim()} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 transform active:scale-95"><Send size={18} /></button>
          </form>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (!currentUserId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans antialiased">
      {/* WINDOW (Chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col"
            style={{ width: '900px', height: '600px', maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 100px)' }}
        >
          <div className="h-8 bg-slate-800 flex items-center justify-end px-3 shrink-0">
             <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white transition-colors p-1"><Minimize2 size={16} /></button>
             <button onClick={() => setIsOpen(false)} className="ml-2 text-slate-300 hover:text-white transition-colors p-1"><X size={16} /></button>
          </div>
          <div className="flex-1 flex overflow-hidden">
             {renderSidebar()}
             {renderMainChat()}
          </div>
        </div>
      )}
      
      {/* ĐÃ XÓA BUTTON TRÒN Ở ĐÂY */}
    </div>
  );
};

export default ChatWidget;