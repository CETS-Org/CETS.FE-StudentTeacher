import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Shield, KeyRound } from "lucide-react";
import { api } from "@/lib/config";
import "../../styles/login-animations.css";
import GenericNavbar from "../../Shared/GenericNavbar";
import { guestNavbarConfig } from "../../Shared/navbarConfigs";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // TEMPORARILY DISABLED - Blocking state variables
  // const [resetAttempts, setResetAttempts] = useState(0);
  // const [isBlocked, setIsBlocked] = useState(false);
  // const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const navigate = useNavigate();

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle reset blocking and load attempts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }

    // Check for reset blocking - TEMPORARILY DISABLED
    // const blockEndTime = localStorage.getItem('resetBlockEnd');
    // if (blockEndTime) {
    //   const remaining = parseInt(blockEndTime) - Date.now();
    //   if (remaining > 0) {
    //     setIsBlocked(true);
    //     setBlockTimeRemaining(Math.ceil(remaining / 1000));
        
    //     const interval = setInterval(() => {
    //       const newRemaining = parseInt(blockEndTime) - Date.now();
    //       if (newRemaining <= 0) {
    //         setIsBlocked(false);
    //         setBlockTimeRemaining(0);
    //         localStorage.removeItem('resetBlockEnd');
    //         localStorage.removeItem('resetAttempts');
    //         clearInterval(interval);
    //       } else {
    //         setBlockTimeRemaining(Math.ceil(newRemaining / 1000));
    //       }
    //     }, 1000);

    //     return () => clearInterval(interval);
    //   } else {
    //     localStorage.removeItem('resetBlockEnd');
    //     localStorage.removeItem('resetAttempts');
    //   }
    // }

    // Load reset attempts - TEMPORARILY DISABLED
    // const attempts = parseInt(localStorage.getItem('resetAttempts') || '0');
    // setResetAttempts(attempts);
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // TEMPORARILY DISABLED - Reset blocking check
    // if (isBlocked) {
    //   setErrorMessage(`Too many reset attempts. Please wait ${blockTimeRemaining} seconds.`);
    //   return;
    // }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      console.log("Forgot password data:", data);
      
      // Call the forgot password API
      const response = await api.forgotPassword(data.email);
      console.log("Forgot password response:", response.data);
      
      // Reset attempts on successful request - TEMPORARILY DISABLED
      // setResetAttempts(0);
      // localStorage.removeItem('resetAttempts');
      // localStorage.removeItem('resetBlockEnd');
      
      // Store the token from response for OTP verification
      const token = response.data;
      
      // Show success message briefly before navigation
      setSuccessMessage("Verification code sent successfully!");
      
      setTimeout(() => {
        // Navigate to OTP verification with email and token
        navigate("/otpVerification", { 
          state: { 
            email: data.email,
            token: token 
          } 
        });
      }, 1500);
      
    } catch (error: any) {
      console.error("Forgot password error:", error);
      
      // Handle failed reset attempts - TEMPORARILY DISABLED
      // const newAttempts = resetAttempts + 1;
      // setResetAttempts(newAttempts);
      // localStorage.setItem('resetAttempts', newAttempts.toString());
      
      // Block after 3 failed attempts for 5 minutes - TEMPORARILY DISABLED
      // if (newAttempts >= 5) {
      //   const blockEndTime = Date.now() + (5 * 60 * 1000);
      //   localStorage.setItem('resetBlockEnd', blockEndTime.toString());
      //   setIsBlocked(true);
      //   setBlockTimeRemaining(900); // 15 minutes in seconds
      //   setErrorMessage("Too many reset attempts. Password reset temporarily blocked for 15 minutes.");
      // } else {
      //   const remainingAttempts = 5 - newAttempts;
      //   let errorMsg = "Failed to send reset email. Please try again.";
        
      //   if (error.response?.data?.message) {
      //     errorMsg = error.response.data.message;
      //   } else if (error.response?.status === 404) {
      //     errorMsg = "Email address not found";
      //   } else if (error.response?.status === 429) {
      //     errorMsg = "Too many requests. Please wait before trying again.";
      //   }
        
      //   setErrorMessage(`${errorMsg} (${remainingAttempts} attempts remaining)`);
      // }

      // Simple error handling without blocking - TEMPORARY
      let errorMsg = "Failed to send reset email. Please try again.";
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMsg = "Email address not found";
      } else if (error.response?.status === 429) {
        errorMsg = "Too many requests. Please wait before trying again.";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Reset Password
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base transition-all duration-500">
              Enter your email address and we'll send you a verification code
            </p>
            
            {/* Reset badge */}
            <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-500 bg-orange-100 text-orange-700">
              Password Recovery
            </div>
          </div>

          {/* Reset attempts warning - TEMPORARILY DISABLED */}
          {/* {resetAttempts > 0 && resetAttempts < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2 mb-4">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {3 - resetAttempts} attempts remaining before temporary lockout
              </span>
            </div>
          )} */}

          {/* Blocked account warning - TEMPORARILY DISABLED */}
          {/* {isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Password Reset Temporarily Blocked</p>
                <p className="text-xs text-red-600 mt-1">
                  Please wait {Math.floor(blockTimeRemaining / 60)}:{(blockTimeRemaining % 60).toString().padStart(2, '0')} minutes
                </p>
              </div>
            </div>
          )} */}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                <p className="text-xs text-green-600 mt-1">Redirecting to verification page...</p>
              </div>
            </div>
          )}

          {/* Form */}
          <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-4 animate-slide-in-right animation-delay-200">
            {/* Email Field */}
            <div className="space-y-2">
              <FormInput
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                autoComplete="email"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus-ring-custom"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={successMessage !== ""}
              className="w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              iconLeft={isLoading ? undefined : <Send className="w-5 h-5" />}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Code...</span>
                </div>
              ) : successMessage ? (
                "Code Sent!"
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </Form>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-xs text-neutral-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure Reset</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Email Verified</span>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}