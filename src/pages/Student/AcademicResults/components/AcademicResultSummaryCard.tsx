import React from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  Eye,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import type { CourseResultSummary} from "@/types/academicResults";
import { GRADE_COLORS, GRADE_BG_COLORS } from "@/types/academicResults";

interface AcademicResultSummaryCardProps {
  summary: CourseResultSummary;
  onViewDetails: (courseId: string) => void;
}

const AcademicResultSummaryCard: React.FC<AcademicResultSummaryCardProps> = ({ 
  summary, 
  onViewDetails 
}) => {
  const getGradeColor = (grade: keyof typeof GRADE_COLORS) => {
    return GRADE_COLORS[grade];
  };

  const getGradeBgColor = (grade: keyof typeof GRADE_BG_COLORS) => {
    return GRADE_BG_COLORS[grade];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pass":
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case "Fail":
        return <XCircle className="w-5 h-5 text-error-600" />;
      case "Incomplete":
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-accent-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pass":
        return "text-success-600";
      case "Fail":
        return "text-error-600";
      case "Incomplete":
        return "text-warning-600";
      default:
        return "text-accent-600";
    }
  };

  const getGPATrendIcon = (gpa: number) => {
    if (gpa >= 3.7) return <Award className="w-5 h-5 text-success-600" />;
    if (gpa >= 3.0) return <TrendingUp className="w-5 h-5 text-primary-600" />;
    if (gpa >= 2.0) return <TrendingDown className="w-5 h-5 text-warning-600" />;
    return <TrendingDown className="w-5 h-5 text-error-600" />;
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-accent-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary-800 mb-1">
              {summary.courseName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-accent-600 mb-2">
              <span className="bg-accent2-300 text-primary-700 px-2 py-1 rounded-md font-medium">
                {summary.courseCode}
              </span>
              <span className="text-accent-600">by {summary.instructor}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-accent-500">
              <span>{summary.semester} {summary.academicYear}</span>
              <span>•</span>
              <span>{summary.credits} credits</span>
            </div>
          </div>
        </div>

        {/* Grade and Status Summary */}
        <div className={`p-4 rounded-xl border mb-4 ${getGradeBgColor(summary.finalGrade)}`}>
          <div className="flex items-center justify-between gap-6">
            {/* Final Grade */}
            <div className="flex items-center gap-3">
              {getGPATrendIcon(summary.gpa)}
              <div>
                <p className="text-sm font-medium text-neutral-700">Final Grade</p>
                <p className={`text-3xl font-bold ${getGradeColor(summary.finalGrade)}`}>
                  {summary.finalGrade}
                </p>
              </div>
            </div>

            {/* Score and GPA */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs font-medium text-neutral-600">Final Score</p>
                <p className="text-xl font-bold text-neutral-700">{summary.finalScore}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-neutral-600">GPA Points</p>
                <p className="text-xl font-bold text-neutral-700">{summary.gpa.toFixed(1)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(summary.status)}
              <div className="text-right">
                <p className="text-xs font-medium text-neutral-600">Status</p>
                <p className={`text-sm font-bold ${getStatusColor(summary.status)}`}>
                  {summary.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {summary.remarks && (
          <div className="mb-4 p-3 bg-accent-50 rounded-lg border border-accent-200">
            <p className="text-sm text-accent-700">
              <span className="font-medium">Remarks:</span> {summary.remarks}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex-1"
            iconLeft={<Eye className="w-4 h-4" />}
            onClick={() => onViewDetails(summary.courseId)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AcademicResultSummaryCard;
