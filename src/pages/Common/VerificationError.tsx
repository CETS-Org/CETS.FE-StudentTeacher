import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, Mail, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import '../../styles/login-animations.css';

export default function VerificationError() {
  usePageTitle("Verification Failed");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  const handleResendVerification = () => {
    // Navigate to forgot password or resend verification page
    navigate('/forgotPassword', { state: { email } });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    navigate('/student/request-issue/technical');
  };

  // Determine error message
  const getErrorMessage = () => {
    if (error === 'expired') {
      return 'The verification link has expired. Please request a new verification email.';
    } else if (error === 'invalid') {
      return 'The verification link is invalid or has already been used.';
    } else if (error === 'not_found') {
      return 'The verification link could not be found. Please check your email again.';
    }
    return 'We could not verify your email address. Please try again or contact support.';
  };

  const getErrorTitle = () => {
    if (error === 'expired') {
      return 'Link Expired';
    } else if (error === 'invalid') {
      return 'Invalid Link';
    }
    return 'Verification Failed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        {/* Primary floating orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-50 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse-slow"></div>
        
        {/* Additional dynamic elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-100 rounded-full mix-blend-multiply filter blur-lg opacity-50 animate-drift-1"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200 rounded-full mix-blend-multiply filter blur-md opacity-60 animate-drift-2"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-red-50 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-drift-3"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-300 rounded-full animate-particle-1"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-particle-2"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-red-400 rounded-full animate-particle-3"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-300 hover:shadow-3xl p-8 animate-fade-in-up">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-scale-in">
                <XCircle className="w-12 h-12 text-white animate-pulse-gentle" />
              </div>
              
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 animate-slide-in-left">
                {getErrorTitle()}
              </h1>
              
              <p className="text-neutral-600 text-base leading-relaxed mb-2 animate-slide-in-right animation-delay-200">
                {getErrorMessage()}
              </p>
              
              {email && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 mt-4 animate-fade-in animation-delay-400">
                  <Mail className="w-4 h-4" />
                  {email}
                </div>
              )}
            </div>

            {/* Error Details */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 animate-fade-in animation-delay-600">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900 mb-1">
                    What Can You Do?
                  </h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Request a new verification email</li>
                    <li>• Check your spam/junk folder</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-slide-in-up animation-delay-800">
              
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleGoHome}
                  variant="secondary"
                  size="lg"
                  className="transform transition-all duration-300 hover:scale-105"
                  iconLeft={<Home className="w-5 h-5" />}
                >
                  Home
                </Button>
                
                <Button
                  onClick={handleContactSupport}
                  variant="secondary"
                  size="lg"
                  className="transform transition-all duration-300 hover:scale-105"
                  iconLeft={<Mail className="w-5 h-5" />}
                >
                  Support
                </Button>
              </div>
            </div>

            {/* Common Issues */}
            <div className="mt-6 pt-6 border-t border-neutral-200 animate-fade-in animation-delay-1000">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Common Issues:</h3>
              <ul className="text-xs text-neutral-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>Verification links expire after 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>Links can only be used once</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>Make sure you're clicking the latest verification email</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Still having issues?{" "}
              <button 
                onClick={handleContactSupport}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


