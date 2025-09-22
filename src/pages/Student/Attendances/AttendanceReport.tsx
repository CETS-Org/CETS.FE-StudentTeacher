import React, { useState, useMemo } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Tabs, { TabContent } from "@/components/ui/Tabs";
import Pagination from "@/Shared/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Filter,
  BarChart3,
  BookOpen,
  Target,
  X,
  Clock,
  MapPin
} from "lucide-react";

import type { 
  StudentAttendanceReport, 
  ClassAttendanceSummary, 
  AttendanceRecord
} from "@/types/attendance";

// Mock data for demonstration
const mockAttendanceReport: StudentAttendanceReport = {
  studentId: "student-1",
  studentName: "John Doe",
  reportPeriod: {
    startDate: "2024-01-15",
    endDate: "2024-04-15"
  },
  overallStats: {
    totalClasses: 4,
    totalSessions: 48,
    totalAttended: 42,
    totalAbsent: 6,
    overallAttendanceRate: 87.5
  },
  classSummaries: [
    {
      classId: "1",
      className: "Advanced Business English - Class A1",
      courseCode: "ABE101",
      courseName: "Advanced Business English",
      instructor: "Sarah Johnson",
      totalSessions: 18,
      attendedSessions: 16,
      absentSessions: 2,
      attendanceRate: 88.9,
      records: [
        {
          id: "att-1",
          meetingId: "meeting-1",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-15T19:00:00Z",
          meeting: {
            id: "meeting-1",
            startsAt: "2024-02-15T19:00:00Z",
            endsAt: "2024-02-15T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Business Communication Fundamentals"
          }
        },
        {
          id: "att-2",
          meetingId: "meeting-2",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-17T19:00:00Z",
          meeting: {
            id: "meeting-2",
            startsAt: "2024-02-17T19:00:00Z",
            endsAt: "2024-02-17T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Email Writing Skills"
          }
        },
        {
          id: "att-3",
          meetingId: "meeting-3",
          studentId: "student-1",
          attendanceStatusId: "status-2",
          attendanceStatus: "Absent",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-19T19:00:00Z",
          notes: "Student was sick",
          meeting: {
            id: "meeting-3",
            startsAt: "2024-02-19T19:00:00Z",
            endsAt: "2024-02-19T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Meeting and Presentation Skills"
          }
        },
        {
          id: "att-4",
          meetingId: "meeting-4",
          studentId: "student-1",
          attendanceStatusId: "status-1",
          attendanceStatus: "Present",
          checkedBy: "teacher-1",
          checkedByName: "Sarah Johnson",
          createdAt: "2024-02-22T19:00:00Z",
          meeting: {
            id: "meeting-4",
            startsAt: "2024-02-22T19:00:00Z",
            endsAt: "2024-02-22T21:00:00Z",
            roomName: "Room 201",
            coveredTopic: "Negotiation Skills"
          }
        }
      ]
    },
    {
      classId: "2",
      className: "IELTS Test Preparation - Class B2",
      courseCode: "IELTS201",
      courseName: "IELTS Test Preparation",
      instructor: "Michael Chen",
      totalSessions: 12,
      attendedSessions: 11,
      absentSessions: 1,
      attendanceRate: 91.7,
      records: []
    },
    {
      classId: "3",
      className: "English Conversation Club - Class C1",
      courseCode: "ECC101",
      courseName: "English Conversation Club",
      instructor: "Emma Wilson",
      totalSessions: 8,
      attendedSessions: 7,
      absentSessions: 1,
      attendanceRate: 87.5,
      records: []
    },
    {
      classId: "4",
      className: "Grammar Fundamentals - Class F1",
      courseCode: "GF101",
      courseName: "Grammar Fundamentals",
      instructor: "James Miller",
      totalSessions: 10,
      attendedSessions: 8,
      absentSessions: 2,
      attendanceRate: 80.0,
      records: []
    }
  ]
};

