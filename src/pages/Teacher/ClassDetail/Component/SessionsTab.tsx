// src/pages/teacher/classes/[classId]/SessionsTab.tsx
import { useState, useMemo, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  NotebookPen,
  Calendar,
  Globe,
  MapPin,
  Building,
  Video,
  CheckCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import Pagination from "@/Shared/Pagination";
import { useNavigate } from "react-router-dom";
import { getClassMeetingsByClassId } from "@/api/classMeetings.api";
import type { ClassMeeting } from "@/api/classMeetings.api";
import Loader from "@/components/ui/Loader";
import WeeklyFeedbackModal from "@/pages/Teacher/ClassDetail/Component/WeeklyFeedbackModal";

type Props = {
  classId?: string;
};

// === Helpers ===
const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const DAY_MS = 24 * 60 * 60 * 1000;

const getMondayOfWeek = (date: Date): number => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  d.setDate(d.getDate() + diff);
  return stripTime(d);
};

/** dd/mm/yyyy */
const formatDateDDMMYYYY = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function SessionsTab({ classId }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sessions, setSessions] = useState<ClassMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pin "next session"
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Weekly feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(
    null
  );
  const [selectedClassMeetingId, setSelectedClassMeetingId] =
    useState<string | null>(null);
  const [modalCanEditWeek, setModalCanEditWeek] = useState<boolean>(false);

  const itemsPerPage = 4;
  const navigate = useNavigate();

  // Map sessionId -> sessionNumber (thứ tự theo ngày)
  const [sessionNumberMap, setSessionNumberMap] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchSessions = async () => {
      if (!classId) {
        setError("Class ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getClassMeetingsByClassId(classId);

        // sort tăng dần theo ngày
        const sorted = [...data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // tạo map số thứ tự session
        const map: Record<string, number> = {};
        sorted.forEach((s, idx) => (map[s.id] = idx + 1));
        setSessionNumberMap(map);

        // Tìm buổi sắp tới (ngày >= hôm nay) và isActive = true
        const today = stripTime(new Date());
        const nextIndex = sorted.findIndex(
          (s) => stripTime(new Date(s.date)) >= today && s.isActive
        );
        const nextSessionId = nextIndex >= 0 ? sorted[nextIndex].id : null;
        setPinnedId(nextSessionId);

        setSessions(sorted);
      } catch (err) {
        console.error("Error fetching class meetings:", err);
        setError("Failed to load sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [classId]);

  /**
   * Tính:
   * - academicWeekMap: session.id -> "tuần học" (tuần 1 = tuần chứa buổi học sớm nhất, tuần tính theo Mon–Sun)
   * - lastOfWeekIdSet: tập ID buổi cuối cùng của từng tuần học
   */
  const { lastOfWeekIdSet, academicWeekMap } = useMemo(() => {
    const resultLastIdx: Record<number, number> = {};
    const weekMap: Record<string, number> = {};

    if (sessions.length === 0) {
      return { lastOfWeekIdSet: new Set<string>(), academicWeekMap: weekMap };
    }

    const WEEK_MS = 7 * DAY_MS;

    // 1) Tìm Monday của tuần chứa buổi học SỚM NHẤT -> baseMonday
    let baseMonday: number | null = null;
    sessions.forEach((s) => {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) return;
      const monday = getMondayOfWeek(d);
      if (baseMonday === null || monday < baseMonday) {
        baseMonday = monday;
      }
    });

    if (baseMonday === null) {
      return { lastOfWeekIdSet: new Set<string>(), academicWeekMap: weekMap };
    }

    const finalBaseMonday = baseMonday;

    // 2) Với mỗi session, tính tuần học (weekIndex) từ baseMonday
    sessions.forEach((s, idx) => {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) return;

      const monday = getMondayOfWeek(d);
      const diffWeeks = Math.floor((monday - finalBaseMonday) / WEEK_MS);
      const weekIndex = diffWeeks + 1; // Tuần bắt đầu từ 1

      weekMap[s.id] = weekIndex;
      // Ghi lại index cuối cùng của tuần đó
      resultLastIdx[weekIndex] = idx;
    });

    // 3) Lấy id của buổi cuối cùng trong mỗi tuần
    const idSet = new Set<string>();
    Object.values(resultLastIdx).forEach((idx) => {
      const id = sessions[idx]?.id;
      if (id) idSet.add(id);
    });

    return { lastOfWeekIdSet: idSet, academicWeekMap: weekMap };
  }, [sessions]);

  // Reorder để ghim “next session” lên đầu
  const orderedSessions = useMemo(() => {
    if (!pinnedId) return sessions;
    const pinned = sessions.find((s) => s.id === pinnedId);
    const rest = sessions.filter((s) => s.id !== pinnedId);
    return pinned ? [pinned, ...rest] : sessions;
  }, [sessions, pinnedId]);

  const totalPages = Math.ceil(orderedSessions.length / itemsPerPage) || 1;

  const currentSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return orderedSessions.slice(startIndex, endIndex);
  }, [currentPage, orderedSessions]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Teaching Progress: số buổi complete / tổng (isStudy === false)
  const completedCount = useMemo(
    () => sessions.filter((s) => !s.isStudy).length,
    [sessions]
  );
  const totalCount = sessions.length;
  const progressPct = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const todayTs = stripTime(new Date());

  // UI states
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 text-center">
        <p className="text-warning-700 font-medium">{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mt-3 mb-6">
        <div className="flex items-center justify-between text-sm font-semibold text-primary-800 mb-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success-600" />
            Teaching Progress
          </div>
          <div className="text-neutral-600">
            {completedCount} / {totalCount}
          </div>
        </div>

        <div className="h-2 w-full bg-neutral-200 rounded">
          <div
            className="h-2 bg-success-500 rounded"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-primary-800">
          Sessions ({totalCount})
        </h2>
      </div>

      {totalCount === 0 ? (
        <Card className="p-8 text-center border border-accent-100">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mb-4">
              <NotebookPen className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary-800 mb-2">
              No Sessions Yet
            </h3>
            <p className="text-neutral-600">
              There are no sessions scheduled for this class yet.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {currentSessions.map((sess) => {
              const isPinned = sess.id === pinnedId;
              const isLastOfWeek = lastOfWeekIdSet.has(sess.id);
              const week = academicWeekMap[sess.id] ?? 1; // tuần học
              const sessionNo = sessionNumberMap[sess.id];

              const isCompleted = !sess.isStudy;
              const isComingUp =
                sess.isStudy &&
                stripTime(new Date(sess.date)) >= stripTime(new Date());

              // ====== LOGIC REMINDER FEEDBACK ======
              let showReminderBadge = false;
              let canEditWeek = false;

              if (isLastOfWeek) {
                const sessionTs = stripTime(new Date(sess.date));

                // Window cho phép edit feedback: từ 3 ngày trước tới hết ngày buổi cuối tuần
                const startEditTs = sessionTs - 3 * DAY_MS;
                const endEditTs = sessionTs + 1 * DAY_MS;

                canEditWeek = todayTs >= startEditTs && todayTs <= endEditTs;
                showReminderBadge = canEditWeek;
              }

              return (
                <Card
                  key={sess.id}
                  className={[
                    "p-6 border bg-white transition-all duration-300 hover:shadow-lg",
                    isPinned
                      ? "relative border-2 border-primary-500 ring-2 ring-primary-300 shadow-xl"
                      : "border-accent-100",
                  ].join(" ")}
                >
                  {/* Ribbon Next */}
                  {isPinned && (
                    <div className="absolute -top-2 -left-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-primary-600 shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        Next session
                        <span className="relative ml-1 inline-flex">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    {/* LEFT info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <NotebookPen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-primary-800 text-lg">
                            Session {sessionNo}
                          </h3>

                          {isComingUp && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-neutral-800">
                              Coming Up
                            </span>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-success-600 text-white">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-neutral-700">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">
                              {formatDateDDMMYYYY(sess.date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-neutral-700">
                            <Clock className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">{sess.slot}</span>
                          </div>

                          {/* Online / Offline + passcode */}
                          <div className="flex items-center gap-2 text-sm text-neutral-700">
                            {sess.roomID ? (
                              <>
                                <Building className="w-4 h-4 text-primary-600 font-semibold" />
                                <span>Offline</span>
                                <MapPin className="w-4 h-4 text-primary-600 font-semibold" />
                                <span>Room: {sess.roomCode}</span>
                                {sess.onlineMeetingUrl && sess.passcode && (
                                  <span className="ml-2 px-2 py-1 bg-neutral-100 rounded text-xs font-semibold text-primary-800">
                                    Meeting Password: {sess.passcode}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4 text-primary-600 font-semibold" />
                                <span>Online</span>
                                {sess.onlineMeetingUrl && sess.passcode && (
                                  <span className="ml-2 px-2 py-1 bg-neutral-100 rounded text-xs font-semibold text-primary-800">
                                    Meeting Password: {sess.passcode}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {sess.recordingUrl && (
                            <div className="flex items-center gap-2 text-sm text-neutral-700">
                              <Video className="w-4 h-4 text-primary-600" />
                              <span>Recording Available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT buttons + reminder */}
                    <div className="flex flex-col gap-1 lg:flex-shrink-0">
                      {/* Row buttons */}
                      <div className="flex flex-row items-center gap-2">
                        {sess.onlineMeetingUrl && !isCompleted && (
                          <Button
                            variant="secondary"
                            className="border-primary-300 text-primary-700 hover:bg-primary-50"
                            onClick={() =>
                              window.open(sess.onlineMeetingUrl!, "_blank")
                            }
                            iconLeft={<Globe className="w-4 h-4" />}
                          >
                            Join
                          </Button>
                        )}

                        {isLastOfWeek ? (
                          <>
                            <div className="relative">
                              {/* 💭 Reminder bubble */}
                           {showReminderBadge && (
                                    <div
                                      className="
                                        absolute left-1/2 bottom-full mb-2 -translate-x-1/2
                                        bg-white px-3 py-1 rounded-full shadow-md
                                        text-[11px] font-semibold text-amber-700
                                        border border-amber-300
                                        flex items-center gap-1
                                        whitespace-nowrap
                                        animate-pulse
                                      "
                                    >
                                      <span className="text-amber-600">💭</span>
                                      Give feedback this week
                                    </div>
                                  )}

                              <Button
                                variant="secondary"
                                className="border-primary-300 text-primary-700 hover:bg-primary-50 flex items-center gap-2"
                                onClick={() => {
                                  setSelectedClassMeetingId(sess.id);
                                  setSelectedWeekNumber(week);
                                  setModalCanEditWeek(canEditWeek);
                                  setFeedbackOpen(true);
                                }}
                              >
                                Weekly Feedback
                              </Button>
                            </div>

                            <Button
                              variant="primary"
                              onClick={() =>
                                navigate(
                                  `/teacher/class/${classId}/session/${sess.id}`
                                )
                              }
                            >
                              Go to Session
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() =>
                              navigate(
                                `/teacher/class/${classId}/session/${sess.id}`
                              )
                            }
                          >
                            Go to Session
                          </Button>
                        )}
                      </div>

                      {/* Text trạng thái feedback */}
                      {isLastOfWeek && (
                        <div className="w-full text-left">
                          {!canEditWeek ? (
                            <span className="text-[10px] text-neutral-500">
                              Feedback is locked for editing. View only.
                            </span>
                          ) : (
                            <span className="text-[10px] text-success-700">
                              Feedback is open for this week.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={orderedSessions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Weekly Feedback Modal */}
          {feedbackOpen &&
            selectedWeekNumber !== null &&
            classId &&
            selectedClassMeetingId && (
              <WeeklyFeedbackModal
                classId={classId}
                classMeetingId={selectedClassMeetingId}
                weekNumber={selectedWeekNumber}
                isOpen={feedbackOpen}
                canEditWeek={modalCanEditWeek} // nhớ thêm prop này bên WeeklyFeedbackModal
                onClose={() => setFeedbackOpen(false)}
              />
            )}
        </>
      )}
    </div>
  );
}
