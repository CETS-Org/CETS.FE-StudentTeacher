import React from "react";
import Card from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  CheckCircle,
  XCircle,
  BarChart3
} from "lucide-react";
import type { StudentAcademicReport } from "@/types/academicResults";

interface OverallStatsCardProps {
  stats: StudentAcademicReport['overallStats'];
}

const OverallStatsCard: React.FC<OverallStatsCardProps> = ({ stats }) => {

  return (
    <Card className="overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-800">Academic Performance Overview</h2>
            <p className="text-sm text-accent-600">Your academic results and performance metrics</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-primary-200">
            <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-primary-700">Total Courses</p>
            <p className="text-2xl font-bold text-primary-600">{stats.totalCourses}</p>
          </div>
          
          
          <div className="text-center p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-xl border border-success-200">
            <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-success-700">Passed Courses</p>
            <p className="text-2xl font-bold text-success-600">{stats.passedCourses}</p>
          </div>
          
          <div className="text-center p-4 bg-error-50 rounded-xl border border-error-200">
            <XCircle className="w-8 h-8 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-error-700">Failed Courses</p>
            <p className="text-2xl font-bold text-error-600">{stats.failedCourses}</p>
          </div>
       
        </div>

       
      </div>
    </Card>
  );
};

export default OverallStatsCard;
