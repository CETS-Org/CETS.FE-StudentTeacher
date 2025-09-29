import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "../ui/Dialog";
import Button from "../ui/Button";
import { CheckCircle, Mail, Shield, ArrowRight, X } from "lucide-react";
import "../../styles/login-animations.css";

interface RegistrationSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function RegistrationSuccessDialog({
  isOpen,
  onClose,
  userEmail
}: RegistrationSuccessDialogProps) {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onClose();
    navigate("/login");
  };

  const handleGoToCourses = () => {
    onClose();
    navigate("/courses");
  };

  const getMaskedEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${maskedUsername}@${domain}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg" className="p-0 bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-neutral-500" />
        </button>

        <div className="p-8">
          {/* Header with Animation */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="mx-auto w-15 h-15 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse-gentle relative">
              <CheckCircle className="w-10 h-10 text-white" />
              {/* Success Ring Animation */}
              <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-neutral-900">
                Account Created Successfully! 🎉
              </h2>
              <p className="text-neutral-600 text-md">
                Welcome to CETS! <br></br> We've sent verification instructions to your email.
              </p>
              {userEmail && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-200 border border-primary-200 rounded-full text-sm">
                  <Mail className="w-4 h-4 text-primary-600" />
                  <span className="text-primary-700 font-medium">{getMaskedEmail(userEmail)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6 animate-slide-in-left animation-delay-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  Next Steps:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-green-800">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-sm font-medium">Check your email inbox for a verification link</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-800">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-sm font-medium">Click the verification link to activate your account</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-800">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-sm font-medium">Once verified, you can log in and start learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-slide-in-right animation-delay-500">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Security Notice</p>
                <p className="text-xs text-blue-700 mt-1">
                  If you don't see the email within 5 minutes, check your spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animation-delay-700">
            <Button
              onClick={handleGoToCourses}
              variant="primary"
              size="lg"
              className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Explore Courses
            </Button>
            <Button
              onClick={handleGoToLogin}
              variant="secondary"
              size="lg"
              className="sm:w-auto min-w-[120px]"
            >
              Go to Login
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
                contact support
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
