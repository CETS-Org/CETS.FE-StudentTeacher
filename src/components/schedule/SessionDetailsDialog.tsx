// src/components/schedule/SessionDetailsDialog.tsx
import React from "react";
import { Video, Calendar, Clock, MapPin, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import type { SessionDetailsData } from "./scheduleUtils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: SessionDetailsData | null;
  isStudent?: boolean;
};

export default function SessionDetailsDialog({
  open,
  onOpenChange,
  sessionData,
  isStudent = true,
}: Props) {
  const navigate = useNavigate();

  if (!sessionData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="border border-accent-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 -mx-6 -mt-6 px-6 py-5 mb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{sessionData.courseName}</DialogTitle>
            <p className="text-primary-100 text-sm mt-1">{sessionData.className}</p>
          </DialogHeader>
        </div>

        <DialogBody className="pt-0">
          {/* Info List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-neutral-500 font-medium w-20">Date</span>
              <span className="text-sm font-semibold text-neutral-800">{sessionData.date}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-neutral-500 font-medium w-20">Time</span>
              <span className="text-sm font-semibold text-neutral-800">{sessionData.time}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-neutral-500 font-medium w-20">Room</span>
              <span className="text-sm font-semibold text-neutral-800">{sessionData.roomNumber || "TBA"}</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-neutral-500 font-medium w-20">Instructor</span>
              <span className="text-sm font-semibold text-neutral-800">{sessionData.instructor || (isStudent ? "TBA" : "You")}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {sessionData.meetingLink && sessionData.meetingLink.trim() !== '' && (
              <a
                href={sessionData.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full justify-center"
              >
                <Video className="w-4 h-4" />
                Join Online Meeting
              </a>
            )}

            {sessionData.classId && (
              <>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    if (isStudent) {
                      if (sessionData.classMeetingId) {
                        navigate(`/student/class/${sessionData.classId}/session/${sessionData.classMeetingId}`);
                      } else {
                        navigate(`/student/class/${sessionData.classId}`);
                      }
                    } else {
                      // Teacher navigation
                      if (sessionData.classMeetingId) {
                        navigate(`/teacher/class/${sessionData.classId}/session/${sessionData.classMeetingId}`);
                      } else {
                        navigate(`/teacher/class/${sessionData.classId}`);
                      }
                    }
                    onOpenChange(false);
                  }}
                >
                  {sessionData.classMeetingId ? "View Session Details" : "View Class"}
                </Button>
                {!isStudent && sessionData.classMeetingId && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      navigate("/teacher/request-issue/academic", {
                        state: {
                          initialData: {
                            classMeetingID: sessionData.classMeetingId,
                            classId: sessionData.classId,
                            date: sessionData.date,
                            time: sessionData.time,
                            roomNumber: sessionData.roomNumber,
                            courseName: sessionData.courseName,
                            className: sessionData.className,
                          }
                        }
                      });
                      onOpenChange(false);
                    }}
                  >
                    Request Change Schedule
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
