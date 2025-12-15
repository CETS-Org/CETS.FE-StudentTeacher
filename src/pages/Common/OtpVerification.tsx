import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/card";
import { ArrowLeft, Shield, RotateCcw, Check, AlertCircle, CheckCircle, Mail, Clock } from "lucide-react";
import { api } from "@/api";
import "../../styles/login-animations.css";
import GenericNavbar from "../../Shared/GenericNavbar";
import { guestNavbarConfig } from "../../Shared/navbarConfigs";

// Validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function OtpVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const token = location.state?.token || "";
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const methods = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Redirect if no email
  // useEffect(() => {
  //   if (!email) {
  //     navigate("/forgotPassword");
  //   }
  // }, [email, navigate]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Update form value
    methods.setValue("otp", newOtp.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      methods.setValue("otp", pastedData);
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
   
    
    if (!email || !token) {
      setErrorMessage("Missing email or token. Please restart the password reset process.");
      setIsLoading(false);
      return;
    }
    
    try {
    
      // Call the OTP verification API
      const response = await api.verifyOtp({
        email: email,
        otp: data.otp,
        token: token
      });
      
      // Store the new token from response for password reset
      const newToken = response.data.token;
      
      // Show success message briefly before navigation
      setSuccessMessage("Code verified successfully!");
      setVerificationAttempts(0);
      
      setTimeout(() => {
        // Navigate to reset password with email and new token
        navigate("/resetPassword", { 
          state: { 
            email: email, 
            token: newToken 
          } 
        });
      }, 1500);
      
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      // Handle failed verification attempts
      const newAttempts = verificationAttempts + 1;
      setVerificationAttempts(newAttempts);
      
      let errorMsg = "Invalid verification code. Please try again.";
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMsg = "Invalid or expired verification code";
      } else if (error.response?.status === 429) {
        errorMsg = "Too many attempts. Please request a new code.";
      }
      
      if (newAttempts >= 3) {
        errorMsg += " Please request a new verification code.";
        setCountdown(0);
        setCanResend(true);
      }
      
      setErrorMessage(errorMsg);
      
      // Reset OTP inputs
      setOtp(["", "", "", "", "", ""]);
      methods.setValue("otp", "");
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      // Call the forgot password API again to resend OTP
      const response = await api.forgotPassword(email);
      
      // Update token for future verification
      // const newToken = response.data; // Token updated but not used in this scope
      
      // Reset countdown and attempts
      setCountdown(60);
      setCanResend(false);
      setVerificationAttempts(0);
      setSuccessMessage("New verification code sent!");
      
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      let errorMsg = "Failed to resend verification code!";
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 429) {
        errorMsg = "Too many requests. Please wait before trying again.";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <div className="login-container min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Guest Navbar */}
      <GenericNavbar 
        config={guestNavbarConfig}
        fullWidth={true}
        collapsed={false}
      />
      
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        {/* Primary floating orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse-slow"></div>
        
        {/* Additional dynamic elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-lg opacity-50 animate-drift-1"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-200 rounded-full mix-blend-multiply filter blur-md opacity-60 animate-drift-2"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-primary-50 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-drift-3"></div>
        <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-blue-200 rounded-full mix-blend-multiply filter blur-md opacity-50 animate-drift-4"></div>
        
        {/* Gradient waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/20 to-transparent animate-wave-1"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-indigo-50/15 to-transparent animate-wave-2"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-grid-shift"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-particle-1"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-particle-2"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-accent-100 rounded-full animate-particle-3"></div>
        <div className="absolute top-1/3 right-1/2 w-1 h-1 bg-blue-400 rounded-full animate-particle-4"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-indigo-300 rounded-full animate-particle-5"></div>
      </div>
      
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      
      <div className="relative w-full max-w-md space-y-4 animate-fade-in-up">
        <Card className="login-card shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-300 mt-2 hover:shadow-3xl sm:p-8 p-6">
          {/* Header */}
          <div className="text-center mb-6 animate-slide-in-left">
            <div className="login-header-icon mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform transition-transform duration-300 hover:scale-110 animate-float">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base transition-all duration-500 mb-2">
              We've sent a 6-digit verification code to
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-success-200 text-primary-700 rounded-full text-sm font-medium border border-primary-200">
              <Shield className="w-4 h-4" />
              Email Verification
            </div>
            <br></br>
            <p className="text-neutral-900 font-semibold text-sm bg-neutral-100 px-3 py-1 rounded-full inline-block ">
              {maskedEmail}
            </p>
            
          
          </div>

          {/* Verification attempts warning */}
          {verificationAttempts > 0 && verificationAttempts < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2 mb-4">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {3 - verificationAttempts} attempts remaining
              </span>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2 animate-shake mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                {successMessage.includes("verified") && (
                  <p className="text-xs text-green-600 mt-1">Redirecting to password reset...</p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-6 animate-slide-in-right animation-delay-200">
            {/* OTP Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-700 text-center">
                Enter Verification Code
              </label>
              
              {/* Enhanced OTP Input Grid */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 ${
                      digit 
                        ? 'border-secondary-300 bg-secondary-200 text-primary-900 shadow-sm' 
                        : 'border-neutral-300 hover:border-neutral-400'
                    } focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 focus:scale-110`}
                    aria-label={`Verification code digit ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center">
                <div className="text-xs text-neutral-500">
                  {otp.filter(d => d).length}/6 digits entered
                </div>
              </div>
            </div>

            {/* Resend OTP Section */}
            <div className="text-center space-y-3">
              {!canResend ? (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <p className="text-sm text-neutral-600">
                    Didn't receive the code? Resend in{" "}
                    <span className="font-semibold text-primary-600">{countdown}s</span>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-semibold hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105"
                >
                  <RotateCcw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Sending New Code..." : "Resend Verification Code"}
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={otp.join("").length !== 6 || successMessage !== ""}
              className="w-full bg-success-600 hover:bg-success-700 focus:ring-success-500 transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              iconLeft={isLoading ? undefined : <Check className="w-5 h-5" />}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Code...</span>
                </div>
              ) : successMessage.includes("verified") ? (
                "Code Verified!"
              ) : (
                "Verify Code"
              )}
            </Button>
          </Form>

          {/* Back to Forgot Password */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <Link
              to="/forgotPassword"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Email Entry
            </Link>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-xs text-neutral-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure Verification</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Email Protected</span>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Having trouble?{" "}
            <a href="#" className="text-primary-600 hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}