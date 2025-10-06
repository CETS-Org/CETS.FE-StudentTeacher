import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Eye, EyeOff, UserPlus, AlertCircle, GraduationCap } from "lucide-react";
import { api } from "@/api";
import "../../styles/login-animations.css";
import GenericNavbar from "../../Shared/GenericNavbar";
import { guestNavbarConfig } from "../../Shared/navbarConfigs";
import RegistrationSuccessDialog from "../../components/auth/RegistrationSuccessDialog";

// Validation schema
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must have at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle registration blocking similar to login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }

    // Check for registration blocking
    const blockEndTime = localStorage.getItem('registerBlockEnd');
    if (blockEndTime) {
      const remaining = parseInt(blockEndTime) - Date.now();
      if (remaining > 0) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(remaining / 1000));
        
        const interval = setInterval(() => {
          const newRemaining = parseInt(blockEndTime) - Date.now();
          if (newRemaining <= 0) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            localStorage.removeItem('registerBlockEnd');
            localStorage.removeItem('registerAttempts');
            clearInterval(interval);
          } else {
            setBlockTimeRemaining(Math.ceil(newRemaining / 1000));
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        localStorage.removeItem('registerBlockEnd');
        localStorage.removeItem('registerAttempts');
      }
    }

    // Load registration attempts
    const attempts = parseInt(localStorage.getItem('registerAttempts') || '0');
    setRegistrationAttempts(attempts);
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    if (isBlocked) {
      setErrorMessage(`Too many failed attempts. Please wait ${blockTimeRemaining} seconds.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    try {   
      // Call the registration API
      const response = await api.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });     
      
      console.log("Registration successful:", response.data);
      
      // Reset registration attempts on successful registration
      setRegistrationAttempts(0);
      localStorage.removeItem('registerAttempts');
      localStorage.removeItem('registerBlockEnd');
      
      // Show success dialog instead of navigating
      setRegisteredEmail(data.email);
      setShowSuccessDialog(true);
      
    } catch (error: any) {
      console.error("Register error:", error);
      
      // Handle failed registration attempts
      const newAttempts = registrationAttempts + 1;
      setRegistrationAttempts(newAttempts);
      localStorage.setItem('registerAttempts', newAttempts.toString());
      
      // Block after 5 failed attempts for 10 minutes
      if (newAttempts >= 5) {
        const blockEndTime = Date.now() + (10 * 60 * 1000); // 10 minutes
        localStorage.setItem('registerBlockEnd', blockEndTime.toString());
        setIsBlocked(true);
        setBlockTimeRemaining(600); // 10 minutes in seconds
        setErrorMessage("Too many failed attempts. Registration temporarily blocked for 10 minutes.");
      } else {
        const remainingAttempts = 5 - newAttempts;
        let errorMsg = "Registration failed. Please try again.";
        
        // Handle different error types
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.response?.status === 400) {
          errorMsg = "Invalid data provided";
        } else if (error.response?.status === 409) {
          errorMsg = "Email already exists";
        }
        
        setErrorMessage(`${errorMsg} (${remainingAttempts} attempts remaining)`);
      }
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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Join CETS
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base transition-all duration-500">
              Create your student account to start learning
            </p>
            
            {/* Student badge */}
            <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-500 bg-blue-100 text-blue-700">
              Student Registration
            </div>
          </div>

          {/* Registration attempts warning */}
          {registrationAttempts > 0 && registrationAttempts < 5 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2 mb-4">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {5 - registrationAttempts} attempts remaining before temporary lockout
              </span>
            </div>
          )}

          {/* Blocked account warning */}
          {isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Registration Temporarily Blocked</p>
                <p className="text-xs text-red-600 mt-1">
                  Please wait {Math.floor(blockTimeRemaining / 60)}:{(blockTimeRemaining % 60).toString().padStart(2, '0')} minutes
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-4 animate-slide-in-right animation-delay-200">
            {/* Full Name Field */}
            <div className="space-y-2">
              <FormInput
                name="fullName"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                autoComplete="name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus-ring-custom"
              />
            </div>

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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <FormInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus-ring-custom"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-all duration-200 hover:scale-110"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <FormInput
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus-ring-custom"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-all duration-200 hover:scale-110"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
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
              disabled={isBlocked}
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              iconLeft={isLoading ? undefined : <UserPlus className="w-5 h-5" />}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : isBlocked ? (
                `Blocked (${Math.floor(blockTimeRemaining / 60)}:${(blockTimeRemaining % 60).toString().padStart(2, '0')})`
              ) : (
                "Create Student Account"
              )}
            </Button>
          </Form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center space-y-4">
          
          
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            By registering, you agree to our{" "}
            <a href="#" className="text-primary-600 hover:underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      </div>

      {/* Registration Success Dialog */}
      <RegistrationSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        userEmail={registeredEmail}
      />
    </div>
  );
}
