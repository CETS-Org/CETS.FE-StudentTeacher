import { useState, useEffect } from 'react';
import { FileCheck, Clock, HelpCircle } from 'lucide-react';
import Button from './Button';
import Loader from './Loader';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogTitle } from './Dialog';
import { getRandomPlacementTestForStudent, type PlacementTest } from '@/api/placementTest.api';
import { config } from '@/lib/config';

interface PlacementTestConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PlacementTestConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
}: PlacementTestConfirmationDialogProps) {
  const [testDetails, setTestDetails] = useState<PlacementTest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Fetch test details when dialog opens
  useEffect(() => {
    if (!isOpen) {
      setTestDetails(null);
      setError(null);
      setTotalQuestions(0);
      return;
    }

    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch random placement test for student
        const response = await getRandomPlacementTestForStudent();
        const test = response.data;
        setTestDetails(test);

        // ========================================
        // SIMPLIFIED: Chỉ count từ response API random-test
        // ========================================
        // Không cần fetch gì thêm, chỉ đếm số questions từ response
        // ========================================
        const questionCount = test.questions?.length || 0;
        setTotalQuestions(questionCount);
      } catch (err: any) {
        console.error("Failed to load placement test details:", err);
        setError(err.response?.data || err.message || "Failed to load test details");
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [isOpen]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col p-0">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">
              Placement Test Confirmation
            </DialogTitle>
          </div>
        </div>

        <DialogBody className="overflow-y-auto flex-1 min-h-0 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader />
              <p className="mt-4 text-sm text-gray-600">Loading test details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <HelpCircle className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Test</h4>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button
                variant="secondary"
                onClick={onClose}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          ) : testDetails ? (
            <div className="space-y-6">
              {/* Test Purpose */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary-600" />
                  Test Purpose
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The placement test helps us determine your current English proficiency level 
                  and recommend courses that best match your skills. Your results will be used 
                  to suggest appropriate courses for your learning journey.
                </p>
              </div>

              {/* Test Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Test Details</h4>
                
                {/* Test Title */}
                <div className="flex items-start gap-3">
                  <FileCheck className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">Test Name</p>
                    <p className="text-sm font-semibold text-gray-900">{testDetails.title}</p>
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">Number of Question Sets</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {totalQuestions} question set{totalQuestions !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (May contain multiple questions per set)
                    </p>
                  </div>
                </div>

                {/* Time Limit */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">Time Limit</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTime(testDetails.durationMinutes)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong className="font-semibold">Note:</strong> Please be honest and answer all questions 
                  to the best of your ability without external assistance, as accurate results 
                  will help you get placed in the most suitable courses.
                </p>
              </div>
            </div>
          ) : null}
        </DialogBody>
        
        {/* Footer */}
        {!loading && !error && testDetails && (
          <DialogFooter className="sm:flex-row">
            <Button
              onClick={onConfirm}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium"
            >
              Start Test
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

