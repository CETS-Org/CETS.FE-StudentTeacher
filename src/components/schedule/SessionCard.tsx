// src/components/schedule/SessionCard.tsx
import { getAttendanceStyles, getTeachingSessionStyles } from "./scheduleUtils";
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
  const hasAttendance = (session as any).attendanceStatus !== undefined;
  const styles = (isStudent || hasAttendance)
    ? getAttendanceStyles((session as StudentSession).attendanceStatus)
    : getTeachingSessionStyles();

  return (
    <button
      onClick={() => onSessionClick(session, startLabel, endLabel)}
      className={`group w-full text-left rounded-lg shadow-md p-2 transition-all duration-200
                 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400
                 ${styles.border} ${styles.bg} ${styles.hover}`}
      title={`${session.title} • ${startLabel} – ${endLabel}`}
    >
      <div className={`text-sm font-bold leading-4 group-hover:opacity-90 mb-1 ${styles.text}`}>
        {session.title}
      </div>
      <div className={`text-xs font-medium mb-1 ${styles.text} opacity-80`}>
        {session.classCode}
        {session.room && (
          <span>
            {" • "}{session.room}
          </span>
        )}
      </div>
      {isStudent && (session as StudentSession).instructor && (
        <div className={`text-xs mb-1 ${styles.text} opacity-70`}>
          {(session as StudentSession).instructor}
        </div>
      )}
      <div className={`text-xs font-medium px-1 py-0.5 rounded ${styles.badge}`}>
        {startLabel} – {endLabel}
      </div>
    </button>
  );
}


