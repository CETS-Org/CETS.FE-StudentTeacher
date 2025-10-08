import React from "react";
import Card from "@/components/ui/Card";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  BookOpen,
  Calendar,
  Target
} from "lucide-react";
import type { StudentAttendanceReport } from "@/types/attendance";

interface OverallStatsCardProps {
  stats: StudentAttendanceReport['overallStats'];
}

const OverallStatsCard: React.FC<OverallStatsCardProps> = ({ stats }) => {
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
            <p className="text-sm font-medium text-success-700">Present</p>
            <p className="text-2xl font-bold text-success-600">{stats.totalAttended}</p>
            <p className="text-xs text-success-600">sessions</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-error-50 to-error-100 rounded-xl border border-error-200">
            <XCircle className="w-8 h-8 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-error-700">Absent</p>
            <p className="text-2xl font-bold text-error-600">{stats.totalAbsent}</p>
            <p className="text-xs text-error-600">sessions</p>
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

export default OverallStatsCard;
