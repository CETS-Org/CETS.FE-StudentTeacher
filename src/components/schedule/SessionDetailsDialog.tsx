// src/components/schedule/SessionDetailsDialog.tsx
import React from "react";
import { Video } from "lucide-react";
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
      <DialogContent size="md" className="border border-accent-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-900 mb-2">Class Details</DialogTitle>
        </DialogHeader>
        <hr className="border-t border-neutral-400" />
        <DialogBody className="pt-2 ">
          <div className="space-y-2 text-sm text-neutral-900 ">
            <div className="font-semibold text-center">Course: {sessionData.courseName}</div>
            <div className="text-neutral-600 text-center mb-4">Class: {sessionData.className}</div>

            <div>Date: {sessionData.date}</div>
            <div>Time: {sessionData.time}</div>
            <div>Room: {sessionData.roomNumber}</div>
            <div>Instructor: {sessionData.instructor || (isStudent ? "TBA" : "You")}</div>

            {sessionData.meetingLink && sessionData.meetingLink.trim() !== '' && (
              <div className="pt-1 ">
                <a
                  href={sessionData.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-300 hover:bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  <Video className="w-3 h-3" />
                  Join online meeting
                </a>
              </div>
            )}

            {sessionData.classId && (
              <div className="pt-1">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    if (sessionData.classMeetingId) {
                      navigate(`/student/class/${sessionData.classId}/session/${sessionData.classMeetingId}`);
                    } else {
                      navigate(`/student/class/${sessionData.classId}`);
                    }
                    onOpenChange(false);
                  }}
                >
                  {sessionData.classMeetingId ? "View This Session" : "View Class"}
                </Button>
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}


