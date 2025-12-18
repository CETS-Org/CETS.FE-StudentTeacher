// src/components/schedule/SessionCard.tsx
import { MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { BaseSession, StudentSession } from "./scheduleUtils";

type SessionCardProps<T extends BaseSession> = {
  session: T;
  startLabel: string;
  endLabel: string;
  onSessionClick: (session: T, startLabel: string, endLabel: string) => void;
  isStudent?: boolean;
};

export default function SessionCard<T extends BaseSession>({
  session,
  startLabel,
  endLabel,
  onSessionClick,
  isStudent = false,
}: SessionCardProps<T>) {
  const attendanceStatus = (session as StudentSession).attendanceStatus;

  // --- STATUS & STYLE LOGIC ---
  let containerStyle = "";
  let titleColor = "";
  let statusLabel = "";
  let statusStyle = "";
  let statusIcon = null;

  if (attendanceStatus === "attended") {
    // ATTENDED
    containerStyle = "bg-white border-l-4 border-green-500 hover:bg-green-50 transition-colors";
    titleColor = "text-green-900";
    statusLabel = "Attended";
    statusStyle = "text-green-600 bg-green-50 border-green-200";
    statusIcon = <CheckCircle2 className="w-3 h-3" />;
  } else if (attendanceStatus === "absent") {
    // ABSENT
    containerStyle = "bg-gray-50/80 border-l-4 border-red-400 hover:bg-gray-100 transition-colors";
    titleColor = "text-gray-500";
    statusLabel = "Absent";
    statusStyle = "text-red-500 bg-red-50 border-red-200";
    statusIcon = <XCircle className="w-3 h-3" />;
  } else {
    // UPCOMING (default)
    containerStyle = "bg-white border-l-4 border-blue-600 hover:bg-blue-50 transition-colors";
    titleColor = "text-blue-900";
    statusLabel = "Up Coming";
    statusStyle = "text-blue-600 bg-blue-50 border-blue-200";
    statusIcon = <Clock className="w-3 h-3" />;
  }

  return (
    <div className="relative h-full group w-full">
      <button
        onClick={() => onSessionClick(session, startLabel, endLabel)}
        className={`w-full h-full text-left rounded-r-md shadow-sm p-2 
                   focus:outline-none focus:ring-2 focus:ring-offset-1
                   flex flex-col gap-1 overflow-hidden ${containerStyle}`}
        title={`${session.title} • ${startLabel} – ${endLabel}`}
      >
        {/* --- HEADER: Title --- */}
        <div className={`font-bold text-xs leading-tight truncate ${titleColor}`}>
          {session.title}
        </div>

        {/* --- STATUS BADGE --- */}
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold w-fit ${statusStyle}`}>
          {statusIcon}
          <span className="uppercase tracking-wide">{statusLabel}</span>
        </div>

        {/* --- BODY --- */}
        <div className="flex flex-col gap-1 mt-auto pt-1">
          {/* Class Code & Room */}
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
            <MapPin className="w-3 h-3 opacity-70" />
            <span className="truncate">
              {session.classCode}
              {session.room && ` • ${session.room}`}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
