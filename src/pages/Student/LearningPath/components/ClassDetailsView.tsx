import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import { ArrowLeft, BookOpen, Calendar, FileText, CheckCircle, Clock, AlertCircle, PlayCircle, ClipboardCheck, TrendingUp } from "lucide-react";
import type { ClassMeeting } from "@/api/classMeetings.api";
import type { MeetingAssignment } from "@/services/teachingClassesService";
import type { MyClass } from "@/types/class";
import { mockClassMeetings, mockAssignmentsByMeeting, mockAttendanceData } from "@/pages/Student/LearningPath/data/mockLearningPathData";

// Mock topics for sessions (fallback if not in attendance data)
const mockSessionTopics: Record<string, string[]> = {
  "class-abe101-1": [
    "Business Communication Fundamentals",
    "Email Writing Skills",
    "Meeting and Presentation Skills",
    "Negotiation Techniques",
    "Cross-cultural Communication",
    "Professional Networking",
    "Report Writing",
    "Telephone Etiquette"
  ],
  "class-ielts201-1": [
    "Reading Comprehension Strategies",
    "Writing Task 1 - Academic",
    "Listening Practice",
    "Speaking Part 2",
    "Writing Task 2 - Essay",
    "Vocabulary Building",
    "Grammar Review",
    "Mock Test"
  ],
  "class-ecc101-1": [
    "Daily Conversations",
    "Shopping and Services",
    "Travel and Tourism",
    "Food and Dining",
    "Health and Fitness",
    "Hobbies and Interests",
    "Weather and Seasons",
    "Final Assessment"
  ]
};

interface ClassDetailsViewProps {
  classItem: MyClass;
  onBack: () => void;
}

interface SessionWithAssignments extends ClassMeeting {
  assignments: MeetingAssignment[];
  sessionNumber: number;
  isCompleted: boolean;
  coveredTopic?: string;
}

