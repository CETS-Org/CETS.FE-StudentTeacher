import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import { 
  Calendar,
  Clock,
  CheckCircle,
  Play,
  ArrowLeft,
  FileText,
  Download,
  Upload,
  BookOpen,
  ExternalLink,
  Target,
  CheckSquare
} from "lucide-react";
import { getCoveredTopicByMeetingId, getAssignmentsByMeetingAndStudent, getClassMeetingsByClassId, type CoveredTopic, type MeetingAssignment, type ClassMeeting } from "@/services/teachingClassesService";
import { getStudentId } from "@/lib/utils";

// Session interface
interface CourseSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration: string;
  isCompleted: boolean;
  submissionTasks: SubmissionTask[];
  // Session Context fields
  topicTitle: string;
  totalSlots: number;
  required: boolean;
  objectives: string[];
  contentSummary: string;
  preReadingUrl?: string;
}

interface SubmissionTask {
  id: string;
  title: string;
  sessionId: string;
  isSubmitted: boolean;
}

interface CourseMaterial {
  id: string;
  title: string;
  fileName: string;
  uploadDate: string;
  size?: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "late" | "submitted" | "graded" | "locked";
  score?: string;
  submittedFile?: {
    name: string;
    size: string;
  };
  instructorRemarks?: string;
  availableDate?: string;
}

interface CourseDetail {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  nextClass: string;
  progress: number;
  status: "Registered" | "In Progress" | "Completed";
  sessions: CourseSession[];
  materials: CourseMaterial[];
  assignments: Assignment[];
}

// Mock data (kept for header fallback but tabs will use API)
const mockCourseDetail: CourseDetail = {
  id: "1",
  title: "English For Beginner",
  instructor: "Sarah Johnson",
  duration: "12 weeks", 
  nextClass: "Jan 28, 2025",
  progress: 95,
  status: "Registered",
  materials: [
    {
      id: "material1",
      title: "English for Beginners.pdf",
      fileName: "English for Beginners.pdf",
      uploadDate: "Jan 30, 2025",
      size: "2.4 MB"
    },
    {
      id: "material2", 
      title: "Grammar Basics.pdf",
      fileName: "Grammar Basics.pdf",
      uploadDate: "Jan 30, 2025",
      size: "1.8 MB"
    }
  ],
  assignments: [
    {
      id: "assignment1",
      title: "Assignment First Term - Unit 1, 2, 3",
      dueDate: "Jan 29, 2025",
      status: "graded",
      score: "95/100",
      submittedFile: {
        name: "project_v2.pdf",
        size: "2.4 MB"
      },
      instructorRemarks: "Good work on the responsive design! The JavaScript functionality is well implemented."
    },
    {
      id: "assignment2",
      title: "Assignment First Term - Unit 4, 5, 6", 
      dueDate: "Jan 30, 2025",
      status: "pending"
    }
  ],
  sessions: [
    {
      id: "session1",
      title: "Session 1",
      topic: "Greetings and Introduction",
      date: "09-30 23/08/2025 - 11:45 23/08/2025",
      duration: "1h 45m",
      isCompleted: true,
      submissionTasks: [
        {
          id: "task1-1",
          title: "Submit: exercise 1 session 1",
          sessionId: "session1",
          isSubmitted: true
        },
        {
          id: "task1-2", 
          title: "Submit: exercise 2 session 1",
          sessionId: "session1",
          isSubmitted: true
        }
      ],
      topicTitle: "Basic Greetings and Self-Introduction",
      totalSlots: 2, // 2 slots = 90 minutes
      required: true,
      objectives: [
        "Learn basic greeting phrases in English",
        "Practice introducing yourself and others",
        "Understand cultural differences in greetings",
        "Build confidence in speaking English"
      ],
      contentSummary: "This session covers fundamental English greetings, including formal and informal ways to say hello, goodbye, and introduce yourself. Students will practice pronunciation and learn about cultural context.",
      preReadingUrl: "https://example.com/greetings-reading"
    },
    {
      id: "session2",
      title: "Session 2",
      topic: "Numbers and Time",
      date: "09-30 25/08/2025 - 11:45 25/08/2025",
      duration: "1h 45m",
      isCompleted: false,
      submissionTasks: [
        {
          id: "task2-1",
          title: "Submit: exercise 1 session 2", 
          sessionId: "session2",
          isSubmitted: false
        }
      ],
      topicTitle: "Numbers, Time, and Daily Schedules",
      totalSlots: 2, // 2 slots = 90 minutes
      required: true,
      objectives: [
        "Master numbers 1-100 in English",
        "Learn to tell time in different formats",
        "Practice describing daily routines",
        "Understand time-related vocabulary"
      ],
      contentSummary: "Students will learn cardinal and ordinal numbers, how to tell time using both 12-hour and 24-hour formats, and vocabulary related to daily schedules and routines.",
      preReadingUrl: "https://example.com/numbers-time-reading"
    },
    {
      id: "session3",
      title: "Session 3",
      topic: "Family and Relationships",
      date: "09-30 27/08/2025 - 11:45 27/08/2025",
      duration: "1h 45m",
      isCompleted: false,
      submissionTasks: [],
      topicTitle: "Family Members and Relationships",
      totalSlots: 2, // 2 slots = 90 minutes
      required: true,
      objectives: [
        "Learn family member vocabulary",
        "Practice describing family relationships",
        "Understand possessive forms",
        "Discuss family traditions and customs"
      ],
      contentSummary: "This session introduces vocabulary for family members, teaches possessive forms (my, your, his, her), and provides practice in describing family relationships and traditions.",
      preReadingUrl: "https://example.com/family-reading"
    }
  ]
};

