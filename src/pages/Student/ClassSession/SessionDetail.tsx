import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Breadcrumbs, { type Crumb } from "@/components/ui/Breadcrumbs";
import Loader from "@/components/ui/Loader";
import { 
  Calendar,
  Clock,
  CheckCircle,
  Play,
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
import { api } from "@/api";
import type { ClassDetail } from "@/types/class";
import type { LearningMaterial } from "@/types/learningMaterial";
import { config } from "@/lib/config";

export default function SessionDetail() {
  const { classId, sessionId } = useParams<{ classId: string; sessionId: string }>();
  const [activeTab, setActiveTab] = useState("context");
  const [context, setContext] = useState<CoveredTopic | null>(null);
  const [assignments, setAssignments] = useState<MeetingAssignment[] | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [meeting, setMeeting] = useState<ClassMeeting | null>(null);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [sessionNumber, setSessionNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingContext, setLoadingContext] = useState<boolean>(true);
  const [loadingAssignments, setLoadingAssignments] = useState<boolean>(true);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorContext, setErrorContext] = useState<string | null>(null);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [errorMaterials, setErrorMaterials] = useState<string | null>(null);
  const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);

  // Helper to parse objectives string from API to string[]
  const parseObjectives = (raw?: string | null): string[] => {
    if (!raw) return [];
    const trimmed = raw.trim();
    try {
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      }
    } catch {}
    return trimmed
      .split(/\r?\n|;|•|,/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  // Fetch class details and meeting info
  useEffect(() => {
    const loadClassAndMeetingDetails = async () => {
      if (!classId || !sessionId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class details
        const classResponse = await api.getClassDetailsById(classId);
        setClassDetail(classResponse.data);
        
        // Fetch all meetings to find the current one and its session number
        const meetingsResponse = await getClassMeetingsByClassId(classId);
        const meetings = Array.isArray(meetingsResponse) ? meetingsResponse : [];
        
        if (meetings.length > 0) {
          const meetingIndex = meetings.findIndex(m => m.id === sessionId);
          const foundMeeting = meetings.find(m => m.id === sessionId);
          
          if (foundMeeting) {
            setMeeting(foundMeeting);
            // Use passcode if available, otherwise use session number
            const sessionNum = foundMeeting.passcode || `Session ${meetingIndex + 1}`;
            setSessionNumber(sessionNum);
          }
        }
      } catch (err) {
        console.error('Error fetching class/meeting details:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    loadClassAndMeetingDetails();
  }, [classId, sessionId]);

  // Load Session Context via API
  useEffect(() => {
    let mounted = true;
    async function loadContext() {
      if (!sessionId) { setErrorContext("Missing sessionId"); setLoadingContext(false); return; }
      try {
        const rawData = await getCoveredTopicByMeetingId(sessionId);
        // Parse objectives from string to array
        const parsedContext = {
          ...rawData,
          objectives: parseObjectives((rawData as any)?.objectives)
        };
        if (mounted) setContext(parsedContext as CoveredTopic);
      } catch (e: any) {
        if (mounted) setErrorContext(e?.message || "Failed to load session context");
      } finally {
        if (mounted) setLoadingContext(false);
      }
    }
    loadContext();
    return () => { mounted = false; };
  }, [sessionId]);

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

  // Load Materials via API
  useEffect(() => {
    let mounted = true;
    async function loadMaterials() {
      if (!sessionId) { 
        setErrorMaterials("Missing sessionId"); 
        setLoadingMaterials(false); 
        return; 
      }
      
      try {
        const response = await api.getLearningMaterialsByClassMeeting(sessionId);
        const materialsData = response.data || [];
        if (mounted) setMaterials(materialsData);
      } catch (e: any) {
        if (mounted) setErrorMaterials(e?.message || "Failed to load materials");
      } finally {
        if (mounted) setLoadingMaterials(false);
      }
    }
    loadMaterials();
    return () => { mounted = false; };
  }, [sessionId]);
  
  const handleDownloadFile = async (material: LearningMaterial) => {
    if (!material.storeUrl) {
      alert('File URL is not available.');
      return;
    }

    try {
      // Construct full URL using storage base URL
      const fullUrl = material.storeUrl.startsWith('http') 
        ? material.storeUrl 
        : `${config.storagePublicUrl}${material.storeUrl.startsWith('/') ? material.storeUrl : '/' + material.storeUrl}`;
      
      // Fetch the file as a blob to bypass CORS restrictions
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = material.fileName || material.title || 'download';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const tabs = [
    { id: "context", label: "Session Context" },
    { id: "materials", label: "Course Materials" },
    { id: "homework", label: "Homework/Quiz" },
    { id: "assignments", label: "Assignment Submission" }
  ];

  // Breadcrumbs - using real data when available
  const crumbs: Crumb[] = classDetail
    ? [
        { label: "My Classes", to: "/student/my-class" },
        { label: classDetail.courseName, to: `/student/class/${classId}` },
        { label: sessionNumber || "Session" },
      ]
    : [
        { label: "My Classes", to: "/student/my-class" },
        { label: "Loading..." },
      ];

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </StudentLayout>
    );
  }

  if (error || !classDetail || !sessionId) {
    return (
      <StudentLayout>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            {error || 'Session not found'}
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={crumbs} />

        {/* Session Header */}
        <div className="flex items-center justify-between p-6 border border-accent-200 rounded-xl bg-white">
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
                {sessionNumber || classDetail.courseName}
              </h1>
              <p className="text-accent-600 text-lg">{context?.topicTitle ?? ''}</p>
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

        {/* Tabs + Card */}
        <Card className="shadow-lg border border-accent-100 bg-white">
          <div className="bg-white p-1 rounded-lg">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId)}
            />
            <div className="mt-4 p-4 min-h-[400px]">
              {/* Session Context Tab */}
              <div className={activeTab === "context" ? "block" : "hidden"}>
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
                    <div className="p-4 bg-gradient-to-br from-secondary-200 to-secondary-300 border border-primary-200 rounded-xl">
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
                    {(!context.objectives || !Array.isArray(context.objectives) || context.objectives.length === 0) ? (
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
              </div>

              {/* Course Materials Tab */}
              <div className={activeTab === "materials" ? "block" : "hidden"}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-800">Course Materials</h3>
              {loadingMaterials && (
                <div className="text-sm text-neutral-600">Loading materials...</div>
              )}
              {errorMaterials && !loadingMaterials && (
                <div className="text-sm text-danger-600">{errorMaterials}</div>
              )}
              {!loadingMaterials && !errorMaterials && materials.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No materials available</h3>
                  <p className="text-neutral-600">Course materials will be uploaded by your instructor.</p>
                </div>
              )}
              {!loadingMaterials && !errorMaterials && materials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-4 border border-accent-200 rounded-lg bg-white hover:bg-accent-25 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-800">{material.title}</h4>
                      <p className="text-sm text-accent-600 font-medium">
                        Uploaded on {formatDate(material.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownloadFile(material)}
                      iconLeft={<Download className="w-4 h-4" />}
                      className="bg-accent-500 hover:bg-accent-600"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
              </div>

              {/* Homework/Quiz Tab */}
              <div className={activeTab === "homework" ? "block" : "hidden"}>
            <div className="text-center py-16 border border-info-200 bg-info-25 rounded-lg">
              <div className="w-20 h-20 bg-info-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-info-800 mb-3">Homework/Quiz</h3>
              <p className="text-info-600 font-medium">Coming soon...</p>
            </div>
              </div>

              {/* Assignment Submission Tab */}
              <div className={activeTab === "assignments" ? "block" : "hidden"}>
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
              </div>
            </div>
          </div>
        </Card>
      </div>
  );
}