const ClassDetailsView: React.FC<ClassDetailsViewProps> = ({ 
  classItem,
  onBack
}) => {
  const [sessions, setSessions] = useState<SessionWithAssignments[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [weeklyScores, setWeeklyScores] = useState<{ label: string; score: number }[]>([]);
  const [warningLevel, setWarningLevel] = useState<"low" | "medium" | "high" | null>(null);
  const [filterMode, setFilterMode] = useState<"4w" | "8s">("8s");
  const [activeTab, setActiveTab] = useState<string>("timeline");

  useEffect(() => {
    if (classItem?.id) {
      fetchClassSessions();
    }
  }, [classItem?.id]);

  const fetchClassSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let meetings: ClassMeeting[] = mockClassMeetings[classItem.id] || [];
      
      const sortedMeetings = meetings.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // Get attendance summary for this class to extract coveredTopic
      const attendanceSummary = mockAttendanceData.classSummaries.find(
        cs => cs.className === classItem.className || cs.courseCode === classItem.courseCode
      );

      const sessionsWithAssignments: SessionWithAssignments[] = await Promise.all(
        sortedMeetings.map(async (meeting, index) => {
          try {
            const assignments: MeetingAssignment[] = mockAssignmentsByMeeting[meeting.id] || [];
            
            // Find coveredTopic from attendance records
            const attendanceRecord = attendanceSummary?.records?.find(
              record => record.meeting.id === meeting.id || record.meetingId === meeting.id
            );
            let coveredTopic = attendanceRecord?.meeting?.coveredTopic || null;
            
            // Fallback to mock topics if not found in attendance
            if (!coveredTopic) {
              const classTopics = mockSessionTopics[classItem.id];
              if (classTopics && classTopics[index]) {
                coveredTopic = classTopics[index];
              }
            }
            
            const now = new Date();
            const sessionDate = new Date(meeting.date);
            const hasAssignments = assignments.length > 0;
            const allAssignmentsCompleted = hasAssignments && assignments.every(assignment => {
              const submission = assignment.submissions?.[0];
              return submission && (submission.score !== null || submission.storeUrl);
            });
            const isCompleted = hasAssignments ? allAssignmentsCompleted : sessionDate < now;

            return {
              ...meeting,
              assignments,
              sessionNumber: index + 1,
              isCompleted,
              coveredTopic: coveredTopic || undefined
            };
          } catch (err) {
            console.error(`Error fetching assignments for session ${meeting.id}:`, err);
            return {
              ...meeting,
              assignments: [],
              sessionNumber: index + 1,
              isCompleted: new Date(meeting.date) < new Date(),
              coveredTopic: undefined
            };
          }
        })
      );

      const firstIncompleteIndex = sessionsWithAssignments.findIndex(session => !session.isCompleted);
      setCurrentSessionIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : sessionsWithAssignments.length - 1);

      setSessions(sessionsWithAssignments);

      computeMetrics(sessionsWithAssignments, filterMode);
    } catch (err) {
      console.error('Error fetching class sessions:', err);
      setError('Failed to load class details. Please try again.');
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

  const computeMetrics = (allSessions: SessionWithAssignments[], mode: "4w" | "8s") => {
    let scoped = [...allSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (mode === "4w") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 28);
      scoped = scoped.filter(s => new Date(s.date) >= cutoff);
    } else {
      scoped = scoped.slice(-8);
    }

    const now = new Date();
    const allAssignments = scoped.flatMap(s => s.assignments);
    const totalAssignments = allAssignments.length;
    const completed = allAssignments.filter(a => {
      const sub = a.submissions?.[0];
      return !!(sub && (sub.score != null || sub.storeUrl));
    }).length;
    const overdue = allAssignments.filter(a => {
      const due = new Date(a.dueDate);
      const sub = a.submissions?.[0];
      return due < now && !(sub && sub.storeUrl);
    }).length;
    const pending = Math.max(0, totalAssignments - completed - overdue);
    setCompletionRate(totalAssignments > 0 ? (completed / totalAssignments) * 100 : 0);
    setPendingCount(pending);
    setOverdueCount(overdue);

    const scorePoints = scoped.map(s => {
      let score = -1;
      s.assignments.forEach(a => {
        const sub = a.submissions?.[0];
        if (sub && sub.score != null) score = Math.max(score, sub.score);
      });
      return { date: s.date, score: score >= 0 ? score : 0 };
    }).map((p, idx) => ({ label: `W${idx + 1}`, score: p.score }));
    setWeeklyScores(scorePoints);

    const lowCompletion = (totalAssignments > 0) && ((completed / totalAssignments) * 100 < 70);
    const lowRecentScore = scorePoints.length > 0 && scorePoints[scorePoints.length - 1].score < 60;
    const scoreDrop2 = (() => {
      if (scorePoints.length < 3) return false;
      const n = scorePoints.length;
      return scorePoints[n - 3].score > scorePoints[n - 2].score && scorePoints[n - 2].score > scorePoints[n - 1].score;
    })();
    setWarningLevel(lowRecentScore && lowCompletion ? "high" : (scoreDrop2 || lowRecentScore || lowCompletion) ? "medium" : null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSessionStatusIcon = (session: SessionWithAssignments, index: number) => {
    if (index === currentSessionIndex) {
      return <PlayCircle className="w-5 h-5 text-primary-600" />;
    }
    if (session.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getSessionStatusLabel = (session: SessionWithAssignments, index: number) => {
    if (index === currentSessionIndex) {
      return 'Current Session';
    }
    if (session.isCompleted) {
      return 'Completed';
    }
    return 'Upcoming';
  };

  const getSessionStatusColor = (session: SessionWithAssignments, index: number) => {
    if (index === currentSessionIndex) {
      return 'bg-primary-50 border-primary-200';
    }
    if (session.isCompleted) {
      return 'bg-green-50 border-green-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

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
            <h3 className="text-xl font-bold text-primary-800 mb-3">Error Loading Details</h3>
            <p className="text-accent-600 mb-8 max-w-md mx-auto">{error}</p>
            <Button 
              onClick={fetchClassSessions} 
              variant="primary"
            >
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
                  <p className="text-accent-600 mb-3">{classItem.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {classItem.instructor && (
                    <div className="flex items-center gap-2">
                      <span className="text-accent-500 font-medium">Instructor:</span>
                      <span className="text-accent-600">{classItem.instructor}</span>
                    </div>
                  )}
                  {classItem.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent-500" />
                      <span className="text-accent-600">
                        {formatDate(classItem.startDate)} - {classItem.endDate ? formatDate(classItem.endDate) : ''}
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
                  icon: <TrendingUp className="w-4 h-4" />
                },
                {
                  id: "assignments",
                  label: "Assignments",
                  icon: <FileText className="w-4 h-4" />
                },
                {
                  id: "attendance",
                  label: "Attendance Report",
                  icon: <ClipboardCheck className="w-4 h-4" />
                }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Learning Timeline Tab */}
            <TabContent activeTab={activeTab} tabId="timeline">
              <div className="p-6 space-y-6">
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
                      <Card className="border border-accent-200 shadow-sm bg-white">
                        <div className="p-6">
                          <h4 className="text-base font-semibold text-primary-800 mb-4">Sessions</h4>
                          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                            {sessions.map((session, index) => {
                              const sessionIndex = index;
                              const isCurrent = sessionIndex === currentSessionIndex;
                              
                              // Format date short (e.g., "01 Sep")
                              const formatShortDate = (dateString: string) => {
                                try {
                                  const date = new Date(dateString);
                                  return date.toLocaleDateString('en-US', {
                                    day: '2-digit',
                                    month: 'short'
                                  });
                                } catch {
                                  return formatDate(dateString);
                                }
                              };

                              return (
                                <div 
                                  key={session.id} 
                                  className={`p-3 rounded-lg border transition-colors ${
                                    isCurrent 
                                      ? 'bg-white border-blue-300 border-2 hover:bg-blue-50 hover:border-blue-400' 
                                      : 'bg-white border-accent-200 hover:bg-accent-25'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      {isCurrent ? (
                                        <PlayCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
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
                                            <span className="px-2 py-0.5 bg-blue-400 text-white rounded text-xs font-medium">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-accent-600 text-xs mb-2">
                                          {session.coveredTopic || 'No topic available'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-accent-500">
                                          <Calendar className="w-3 h-3" />
                                          <span>{formatDate(session.date)}</span>
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
                      <Card className="border border-accent-200 shadow-sm bg-white">
                        <div className="p-6">
                          <h4 className="text-base font-semibold text-primary-800 mb-6">Milestone Timeline</h4>
                          <div className="relative">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-accent-200"></div>
                            
                            {/* Timeline Items */}
                            <div className="space-y-3">
                              {/* Enrolled Event - First in timeline */}
                              {classItem.startDate && (() => {
                                // Check if date matches today (example: 5/11/2025)
                                const enrolledDate = new Date(classItem.startDate);
                                const today = new Date();
                                const targetDate = new Date('2025-11-05'); // Example: 5/11/2025
                                
                                // Normalize dates to compare only year, month, day
                                const isToday = enrolledDate.getFullYear() === today.getFullYear() &&
                                               enrolledDate.getMonth() === today.getMonth() &&
                                               enrolledDate.getDate() === today.getDate();
                                
                                const isTargetDate = enrolledDate.getFullYear() === targetDate.getFullYear() &&
                                                     enrolledDate.getMonth() === targetDate.getMonth() &&
                                                     enrolledDate.getDate() === targetDate.getDate();
                                
                                const shouldGlow = isToday || isTargetDate;

                                return (
                                  <div className="relative flex items-start gap-4">
                                    <div className="relative z-10 flex-shrink-0">
                                      <div className={`w-4 h-4 rounded-full bg-primary-300 border-2 border-primary-400 ${
                                        shouldGlow ? 'ring-4 ring-primary-200 ring-opacity-75 shadow-lg animate-pulse' : ''
                                      }`}>
                                      </div>
                                    </div>
                                    <div className="flex-1 pt-0">
                                      <Card className={`p-2 border shadow-sm transition-colors ${
                                        shouldGlow 
                                          ? 'border-blue-300 hover:bg-blue-50 hover:border-blue-400' 
                                          : 'border-accent-200 hover:bg-accent-25'
                                      }`}>
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-primary-800 text-sm mb-0.5">
                                              Enrolled
                                            </h5>
                                            <p className="text-accent-600 text-xs">
                                              Reservation confirmed - {classItem.className}
                                            </p>
                                          </div>
                                          <span className="text-accent-600 text-xs font-medium whitespace-nowrap ml-4">
                                            {(() => {
                                              try {
                                                const date = new Date(classItem.startDate);
                                                return date.toLocaleDateString('en-US', {
                                                  day: '2-digit',
                                                  month: 'short'
                                                });
                                              } catch {
                                                return formatDate(classItem.startDate);
                                              }
                                            })()}
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
                                const isCurrent = sessionIndex === currentSessionIndex;
                                
                                // Check if this is a milestone (First Attendance, Exam, Mock Test)
                                const isFirstAttendance = sessionIndex === 0;
                                const isMilestone = session.assignments.some(a => {
                                  const title = a.title.toLowerCase();
                                  return title.includes('exam') || title.includes('mock') || title.includes('test') || title.includes('assessment');
                                });

                                if (!isFirstAttendance && !isMilestone) {
                                  return null;
                                }

                                // Get session title
                                const getMilestoneTitle = () => {
                                  if (isFirstAttendance) return 'First Attendance';
                                  const milestoneAssignment = session.assignments.find(a => {
                                    const title = a.title.toLowerCase();
                                    return title.includes('exam') || title.includes('mock') || title.includes('test') || title.includes('assessment');
                                  });
                                  return milestoneAssignment ? milestoneAssignment.title : `Session ${session.sessionNumber}`;
                                };

                                // Get session description
                                const getMilestoneDescription = () => {
                                  if (isFirstAttendance) {
                                    return 'Attendance started - Materials assigned';
                                  }
                                  const milestoneAssignment = session.assignments.find(a => {
                                    const title = a.title.toLowerCase();
                                    return title.includes('exam') || title.includes('mock') || title.includes('test') || title.includes('assessment');
                                  });
                                  if (milestoneAssignment) {
                                    const sub = milestoneAssignment.submissions?.[0];
                                    if (sub && sub.score !== null) {
                                      return `Score: ${sub.score}%${sub.feedback ? ' - Feedback available' : ''}`;
                                    }
                                    return milestoneAssignment.description || 'Important assessment';
                                  }
                                  return 'Milestone session';
                                };

                                // Format date short (e.g., "01 Sep")
                                const formatShortDate = (dateString: string) => {
                                  try {
                                    const date = new Date(dateString);
                                    return date.toLocaleDateString('en-US', {
                                      day: '2-digit',
                                      month: 'short'
                                    });
                                  } catch {
                                    return formatDate(dateString);
                                  }
                                };

                                // Check if session date matches today or target date (5/11/2025)
                                const sessionDate = new Date(session.date);
                                const today = new Date();
                                const targetDate = new Date('2025-11-05'); // Example: 5/11/2025
                                
                                // Normalize dates to compare only year, month, day
                                const isToday = sessionDate.getFullYear() === today.getFullYear() &&
                                               sessionDate.getMonth() === today.getMonth() &&
                                               sessionDate.getDate() === today.getDate();
                                
                                const isTargetDate = sessionDate.getFullYear() === targetDate.getFullYear() &&
                                                     sessionDate.getMonth() === targetDate.getMonth() &&
                                                     sessionDate.getDate() === targetDate.getDate();
                                
                                const shouldGlow = isToday || isTargetDate;

                                return (
                                  <div key={session.id} className="relative flex items-start gap-4">
                                    {/* Timeline Node */}
                                    <div className="relative z-10 flex-shrink-0">
                                      <div className={`w-4 h-4 rounded-full bg-primary-300 border-2 border-primary-400 ${
                                        shouldGlow ? 'ring-4 ring-primary-200 ring-opacity-75 shadow-lg animate-pulse' : ''
                                      }`}>
                                      </div>
                                    </div>

                                    {/* Timeline Content */}
                                    <div className="flex-1 pt-0">
                                      <Card className={`p-2 border shadow-sm transition-colors ${
                                        shouldGlow 
                                          ? 'border-blue-300 hover:bg-blue-50 hover:border-blue-400' 
                                          : 'border-accent-200 hover:bg-accent-25'
                                      }`}>
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
                                            {formatShortDate(session.date)}
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
                {/* Learning Performance for this class */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-primary-800">Học lực & Tiến độ</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      className={`px-3 py-1 rounded border ${filterMode === '4w' ? 'bg-primary-100 border-primary-300 text-primary-800' : 'bg-white border-accent-300 text-accent-700'}`}
                      onClick={() => setFilterMode('4w')}
                    >
                      4 tuần gần nhất
                    </button>
                    <button
                      className={`px-3 py-1 rounded border ${filterMode === '8s' ? 'bg-primary-100 border-primary-300 text-primary-800' : 'bg-white border-accent-300 text-accent-700'}`}
                      onClick={() => setFilterMode('8s')}
                    >
                      8 buổi gần nhất
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Weekly Scores */}
                  <Card className="p-4 border border-accent-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-primary-800">Điểm theo tuần</div>
                      <span className="text-xs text-accent-600">out of 100</span>
                    </div>
                    <div className="h-28 flex items-end gap-2">
                      {weeklyScores.map((w) => (
                        <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-primary-200 rounded-t-md" style={{ height: `${Math.max(4, w.score)}%` }} />
                          <span className="text-[10px] text-accent-600">{w.label}</span>
                        </div>
                      ))}
                    </div>
                    {weeklyScores.length > 0 && (
                      <div className="mt-2 text-xs text-accent-600">
                        Tuần gần nhất: <span className="font-medium text-primary-700">{weeklyScores[weeklyScores.length-1].score}</span>
                      </div>
                    )}
                  </Card>

                  {/* Completion */}
                  <Card className="p-4 border border-accent-200">
                    <div className="text-sm font-semibold text-primary-800 mb-3">Tỷ lệ hoàn thành bài tập</div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-accent-700">Hoàn thành</span>
                      <span className="font-semibold text-primary-700">{Math.round(completionRate)}%</span>
                    </div>
                    <div className="h-3 w-full bg-accent-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500" style={{ width: `${completionRate}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                      <div className="p-2 rounded border border-accent-200 bg-accent-25">
                        <div className="text-accent-600">Đang chờ</div>
                        <div className="font-semibold text-primary-700">{pendingCount}</div>
                      </div>
                      <div className="p-2 rounded border border-accent-200 bg-accent-25">
                        <div className="text-accent-600">Trễ hạn</div>
                        <div className="font-semibold text-error-600">{overdueCount}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Early Warning */}
                  <Card className="p-4 border border-accent-200">
                    <div className="text-sm font-semibold text-primary-800 mb-3">Cảnh báo sớm</div>
                    {!warningLevel ? (
                      <div className="text-sm text-success-700">Không có rủi ro đáng chú ý. Tiếp tục duy trì tiến độ!</div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className={`px-2 py-1 inline-block rounded text-xs font-medium ${warningLevel === 'high' ? 'bg-error-100 text-error-700' : 'bg-warning-100 text-warning-800'}`}>
                          Mức độ: {warningLevel === 'high' ? 'Cao' : 'Trung bình'}
                        </div>
                        <ul className="list-disc pl-5 text-accent-700">
                          {(() => {
                            const items: string[] = [];
                            if (weeklyScores.length >= 3) {
                              const n = weeklyScores.length;
                              if (weeklyScores[n-3].score > weeklyScores[n-2].score && weeklyScores[n-2].score > weeklyScores[n-1].score) items.push('Điểm tuần giảm liên tiếp');
                            }
                            if (completionRate < 70) items.push('Tỷ lệ hoàn thành bài tập thấp (< 70%)');
                            if (weeklyScores.length && weeklyScores[weeklyScores.length-1].score < 60) items.push('Điểm tuần gần nhất dưới 60');
                            return items.map((t, i) => <li key={i}>{t}</li>);
                          })()}
                        </ul>
                        <div className="text-xs text-accent-600">Đề xuất: hoàn thành bài tập còn lại, xem lại nội dung tuần gần đây.</div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                      <FileText className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                      <p className="text-accent-600">No sessions available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map((session, index) => {
                        const isCurrent = index === currentSessionIndex;
                        return (
                        <Card 
                          key={session.id} 
                          className={`p-4 border transition-colors ${
                            isCurrent 
                              ? 'bg-white border-blue-300 border-2 hover:bg-blue-50 hover:border-blue-400' 
                              : getSessionStatusColor(session, index) + ' hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {getSessionStatusIcon(session, index)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-primary-800">
                                    Session {session.sessionNumber}
                                  </h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    index === currentSessionIndex
                                      ? 'bg-blue-400 text-white'
                                      : session.isCompleted
                                      ? 'bg-green-200 text-green-800'
                                      : 'bg-gray-200 text-gray-800'
                                  }`}>
                                    {getSessionStatusLabel(session, index)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-accent-600 mb-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(session.date)}</span>
                                  {session.isStudy && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                      Study Day
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Assignments in this session */}
                          {session.assignments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-accent-200">
                              <h5 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Assignments ({session.assignments.length})
                              </h5>
                              <div className="space-y-3">
                                {session.assignments.map((assignment) => {
                                  const submission = assignment.submissions?.[0];
                                  const hasSubmission = !!(submission && submission.storeUrl);
                                  const hasScore = submission?.score !== null && submission?.score !== undefined;
                                  
                                  return (
                                    <div 
                                      key={assignment.id}
                                      className="p-3 bg-white rounded-lg border border-accent-100 hover:bg-accent-25 transition-colors"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h6 className="font-medium text-primary-800 mb-1">
                                            {assignment.title}
                                          </h6>
                                          {assignment.description && (
                                            <p className="text-xs text-accent-600 mb-2">
                                              {assignment.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                          hasScore
                                            ? 'bg-green-100 text-green-800'
                                            : hasSubmission
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {hasScore ? 'Graded' : hasSubmission ? 'Submitted' : 'Pending'}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-accent-600">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>Due: {formatDate(assignment.dueDate)}</span>
                                        </div>
                                        {hasScore && (
                                          <div className="flex items-center gap-1 text-green-700">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Score: {submission.score}%</span>
                                          </div>
                                        )}
                                      </div>
                                      {submission?.feedback && (
                                        <div className="mt-2 p-2 bg-accent-25 rounded border border-accent-200">
                                          <p className="text-[11px] font-medium text-primary-700 mb-1">Feedback</p>
                                          <p className="text-xs text-accent-700">{submission.feedback}</p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {session.assignments.length === 0 && (
                            <div className="mt-3 text-sm text-accent-500 italic">
                              No assignments for this session
                            </div>
                          )}
                        </Card>
                      );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabContent>

            {/* Attendance Report Tab */}
            <TabContent activeTab={activeTab} tabId="attendance">
              <div className="p-6">
                {(() => {
                  const summary = mockAttendanceData.classSummaries.find(cs => cs.className === classItem.className || cs.courseCode === classItem.courseCode);
                  if (!summary) {
                    return (
                      <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                        <ClipboardCheck className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                        <p className="text-accent-600">No attendance data available</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <Card className="p-4 border border-accent-200">
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center p-3 bg-success-50 rounded-lg">
                            <p className="text-sm font-medium text-success-700">Present</p>
                            <p className="text-2xl font-bold text-success-600">{summary.attendedSessions}</p>
                          </div>
                          <div className="text-center p-3 bg-error-50 rounded-lg">
                            <p className="text-sm font-medium text-error-700">Absent</p>
                            <p className="text-2xl font-bold text-error-600">{summary.absentSessions}</p>
                          </div>
                          <div className="text-center p-3 bg-primary-50 rounded-lg">
                            <p className="text-sm font-medium text-primary-700">Total</p>
                            <p className="text-2xl font-bold text-primary-600">{summary.totalSessions}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-accent-200">
                          <span className="text-sm font-medium text-neutral-700">Attendance Rate</span>
                          <span className="text-lg font-bold text-primary-600">
                            {summary.attendanceRate?.toFixed?.(1) ?? summary.attendanceRate}%
                          </span>
                        </div>
                      </Card>

                      {/* Detailed Attendance Records */}
                      {summary.records && summary.records.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-md font-semibold text-primary-800">Attendance Records</h4>
                          <div className="space-y-2">
                            {summary.records.map((record) => {
                              const meetingDate = new Date(record.meeting.startsAt);
                              const dateStr = meetingDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                              const timeStr = `${meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(record.meeting.endsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
                              const present = record.attendanceStatus === 'Present';
                              return (
                                <Card 
                                  key={record.id} 
                                  className={`p-4 border ${
                                    present 
                                      ? 'bg-success-50 border-success-200' 
                                      : 'bg-error-50 border-error-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      {present ? (
                                        <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                                          <CheckCircle className="w-5 h-5 text-success-600" />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                                          <AlertCircle className="w-5 h-5 text-error-600" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            present
                                              ? 'bg-success-200 text-success-800'
                                              : 'bg-error-200 text-error-800'
                                          }`}>
                                            {record.attendanceStatus}
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-accent-500" />
                                            <span className="font-medium text-primary-700">{dateStr}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-accent-500" />
                                            <span className="text-accent-600">{timeStr}</span>
                                          </div>
                                          {record.meeting.roomName && (
                                            <div className="flex items-center gap-2 text-sm text-accent-600">
                                              <span>Room: {record.meeting.roomName}</span>
                                            </div>
                                          )}
                                          {record.meeting.coveredTopic && (
                                            <div className="mt-2">
                                              <p className="text-xs font-medium text-primary-700 mb-1">Covered Topic:</p>
                                              <p className="text-sm text-accent-600">{record.meeting.coveredTopic}</p>
                                            </div>
                                          )}
                                          {record.notes && (
                                            <div className="mt-2 p-2 bg-accent-50 rounded border border-accent-200">
                                              <p className="text-xs font-medium text-primary-700 mb-1">Notes:</p>
                                              <p className="text-sm text-accent-600">{record.notes}</p>
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
                          <p className="text-sm text-accent-600">No detailed attendance records available</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </TabContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClassDetailsView;

