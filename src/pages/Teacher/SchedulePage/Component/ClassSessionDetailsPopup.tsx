// src/components/modals/ClassSessionDetailsPopup.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, BookOpen, GraduationCap } from "lucide-react";

// Định nghĩa cấu trúc dữ liệu cho một buổi học
type SessionDetails = {
  courseName: string;
  className: string;
  instructor?: string;
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

export default function ClassSessionDetailsPopup({ open, onOpenChange, session }: Props) {
  if (!session) {
    return null; // Không render gì nếu không có dữ liệu buổi học
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="border border-accent-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-primary-800">Teaching Session Details</DialogTitle>
              <p className="text-accent-600 text-sm">Course Information & Schedule</p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="pt-3">
          {session && (
            <div className="space-y-4">
              {/* Course Header */}
              <div className="p-4 bg-primary-500 text-white rounded-lg relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-primary-100 text-xs font-medium uppercase tracking-wide">Course</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{session.courseName}</h3>
                <p className="text-primary-100 text-sm font-medium">{session.className}</p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {session.instructor && (
                  <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-accent-800 text-sm uppercase tracking-wide">Teacher</span>
                    </div>
                    <p className="text-accent-700 font-semibold text-base">{session.instructor}</p>
                    <p className="text-accent-600 text-sm mt-1">Office hours available after class</p>
                  </div>
                )}

                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-success-800 text-sm uppercase tracking-wide">Schedule</span>
                  </div>
                  <p className="text-success-700 font-semibold text-base">{session.time}</p>
                  <p className="text-success-600 text-sm mt-1">90 minutes duration</p>
                </div>

                <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-warning-800 text-sm uppercase tracking-wide">Location</span>
                  </div>
                  <p className="text-warning-700 font-semibold text-base">{session.roomNumber}</p>
                  <p className="text-warning-600 text-sm mt-1">CETS Language Center</p>
                </div>

                <div className="p-3 bg-primary-25 border border-primary-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-primary-800 text-sm uppercase tracking-wide">Date</span>
                  </div>
                  <p className="text-primary-700 font-semibold text-base">{session.date}</p>
                  <p className="text-primary-600 text-sm mt-1">Arrive 10 minutes early to set up</p>
                </div>
              </div>

              {/* Meeting Link Section */}
              {session.meetingLink && (
                <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-info-500 rounded flex items-center justify-center">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-bold text-info-800 text-sm">Online Meeting Room</span>
                    </div>
                    <a 
                      href={session.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-info-500 hover:bg-info-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      <Video className="w-3 h-3" />
                      Start Meeting
                    </a>
                  </div>
                </div>
              )}

              {/* Teaching Preparation */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <h4 className="font-bold text-neutral-800 mb-2 text-sm">Teaching Preparation</h4>
                <div className="text-neutral-700 text-xs space-y-1">
                  <div>• Review lesson plan and materials</div>
                  <div>• Check audio/visual equipment</div>
                  <div>• Prepare handouts and exercises</div>
                  <div>• Set up classroom or online room</div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}