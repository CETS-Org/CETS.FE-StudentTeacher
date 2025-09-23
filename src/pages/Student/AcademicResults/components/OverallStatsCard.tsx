import React from "react";
import Card from "@/components/ui/Card";
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
  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return "from-success-400 to-success-500";
    if (gpa >= 3.0) return "from-primary-400 to-primary-500";
    if (gpa >= 2.0) return "from-warning-400 to-warning-500";
    return "from-error-400 to-error-500";
  };

  const getGPAIcon = (gpa: number) => {
    if (gpa >= 3.7) return <Award className="w-6 h-6 text-white" />;
    if (gpa >= 3.0) return <TrendingUp className="w-6 h-6 text-white" />;
    if (gpa >= 2.0) return <Target className="w-6 h-6 text-white" />;
    return <TrendingDown className="w-6 h-6 text-white" />;
  };

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.7) return "Honors";
    if (gpa >= 3.0) return "Good";
    if (gpa >= 2.0) return "Satisfactory";
    return "Needs Improvement";
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-primary-200">
            <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-primary-700">Total Courses</p>
            <p className="text-2xl font-bold text-primary-600">{stats.totalCourses}</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-accent2-50 to-accent2-100 rounded-xl border border-accent-200">
            <BarChart3 className="w-8 h-8 text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-accent-700">Total Credits</p>
            <p className="text-2xl font-bold text-accent-600">{stats.totalCredits}</p>
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
          
          <div className={`text-center p-4 rounded-xl border bg-gradient-to-r ${getGPAColor(stats.currentGPA)} text-white`}>
            {getGPAIcon(stats.currentGPA)}
            <p className="text-sm font-medium mt-2">Current GPA</p>
            <p className="text-2xl font-bold">{stats.currentGPA.toFixed(2)}</p>
            <p className="text-xs opacity-90">{getGPALabel(stats.currentGPA)}</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-gradient-to-r from-secondary-100 to-secondary-200 rounded-xl border border-primary-200">
            <TrendingUp className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-primary-700">Cumulative GPA</p>
            <p className="text-xl font-bold text-primary-600">{stats.cumulativeGPA.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-accent2-50 to-accent2-100 rounded-xl border border-accent-200">
            <BookOpen className="w-6 h-6 text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-accent-700">Completed Credits</p>
            <p className="text-xl font-bold text-accent-600">{stats.completedCredits}</p>
          </div>
          
          <div className={`text-center p-4 rounded-xl border ${stats.honorsEligible ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200' : 'bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200'}`}>
            <Award className={`w-6 h-6 mx-auto mb-2 ${stats.honorsEligible ? 'text-success-600' : 'text-accent-600'}`} />
            <p className={`text-sm font-medium ${stats.honorsEligible ? 'text-success-700' : 'text-accent-700'}`}>Honors Eligible</p>
            <p className={`text-xl font-bold ${stats.honorsEligible ? 'text-success-600' : 'text-accent-600'}`}>
              {stats.honorsEligible ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OverallStatsCard;