// Attendance Details Modal Component
const AttendanceDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  classData: ClassAttendanceSummary;
}> = ({ isOpen, onClose, classData }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-accent-200">
          <div>
            <h2 className="text-xl font-bold text-primary-800">{classData.className}</h2>
            <p className="text-sm text-accent-600">Detailed Attendance Records</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-accent-50 rounded-lg">
              <p className="text-sm font-medium text-accent-700">Total Sessions</p>
              <p className="text-lg font-bold text-accent-600">{classData.totalSessions}</p>
            </div>
            <div className="text-center p-3 bg-success-50 rounded-lg">
              <p className="text-sm font-medium text-success-700">Present</p>
              <p className="text-lg font-bold text-success-600">{classData.attendedSessions}</p>
            </div>
            <div className="text-center p-3 bg-error-50 rounded-lg">
              <p className="text-sm font-medium text-error-700">Absent</p>
              <p className="text-lg font-bold text-error-600">{classData.absentSessions}</p>
            </div>
          </div>

          {/* Attendance Records List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary-800 mb-3">Session Records</h3>
            {classData.records.length > 0 ? (
              classData.records.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border ${
                    record.attendanceStatus === 'Present'
                      ? 'bg-success-50 border-success-200'
                      : 'bg-error-50 border-error-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.attendanceStatus === 'Present'
                          ? 'bg-success-100'
                          : 'bg-error-100'
                      }`}>
                        {record.attendanceStatus === 'Present' ? (
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold ${
                            record.attendanceStatus === 'Present'
                              ? 'text-success-700'
                              : 'text-error-700'
                          }`}>
                            {record.attendanceStatus}
                          </p>
                          <span className="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded-full">
                            {formatDate(record.meeting.startsAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-neutral-800">
                          {record.meeting.coveredTopic}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTime(record.meeting.startsAt)} - {formatTime(record.meeting.endsAt)}
                            </span>
                          </div>
                          {record.meeting.roomName && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{record.meeting.roomName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <p>Checked by: {record.checkedByName}</p>
                      {record.notes && (
                        <p className="mt-1 text-neutral-600 italic">Note: {record.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="w-8 h-8 text-accent-600" />
                </div>
                <p className="text-neutral-600">No detailed records available for this class</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-accent-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Attendance Summary Card Component
const AttendanceSummaryCard: React.FC<{ summary: ClassAttendanceSummary; onViewDetails: (classId: string) => void }> = ({ 
  summary, 
  onViewDetails 
}) => {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-success-600";
    if (rate >= 80) return "text-warning-600";
    return "text-error-600";
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="w-5 h-5 text-success-600" />;
    if (rate >= 80) return <Target className="w-5 h-5 text-warning-600" />;
    return <TrendingDown className="w-5 h-5 text-error-600" />;
  };

  const getAttendanceBgColor = (rate: number) => {
    if (rate >= 90) return "bg-gradient-to-r from-success-50 to-success-100 border-success-200";
    if (rate >= 80) return "bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200";
    return "bg-gradient-to-r from-error-50 to-error-100 border-error-200";
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-accent-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary-800 mb-1">
              {summary.className}
            </h3>
            <div className="flex items-center gap-2 text-sm text-accent-600">
              <span className="bg-accent2-300 text-primary-700 px-2 py-1 rounded-md font-medium">
                {summary.courseCode}
              </span>
              <span className="text-accent-600">by {summary.instructor}</span>
            </div>
          </div>
        </div>

        {/* Attendance Summary - All in One Line */}
        <div className={`p-4 rounded-xl border mb-4 ${getAttendanceBgColor(summary.attendanceRate)}`}>
          <div className="flex items-center justify-between gap-6">
            {/* Attendance Rate */}
            <div className="flex items-center gap-3">
              {getAttendanceIcon(summary.attendanceRate)}
              <div>
                <p className="text-sm font-medium text-neutral-700">Attendance Rate</p>
                <p className={`text-2xl font-bold ${getAttendanceColor(summary.attendanceRate)}`}>
                  {summary.attendanceRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Present/Absent Counts */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-success-700">Present</p>
                  <p className="text-lg font-bold text-success-600">{summary.attendedSessions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-error-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-error-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-error-700">Absent</p>
                  <p className="text-lg font-bold text-error-600">{summary.absentSessions}</p>
                </div>
              </div>
            </div>

            {/* Total Sessions */}
            <div className="text-right">
              <p className="text-xs font-medium text-neutral-600">Total Sessions</p>
              <p className="text-lg font-bold text-neutral-700">{summary.totalSessions}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex-1"
            iconLeft={<Eye className="w-4 h-4" />}
            onClick={() => onViewDetails(summary.classId)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Overall Statistics Component
const OverallStatsCard: React.FC<{ stats: StudentAttendanceReport['overallStats'] }> = ({ stats }) => {
  const getOverallColor = (rate: number) => {
    if (rate >= 90) return "from-success-400 to-success-500";
    if (rate >= 80) return "from-warning-400 to-warning-500";
    return "from-error-400 to-error-500";
  };

  const getOverallIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="w-6 h-6 text-white" />;
    if (rate >= 80) return <Target className="w-6 h-6 text-white" />;
    return <TrendingDown className="w-6 h-6 text-white" />;
  };

  return (
    <Card className="overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-800">Overall Attendance Statistics</h2>
            <p className="text-sm text-accent-600">Your attendance across all enrolled classes</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-primary-200">
            <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-primary-700">Total Classes</p>
            <p className="text-2xl font-bold text-primary-600">{stats.totalClasses}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-accent2-50 to-accent2-100 rounded-xl border border-accent-200">
            <Calendar className="w-8 h-8 text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-accent-700">Total Sessions</p>
            <p className="text-2xl font-bold text-accent-600">{stats.totalSessions}</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
            <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-success-700">Attended</p>
            <p className="text-2xl font-bold text-success-600">{stats.totalAttended}</p>
          </div>
          <div className="text-center p-4 bg-error-50 rounded-xl border border-error-200">
            <XCircle className="w-8 h-8 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-error-700">Absent</p>
            <p className="text-2xl font-bold text-error-600">{stats.totalAbsent}</p>
          </div>
          <div className={`text-center p-4 rounded-xl border bg-gradient-to-r ${getOverallColor(stats.overallAttendanceRate)} text-white`}>
            {getOverallIcon(stats.overallAttendanceRate)}
            <p className="text-sm font-medium mt-2">Attendance Rate</p>
            <p className="text-2xl font-bold">{stats.overallAttendanceRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function AttendanceReport() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<ClassAttendanceSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  const attendanceData = mockAttendanceReport;

  // Filter classes based on active tab
  const filteredClasses = useMemo(() => {
    let filtered = attendanceData.classSummaries;
    
    switch (activeTab) {
      case "excellent":
        return filtered.filter(cls => cls.attendanceRate >= 90);
      case "good":
        return filtered.filter(cls => cls.attendanceRate >= 80 && cls.attendanceRate < 90);
      case "needs-improvement":
        return filtered.filter(cls => cls.attendanceRate < 80);
      case "overview":
      default:
        return filtered;
    }
  }, [activeTab, attendanceData.classSummaries]);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (classId: string) => {
    const classData = attendanceData.classSummaries.find(cls => cls.classId === classId);
    if (classData) {
      setSelectedClass(classData);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const summaries = attendanceData.classSummaries;
    return {
      overview: summaries.length,
      excellent: summaries.filter(c => c.attendanceRate >= 90).length,
      good: summaries.filter(c => c.attendanceRate >= 80 && c.attendanceRate < 90).length,
      needsImprovement: summaries.filter(c => c.attendanceRate < 80).length
    };
  }, [attendanceData.classSummaries]);

  const tabs = [
    { id: "overview", label: "Overview", badge: tabCounts.overview, color: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
    { id: "excellent", label: "Excellent (90%+)", badge: tabCounts.excellent, color: "bg-gradient-to-r from-success-500 to-success-600 text-white" },
    { id: "good", label: "Good (80-89%)", badge: tabCounts.good, color: "bg-gradient-to-r from-warning-500 to-warning-600 text-white" },
    { id: "needs-improvement", label: "Needs Improvement (<80%)", badge: tabCounts.needsImprovement, color: "bg-gradient-to-r from-error-500 to-error-600 text-white" }
  ];

  const breadcrumbItems = [
    { label: "Attendance Report" }
  ];

  return (
    <StudentLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Attendance Report"
        description="Track your attendance across all enrolled classes and monitor your progress"
        icon={<ClipboardCheck className="w-5 h-5 text-white" />}
      />

      {/* Overall Statistics */}
      <OverallStatsCard stats={attendanceData.overallStats} />

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          variant="secondary" 
          iconLeft={<Download className="w-4 h-4" />}
        >
          Export Report
        </Button>
        <Button 
          variant="ghost" 
          iconLeft={<Filter className="w-4 h-4" />}
        >
          Filter
        </Button>
      </div>

      {/* Tabs and Content */}
      <Card className="shadow-lg border border-accent-100">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {tabs.map(tab => (
          <TabContent key={tab.id} activeTab={activeTab} tabId={tab.id}>
            <div className="space-y-6">
              {paginatedClasses.map((classSummary) => (
                <AttendanceSummaryCard 
                  key={classSummary.classId} 
                  summary={classSummary} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </TabContent>
        ))}

        {/* Empty State */}
        {filteredClasses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-12 h-12 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold text-primary-800 mb-3">
              No attendance data found
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              {activeTab === "overview" 
                ? "No attendance records available for the selected period." 
                : `No classes found in the ${activeTab.replace('-', ' ')} category.`
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredClasses.length > 0 && totalPages > 1 && (
          <div className="pt-8 border-t border-accent-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClasses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
          )}
        </Card>

        {/* Attendance Details Modal */}
        {selectedClass && (
          <AttendanceDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            classData={selectedClass}
          />
        )}
    </StudentLayout>
  );
}
