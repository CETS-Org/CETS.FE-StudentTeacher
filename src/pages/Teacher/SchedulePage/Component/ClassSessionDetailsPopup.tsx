// src/components/modals/ClassSessionDetailsPopup.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { Calendar, Clock, DoorClosed, Video, X } from "lucide-react";

// Định nghĩa cấu trúc dữ liệu cho một buổi học
type SessionDetails = {
  courseName: string;
  className: string;
  date: string;
  time: string;
  roomNumber: string;
  format: 'Hybrid' | 'Online' | 'In-person';
  meetingLink?: string;
};

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionDetails | null; // Cho phép null để xử lý trường hợp không có dữ liệu
};

// Component con để hiển thị một mục thông tin
// Định nghĩa kiểu dữ liệu cho props của InfoItem
type InfoItemProps = {
  icon: React.ElementType;
  label: string;
  value: string | number;
};

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div>
    <p className="text-sm text-gray-500 flex items-center gap-2">
      <Icon size={16} />
      {label}
    </p>
    <p className="font-medium text-gray-800 mt-1">{value}</p>
  </div>
);


export default function ClassSessionDetailsPopup({ open, onOpenChange, session }: Props) {
  if (!session) {
    return null; // Không render gì nếu không có dữ liệu buổi học
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Class Session Details</DialogTitle>
          {/* Nút đóng 'x' */}
          <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
             <X size={24} />
          </button>
        </DialogHeader>
        <DialogBody className="space-y-6 pt-4">
          {/* Thông tin khóa học và lớp */}
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="text-xl font-semibold text-gray-900">{session.courseName}</p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Class Section</p>
              <p className="text-xl font-semibold text-gray-900">{session.className}</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:underline p-0">
                Details
            </button>
          </div>

          <hr/>

          {/* Lưới thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoItem icon={Calendar} label="Date" value={session.date} />
            <InfoItem icon={Clock} label="Time" value={session.time} />
            <InfoItem icon={DoorClosed} label="Room Number" value={session.roomNumber} />
            <div>
              <p className="text-sm text-gray-500">Teaching Format</p>
              <span className="mt-1 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {session.format}
              </span>
            </div>
          </div>

          {/* Liên kết cuộc họp trực tuyến */}
          {session.meetingLink && (
            <div>
              <hr/>
              <p className="font-semibold text-gray-700 mt-4 mb-2">Online Meeting</p>
              <div className="relative">
                <Video size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  readOnly
                  value={session.meetingLink}
                  className="w-full border rounded-md pl-10 pr-3 py-2 bg-gray-50 text-gray-600"
                />
              </div>
              <Button 
                variant="primary" 
                className="w-full mt-3" 
                iconLeft={<Video size={16}/>}
                onClick={() => window.open(session.meetingLink, '_blank')}
              >
                Join Meeting
              </Button>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}