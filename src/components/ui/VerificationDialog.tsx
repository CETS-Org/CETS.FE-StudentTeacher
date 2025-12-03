import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, X, AlertCircle } from 'lucide-react';
import Button from './Button';

interface VerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResendVerification: () => Promise<void>;
  userEmail?: string;
}

export default function VerificationDialog({
  isOpen,
  onClose,
  onResendVerification,
  userEmail
}: VerificationDialogProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  if (!isOpen) return null;

  const handleResend = async () => {
    try {
      setIsResending(true);
      setResendError('');
      await onResendVerification();
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return createPortal(
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity z-[70] backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Dialog Container */}
      <div className="fixed inset-0 z-[70] overflow-y-auto pointer-events-none">
        <div className="flex items-center justify-center min-h-full p-4 text-center pointer-events-auto">
          {/* Dialog */}
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-md">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-white px-6 pt-8 pb-6">
              <div className="sm:flex sm:items-start">
                {/* Icon */}
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 sm:mx-0">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                
                {/* Content */}
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-3">
                    Verify Your Account
                  </h3>
                  <div className="mt-2 space-y-3">
                    <p className="text-sm text-gray-600">
                      Your account is not verified yet. Please check your email and click the verification link to activate all features.
                    </p>
                    
                    {userEmail && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-blue-800 font-medium break-all">
                          {userEmail}
                        </p>
                      </div>
                    )}

                    {resendSuccess && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Verification email has been resent successfully!
                        </p>
                      </div>
                    )}

                    {resendError && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">
                          {resendError}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 italic">
                      Didn't receive the email? Check your spam folder or click the button below to resend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
              <Button
                onClick={handleResend}
                variant="primary"
                disabled={isResending || resendSuccess}
                iconLeft={<Mail className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {isResending ? 'Sending...' : resendSuccess ? 'Sent!' : 'Resend Email'}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full sm:w-auto mt-3 sm:mt-0"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

