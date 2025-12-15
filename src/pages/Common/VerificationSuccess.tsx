import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/card';
import { usePageTitle } from '@/hooks/usePageTitle';
import '../../styles/login-animations.css';

export default function VerificationSuccess() {
  usePageTitle("Verification Success");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  // Auto redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        {/* Primary floating orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-50 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse-slow"></div>
        
        {/* Additional dynamic elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-100 rounded-full mix-blend-multiply filter blur-lg opacity-50 animate-drift-1"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-200 rounded-full mix-blend-multiply filter blur-md opacity-60 animate-drift-2"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-50 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-drift-3"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300 rounded-full animate-particle-1"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-particle-2"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-particle-3"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-300 hover:shadow-3xl p-8 animate-fade-in-up">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-scale-in">
                <CheckCircle className="w-12 h-12 text-white animate-pulse-gentle" />
              </div>
              
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 animate-slide-in-left">
                Verification Successful!
              </h1>
              
              <p className="text-neutral-600 text-base leading-relaxed mb-2 animate-slide-in-right animation-delay-200">
                Your email has been verified successfully. You can now access all features of your account.
              </p>
              
              {email && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 mt-4 animate-fade-in animation-delay-400">
                  <CheckCircle className="w-4 h-4" />
                  {email}
                </div>
              )}
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-fade-in animation-delay-600">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900 mb-1">
                    What's Next?
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ Sign in to your account</li>
                    <li>✓ Complete your profile</li>
                    <li>✓ Start exploring courses</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-slide-in-up animation-delay-800">
              <Button
                onClick={handleGoToLogin}
                variant="primary"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 transform transition-all duration-300 hover:scale-105"
                iconLeft={<ArrowRight className="w-5 h-5" />}
              >
                Sign In Now
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="secondary"
                size="lg"
                className="w-full transform transition-all duration-300 hover:scale-105"
                iconLeft={<Home className="w-5 h-5" />}
              >
                Go to Home
              </Button>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mt-6 text-center animate-fade-in animation-delay-1000">
              <p className="text-xs text-neutral-500">
                You will be automatically redirected to login page in 5 seconds...
              </p>
            </div>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Need help?{" "}
              <a href="#" className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


