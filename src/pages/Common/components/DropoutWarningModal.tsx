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
                    <p className="font-medium text-neutral-800">This decision is final</p>
                    <p className="text-sm text-neutral-600">
                      Once your dropout is approved, it is permanent and cannot be undone.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FileX className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">Your enrolment will end</p>
                    <p className="text-sm text-neutral-600">
                      Your study contract will be terminated and all current or future classes and
                      sessions will be cancelled. To return later, you will need to re-enrol as a
                      new student.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-800">Fees, access, and progress</p>
                    <p className="text-sm text-neutral-600">
                      You must settle any unpaid fees. Your LMS and portal access will be removed,
                      and remaining sessions or progress may be lost according to the centre's
                      refund policy.
                    </p>
                  </div>
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

