import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from "@/components/ui/Dialog";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  BookOpen,
  User,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  Target
} from "lucide-react";
import type { CourseResultSummary} from "@/types/academicResults";
import { GRADE_COLORS, GRADE_BG_COLORS } from "@/types/academicResults";

interface AcademicResultDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: CourseResultSummary;
}

const AcademicResultDetailsModal: React.FC<AcademicResultDetailsModalProps> = ({
  isOpen,
  onClose,
  courseData
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

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case "Assignment":
        return <FileText className="w-4 h-4" />;
      case "Quiz":
        return <Target className="w-4 h-4" />;
      case "Midterm":
        return <BookOpen className="w-4 h-4" />;
      case "Final":
        return <Award className="w-4 h-4" />;
      case "Project":
        return <TrendingUp className="w-4 h-4" />;
      case "Participation":
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary-800">
            {courseData.courseName}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-accent-600 mb-2">
            <span className="bg-accent2-300 text-primary-700 px-2 py-1 rounded-md font-medium">
              {courseData.courseCode}
            </span>
            <span className="text-accent-600">by {courseData.instructor}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-accent-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {courseData.semester} {courseData.academicYear}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {courseData.credits} credits
            </span>
          </div>
        </DialogHeader>

        <DialogBody>
          {/* Course Overview */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-bold text-primary-800 mb-4">Course Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${getGradeBgColor(courseData.finalGrade)}`}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-700 mb-1">Final Grade</p>
                    <p className={`text-3xl font-bold ${getGradeColor(courseData.finalGrade)}`}>
                      {courseData.finalGrade}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-accent-700 mb-1">Final Score</p>
                    <p className="text-3xl font-bold text-accent-600">{courseData.finalScore}</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-secondary-200 to-secondary-300 rounded-xl border border-primary-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary-700 mb-1">GPA Points</p>
                    <p className="text-3xl font-bold text-primary-600">{courseData.gpa.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {getStatusIcon(courseData.status)}
                <span className={`font-medium ${getStatusColor(courseData.status)}`}>
                  Status: {courseData.status}
                </span>
              </div>
              {courseData.remarks && (
                <div className="mt-4 p-3 bg-accent-50 rounded-lg border border-accent-200">
                  <p className="text-sm text-accent-700">
                    <span className="font-medium">Remarks:</span> {courseData.remarks}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Assessment Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-primary-800 mb-4">Assessment Details</h3>
              <div className="space-y-4">
                {courseData.result.assessments.map((assessment, index) => (
                  <div key={assessment.id} className="p-4 border border-accent-200 rounded-lg hover:bg-accent-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent-200 rounded-full flex items-center justify-center">
                          {getAssessmentTypeIcon(assessment.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-primary-800">{assessment.name}</h4>
                          <p className="text-sm text-accent-600">{assessment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getGradeColor(assessment.grade)}`}>
                          {assessment.grade}
                        </p>
                        <p className="text-sm text-accent-600">
                          {assessment.score}/{assessment.maxScore}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent-500" />
                        <span className="text-accent-600">Weight:</span>
                        <span className="font-medium">{assessment.weight}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent-500" />
                        <span className="text-accent-600">Submitted:</span>
                        <span className="font-medium">{formatDate(assessment.submittedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent-500" />
                        <span className="text-accent-600">Graded:</span>
                        <span className="font-medium">{formatDate(assessment.gradedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicResultDetailsModal;
