import React from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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

export default AttendanceSummaryCard;
