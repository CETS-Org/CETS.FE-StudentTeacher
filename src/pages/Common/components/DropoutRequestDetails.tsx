import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle, XCircle, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { getAttachmentDownloadUrl } from '@/api/academicRequest.api';
import type { AcademicRequestResponse } from '@/types/academicRequest';
import {
  DropoutReasonCategoryLabels,
  type DropoutReasonCategory,
  type ExitSurveyData,
} from '@/types/dropoutRequest';

interface DropoutRequestDetailsProps {
  request: AcademicRequestResponse;
}

const DropoutRequestDetails: React.FC<DropoutRequestDetailsProps> = ({ request }) => {
  const [isDownloadingExitSurvey, setIsDownloadingExitSurvey] = useState(false);
  const [exitSurveyData, setExitSurveyData] = useState<ExitSurveyData | null>(null);
  const [showExitSurvey, setShowExitSurvey] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewExitSurvey = async () => {
    if (!request.exitSurveyId) {
      toast.error('Exit survey not available');
      return;
    }

    setIsDownloadingExitSurvey(true);
    try {
      // Fetch exit survey from MongoDB
      const { getExitSurveyById } = await import('@/api/exitSurvey.api');
      const surveyResponse = await getExitSurveyById(request.exitSurveyId);
      
      // Map MongoDB response to ExitSurveyData format
      const surveyData: ExitSurveyData = {
        studentID: surveyResponse.studentId,
        reasonCategory: surveyResponse.reasonCategory as any,
        reasonDetail: surveyResponse.reasonDetail,
        feedback: surveyResponse.feedback,
        futureIntentions: surveyResponse.futureIntentions,
        comments: surveyResponse.comments,
        acknowledgesPermanent: surveyResponse.acknowledgesPermanent,
        completedAt: surveyResponse.completedAt,
      };
      
      setExitSurveyData(surveyData);
      setShowExitSurvey(true);
    } catch (error: any) {
      console.error('Error loading exit survey:', error);
      toast.error('Failed to load exit survey');
    } finally {
      setIsDownloadingExitSurvey(false);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-neutral-600">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`border-l-4 rounded-r-lg p-4 ${
        request.completedExitSurvey 
          ? 'bg-success-50 border-success-500' 
          : 'bg-warning-50 border-warning-500'
      }`}>
        <div className="flex items-center gap-2">
          {request.completedExitSurvey ? (
            <CheckCircle className="w-5 h-5 text-success-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning-600" />
          )}
          <div>
            <p className="font-semibold text-sm text-neutral-800">
              {request.completedExitSurvey 
                ? 'Exit Survey Completed' 
                : 'Exit Survey Required'}
            </p>
            <p className="text-xs text-neutral-600">
              {request.completedExitSurvey
                ? 'Student has completed the required exit survey'
                : 'Exit survey must be completed before approval'}
            </p>
          </div>
        </div>
      </div>

      {/* Dropout Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-neutral-600" />
            <h4 className="text-sm font-semibold text-neutral-700">Effective Date</h4>
          </div>
          <p className="text-base font-medium text-neutral-900">
            {formatDate(request.effectiveDate)}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Date when dropout becomes effective
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-neutral-600" />
            <h4 className="text-sm font-semibold text-neutral-700">Reason Category</h4>
          </div>
          <p className="text-base font-medium text-neutral-900">
            {request.reasonCategory 
              ? DropoutReasonCategoryLabels[request.reasonCategory as DropoutReasonCategory]
              : 'Not specified'}
          </p>
        </div>
      </div>

      {/* Reason Detail */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2">Detailed Reason</h4>
        <p className="text-sm text-neutral-800 whitespace-pre-wrap">
          {request.reason || 'No reason provided'}
        </p>
      </div>

      {/* Exit Survey Section */}
      {request.completedExitSurvey && request.exitSurveyId && (
        <div className="border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-semibold text-neutral-800">Exit Survey</h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewExitSurvey}
              disabled={isDownloadingExitSurvey}
              loading={isDownloadingExitSurvey}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Survey
            </Button>
          </div>

          {showExitSurvey && exitSurveyData && (
            <div className="space-y-4 mt-4 pt-4 border-t border-neutral-200">
              {/* Feedback Ratings */}
              <div>
                <h5 className="text-sm font-semibold text-neutral-700 mb-3">
                  Student Feedback Ratings
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-neutral-600">Teacher Quality:</span>
                    {renderRatingStars(exitSurveyData.feedback.teacherQuality)}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-neutral-600">Class Pacing:</span>
                    {renderRatingStars(exitSurveyData.feedback.classPacing)}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-neutral-600">Materials:</span>
                    {renderRatingStars(exitSurveyData.feedback.materials)}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-neutral-600">Staff Service:</span>
                    {renderRatingStars(exitSurveyData.feedback.staffService)}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-neutral-600">Schedule:</span>
                    {renderRatingStars(exitSurveyData.feedback.schedule)}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm text-neutral-600">Facilities:</span>
                    {renderRatingStars(exitSurveyData.feedback.facilities)}
                  </div>
                </div>
              </div>

              {/* Future Intentions */}
              <div>
                <h5 className="text-sm font-semibold text-neutral-700 mb-2">
                  Future Intentions
                </h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {exitSurveyData.futureIntentions.wouldReturnInFuture ? (
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error-500" />
                    )}
                    <span className="text-sm text-neutral-700">
                      {exitSurveyData.futureIntentions.wouldReturnInFuture
                        ? 'Might return in the future'
                        : 'Does not plan to return'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {exitSurveyData.futureIntentions.wouldRecommendToOthers ? (
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error-500" />
                    )}
                    <span className="text-sm text-neutral-700">
                      {exitSurveyData.futureIntentions.wouldRecommendToOthers
                        ? 'Would recommend to others'
                        : 'Would not recommend to others'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {exitSurveyData.comments && (
                <div>
                  <h5 className="text-sm font-semibold text-neutral-700 mb-2">
                    Additional Comments
                  </h5>
                  <div className="bg-white rounded p-3 border border-neutral-200">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {exitSurveyData.comments}
                    </p>
                  </div>
                </div>
              )}

              {/* Survey Metadata */}
              <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                <p>Survey completed: {formatDate(exitSurveyData.completedAt)}</p>
                <p>Acknowledged permanent decision: {exitSurveyData.acknowledgesPermanent ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-error-800 mb-1">
              Permanent Decision
            </h4>
            <p className="text-xs text-error-700">
              Dropping out is permanent and cannot be reversed. The student will need to
              re-enroll as a new student if they wish to return in the future.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Actions Note */}
      {(request.statusName === 'Pending' || request.statusName === 'UnderReview') && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-accent-800 mb-2">
            Staff Review Checklist
          </h4>
          <ul className="text-xs text-accent-700 space-y-1 pl-4">
            <li className="list-disc">Verify exit survey completion</li>
            <li className="list-disc">Check financial clearance (no unpaid invoices)</li>
            <li className="list-disc">Confirm no other pending requests</li>
            <li className="list-disc">Review reason and supporting documents</li>
            <li className="list-disc">Verify student acknowledgment of permanence</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropoutRequestDetails;

