// src/pages/Student/ClassDetailsView.tsx
import React, { useState, useEffect, useRef } from "react"; // Thêm useRef
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  ClipboardCheck,
  TrendingUp,
  MessageCircle,
  User as UserIcon,
  ChevronDown, // Thêm ChevronDown
} from "lucide-react";

import type { ClassMeeting } from "@/api/classMeetings.api";
import type { MeetingAssignment } from "@/services/teachingClassesService";
import type { MyClass } from "@/types/class";
import type { AttendanceRecord } from "@/types/attendance";

import { getClassMeetingsByClassId } from "@/api/classMeetings.api";
import { attendanceService } from "@/services/attendanceService";
import {
  getCourseAttendanceSummary,
  getCourseDetails,
  type CourseAttendanceSummaryResponse,
  type Assignment,
  type AssignmentByMeeting,
} from "@/api/academicResults.api";
import { getCoveredTopicByMeetingId } from "@/services/teachingClassesService";
import { getStudentId } from "@/lib/utils";

import { getWeeklyFeedbackByStudent } from "@/api/weeklyFeedback.api";
import type { WeeklyFeedbackView } from "@/services/teachingClassesService";

import {
  mockClassMeetings,
  mockAssignmentsByMeeting,
  mockAttendanceData,
} from "@/pages/Student/LearningPath/data/mockLearningPathData";

// Mock topics for sessions (fallback if not in attendance data)
const mockSessionTopics: Record<string, string[]> = {
  // ... (Nội dung mock data giữ nguyên)
  "class-abe101-1": [
    "Business Communication Fundamentals",
    "Email Writing Skills",
    "Meeting and Presentation Skills",
    "Negotiation Techniques",
    "Cross-cultural Communication",
    "Professional Networking",
    "Report Writing",
    "Telephone Etiquette",
  ],
  "class-ielts201-1": [
    "Reading Comprehension Strategies",
    "Writing Task 1 - Academic",
    "Listening Practice",
    "Speaking Part 2",
    "Writing Task 2 - Essay",
    "Vocabulary Building",
    "Grammar Review",
    "Mock Test",
  ],
  "class-ecc101-1": [
    "Daily Conversations",
    "Shopping and Services",
    "Travel and Tourism",
    "Food and Dining",
    "Health and Fitness",
    "Hobbies and Interests",
    "Weather and Seasons",
    "Final Assessment",
  ],
};

interface ClassDetailsViewProps {
  classItem: MyClass;
  courseId?: string; // Optional courseId from parent component
  onBack: () => void;
}

interface AssignmentWithStatus extends MeetingAssignment {
  submissionStatus?: string; // From API: "SUBMITTED", "PENDING", etc.
  submittedAt?: string | null; // From API
}

interface SessionWithAssignments extends ClassMeeting {
  assignments: AssignmentWithStatus[];
  sessionNumber: number;
  isCompleted: boolean;
  coveredTopic?: string;
}

