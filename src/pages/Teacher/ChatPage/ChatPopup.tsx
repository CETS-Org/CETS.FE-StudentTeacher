// src/components/chat/ChatPopup.tsx
import React, { useState } from "react";
import { X, Send } from "lucide-react";

type Msg = { id: number; from: "me" | "teacher"; text: string; time: string };
type Conv = {
  id: string;
  teacher: string;
  avatar: string;
  lastMessage: string;
  time: string;
  messages: Msg[];
};

const seed: Conv[] = [
  {
    id: "1",
    teacher: "Dr. Sarah Johnson",
    avatar: "https://i.pravatar.cc/40?img=1",
    lastMessage: "Of course! The chain rule is fundamental...",
    time: "2:33 PM",
    messages: [
      { id: 1, from: "teacher", text: "Hi! I'm here to help with your studies.", time: "2:30 PM" },
      { id: 2, from: "me", text: "Hello! I'm struggling with calculus derivatives.", time: "2:32 PM" },
      { id: 3, from: "teacher", text: "Of course! The chain rule is fundamental.", time: "2:33 PM" },
    ],
  },
  {
    id: "2",
    teacher: "Prof. Michael Chen",
    avatar: "https://i.pravatar.cc/40?img=2",
    lastMessage: "Great progress on your essay!",
    time: "Yesterday",
    messages: [{ id: 1, from: "teacher", text: "Great progress on your essay!", time: "1:00 PM" }],
  },
];

export default function ChatPopup({ onClose }: { onClose: () => void }) {
  const [conversations, setConversations] = useState<Conv[]>(seed);       // chuỗi 1: lưu conversation
  const [selected, setSelected] = useState<Conv>(seed[0]);                 // chuỗi 2: nội dung của conversation được chọn
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const newMsg: Msg = { id: Date.now(), from: "me", text, time: "Now" };
    const updated = {
      ...selected,
      messages: [...selected.messages, newMsg],
      lastMessage: text,
      time: "Now",
    };

    // cập nhật vào list
    setConversations((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    setSelected(updated);
    setInput("");
  };

  return (
    <div className="fixed bottom-20 right-8 w-[860px] h-[560px] bg-white border rounded-xl shadow-2xl overflow-hidden z-[60]">
      <div className="flex h-full">
        {/* Sidebar danh sách conversation */}
        <aside className="w-80 border-r flex flex-col bg-white">
          <div className="p-3 border-b">
            <input
              placeholder="Find person you want to chat with"
              className="w-full px-3 py-2 text-sm border rounded-md"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left flex items-center gap-3 p-3 hover:bg-gray-100 ${
                  selected.id === c.id ? "bg-gray-200" : ""
                }`}
              >
                <img src={c.avatar} alt={c.teacher} className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.teacher}</div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage}</div>
                </div>
                <div className="text-[11px] text-gray-400">{c.time}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Khung chat */}
        <section className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="h-12 px-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selected.avatar} className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-sm font-medium">{selected.teacher}</div>
                <div className="text-xs text-green-600">Online</div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selected.messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow-sm ${
                    m.from === "me" ? "bg-black text-white" : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="mt-1 text-[10px] opacity-70">{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="h-14 border-t bg-white flex items-center gap-2 px-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm border rounded-md"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
