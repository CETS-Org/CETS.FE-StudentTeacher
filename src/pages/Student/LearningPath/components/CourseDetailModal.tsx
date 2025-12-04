import React, { useState, useEffect } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import { X, BookOpen, User, Calendar, FileText, CheckCircle, Clock, AlertCircle, ClipboardCheck, MapPin } from "lucide-react";
import type { CourseDetailResponse, Assignment } from "@/types/academicResults";
import type { ClassAttendanceSummary } from "@/types/attendance";
import { getCourseDetails } from "@/api/academicResults.api";
import { getUserInfo } from "@/lib/utils";

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  attendanceData?: ClassAttendanceSummary;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  courseId,
  attendanceData
}) => {
  const [courseDetails, setCourseDetails] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("assignments");

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseDetails();
    }
  }, [isOpen, courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = getUserInfo();
      const studentId = userInfo?.id;
      
      if (!studentId) {
        throw new Error('Student ID not found');
      }
      
      const details = await getCourseDetails(studentId, courseId);
      setCourseDetails(details);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
      case 'completed':
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
      case 'late':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
      case 'completed':
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
      case 'late':
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const tabs = [
    {
      id: "assignments",
      label: "Assignments",
      badge: courseDetails?.assignments.length || 0,
      color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white",
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: "attendance",
      label: "Attendance Report",
      badge: attendanceData ? 1 : 0,
      color: "bg-gradient-to-r from-success-500 to-success-600 text-white",
      icon: <ClipboardCheck className="w-4 h-4" />
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-accent-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-800">Course Details</h2>
                {courseDetails && (
                  <p className="text-sm text-accent-600">{courseDetails.courseCode} - {courseDetails.courseName}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-primary-100 rounded-full"
            >
              <X className="w-5 h-5 text-primary-600" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-accent-600">Loading course details...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-error-100 to-error-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-error-600" />
                </div>
                <h3 className="text-xl font-bold text-primary-800 mb-3">Error Loading Details</h3>
                <p className="text-accent-600 mb-8 max-w-md mx-auto">{error}</p>
                <Button 
                  onClick={fetchCourseDetails} 
                  variant="primary"
                >
                  Try Again
                </Button>
              </div>
            )}

            {courseDetails && !loading && (
              <div className="space-y-6">
                {/* Course Information */}
                <Card className="p-6 border border-accent-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary-800 mb-2">
                        {courseDetails.courseCode} - {courseDetails.courseName}
                      </h3>
                      {courseDetails.description && (
                        <p className="text-accent-600 mb-3">{courseDetails.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-accent-500" />
                        <span className="text-sm text-accent-600">
                          Instructor: {courseDetails.teacherNames.join(', ')}
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(courseDetails.statusCode)}`}>
                        {getStatusIcon(courseDetails.statusCode)}
                        {courseDetails.statusName}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tabs */}
                <Card className="border border-accent-100">
                  <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />

                  {/* Assignments Tab */}
                  <TabContent activeTab={activeTab} tabId="assignments">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-primary-800 mb-4">Assignments</h3>
                      {courseDetails.assignments.length === 0 ? (
                        <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                          <FileText className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                          <p className="text-accent-600">No assignments available</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {courseDetails.assignments.flatMap(meeting =>
                            meeting.assignments.map((assignment) => (
                              <Card key={assignment.assignmentId} className="p-4 border border-accent-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-primary-800 mb-1">
                                      {assignment.title}
                                    </h4>
                                    {assignment.description && (
                                      <p className="text-sm text-accent-600 mb-2">
                                        {assignment.description}
                                      </p>
                                    )}
                                    <p className="text-xs text-accent-500">
                                      Meeting: {meeting.topic} ({formatDate(meeting.meetingDate)})
                                    </p>
                                  </div>
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment.submissionStatus)}`}>
                                    {getStatusIcon(assignment.submissionStatus)}
                                    {assignment.submissionStatus}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent-500" />
                                    <div>
                                      <p className="font-medium text-primary-700">Due Date</p>
                                      <p className="text-accent-600">{formatDate(assignment.dueAt)}</p>
                                    </div>
                                  </div>

                                  {assignment.submittedAt && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-accent-500" />
                                      <div>
                                        <p className="font-medium text-primary-700">Submitted</p>
                                        <p className="text-accent-600">{formatDate(assignment.submittedAt)}</p>
                                      </div>
                                    </div>
                                  )}

                                  {assignment.score !== null && assignment.score !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-accent-500" />
                                      <div>
                                        <p className="font-medium text-primary-700">Score</p>
                                        <p className="text-accent-600">{assignment.score}%</p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {assignment.feedback && (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                                    <p className="text-sm font-medium text-primary-700 mb-1">Feedback</p>
                                    <p className="text-sm text-accent-600">{assignment.feedback}</p>
                                  </div>
                                )}
                              </Card>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </TabContent>

                  {/* Attendance Tab */}
                  <TabContent activeTab={activeTab} tabId="attendance">
                    <div className="p-6 space-y-6">
                      <h3 className="text-lg font-semibold text-primary-800 mb-4">Attendance Report</h3>
                      {attendanceData ? (
                        <>
                          {/* Summary Stats */}
                          <Card className="p-4 border border-accent-100">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-success-50 rounded-lg">
                                <p className="text-sm font-medium text-success-700">Present</p>
                                <p className="text-2xl font-bold text-success-600">{attendanceData.attendedSessions}</p>
                              </div>
                              <div className="text-center p-3 bg-error-50 rounded-lg">
                                <p className="text-sm font-medium text-error-700">Absent</p>
                                <p className="text-2xl font-bold text-error-600">{attendanceData.absentSessions}</p>
                              </div>
                              <div className="text-center p-3 bg-primary-50 rounded-lg">
                                <p className="text-sm font-medium text-primary-700">Total</p>
                                <p className="text-2xl font-bold text-primary-600">{attendanceData.totalSessions}</p>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-accent-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-700">Attendance Rate</span>
                                <span className="text-lg font-bold text-primary-600">
                                  {attendanceData.attendanceRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </Card>

                          {/* Detailed Attendance Records */}
                          {attendanceData.records && attendanceData.records.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-md font-semibold text-primary-800">Session Records</h4>
                              <div className="space-y-3">
                                {attendanceData.records.map((record) => {
                                  const meetingDate = new Date(record.meeting.startsAt);
                                  const formatDate = (date: Date) => {
                                    return date.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    });
                                  };
                                  const formatTime = (date: Date) => {
                                    return date.toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    });
                                  };

                                  return (
                                    <Card
                                      key={record.id}
                                      className={`p-4 border ${
                                        record.attendanceStatus === 'Present'
                                          ? 'bg-success-50 border-success-200'
                                          : 'bg-error-50 border-error-200'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                          {record.attendanceStatus === 'Present' ? (
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
                                                record.attendanceStatus === 'Present'
                                                  ? 'bg-success-200 text-success-800'
                                                  : 'bg-error-200 text-error-800'
                                              }`}>
                                                {record.attendanceStatus}
                                              </span>
                                            </div>
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-accent-500" />
                                                <span className="font-medium text-primary-700">
                                                  {formatDate(meetingDate)}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-accent-500" />
                                                <span className="text-accent-600">
                                                  {formatTime(new Date(record.meeting.startsAt))} - {formatTime(new Date(record.meeting.endsAt))}
                                                </span>
                                              </div>
                                              {record.meeting.roomName && (
                                                <div className="flex items-center gap-2 text-sm">
                                                  <MapPin className="w-4 h-4 text-accent-500" />
                                                  <span className="text-accent-600">{record.meeting.roomName}</span>
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
                        </>
                      ) : (
                        <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                          <ClipboardCheck className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                          <p className="text-accent-600">No attendance data available</p>
                        </div>
                      )}
                    </div>
                  </TabContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default CourseDetailModal;