export default function SessionDetail() {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("context");
  const [context, setContext] = useState<CoveredTopic | null>(null);
  const [assignments, setAssignments] = useState<MeetingAssignment[] | null>(null);
  const [meeting, setMeeting] = useState<ClassMeeting | null>(null);
  const [loadingContext, setLoadingContext] = useState<boolean>(true);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(true);
  const [loadingMeeting, setLoadingMeeting] = useState<boolean>(true);
  const [errorContext, setErrorContext] = useState<string | null>(null);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [errorMeeting, setErrorMeeting] = useState<string | null>(null);
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);
  
  // In real app, fetch course header; for now, only use meeting/context for header
  const course = mockCourseDetail;

  // Load Session Context and Assignments via API
  useEffect(() => {
    let mounted = true;
    async function loadContext() {
      if (!sessionId) { setErrorContext("Missing sessionId"); setLoadingContext(false); return; }
      try {
        const data = await getCoveredTopicByMeetingId(sessionId);
        if (mounted) setContext(data);
      } catch (e: any) {
        if (mounted) setErrorContext(e?.message || "Failed to load session context");
      } finally {
        if (mounted) setLoadingContext(false);
      }
    }
    loadContext();
    return () => { mounted = false; };
  }, [sessionId]);

  // Load Meeting by classId then match sessionId
  useEffect(() => {
    let mounted = true;
    async function loadMeeting() {
      if (!classId || !sessionId) { setErrorMeeting("Missing classId/sessionId"); setLoadingMeeting(false); return; }
      try {
        const list = await getClassMeetingsByClassId(classId);
        const found = list.find(m => m.id === sessionId);
        if (mounted) setMeeting(found ?? null);
      } catch (e: any) {
        if (mounted) setErrorMeeting(e?.message || "Failed to load meeting");
      } finally {
        if (mounted) setLoadingMeeting(false);
      }
    }
    loadMeeting();
    return () => { mounted = false; };
  }, [classId, sessionId]);

  useEffect(() => {
    let mounted = true;
    async function loadAssignments() {
      if (!sessionId) { setErrorAssignments("Missing sessionId"); setLoadingAssignments(false); return; }
      
      // Get student ID from authentication
      const studentId = getStudentId();
      if (!studentId) { 
        setErrorAssignments("User not authenticated. Please login again."); 
        setLoadingAssignments(false); 
        return; 
      }
      
      try {
        const data = await getAssignmentsByMeetingAndStudent(sessionId, studentId);
        if (mounted) setAssignments(data);
      } catch (e: any) {
        if (mounted) setErrorAssignments(e?.message || "Failed to load assignments");
      } finally {
        if (mounted) setLoadingAssignments(false);
      }
    }
    loadAssignments();
    return () => { mounted = false; };
  }, [sessionId]);
  
  if (!sessionId) {
    return (
      <StudentLayout>
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Session Not Found</h2>
            <p className="text-neutral-600 mb-6">The requested session could not be found.</p>
            <Button onClick={() => navigate(`/student/class/${classId}`)}>
              Back to Sessions
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const handleDownload = (material: CourseMaterial) => {
    console.log(`Downloading ${material.fileName}`);
  };

  const goBack = () => {
    navigate(`/student/class/${classId}`);
  }

  const tabs = [
    { id: "context", label: "Session Context", badge: null, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "materials", label: "Course Materials", badge: course.materials.length, color: "bg-gradient-to-r from-accent-500 to-accent-600 text-white" },
    { id: "homework", label: "Homework/Quiz", badge: null, color: "bg-gradient-to-r from-info-500 to-info-600 text-white" },
    { id: "assignments", label: "Assignment Submission", badge: assignments?.length ?? 0, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" }
  ];

  return (
    <StudentLayout>
      <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">All session</span>
          </button>
          <span className="text-neutral-400">›</span>
          <span className="text-sm text-neutral-900 font-medium">{meeting?.passcode ?? context?.topicTitle ?? "Session"}</span>
        </div>

        {/* Session Header */}
        {loadingMeeting && (
          <div className="mb-4 text-sm text-neutral-600">Loading session header...</div>
        )}
        {errorMeeting && !loadingMeeting && (
          <div className="mb-4 text-sm text-danger-600">{errorMeeting}</div>
        )}
        <div className="flex items-center justify-between mb-8 p-6 border border-accent-200 rounded-xl bg-white">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
              meeting && meeting.isActive === false ? 'bg-success-500' : 'bg-accent-500'
            }`}>
              {meeting && meeting.isActive === false ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-800 mb-2">
                {meeting?.passcode ?? `Session`}
              </h1>
              <p className="text-accent-600 text-lg">{context?.topicTitle ?? ''}</p>
              {/* <p className="text-neutral-500 mt-1">{context?.topicTitle ?? ''}</p> */}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-accent-100 px-3 py-2 rounded-lg mb-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-primary-700">{meeting?.date && meeting?.date !== '0001-01-01' ? meeting.date : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-100 px-3 py-2 rounded-lg w-fit ml-auto">
              <Clock className="w-4 h-4 text-neutral-600" />
              <span className="font-medium text-neutral-700">{context?.totalSlots ? `${context.totalSlots} minutes` : ''}</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Card className="mb-8 border border-accent-200 bg-white shadow-lg">
          <Tabs
            tabs={tabs.map(tab => ({
              ...tab,
              badge: tab.badge === null ? undefined : tab.badge
            }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <TabContent activeTab={activeTab} tabId="context">
            <div className="space-y-6">
              {loadingContext && (
                <div className="text-sm text-neutral-600">Loading session context...</div>
              )}
              {errorContext && !loadingContext && (
                <div className="text-sm text-danger-600">{errorContext}</div>
              )}
              {!loadingContext && !errorContext && context && (
                <>
                  {/* Session Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-primary-800">Topic Title</h4>
                      </div>
                      <p className="text-primary-700 font-medium">{context.topicTitle}</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-accent-800">Duration</h4>
                      </div>
                      <p className="text-accent-700 font-medium">{context.totalSlots} minutes</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-warning-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-warning-800">Required</h4>
                      </div>
                      <p className="text-warning-700 font-medium">{context.required ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 border border-success-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-success-800">Learning Objectives</h3>
                    </div>
                    {(!context.objectives || context.objectives.length === 0) ? (
                      <div className="text-success-700">No objectives provided.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {context.objectives.map((objective, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-white border border-success-200 rounded-lg shadow-sm">
                            <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <p className="text-success-800 font-medium">{objective}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Content Summary */}
                  <div className="p-6 bg-gradient-to-br from-info-50 to-info-100 border border-info-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-info-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-info-800">Content Summary</h3>
                    </div>
                    <div className="p-4 bg-white border border-info-200 rounded-lg">
                      <p className="text-info-700 leading-relaxed text-base">{context.contentSummary || '—'}</p>
                    </div>
                  </div>
                  
                  {/* Pre-Reading Material */}
                  {context.preReadingUrl && (
                    <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-neutral-600 rounded-xl flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-800">Pre-Reading Material</h3>
                      </div>
                      <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                        <a 
                          href={context.preReadingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 text-primary-600 hover:text-primary-800 font-semibold text-lg transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Access Pre-Reading Material
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="materials">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-800">Course Materials</h3>
              {course.materials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-4 border border-accent-200 rounded-lg bg-white hover:bg-accent-25 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-800">{material.title}</h4>
                      <p className="text-sm text-accent-600 font-medium">{material.uploadDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {material.size && (
                      <span className="text-sm font-medium text-primary-600 bg-neutral-200 px-3 py-1 rounded-full">{material.size}</span>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(material)}
                      iconLeft={<Download className="w-4 h-4" />}
                      className="bg-accent-500 hover:bg-accent-600"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
              {course.materials.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No materials available</h3>
                  <p className="text-neutral-600">Course materials will be uploaded by your instructor.</p>
                </div>
              )}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="homework">
            <div className="text-center py-16 border border-info-200 bg-info-25 rounded-lg">
              <div className="w-20 h-20 bg-info-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-info-800 mb-3">Homework/Quiz</h3>
              <p className="text-info-600 font-medium">Coming soon...</p>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="assignments">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-800">Assignment Submission</h3>
              {loadingAssignments && (
                <div className="text-sm text-neutral-600">Loading assignments...</div>
              )}
              {errorAssignments && !loadingAssignments && (
                <div className="text-sm text-danger-600">{errorAssignments}</div>
              )}
              {!loadingAssignments && !errorAssignments && (assignments?.length ?? 0) === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No assignments available</h3>
                  <p className="text-neutral-600">Assignments will be posted by your instructor.</p>
                </div>
              )}
              {assignments?.map((assignment) => {
                const submission = assignment.submissions?.[0];
                const status = submission?.score != null ? "graded" : submission ? "submitted" : "pending";
                return (
                  <div key={assignment.id} className="p-4 border border-accent-200 rounded-lg bg-white hover:bg-accent-25 transition-colors">
                    <button
                      className="w-full text-left"
                      onClick={() => setOpenAssignmentId(openAssignmentId === assignment.id ? null : assignment.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-primary-800 mb-2">
                            {assignment.title}
                          </h4>
                          <div className="flex items-center gap-2 bg-accent-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium text-primary-700">Due: {assignment.dueDate}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          status === "graded" ? "bg-success-500 text-white" :
                          status === "submitted" ? "bg-accent-500 text-white" :
                          status === "pending" ? "bg-warning-500 text-white" :
                          "bg-neutral-400 text-white"
                        }`}>
                          {status === "graded" ? "Graded" :
                           status === "submitted" ? "Submitted" :
                           status === "pending" ? "Pending" : status}
                        </span>
                      </div>
                    </button>

                    {openAssignmentId === assignment.id && (
                      <div className="mt-4">
                        {/* Score Display */}
                        {submission?.score != null && (
                          <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-success-600" />
                              <span className="text-lg font-bold text-success-700">Score: {submission.score}</span>
                            </div>
                          </div>
                        )}

                        {/* Submitted File */}
                        {/* {submission?.storeUrl ? ( */}
                          <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-accent-600" />
                              <div>
                                <a className="text-sm font-semibold text-accent-800 underline" href={submission.storeUrl ?? ""} target="_blank" rel="noreferrer">
                                  Submitted file
                                </a>
                                {submission.createdAt && (
                                  <p className="text-xs text-accent-600">Submitted at: {submission.createdAt}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        {/* ) : (
                          <div className="mb-4 text-sm text-neutral-600">No submission yet.</div>
                        )} */}

                        {/* Instructor Feedback */}
                        {submission?.feedback && (
                          <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg">
                            <h5 className="text-sm font-semibold text-info-800 mb-2">Instructor Feedback:</h5>
                            <p className="text-sm text-info-700 leading-relaxed">{submission.feedback}</p>
                          </div>
                        )}

                        {/* Action Button */}
                        {status === "pending" && (
                          <div className="flex justify-end">
                            <Button 
                              variant="primary"
                              className="bg-warning-500 hover:bg-warning-600"
                              iconLeft={<Upload className="w-4 h-4" />}
                            >
                              Submit Assignment
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabContent>
        </Card>
      </div>
    </StudentLayout>
  );
}