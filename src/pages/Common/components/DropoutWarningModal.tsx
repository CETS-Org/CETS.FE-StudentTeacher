import React from 'react';
import { AlertTriangle, X, XCircle, Ban, FileX, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';

interface DropoutWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const DropoutWarningModal: React.FC<DropoutWarningModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100">
                <AlertTriangle className="w-6 h-6 text-error-600" />
              </div>
              <DialogTitle className="text-error-700">Important Warning</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            <div className="bg-error-50 border-2 border-error-500 rounded-lg p-4">
              <p className="text-base font-semibold text-error-900 mb-2">
                You are about to submit a request to permanently drop out from the program.
              </p>
              <p className="text-sm text-error-800">
                This is a serious decision that will have lasting consequences. Please read
                carefully before proceeding.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-error-500" />
                Consequences of Dropping Out:
              </h3>

              <ul className="space-y-3 pl-2">
                <li className="flex items-start gap-3">
                  <Ban className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">
                      This action is permanent and cannot be undone
                    </p>
                    <p className="text-sm text-neutral-600">
                      Once approved and completed, your dropout cannot be reversed
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FileX className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">
                      Your study contract will be terminated
                    </p>
                    <p className="text-sm text-neutral-600">
                      All class enrollments and future sessions will be cancelled
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">
                      You must re-enroll as a new student to return
                    </p>
                    <p className="text-sm text-neutral-600">
                      If you wish to study again in the future, you will need to go through the
                      complete enrollment process
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-neutral-800">
                      Financial obligations must be settled
                    </p>
                    <p className="text-sm text-neutral-600">
                      All outstanding invoices and payments must be cleared. Refunds (if any) will
                      be processed according to the centre's policy
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-neutral-800">
                      Access to learning materials and systems will be removed
                    </p>
                    <p className="text-sm text-neutral-600">
                      Your LMS access, class materials, and student portal access will be
                      deactivated
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-neutral-800">
                      Remaining sessions and progress will be lost
                    </p>
                    <p className="text-sm text-neutral-600">
                      Unless refund policy applies, you will forfeit any remaining class sessions
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
              <h3 className="font-semibold text-accent-900 mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Consider Alternatives
              </h3>
              <p className="text-sm text-accent-800 mb-2">
                If you're facing temporary difficulties, you might want to consider:
              </p>
              <ul className="text-sm text-accent-700 space-y-1 pl-4">
                <li className="list-disc">
                  <strong>Suspension Request:</strong> Temporarily pause your studies and return
                  later
                </li>
                <li className="list-disc">
                  <strong>Class Transfer:</strong> Switch to a different class schedule
                </li>
                <li className="list-disc">
                  <strong>Talk to Staff:</strong> Discuss your concerns with our academic advisors
                </li>
              </ul>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-sm text-warning-800">
                <strong className="font-semibold">Next Steps:</strong> If you choose to continue,
                you will be asked to complete an exit survey to help us understand your decision and
                improve our services.
              </p>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              <span className="flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                Cancel & Go Back
              </span>
            </Button>
            <Button variant="danger" onClick={onContinue} className="flex-1">
              <span className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                I Understand, Continue
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DropoutWarningModal;

