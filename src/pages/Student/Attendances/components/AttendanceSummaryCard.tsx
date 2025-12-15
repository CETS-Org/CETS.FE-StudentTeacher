import React from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Target
} from "lucide-react";
import type { ClassAttendanceSummary } from "@/types/attendance";

interface AttendanceSummaryCardProps {
  summary: ClassAttendanceSummary;
  onViewDetails: (classId: string) => void;
}

const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({ 
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
            <div className="flex items-center gap-2 text-sm text-accent-600 mb-2">
              <span className="bg-accent2-300 text-primary-700 px-2 py-1 rounded-md font-medium">
                {summary.courseCode}
              </span>
              <span className="text-accent-600">by {summary.instructor}</span>
            </div>
            {/* Course Name - More Prominent */}
            <div className="bg-gradient-to-r from-secondary-200 to-secondary-300 border border-primary-200 rounded-lg p-3">
              <p className="text-sm font-medium text-primary-700 mb-1">Course:</p>
              <p className="text-base font-semibold text-primary-800">{summary.courseName}</p>
            </div>
          </div>
        </div>

        {/* Attendance Summary - All in One Line */}
        <div className={`p-4 rounded-xl border ${getAttendanceBgColor(summary.attendanceRate)}`}>
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

            {/* Present/Absent Counts - Enhanced */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-success-700">Present</p>
                  <p className="text-2xl font-bold text-success-600">{summary.attendedSessions}</p>
                  <p className="text-xs text-success-600">sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-error-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-error-700">Absent</p>
                  <p className="text-2xl font-bold text-error-600">{summary.absentSessions}</p>
                  <p className="text-xs text-error-600">sessions</p>
                </div>
              </div>
            </div>

            {/* View Details Button - Replacing Total Sessions */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs font-medium text-neutral-600">
                Total: <span className="font-bold text-neutral-700">{summary.totalSessions}</span> sessions
              </div>
              <Button 
                variant="primary" 
                size="sm"
                iconLeft={<Eye className="w-4 h-4" />}
                onClick={() => onViewDetails(summary.classId)}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AttendanceSummaryCard;
