import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X, BookOpen, User, Calendar, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { CourseDetailResponse } from "@/types/academicResults";
import { mockCourseDetails } from "../data";

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  studentId: string;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  courseId, 
  studentId 
}) => {
  const [courseDetails, setCourseDetails] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseDetails();
    }
  }, [isOpen, courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use mock data
      const details = mockCourseDetails[courseId];
      if (details) {
        setCourseDetails(details);
      } else {
        setError('Course details not found');
      }
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

  return (
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
            <h2 className="text-xl font-bold text-primary-800">Course Details</h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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

              {/* Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-4">Assignments</h3>
                {courseDetails.assignments.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                    <FileText className="w-12 h-12 text-accent-400 mx-auto mb-2" />
                    <p className="text-accent-600">No assignments available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseDetails.assignments.map((assignment) => (
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;