const ClassDetailsView: React.FC<ClassDetailsViewProps> = ({
  classItem,
  courseId: propCourseId,
  onBack,
}) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithAssignments[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [weeklyScores, setWeeklyScores] = useState<
    { label: string; score: number }[]
  >([]);
  const [warningLevel, setWarningLevel] = useState<
    "low" | "medium" | "high" | null
  >(null);
  const [filterMode, setFilterMode] = useState<"4w" | "8s">("8s");
  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null); // Store attendance summary for Learning Timeline
  const [courseAttendanceSummary, setCourseAttendanceSummary] =
    useState<CourseAttendanceSummaryResponse | null>(null); // Store course attendance summary for Attendance Report tab
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [allAssignments, setAllAssignments] = useState<AssignmentWithStatus[]>(
    []
  ); // Store all assignments from API
  const [assignmentsByMeeting, setAssignmentsByMeeting] = useState<
    AssignmentByMeeting[]
  >([]); // Store assignments grouped by meeting
  const [sortedMeetingsList, setSortedMeetingsList] = useState<ClassMeeting[]>(
    []
  ); // Store sorted meetings for reference
  const [courseDetailsData, setCourseDetailsData] = useState<any>(null); // Store full course details response for weeklyPerformance and completionStats

  // --- Weekly feedback state (Student View) ---
  const [weeklyFeedback, setWeeklyFeedback] = useState<WeeklyFeedbackView[]>(
    []
  );
  const [weeklyFeedbackLoading, setWeeklyFeedbackLoading] =
    useState<boolean>(false);
  const [weeklyFeedbackError, setWeeklyFeedbackError] = useState<
    string | null
  >(null);
  const [hasLoadedWeeklyFeedback, setHasLoadedWeeklyFeedback] =
    useState<boolean>(false);
  // --- STATE MỚI CHO ACCORDION ---
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  // --- REF MỚI ĐỂ SCROLL ---
  const weekRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (classItem?.id) {
      fetchClassSessions();
      fetchCourseAttendanceSummary();
    }
  }, [classItem?.id]);

  // Khi chuyển sang tab weekly-feedback lần đầu thì mới call API
  useEffect(() => {
    if (activeTab === "weekly-feedback" && !hasLoadedWeeklyFeedback) {
      fetchWeeklyFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- EFFECT MỚI: Tự động cuộn đến tuần active ---
  useEffect(() => {
    if (activeWeek && hasLoadedWeeklyFeedback) {
      // Dùng timeout nhỏ để đảm bảo DOM đã render sau khi mở rộng
      setTimeout(() => {
        const activeWeekKey = String(activeWeek);
        weekRefs.current[activeWeekKey]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100); // 100ms delay
    }
    // Chỉ chạy khi activeWeek thay đổi *sau khi* data đã load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWeek, hasLoadedWeeklyFeedback]);

  // Fetch weekly feedback cho student hiện tại
  const fetchWeeklyFeedback = async () => {
    try {
      setWeeklyFeedbackLoading(true);
      setWeeklyFeedbackError(null);
      setActiveWeek(null); // Reset tuần active khi fetch

      const studentId = getStudentId();
      if (!studentId) {
        throw new Error("Student ID not found. Please log in again.");
      }

      // `getWeeklyFeedbackByStudent` trả về AxiosResponse<WeeklyFeedbackView[]>
      const res = await getWeeklyFeedbackByStudent(studentId, classItem.id);
      const feedbackData = res.data || [];
      setWeeklyFeedback(feedbackData);
      setHasLoadedWeeklyFeedback(true);

      // --- LOGIC MỚI: Tìm và set tuần active ---
      if (feedbackData.length > 0) {
        // Sắp xếp theo tuần giảm dần để tìm tuần MỚI NHẤT
        const sortedFeedback = [...feedbackData].sort(
          (a, b) => b.weekNumber - a.weekNumber
        );

        // 1. Ưu tiên tìm tuần "Submitted" (status 2) mới nhất
        const latestSubmitted = sortedFeedback.find((f) => f.status === 2);
        if (latestSubmitted) {
          setActiveWeek(latestSubmitted.weekNumber);
          return; // Đã tìm thấy
        }

        // 2. Nếu không, tìm tuần "Draft" (status 1) mới nhất
        const latestDraft = sortedFeedback.find((f) => f.status === 1);
        if (latestDraft) {
          setActiveWeek(latestDraft.weekNumber);
          return; // Đã tìm thấy
        }

        // 3. Fallback: Lấy tuần mới nhất (cao nhất) có trong danh sách
        const maxWeek = Math.max(...feedbackData.map((f) => f.weekNumber));
        setActiveWeek(maxWeek);
      }
      // --- KẾT THÚC LOGIC MỚI ---
    } catch (err: any) {
      console.error("Error fetching weekly feedback:", err);
      setWeeklyFeedbackError(
        "Failed to load weekly feedback. Please try again."
      );
    } finally {
      setWeeklyFeedbackLoading(false);
    }
  };

  // Fetch course attendance summary for Attendance Report tab
  const fetchCourseAttendanceSummary = async () => {
    try {
      setAttendanceLoading(true);
      const studentId = getStudentId();
      if (!studentId) {
        throw new Error("Student ID not found");
      }

      // Get courseId: prefer prop, then courseCode from classItem
      const courseId = propCourseId || classItem.courseCode;
      if (!courseId) {
        console.warn("Course ID not found, skipping attendance summary fetch", {
          propCourseId,
          courseCode: classItem.courseCode,
          classItem,
        });
        return;
      }

      console.log("Fetching course attendance summary:", {
        courseId,
        studentId,
        propCourseId,
        classItemCourseCode: classItem.courseCode,
        classItemId: classItem.id,
      });

      const summary = await getCourseAttendanceSummary(courseId, studentId);
      console.log("Course attendance summary received:", summary);
      setCourseAttendanceSummary(summary);
    } catch (err: any) {
      console.error("Error fetching course attendance summary:", err);
      const mockSummary = mockAttendanceData.classSummaries.find(
        (cs) =>
          cs.className === classItem.className ||
          cs.courseCode === classItem.courseCode
      );
      if (mockSummary) {
        setCourseAttendanceSummary(null); // để render fallback mock ở UI
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchClassSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const studentId = getStudentId();
      if (!studentId) {
        throw new Error("Student ID not found. Please log in again.");
      }

      // 1. Fetch meetings
      let meetings: ClassMeeting[] = [];
      try {
        meetings = await getClassMeetingsByClassId(classItem.id);
      } catch (meetingError) {
        console.warn("Error fetching meetings, using mock data:", meetingError);
        meetings = mockClassMeetings[classItem.id] || [];
      }

      const sortedMeetings = meetings.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // 2. Attendance summary
      let attendanceSummaryData = null;
      try {
        const attendanceReport =
          await attendanceService.getStudentAttendanceReport(studentId);
        attendanceSummaryData = attendanceReport.classSummaries.find(
          (cs: any) =>
            cs.className === classItem.className ||
            cs.courseCode === classItem.courseCode ||
            cs.classId === classItem.id
        );
        setAttendanceSummary(attendanceSummaryData);
      } catch (attendanceError) {
        console.warn(
          "Error fetching attendance report, using mock data:",
          attendanceError
        );
        attendanceSummaryData = mockAttendanceData.classSummaries.find(
          (cs) =>
            cs.className === classItem.className ||
            cs.courseCode === classItem.courseCode
        );
        setAttendanceSummary(attendanceSummaryData);
      }

      // 3. Assignments / course details
      const courseId =
        propCourseId || (classItem as any).courseId || classItem.courseCode;

      console.log("Assignment fetch debug:", {
        propCourseId,
        classItemCourseId: (classItem as any).courseId,
        classItemCourseCode: classItem.courseCode,
        finalCourseId: courseId,
        studentId,
      });

      let assignmentsByMeetingData: AssignmentByMeeting[] = [];

      if (courseId) {
        try {
          console.log(
            `Fetching course assignments for student ${studentId}, course ${courseId}`
          );
          const courseDetailsResponse = await getCourseDetails(
            studentId,
            courseId
          );
          console.log("Course details response:", courseDetailsResponse);
          assignmentsByMeetingData = courseDetailsResponse.assignments || [];
          setCourseDetailsData(courseDetailsResponse);

          assignmentsByMeetingData.sort((a, b) => {
            const dateA = new Date(a.meetingDate).getTime();
            const dateB = new Date(b.meetingDate).getTime();
            return dateA - dateB;
          });

          setAssignmentsByMeeting(assignmentsByMeetingData);

          const allAssignmentsFlat: AssignmentWithStatus[] = [];
          assignmentsByMeetingData.forEach((meetingGroup) => {
            meetingGroup.assignments.forEach((asm) => {
              allAssignmentsFlat.push({
                id: asm.assignmentId,
                classMeetingId: meetingGroup.meetingId,
                teacherId: "",
                title: asm.title,
                description: asm.description || null,
                fileUrl: null,
                dueDate: asm.dueAt,
                createdAt: asm.dueAt,
                submissionStatus: asm.submissionStatus,
                submittedAt: asm.submittedAt,
                submissions: asm.submittedAt
                  ? [
                      {
                        id: asm.assignmentId,
                        assignmentID: asm.assignmentId,
                        studentID: studentId,
                        storeUrl: null,
                        content: null,
                        score: asm.score,
                        feedback: asm.feedback,
                        createdAt:
                          asm.submittedAt || new Date().toISOString(),
                      },
                    ]
                  : [],
              });
            });
          });
          setAllAssignments(allAssignmentsFlat);
        } catch (courseAssignmentsError: any) {
          console.error(
            "Error fetching course assignments:",
            courseAssignmentsError
          );
          setAssignmentsByMeeting([]);
          setAllAssignments([]);
        }
      } else {
        console.warn("Course ID not available, skipping assignment fetch");
        setAssignmentsByMeeting([]);
        setAllAssignments([]);
      }

      // Map sessions
      const sessionsWithAssignments: SessionWithAssignments[] =
        await Promise.all(
          sortedMeetings.map(async (meeting, index) => {
            try {
              const meetingAssignments: AssignmentWithStatus[] = [];

              if (index === 0) {
                setSortedMeetingsList(sortedMeetings);
              }

              let coveredTopic: string | null = null;
              try {
                console.log(
                  `Fetching coveredTopic from API for Session ${index + 1} (${
                    meeting.id
                  })...`
                );
                const coveredTopicData = await getCoveredTopicByMeetingId(
                  meeting.id
                );
                coveredTopic = coveredTopicData?.topicTitle || null;
              } catch (apiError: any) {
                console.warn(
                  `Failed to fetch coveredTopic from API for Session ${
                    index + 1
                  }:`,
                  apiError
                );

                const attendanceRecord = attendanceSummaryData?.records?.find(
                  (record: any) =>
                    record.meeting.id === meeting.id ||
                    record.meetingId === meeting.id
                );
                coveredTopic = attendanceRecord?.meeting?.coveredTopic || null;

                if (!coveredTopic) {
                  const classTopics = mockSessionTopics[classItem.id];
                  if (classTopics && classTopics[index]) {
                    coveredTopic = classTopics[index];
                  }
                }
              }

              const now = new Date();
              const sessionDate = new Date(meeting.date);
              const hasAssignments = meetingAssignments.length > 0;
              const allAssignmentsCompleted =
                hasAssignments &&
                meetingAssignments.every((assignment) => {
                  const sub = assignment.submissions?.[0];
                  return sub && (sub.score !== null || sub.storeUrl);
                });
              const isCompleted = hasAssignments
                ? allAssignmentsCompleted
                : sessionDate < now;

              return {
                ...meeting,
                assignments: meetingAssignments,
                sessionNumber: index + 1,
                isCompleted,
                coveredTopic: coveredTopic || undefined,
              };
            } catch (err) {
              console.error(`Error processing session ${meeting.id}:`, err);
              return {
                ...meeting,
                assignments: [],
                sessionNumber: index + 1,
                isCompleted: new Date(meeting.date) < new Date(),
                coveredTopic: undefined,
              };
            }
          })
        );

      // Determine current session based on attendance
      let currentSessionIdx = -1;
      const attendanceRecords = attendanceSummaryData?.records || [];
      const courseAttendanceRecords =
        courseAttendanceSummary?.sessionRecords || [];

      const allAttendedSessions: Array<{
        meetingId: string;
        date: string;
        sessionIndex: number;
      }> = [];

      attendanceRecords.forEach((record: any) => {
        const meetingId = record.meetingId || record.meeting?.id;
        const status = record.status || record.attendanceStatus;
        if (status === "Present" && meetingId) {
          const sessionIndex = sessionsWithAssignments.findIndex(
            (s) => s.id === meetingId
          );
          if (sessionIndex >= 0) {
            const meetingDate =
              record.meeting?.startsAt ||
              record.meeting?.date ||
              sessionsWithAssignments[sessionIndex].date;
            allAttendedSessions.push({
              meetingId,
              date: meetingDate,
              sessionIndex,
            });
          }
        }
      });

      courseAttendanceRecords.forEach((record: any) => {
        if (record.status === "Present" && record.meetingId) {
          const sessionIndex = sessionsWithAssignments.findIndex(
            (s) => s.id === record.meetingId
          );
          if (
            sessionIndex >= 0 &&
            !allAttendedSessions.find((s) => s.meetingId === record.meetingId)
          ) {
            allAttendedSessions.push({
              meetingId: record.meetingId,
              date: record.meetingDate,
              sessionIndex,
            });
          }
        }
      });

      allAttendedSessions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      if (allAttendedSessions.length > 0) {
        const lastAttendedSession = allAttendedSessions[0];
        const lastAttendedIndex = lastAttendedSession.sessionIndex;

        const nextSessionIndex = sessionsWithAssignments.findIndex(
          (session, idx) => idx > lastAttendedIndex
        );

        if (nextSessionIndex >= 0) {
          currentSessionIdx = nextSessionIndex;
        } else {
          currentSessionIdx = lastAttendedIndex;
        }
      } else {
        currentSessionIdx = 0;
      }

      setCurrentSessionIndex(currentSessionIdx);
      setSessions(sessionsWithAssignments);

      computeMetrics(sessionsWithAssignments, filterMode);
    } catch (err) {
      console.error("Error fetching class sessions:", err);
      setError("Failed to load class details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      computeMetrics(sessions, filterMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode]);

  const computeMetrics = (
    allSessions: SessionWithAssignments[],
    mode: "4w" | "8s"
  ) => {
    let scoped = [...allSessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (mode === "4w") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 28);
      scoped = scoped.filter((s) => new Date(s.date) >= cutoff);
    } else {
      scoped = scoped.slice(-8);
    }

    const now = new Date();
    const allAssignments = scoped.flatMap((s) => s.assignments);
    const totalAssignments = allAssignments.length;
    const completed = allAssignments.filter((a) => {
      const sub = a.submissions?.[0];
      return !!(sub && (sub.score != null || sub.storeUrl));
    }).length;
    const overdue = allAssignments.filter((a) => {
      const due = new Date(a.dueDate);
      const sub = a.submissions?.[0];
      return due < now && !(sub && sub.storeUrl);
    }).length;
    const pending = Math.max(0, totalAssignments - completed - overdue);
    setCompletionRate(
      totalAssignments > 0 ? (completed / totalAssignments) * 100 : 0
    );
    setPendingCount(pending);
    setOverdueCount(overdue);

    const scorePoints = scoped
      .map((s) => {
        let score = -1;
        s.assignments.forEach((a) => {
          const sub = a.submissions?.[0];
          if (sub && sub.score != null) score = Math.max(score, sub.score);
        });
        return { date: s.date, score: score >= 0 ? score : 0 };
      })
      .map((p, idx) => ({ label: `W${idx + 1}`, score: p.score }));
    setWeeklyScores(scorePoints);

    const lowCompletion =
      totalAssignments > 0 && (completed / totalAssignments) * 100 < 70;
    const lowRecentScore =
      scorePoints.length > 0 && scorePoints[scorePoints.length - 1].score < 60;
    const scoreDrop2 = (() => {
      if (scorePoints.length < 3) return false;
      const n = scorePoints.length;
      return (
        scorePoints[n - 3].score > scorePoints[n - 2].score &&
        scorePoints[n - 2].score > scorePoints[n - 1].score
      );
    })();
    setWarningLevel(
      lowRecentScore && lowCompletion
        ? "high"
        : scoreDrop2 || lowRecentScore || lowCompletion
        ? "medium"
        : null
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // ====== UI HELPERS (sessions) =======

  const getSessionStatusIcon = (
    session: SessionWithAssignments,
    index: number
  ) => {
    if (index === currentSessionIndex) {
      return <PlayCircle className="w-5 h-5 text-primary-600" />;
    }
    if (session.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getSessionStatusLabel = (
    session: SessionWithAssignments,
    index: number
  ) => {
    if (index === currentSessionIndex) {
      return "Current Session";
    }
    if (session.isCompleted) {
      return "Completed";
    }
    return "Upcoming";
  };

  const getSessionStatusColor = (
    session: SessionWithAssignments,
    index: number
  ) => {
    if (index === currentSessionIndex) {
      return "bg-primary-50 border-primary-200";
    }
    if (session.isCompleted) {
      return "bg-green-50 border-green-200";
    }
    return "bg-gray-50 border-gray-200";
  };

  // ================== RENDER =====================
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        iconLeft={<ArrowLeft className="w-4 h-4" />}
        className="text-primary-600 hover:bg-primary-50"
      >
        Back to Course List
      </Button>

      {/* Content */}
      {loading && (
        <Card className="shadow-lg border border-accent-100">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-accent-600">Loading class details...</p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="shadow-lg border border-accent-100">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-error-100 to-error-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-error-600" />
            </div>
            <h3 className="text-xl font-bold text-primary-800 mb-3">
              Error Loading Details
            </h3>
            <p className="text-accent-600 mb-8 max-w-md mx-auto">{error}</p>
            <Button onClick={fetchClassSessions} variant="primary">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Class Information */}
          <Card className="p-6 border border-accent-100 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  {classItem.className}
                </h3>
                {classItem.description && (
                  <p className="text-accent-600 mb-3">
                    {classItem.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {classItem.instructor && (
                    <div className="flex items-center gap-2">
                      <span className="text-accent-500 font-medium">
                        Instructor:
                      </span>
                      <span className="text-accent-600">
                        {classItem.instructor}
                      </span>
                    </div>
                  )}
                  {classItem.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent-500" />
                      <span className="text-accent-600">
                        {formatDate(classItem.startDate)}{" "}
                        {classItem.endDate ? (
                          <>
                            {" "}
                            - {formatDate(classItem.endDate)}
                          </>
                        ) : null}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="border border-accent-100 shadow-lg">
            <Tabs
              tabs={[
                {
                  id: "timeline",
                  label: "Learning Timeline",
                  icon: <TrendingUp className="w-4 h-4" />,
                },
                {
                  id: "assignments",
                  label: "Assignments",
                  icon: <FileText className="w-4 h-4" />,
                },
                {
                  id: "attendance",
                  label: "Attendance Report",
                  icon: <ClipboardCheck className="w-4 h-4" />,
                },
                {
                  id: "weekly-feedback",
                  label: "Weekly feedback",
                  icon: <MessageCircle className="w-4 h-4" />,
                },
              ]}
              activeTab={activeTab}
              onTabChange={(tabId) => {
                setActiveTab(tabId);
              }}
            />

            {/* Learning Timeline Tab */}
            <TabContent activeTab={activeTab} tabId="timeline">
              <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 rounded-lg">
                {/* Learning Timeline - Split into 2 columns */}
                <div>
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                      <Clock className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                      <p className="text-accent-600">No sessions available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column: Session List */}
                      <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50/40">
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-base font-semibold text-primary-800">
                              Sessions
                            </h4>
                          </div>
                          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                            {sessions.map((session, index) => {
                              const sessionIndex = index;
                              const isCurrent =
                                sessionIndex === currentSessionIndex;

                              // Format date short (e.g., "01 Sep")
                              const formatShortDate = (dateString: string) => {
                                try {
                                  const date = new Date(dateString);
                                  return date.toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                  });
                                } catch {
                                  return formatDate(dateString);
                                }
                              };

                              const handleSessionClick = () => {
                                // Navigate to session detail page with Session Context tab
                                navigate(
                                  `/student/class/${classItem.id}/session/${session.id}?tab=context`
                                );
                              };

                              return (
                                <div
                                  key={session.id}
                                  onClick={handleSessionClick}
                                  className={`p-3 rounded-lg border transition-all duration-200 shadow-sm cursor-pointer ${
                                    isCurrent
                                      ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-400 border-2 hover:bg-blue-100 hover:border-blue-500 hover:shadow-md"
                                      : "bg-gradient-to-br from-white to-accent-50/30 border-accent-200 hover:bg-accent-25 hover:shadow"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      {isCurrent ? (
                                        <PlayCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                      ) : session.isCompleted ? (
                                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-semibold text-primary-800 text-sm">
                                            Session {session.sessionNumber}
                                          </h5>
                                          {isCurrent && (
                                            <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium shadow-sm">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-accent-600 text-xs mb-2">
                                          {session.coveredTopic ||
                                            "No topic available"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-accent-500">
                                          <Calendar className="w-3 h-3" />
                                          <span>
                                            {formatDate(session.date)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>

                      {/* Right Column: Milestone Timeline */}
                      <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50/40">
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-blue-200">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-base font-semibold text-primary-800">
                              Milestone Timeline
                            </h4>
                          </div>
                          <div className="relative">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-accent-200"></div>

                            {/* Timeline Items */}
                            <div className="space-y-3">
                              {/* Enrolled Event - First in timeline */}
                              {classItem.startDate &&
                                (() => {
                                  // Check if date matches today (example: 5/11/2025)
                                  const enrolledDate = new Date(
                                    classItem.startDate
                                  );
                                  const today = new Date();
                                  const targetDate = new Date("2025-11-05"); // Example: 5/11/2025

                                  // Normalize dates to compare only year, month, day
                                  const isToday =
                                    enrolledDate.getFullYear() ===
                                      today.getFullYear() &&
                                    enrolledDate.getMonth() ===
                                      today.getMonth() &&
                                    enrolledDate.getDate() ===
                                      today.getDate();

                                  const isTargetDate =
                                    enrolledDate.getFullYear() ===
                                      targetDate.getFullYear() &&
                                    enrolledDate.getMonth() ===
                                      targetDate.getMonth() &&
                                    enrolledDate.getDate() ===
                                      targetDate.getDate();

                                  const shouldGlow = isToday || isTargetDate;

                                  return (
                                    <div className="relative flex items-start gap-4">
                                      <div className="relative z-10 flex-shrink-0">
                                        <div
                                          className={`w-4 h-4 rounded-full bg-primary-300 border-2 border-primary-400 ${
                                            shouldGlow
                                              ? "ring-4 ring-primary-200 ring-opacity-75 shadow-lg animate-pulse"
                                              : ""
                                          }`}
                                        ></div>
                                      </div>
                                      <div className="flex-1 pt-0">
                                        <Card
                                          className={`p-2 border shadow-sm transition-all duration-200 ${
                                            shouldGlow
                                              ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-400 border-2 hover:bg-blue-100 hover:border-blue-500 hover:shadow-md"
                                              : "bg-gradient-to-br from-white to-accent-50/30 border-accent-200 hover:bg-accent-25 hover:shadow"
                                          }`}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-primary-800 text-sm mb-0.5">
                                                Enrolled
                                              </h5>
                                              <p className="text-accent-600 text-xs">
                                                Reservation confirmed -{" "}
                                                {classItem.className}
                                              </p>
                                            </div>
                                            <span className="text-accent-600 text-xs font-medium whitespace-nowrap ml-4">
                                              {formatDate(classItem.startDate)}
                                            </span>
                                          </div>
                                        </Card>
                                      </div>
                                    </div>
                                  );
                                })()}

                              {/* Milestone Sessions (First Attendance, Exams, Mock Tests) */}
                              {sessions.map((session, index) => {
                                const sessionIndex = index;
                                const isCurrent =
                                  sessionIndex === currentSessionIndex;

                                // Check if this is a milestone (First Attendance, Exam, Mock Test)
                                const isFirstAttendance = sessionIndex === 0;

                                // Check milestone based on coveredTopic.topicTitle instead of assignment.title
                                const checkIfMilestone = (
                                  topicTitle: string | null | undefined
                                ): boolean => {
                                  if (!topicTitle) {
                                    console.log(
                                      `🔍 Milestone check - Session ${session.sessionNumber}: No topicTitle`
                                    );
                                    return false;
                                  }
                                  const title = topicTitle.toLowerCase();
                                  const isMilestone =
                                    title.includes("exam") ||
                                    title.includes("mock") ||
                                    title.includes("test") ||
                                    title.includes("assessment");

                                  console.log(
                                    `🔍 Milestone check - Session ${session.sessionNumber}:`,
                                    {
                                      topicTitle,
                                      lowercased: title,
                                      isMilestone,
                                      containsExam: title.includes("exam"),
                                      containsMock: title.includes("mock"),
                                      containsTest: title.includes("test"),
                                      containsAssessment:
                                        title.includes("assessment"),
                                    }
                                  );

                                  return isMilestone;
                                };

                                const isMilestone = checkIfMilestone(
                                  session.coveredTopic
                                );

                                if (!isFirstAttendance && !isMilestone) {
                                  return null;
                                }

                                // Get session title
                                const getMilestoneTitle = () => {
                                  if (isFirstAttendance)
                                    return "First Attendance";
                                  // Use coveredTopic instead of assignment title
                                  return (
                                    session.coveredTopic ||
                                    `Session ${session.sessionNumber}`
                                  );
                                };

                                // Get session description
                                const getMilestoneDescription = () => {
                                  if (isFirstAttendance) {
                                    return "Attendance started - Materials assigned";
                                  }
                                  // For milestone sessions, show the coveredTopic as description
                                  if (session.coveredTopic) {
                                    // Try to find assignment score if available
                                    const milestoneAssignment =
                                      session.assignments.find((a) => {
                                        const sub = a.submissions?.[0];
                                        return sub && sub.score !== null;
                                      });
                                    if (milestoneAssignment) {
                                      const sub =
                                        milestoneAssignment.submissions?.[0];
                                      if (sub && sub.score !== null) {
                                        return `Score: ${sub.score}%${
                                          sub.feedback
                                            ? " - Feedback available"
                                            : ""
                                        }`;
                                      }
                                    }
                                    return "Important assessment";
                                  }
                                  return "Milestone session";
                                };

                                // Format date short (e.g., "01 Sep")
                                const formatShortDate = (
                                  dateString: string
                                ) => {
                                  try {
                                    const date = new Date(dateString);
                                    return date.toLocaleDateString("en-US", {
                                      day: "2-digit",
                                      month: "short",
                                    });
                                  } catch {
                                    return formatDate(dateString);
                                  }
                                };

                                // Check if session date matches today or target date (5/11/2025)
                                const sessionDate = new Date(session.date);
                                const today = new Date();
                                const targetDate = new Date("2025-11-05"); // Example: 5/11/2025

                                // Normalize dates to compare only year, month, day
                                const isToday =
                                  sessionDate.getFullYear() ===
                                    today.getFullYear() &&
                                  sessionDate.getMonth() ===
                                    today.getMonth() &&
                                  sessionDate.getDate() === today.getDate();

                                const isTargetDate =
                                  sessionDate.getFullYear() ===
                                    targetDate.getFullYear() &&
                                  sessionDate.getMonth() ===
                                    targetDate.getMonth() &&
                                  sessionDate.getDate() ===
                                    targetDate.getDate();

                                const shouldGlow = isToday || isTargetDate;

                                return (
                                  <div
                                    key={session.id}
                                    className="relative flex items-start gap-4"
                                  >
                                    {/* Timeline Node */}
                                    <div className="relative z-10 flex-shrink-0">
                                      <div
                                        className={`w-4 h-4 rounded-full bg-primary-300 border-2 border-primary-400 ${
                                          shouldGlow
                                            ? "ring-4 ring-primary-200 ring-opacity-75 shadow-lg animate-pulse"
                                            : ""
                                        }`}
                                      ></div>
                                    </div>

                                    {/* Timeline Content */}
                                    <div className="flex-1 pt-0">
                                      <Card
                                        className={`p-2 border shadow-sm transition-all duration-200 ${
                                          shouldGlow
                                            ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-400 border-2 hover:bg-blue-100 hover:border-blue-500 hover:shadow-md"
                                            : "bg-gradient-to-br from-white to-accent-50/30 border-accent-200 hover:bg-accent-25 hover:shadow"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-primary-800 text-sm mb-0.5">
                                              {getMilestoneTitle()}
                                            </h5>
                                            <p className="text-accent-600 text-xs">
                                              {getMilestoneDescription()}
                                            </p>
                                          </div>
                                          <span className="text-accent-600 text-xs font-medium whitespace-nowrap ml-4">
                                            {formatDate(session.date)}
                                          </span>
                                        </div>
                                      </Card>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabContent>

            {/* Assignments Tab */}
            <TabContent activeTab={activeTab} tabId="assignments">
              <div className="p-6 space-y-6">
                {/* Sessions with Assignments */}
                {assignmentsByMeeting.length > 0 ? (
                  <div className="space-y-4">
                    {assignmentsByMeeting.map((meetingGroup, index) => {
                      // Find corresponding session from meetings
                      const session = sortedMeetingsList.find(
                        (m) => m.id === meetingGroup.meetingId
                      );
                      const sessionNumber =
                        sortedMeetingsList.findIndex(
                          (m) => m.id === meetingGroup.meetingId
                        ) + 1;
                      const isCurrent =
                        sessionNumber === currentSessionIndex + 1;

                      const handleSessionClick = () => {
                        // Navigate to Assignment Submission page for this session with tab parameter
                        navigate(
                          `/student/class/${classItem.id}/session/${meetingGroup.meetingId}?tab=assignments`
                        );
                      };

                      return (
                        <div
                          onClick={handleSessionClick}
                          className="cursor-pointer"
                        >
                          <Card
                            key={meetingGroup.meetingId}
                            className={`p-5 border transition-all duration-200 ${
                              isCurrent
                                ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-400 border-2 shadow-lg hover:shadow-xl"
                                : "bg-gradient-to-br from-white to-accent-50/30 border-accent-200 shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div
                                  className={`p-2 rounded-lg ${
                                    isCurrent
                                      ? "bg-blue-500 text-white"
                                      : "bg-primary-100 text-primary-600"
                                  }`}
                                >
                                  <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-primary-800 text-lg">
                                      {session
                                        ? `Session ${sessionNumber}`
                                        : `Session ${index + 1}`}
                                    </h4>
                                    {isCurrent && (
                                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm animate-pulse">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-accent-600">
                                    <div className="flex items-center gap-1 font-medium">
                                      <Calendar className="w-4 h-4 text-primary-500" />
                                      <span>
                                        {formatDate(meetingGroup.meetingDate)}
                                      </span>
                                    </div>
                                    {meetingGroup.topic &&
                                      meetingGroup.topic !== "(No topic)" && (
                                        <span className="px-2 py-1 rounded-md bg-primary-100 text-primary-700 text-xs font-medium">
                                          {meetingGroup.topic}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Assignments for this session */}
                            {meetingGroup.assignments.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-accent-200">
                                <h5 className="text-sm font-semibold text-primary-700 mb-4 flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-gradient-to-br from-primary-500 to-primary-600">
                                    <FileText className="w-4 h-4 text-white" />
                                  </div>
                                  <span>
                                    Assignments (
                                    {meetingGroup.assignments.length})
                                  </span>
                                </h5>
                                <div className="space-y-3">
                                  {meetingGroup.assignments.map(
                                    (assignment) => {
                                      const submissionStatus =
                                        assignment.submissionStatus ||
                                        "PENDING";
                                      const hasScore =
                                        assignment.score !== null &&
                                        assignment.score !== undefined;
                                      const isSubmitted =
                                        submissionStatus === "SUBMITTED" ||
                                        submissionStatus === "GRADED" ||
                                        !!assignment.submittedAt;
                                      const isGraded =
                                        hasScore ||
                                        submissionStatus === "GRADED";

                                      // Determine status badge with better colors
                                      let statusBadge = {
                                        text: "Pending",
                                        className:
                                          "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200",
                                      };

                                      if (isGraded) {
                                        statusBadge = {
                                          text: "Graded",
                                          className:
                                            "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200",
                                        };
                                      } else if (isSubmitted) {
                                        statusBadge = {
                                          text: "Submitted",
                                          className:
                                            "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200",
                                        };
                                      }

                                      return (
                                        <div
                                          key={assignment.assignmentId}
                                          className="p-4 bg-white rounded-lg border border-accent-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-accent-50/20"
                                        >
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                              <h6 className="font-semibold text-primary-800 mb-2 text-base">
                                                {assignment.title}
                                              </h6>
                                              {assignment.description && (
                                                <p className="text-sm text-accent-600 mb-2 leading-relaxed">
                                                  {assignment.description}
                                                </p>
                                              )}
                                            </div>
                                            <div
                                              className={`px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm ${statusBadge.className}`}
                                            >
                                              {statusBadge.text}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-accent-600 flex-wrap">
                                            <div className="flex items-center gap-1.5 bg-accent-50 px-2 py-1 rounded-md">
                                              <Calendar className="w-4 h-4 text-primary-500" />
                                              <span className="font-medium">
                                                Due:{" "}
                                                {formatDate(assignment.dueAt)}
                                              </span>
                                            </div>
                                            {assignment.submittedAt && (
                                              <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md text-blue-700">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">
                                                  Submitted:{" "}
                                                  {formatDate(
                                                    assignment.submittedAt
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            {hasScore &&
                                              assignment.score !== null && (
                                                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md text-green-700">
                                                  <CheckCircle className="w-4 h-4" />
                                                  <span className="font-bold text-base">
                                                    Score: {assignment.score}
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                          {assignment.feedback && (
                                            <div className="mt-3 p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200 shadow-sm">
                                              <p className="text-xs font-semibold text-green-700 mb-1.5">
                                                Feedback
                                              </p>
                                              <p className="text-sm text-green-800 leading-relaxed">
                                                {assignment.feedback}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 text-sm text-accent-500 italic p-3 bg-accent-50 rounded-lg border border-accent-200">
                                No assignments for this session
                              </div>
                            )}
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                    <FileText className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                    <p className="text-accent-600">No assignments available</p>
                  </div>
                )}
              </div>
            </TabContent>

            {/* Attendance Report Tab */}
            <TabContent activeTab={activeTab} tabId="attendance">
              <div className="p-6">
                {attendanceLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-accent-600">
                        Loading attendance data...
                      </p>
                    </div>
                  </div>
                ) : (
                  (() => {
                    // Prefer API data; fallback to mock
                    const summary = courseAttendanceSummary;
                    const mockSummary =
                      mockAttendanceData.classSummaries.find(
                        (cs) =>
                          cs.className === classItem.className ||
                          cs.courseCode === classItem.courseCode
                      );

                    if (!summary && !mockSummary) {
                      return (
                        <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                          <ClipboardCheck className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                          <p className="text-accent-600">
                            No attendance data available
                          </p>
                        </div>
                      );
                    }

                    if (summary) {
                      return (
                        <div className="space-y-4">
                          <Card className="p-4 border border-accent-200">
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center p-3 bg-success-50 rounded-lg">
                                <p className="text-sm font-medium text-success-700">
                                  Present
                                </p>
                                <p className="text-2xl font-bold text-success-600">
                                  {summary.attended}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-error-50 rounded-lg">
                                <p className="text-sm font-medium text-error-700">
                                  Absent
                                </p>
                                <p className="text-2xl font-bold text-error-600">
                                  {summary.absent}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-primary-50 rounded-lg">
                                <p className="text-sm font-medium text-primary-700">
                                  Total
                                </p>
                                <p className="text-2xl font-bold text-primary-600">
                                  {summary.totalSessions}
                                </p>
                              </div>
                            </div>
                            {summary.isWarning && summary.warningMessage && (
                              <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                                <p className="text-sm font-medium text-warning-800">
                                  Warning
                                </p>
                                <p className="text-sm text-warning-700">
                                  {summary.warningMessage}
                                </p>
                              </div>
                            )}
                          </Card>

                          {sessions && sessions.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-md font-semibold text-primary-800">
                                Attendance Records
                              </h4>
                              <div className="space-y-2">
                                {sessions.map((session) => {
                                  const attendanceRecord =
                                    summary.sessionRecords?.find(
                                      (record) =>
                                        record.meetingId === session.id
                                    );

                                  const meetingDate = new Date(session.date);
                                  const dateStr =
                                    meetingDate.toLocaleDateString("en-US", {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    });

                                  const status =
                                    attendanceRecord?.status || "Not Marked";
                                  const present = status === "Present";
                                  const absent = status === "Absent";

                                  return (
                                    <Card
                                      key={session.id}
                                      className={`p-4 border ${
                                        present
                                          ? "bg-success-50 border-success-200"
                                          : absent
                                          ? "bg-error-50 border-error-200"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                          {present ? (
                                            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                                              <CheckCircle className="w-5 h-5 text-success-600" />
                                            </div>
                                          ) : absent ? (
                                            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                                              <AlertCircle className="w-5 h-5 text-error-600" />
                                            </div>
                                          ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                              <Clock className="w-5 h-5 text-gray-600" />
                                            </div>
                                          )}
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-semibold text-primary-800">
                                                Session {session.sessionNumber}
                                              </span>
                                              <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                  present
                                                    ? "bg-success-200 text-success-800"
                                                    : absent
                                                    ? "bg-error-200 text-error-800"
                                                    : "bg-gray-200 text-gray-800"
                                                }`}
                                              >
                                                {status}
                                              </span>
                                            </div>
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-accent-500" />
                                                <span className="font-medium text-primary-700">
                                                  {dateStr}
                                                </span>
                                              </div>
                                              {session.coveredTopic && (
                                                <div className="mt-2 flex items-center gap-2">
                                                  <span className="text-xs font-medium text-primary-700">
                                                    Topic:
                                                  </span>
                                                  <span className="text-sm text-primary-600 underline">
                                                    {session.coveredTopic}
                                                  </span>
                                                </div>
                                              )}
                                              {attendanceRecord?.notes && (
                                                <div className="mt-2 p-2 bg-accent-50 rounded border border-accent-200">
                                                  <p className="text-xs font-medium text-primary-700 mb-1">
                                                    Notes:
                                                  </p>
                                                  <p className="text-sm text-accent-600">
                                                    {attendanceRecord.notes}
                                                  </p>
                                                </div>
                                              )}
                                              {attendanceRecord?.checkedBy && (
                                                <div className="flex items-center gap-2 text-xs text-accent-500 mt-1">
                                                  <span>
                                                    Checked by:{" "}
                                                    {attendanceRecord.checkedBy}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                              <ClipboardCheck className="w-8 h-8 text-accent-400 mx-auto mb-2" />
                              <p className="text-sm text-accent-600">
                                No sessions available
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Fallback to mock data
                    return (
                      <div className="space-y-4">
                        <Card className="p-4 border border-accent-200">
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center p-3 bg-success-50 rounded-lg">
                              <p className="text-sm font-medium text-success-700">
                                Present
                              </p>
                              <p className="text-2xl font-bold text-success-600">
                                {mockSummary!.attendedSessions}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-error-50 rounded-lg">
                              <p className="text-sm font-medium text-error-700">
                                Absent
                              </p>
                              <p className="text-2xl font-bold text-error-600">
                                {mockSummary!.absentSessions}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-primary-50 rounded-lg">
                              <p className="text-sm font-medium text-primary-700">
                                Total
                              </p>
                              <p className="text-2xl font-bold text-primary-600">
                                {mockSummary!.totalSessions}
                              </p>
                            </div>
                          </div>
                        </Card>

                        {sessions && sessions.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-md font-semibold text-primary-800">
                              Attendance Records
                            </h4>
                            <div className="space-y-2">
                              {sessions.map((session) => {
                                const attendanceRecord =
                                  mockSummary!.records?.find(
                                    (record: AttendanceRecord) =>
                                      record.meeting.id === session.id ||
                                      record.meetingId === session.id
                                  );

                                const meetingDate = new Date(session.date);
                                const dateStr =
                                  meetingDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  });

                                const status =
                                  attendanceRecord?.attendanceStatus ||
                                  "Not Marked";
                                const present = status === "Present";
                                const absent = status === "Absent";

                                return (
                                  <Card
                                    key={session.id}
                                    className={`p-4 border ${
                                      present
                                        ? "bg-success-50 border-success-200"
                                        : absent
                                        ? "bg-error-50 border-error-200"
                                        : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3 flex-1">
                                        {present ? (
                                          <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-success-600" />
                                          </div>
                                        ) : absent ? (
                                          <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-error-600" />
                                          </div>
                                        ) : (
                                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-gray-600" />
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-primary-800">
                                              Session {session.sessionNumber}
                                            </span>
                                            <span
                                              className={`px-2 py-1 rounded text-xs font-medium ${
                                                present
                                                  ? "bg-success-200 text-success-800"
                                                  : absent
                                                  ? "bg-error-200 text-error-800"
                                                  : "bg-gray-200 text-gray-800"
                                              }`}
                                            >
                                              {status}
                                            </span>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                              <Calendar className="w-4 h-4 text-accent-500" />
                                              <span className="font-medium text-primary-700">
                                                {dateStr}
                                              </span>
                                            </div>
                                            {session.coveredTopic && (
                                              <div className="mt-2">
                                                <p className="text-xs font-medium text-primary-700 mb-1">
                                                  Topic:
                                                </p>
                                                <p className="text-sm text-accent-600">
                                                  {session.coveredTopic}
                                                </p>
                                              </div>
                                            )}
                                            {attendanceRecord?.notes && (
                                              <div className="mt-2 p-2 bg-accent-50 rounded border border-accent-200">
                                                <p className="text-xs font-medium text-primary-700 mb-1">
                                                  Notes:
                                                </p>
                                                <p className="text-sm text-accent-600">
                                                  {attendanceRecord.notes}
                                                </p>
                                              </div>
                                            )}
                                            {attendanceRecord?.checkedByName && (
                                              <div className="flex items-center gap-2 text-xs text-accent-500 mt-1">
                                                <span>
                                                  Checked by:{" "}
                                                  {
                                                    attendanceRecord.checkedByName
                                                  }
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                            <ClipboardCheck className="w-8 h-8 text-accent-400 mx-auto mb-2" />
                            <p className="text-sm text-accent-600">
                              No sessions available
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </TabContent>

            {/* -------- WEEKLY FEEDBACK TAB (ĐÃ CẬP NHẬT) -------- */}
            <TabContent activeTab={activeTab} tabId="weekly-feedback">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-white-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800">
                      Weekly feedback
                    </h3>
                    <p className="text-sm text-accent-600">
                      View teacher’s weekly feedback about your participation,
                      assignment quality and skill progress.
                    </p>
                  </div>
                </div>

                {weeklyFeedbackLoading && (
                  <Card className="p-6 border border-accent-100">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
                        <p className="text-accent-600">
                          Loading weekly feedback...
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {weeklyFeedbackError && !weeklyFeedbackLoading && (
                  <Card className="p-6 border border-error-200 bg-error-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-error-800 font-medium mb-2">
                          {weeklyFeedbackError}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={fetchWeeklyFeedback}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {!weeklyFeedbackLoading &&
                  !weeklyFeedbackError &&
                  weeklyFeedback.length === 0 && (
                    <Card className="p-6 border border-accent-100 bg-accent-25">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-accent-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-accent-700">
                            There is no weekly feedback recorded for this class
                            yet. Your teacher may add feedback after a few
                            sessions.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                {/* Có data: UI Accordion MỚI */}
                {!weeklyFeedbackLoading &&
                  weeklyFeedback.length > 0 &&
                  !weeklyFeedbackError && (
                    <div className="space-y-3">
                      {/* Group theo weekNumber */}
                      {Object.entries(
                        weeklyFeedback.reduce(
                          (
                            acc: Record<number, WeeklyFeedbackView[]>,
                            item
                          ) => {
                            if (!acc[item.weekNumber]) {
                              acc[item.weekNumber] = [];
                            }
                            acc[item.weekNumber].push(item);
                            return acc;
                          },
                          {}
                        )
                      )
                        .sort(
                          ([a], [b]) => Number(a) - Number(b) // sort theo tuần tăng dần
                        )
                        .map(([week, items]) => {
                          const weekNum = Number(week);
                          const isActive = activeWeek === weekNum;
                          const first = items[0]; // Tất cả item trong group này đều chung 1 tuần, status...

                          const statusLabel =
                            first.status === 2 ? "Submitted" : "Draft";
                          const statusColor =
                            first.status === 2
                              ? "bg-success-100 text-success-700 border-success-200"
                              : "bg-warning-100 text-warning-800 border-warning-200";

                          return (
                            <div
                              key={week}
                              // --- Thêm Ref để scroll ---
                              ref={(el) => { weekRefs.current[week] = el; }}
                              className={`rounded-lg border transition-all duration-300 ${
                                isActive
                                  ? "border-primary-400 shadow-lg bg-white" // Style khi active
                                  : "border-accent-200 bg-accent-25 hover:bg-white" // Style khi không active
                              }`}
                            >
                              {/* --- 1. Thanh Trigger (Luôn hiển thị) --- */}
                              <div
                                className="flex items-center justify-between p-4 cursor-pointer"
                                onClick={() =>
                                  setActiveWeek(isActive ? null : weekNum)
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                      isActive
                                        ? "bg-primary-100"
                                        : "bg-accent-100"
                                    }`}
                                  >
                                    <Calendar
                                      className={`w-5 h-5 ${
                                        isActive
                                          ? "text-primary-600"
                                          : "text-accent-600"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className={`text-sm font-semibold tracking-wide ${
                                        isActive
                                          ? "text-primary-700"
                                          : "text-primary-800"
                                      }`}
                                    >
                                      Week {week}
                                    </p>
                                    <p className="text-xs text-accent-600">
                                      {first.teacherName
                                        ? `Feedback from ${first.teacherName}`
                                        : "Weekly feedback summary"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor}`}
                                  >
                                    {statusLabel}
                                  </span>
                                  <ChevronDown
                                    className={`w-5 h-5 text-accent-500 transition-transform duration-200 ${
                                      isActive ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* --- 2. Nội dung chi tiết (Chỉ hiển thị khi Active) --- */}
                              {isActive && (
                                <div className="p-5 border-t border-accent-200 bg-white rounded-b-lg space-y-4">
                                  {/* Thông tin giáo viên/lớp học */}
                                  {(first.teacherName || first.className) && (
                                    <div className="flex items-center gap-3 text-xs text-accent-600">
                                      {first.teacherName && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent-50 border border-accent-200">
                                          <UserIcon className="w-3 h-3 text-accent-500" />
                                          <span>
                                            Teacher: {first.teacherName}
                                          </span>
                                        </span>
                                      )}
                                      {first.className && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent-50 border border-accent-200">
                                          <BookOpen className="w-3 h-3 text-accent-500" />
                                          <span>
                                            Class: {first.className}
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Map qua các feedback (thường chỉ 1) */}
                                  {items.map((fb) => (
                                    <div
                                      key={fb.id}
                                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                      {/* Left: participation + assignment */}
                                      <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-primary-50/60 border border-primary-100">
                                          <p className="text-xs font-semibold text-primary-700 mb-1">
                                            Participation & Engagement
                                          </p>
                                          <p className="text-sm text-primary-800 leading-relaxed whitespace-pre-line">
                                            {fb.participation}
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-accent-50/70 border border-accent-100">
                                          <p className="text-xs font-semibold text-primary-700 mb-1">
                                            Assignment / Homework Quality
                                          </p>
                                          <p className="text-sm text-primary-800 leading-relaxed whitespace-pre-line">
                                            {fb.assignmentQuality}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Right: skill + next step + note */}
                                      <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-success-50/70 border border-success-100">
                                          <p className="text-xs font-semibold text-success-700 mb-1">
                                            Skill Focus & Progress
                                          </p>
                                          <p className="text-sm text-success-900 leading-relaxed whitespace-pre-line">
                                            {fb.skillProgress}
                                          </p>
                                        </div>

                                        {fb.nextStep && (
                                          <div className="p-3 rounded-lg bg-warning-50/70 border border-warning-100">
                                            <p className="text-xs font-semibold text-warning-800 mb-1">
                                              Actionable Next Step
                                            </p>
                                            <p className="text-sm text-warning-900 leading-relaxed whitespace-pre-line">
                                              {fb.nextStep}
                                            </p>
                                          </div>
                                        )}

                                        {fb.customNote && (
                                          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                                            <p className="text-xs font-semibold text-neutral-700 mb-1">
                                              Teacher&apos;s note
                                            </p>
                                            <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
                                              {fb.customNote}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  <div className="mt-4 text-[11px] text-neutral-500 flex justify-between">
                                    <span>
                                      Last updated:{" "}
                                      {formatDate(
                                        first.updatedAt ??
                                          new Date().toISOString()
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
              </div>
            </TabContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClassDetailsView;