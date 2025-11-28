import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, ExternalLink } from 'lucide-react';
import type { ChatMessage } from '@/Shared/Chat/api/chat.types';

interface MessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const navigate = useNavigate();

  const handleAssignmentClick = () => {
    if (message.metadata?.redirectUrl) {
      navigate(message.metadata.redirectUrl);
    }
  };

  const renderContent = () => {
    // --- DISPLAY ASSIGNMENT LINK ---
    if (message.type === 'assignment_link') {
      const { title, dueDate } = message.metadata || {};
      return (
        <div 
          onClick={handleAssignmentClick}
          className="mt-1 min-w-[240px] bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-all shadow-sm group text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {title || 'Bài tập'}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Hạn nộp: {dueDate ? format(new Date(dueDate), 'dd/MM/yyyy') : '---'}
              </p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium border-t border-gray-100 pt-1.5 flex items-center justify-between">
            <span>Xem chi tiết</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      );
    }

    // --- DISPLAY TEXT ---
    return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div className={`flex w-full mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-3 py-2 rounded-2xl shadow-sm ${
            message.type === 'assignment_link' 
              ? 'bg-transparent p-0 shadow-none' 
              : isOwnMessage 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          {renderContent()}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {format(new Date(message.createdAt), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;