// src/components/schedule/SessionDetailsDialog.tsx
import React from "react";
import { Video, Calendar as CalendarIcon, User, Clock, MapPin, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
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

  const handleGoToClass = () => {
    if (sessionData.classId && !isStudent) {
      navigate(`/teacher/class/${sessionData.classId}`);
      onOpenChange(false);
    }
  };

  // Debug log
  console.log('SessionDetailsDialog:', { 
    classId: sessionData.classId, 
    isStudent, 
    shouldShowButton: sessionData.classId && !isStudent 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="border border-accent-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-primary-800">Class Details</DialogTitle>
              <p className="text-accent-600 text-sm">Course Information & Schedule</p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="pt-3">
          <div className="space-y-4">
            <div className="p-4 bg-primary-500 text-white rounded-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-primary-100 text-xs font-medium uppercase tracking-wide">Course</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{sessionData.courseName}</h3>
              <p className="text-primary-100 text-sm font-medium">{sessionData.className}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-accent-800 text-sm uppercase tracking-wide">
                    {isStudent ? "Instructor" : "Role"}
                  </span>
                </div>
                <p className="text-accent-700 font-semibold text-base">
                  {sessionData.instructor || (isStudent ? "TBA" : "You (Instructor)")}
                </p>
                <p className="text-accent-600 text-sm mt-1">
                  {isStudent ? "Available for Q&A after class" : "You are the instructor for this class"}
                </p>
              </div>

              <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-success-800 text-sm uppercase tracking-wide">Schedule</span>
                </div>
                <p className="text-success-700 font-semibold text-base">{sessionData.time}</p>
                <p className="text-success-600 text-sm mt-1">90 minutes duration</p>
              </div>

              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-warning-800 text-sm uppercase tracking-wide">Location</span>
                </div>
                <p className="text-warning-700 font-semibold text-base">{sessionData.roomNumber}</p>
                <p className="text-warning-600 text-sm mt-1">CETS Language Center</p>
              </div>

              <div className="p-3 bg-primary-25 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-primary-800 text-sm uppercase tracking-wide">Date</span>
                </div>
                <p className="text-primary-700 font-semibold text-base">{sessionData.date}</p>
                <p className="text-primary-600 text-sm mt-1">
                  {isStudent ? "Please arrive 10 minutes early" : "Class starts on time"}
                </p>
              </div>
            </div>

            {sessionData.meetingLink && (
              <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-info-500 rounded flex items-center justify-center">
                      <Video className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-info-800 text-sm">Online Meeting Available</span>
                  </div>
                  <a 
                    href={sessionData.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-info-500 hover:bg-info-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    <Video className="w-3 h-3" />
                    Join
                  </a>
                </div>
              </div>
            )}

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <h4 className="font-bold text-neutral-800 mb-2 text-sm">
                {isStudent ? "Class Preparation" : "Teaching Notes"}
              </h4>
              <div className="text-neutral-700 text-xs space-y-1">
                {isStudent ? (
                  <>
                    <div>• Bring textbook and notebook</div>
                    <div>• Complete assigned homework</div>
                    <div>• Review previous materials</div>
                  </>
                ) : (
                  <>
                    <div>• Prepare lesson materials</div>
                    <div>• Review student assignments</div>
                    <div>• Set up classroom equipment</div>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Button - Teacher Only */}
            {!isStudent && (
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={handleGoToClass}
                  iconRight={<ArrowRight size={16} />}
                  className="w-full"
                  disabled={!sessionData.classId}
                >
                  {sessionData.classId ? "Go to Class Detail" : "Class ID not available"}
                </Button>
                {!sessionData.classId && (
                  <p className="text-xs text-warning-600 mt-2 text-center">
                    Note: Backend needs to provide classId in API response
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}


