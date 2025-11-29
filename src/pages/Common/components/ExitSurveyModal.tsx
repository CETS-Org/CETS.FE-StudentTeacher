import React, { useState } from 'react';
import { X, AlertTriangle, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { createExitSurvey } from '@/api/exitSurvey.api';
import {
  DropoutReasonCategories,
  DropoutReasonCategoryLabels,
  type ExitSurveyData,
  type DropoutReasonCategory,
} from '@/types/dropoutRequest';

interface ExitSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentID: string;
  onSurveyComplete: (exitSurveyId: string, surveyData: ExitSurveyData) => void;
}

const ExitSurveyModal: React.FC<ExitSurveyModalProps> = ({
  isOpen,
  onClose,
  studentID,
  onSurveyComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ExitSurveyData>>({
    studentID,
    reasonCategory: undefined,
    reasonDetail: '',
    feedback: {
      teacherQuality: 3,
      classPacing: 3,
      materials: 3,
      staffService: 3,
      schedule: 3,
      facilities: 3,
    },
    futureIntentions: {
      wouldReturnInFuture: false,
      wouldRecommendToOthers: false,
    },
    comments: '',
    acknowledgesPermanent: false,
  });

  const handleRatingChange = (category: keyof ExitSurveyData['feedback'], value: number) => {
    setFormData({
      ...formData,
      feedback: {
        ...formData.feedback!,
        [category]: value,
      },
    });
  };

  const renderRatingStars = (
    category: keyof ExitSurveyData['feedback'],
    label: string
  ) => {
    const currentRating = formData.feedback?.[category] || 0;

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingChange(category, rating)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= currentRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-neutral-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-neutral-600">
            {currentRating === 1 && 'Poor'}
            {currentRating === 2 && 'Fair'}
            {currentRating === 3 && 'Good'}
            {currentRating === 4 && 'Very Good'}
            {currentRating === 5 && 'Excellent'}
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reasonCategory) {
      toast.error('Please select a reason category');
      return;
    }

    if (!formData.reasonDetail || formData.reasonDetail.length < 20) {
      toast.error('Please provide at least 20 characters of detailed explanation');
      return;
    }

    if (!formData.acknowledgesPermanent) {
      toast.error('Please acknowledge that this decision is permanent');
      return;
    }

    setIsSubmitting(true);
    try {
      const completeSurveyData: ExitSurveyData = {
        reasonCategory: formData.reasonCategory!,
        reasonDetail: formData.reasonDetail!,
        feedback: formData.feedback!,
        futureIntentions: formData.futureIntentions!,
        comments: formData.comments || '',
        acknowledgesPermanent: formData.acknowledgesPermanent!,
        completedAt: new Date().toISOString(),
        studentID,
      };

      const response = await createExitSurvey(completeSurveyData);
      onSurveyComplete(response.id, completeSurveyData);
      onClose();
    } catch (error: any) {
      console.error('Failed to save exit survey:', error);
      toast.error(error.response?.data?.message || 'Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Exit Survey</DialogTitle>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-neutral-600 mt-2">
            Please complete this exit survey. Your feedback helps us improve our services.
          </p>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Reason for Leaving */}
            <div className="border-b border-neutral-200 pb-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                1. Reason for Leaving
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Primary Reason <span className="text-error-500">*</span>
                </label>
                <select
                  required
                  value={formData.reasonCategory || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reasonCategory: e.target.value as DropoutReasonCategory,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a reason...</option>
                  {Object.entries(DropoutReasonCategoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Please explain in detail <span className="text-error-500">*</span>
                </label>
                <textarea
                  required
                  minLength={20}
                  value={formData.reasonDetail || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, reasonDetail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Please provide details about your decision to leave (minimum 20 characters)..."
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.reasonDetail?.length || 0} / 20 characters minimum
                </p>
              </div>
            </div>

            {/* Section 2: Feedback Ratings */}
            <div className="border-b border-neutral-200 pb-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                2. Please Rate Your Experience
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                Rate each aspect from 1 (Poor) to 5 (Excellent)
              </p>

              {renderRatingStars('teacherQuality', 'Teacher Quality')}
              {renderRatingStars('classPacing', 'Class Pacing')}
              {renderRatingStars('materials', 'Learning Materials')}
              {renderRatingStars('staffService', 'Staff Service')}
              {renderRatingStars('schedule', 'Schedule Flexibility')}
              {renderRatingStars('facilities', 'Facilities')}
            </div>

            {/* Section 3: Future Intentions */}
            <div className="border-b border-neutral-200 pb-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                3. Future Intentions
              </h3>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.futureIntentions?.wouldReturnInFuture || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        futureIntentions: {
                          ...formData.futureIntentions!,
                          wouldReturnInFuture: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <span className="text-sm text-neutral-700">
                    I might return to this centre in the future
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.futureIntentions?.wouldRecommendToOthers || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        futureIntentions: {
                          ...formData.futureIntentions!,
                          wouldRecommendToOthers: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <span className="text-sm text-neutral-700">
                    I would recommend this centre to others
                  </span>
                </label>
              </div>
            </div>

            {/* Section 4: Additional Comments */}
            <div className="border-b border-neutral-200 pb-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                4. Additional Comments
              </h3>

              <textarea
                value={formData.comments || ''}
                onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Any additional feedback, suggestions, or comments..."
              />
            </div>

            {/* Section 5: Acknowledgement */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-warning-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-warning-800 mb-3">
                    5. Important Notice
                  </h3>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acknowledgesPermanent || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acknowledgesPermanent: e.target.checked,
                        })
                      }
                      className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <span className="text-sm text-neutral-700">
                      I understand and acknowledge that dropping out is{' '}
                      <strong className="text-warning-800">permanent</strong> and{' '}
                      <strong className="text-warning-800">cannot be reversed</strong>. If I wish
                      to return in the future, I will need to re-enroll as a new student.{' '}
                      <span className="text-error-500">*</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.acknowledgesPermanent}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Submitting Survey...' : 'Complete Exit Survey'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExitSurveyModal;

