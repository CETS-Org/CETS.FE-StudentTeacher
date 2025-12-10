import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, FileCheck, X, Sparkles } from "lucide-react";
import CoursesSection from "./components/CoursesSection";
import PackagesSection from "./components/PackagesSection";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import courseBgImage from "@/assets/course-bg.png";
import { isTokenValid, getUserInfo } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import VerificationDialog from "@/components/ui/VerificationDialog";
import PlacementTestConfirmationDialog from "@/components/ui/PlacementTestConfirmationDialog";
import { api } from "@/api";

export default function CourseAll() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  const [showPlacementTestMessage, setShowPlacementTestMessage] = useState(true);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showPlacementTestDialog, setShowPlacementTestDialog] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Handle hash navigation
    if (location.hash) {
      const hash = location.hash.substring(1);
      const scrollToElement = () => {
        const element = document.getElementById(hash);
        if (element) {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            // Account for fixed header/navbar and spacing (approximately 100px)
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          });
        }
      };

      // Try immediately after a small delay to let React render
      const immediateId = setTimeout(scrollToElement, 50);
      
      // Also try after a delay to ensure content is loaded
      const timeoutId = setTimeout(scrollToElement, 300);
      
      // And try after images/content might have loaded
      const longTimeoutId = setTimeout(scrollToElement, 800);

      return () => {
        clearTimeout(immediateId);
        clearTimeout(timeoutId);
        clearTimeout(longTimeoutId);
      };
    }

    // Check if user has seen the placement test message before
    const hasSeenMessage = localStorage.getItem('placementTestMessageSeen');
    if (hasSeenMessage === 'true') {
      setShowPlacementTestMessage(false);
    }

    // Check if user is logged in and not verified
    if (isTokenValid()) {
      const userInfo = getUserInfo();
      
      if (userInfo && userInfo.isVerified === false) {
        setUserEmail(userInfo.email || "");
        
        // Use a combination of userId and a flag to track if dialog was shown
        // This ensures dialog shows at least once per page visit for unverified users
        const dialogKey = `verificationDialog_${userInfo.id}_shown`;
        const hasSeenInThisVisit = sessionStorage.getItem(dialogKey);
        
        if (!hasSeenInThisVisit) {
          setShowVerificationDialog(true);
        }
      }
    }
  }, [location]);

  const handleDismissMessage = () => {
    setShowPlacementTestMessage(false);
    localStorage.setItem('placementTestMessageSeen', 'true');
  };

  const handleResendVerification = async () => {
    try {
      await api.resendVerificationEmail(userEmail);
      showSuccess('Verification email has been resent successfully!');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      showError('Failed to resend verification email. Please try again later.');
      throw error;
    }
  };

  const handleCloseVerificationDialog = () => {
    setShowVerificationDialog(false);
    // Remember that user has seen the dialog for this page visit
    const userInfo = getUserInfo();
    if (userInfo?.id) {
      const dialogKey = `verificationDialog_${userInfo.id}_shown`;
      sessionStorage.setItem(dialogKey, 'true');
    }
  };

  const handleConfirmPlacementTest = () => {
    setShowPlacementTestDialog(false);
    navigate('/student/placement-test');
  };

  return (
    <>
      {/* Verification Dialog */}
      <VerificationDialog
        isOpen={showVerificationDialog}
        onClose={handleCloseVerificationDialog}
        onResendVerification={handleResendVerification}
        userEmail={userEmail}
      />
      
      {/* Placement Test Confirmation Dialog */}
      <PlacementTestConfirmationDialog
        isOpen={showPlacementTestDialog}
        onClose={() => setShowPlacementTestDialog(false)}
        onConfirm={handleConfirmPlacementTest}
      />

    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xs"
            style={{ backgroundImage: `url(${courseBgImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/40 via-primary-500/30 to-primary-500/40"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary-300/10 rounded-full blur-3xl"></div>
        </div>
      
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-36">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white drop-shadow-2xl whitespace-nowrap">
                Learn Without Limits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-5xl mx-auto leading-normal drop-shadow-lg">
              Interactive lessons, real-world practice, and personalized feedback from expert instructors.
              <br />
              Choose individual courses or save with our course packages.
            </p>

          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-32 left-10 w-20 h-20 bg-gradient-to-br from-accent-500 to-primary-600 rounded-2xl rotate-12 animate-bounce opacity-20"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl -rotate-12 animate-bounce delay-1000 opacity-25"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* Courses Section */}
      <CoursesSection />

      {/* Section Divider */}
      <div className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-200 via-accent-100 to-secondary-200"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full mb-4"></div>
            <p className="text-lg text-neutral-600 font-medium">
              Or explore our money-saving course combos below
            </p>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <PackagesSection />

      {/* Floating Action Button - Placement Test with Enhanced Effects */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {/* Notification Message - Always visible (can be dismissed) */}
        {showPlacementTestMessage && (
          <div className="relative animate-in slide-in-from-right-4 fade-in-0 duration-500">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-3 rounded-xl shadow-2xl max-w-xs md:max-w-sm border-2 border-white/20">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1">Take Placement Test Now!</p>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Find courses that match your level. Click the button below to get started.
                  </p>
                </div>
                <button
                  onClick={handleDismissMessage}
                  className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Arrow pointing to button */}
            <div className="absolute bottom-0 right-6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-primary-600 transform translate-y-full"></div>
          </div>
        )}

        {/* FAB Button with enhanced animations */}
        <button
          onClick={() => {
            // Check if user is logged in
            if (!isTokenValid()) {
              showError("Bạn cần đăng nhập để làm bài Placement Test. Vui lòng đăng nhập trước.");
              navigate('/login');
              return;
            }
            setShowPlacementTestDialog(true);
            handleDismissMessage(); // Auto-dismiss message when clicked
          }}
          className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-2xl hover:shadow-primary-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group animate-bounce"
          style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
          title="Take Placement Test to find suitable courses"
        >
          {/* Glowing ring effect */}
          <div className="absolute inset-0 rounded-full bg-primary-400 opacity-75 animate-ping" style={{ animationDuration: '2s' }}></div>
          
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-primary-500/50 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Badge NEW */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg border-2 border-white">
            NEW
          </div>
          
          {/* Icon */}
          <FileCheck className="relative z-10 w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
          
          {/* Always visible tooltip on mobile */}
          <div className="absolute right-full mr-3 md:hidden bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            Take Test
          </div>
          
          {/* Tooltip on desktop hover */}
          <div className="absolute right-full mr-4 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              <div className="font-semibold mb-1">Placement Test</div>
              <div className="text-xs text-gray-300">Find courses that suit you</div>
            </div>
          </div>
        </button>
      </div>
    </div>
    </>
  );
}