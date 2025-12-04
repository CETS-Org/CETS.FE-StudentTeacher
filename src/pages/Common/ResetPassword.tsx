import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/card";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, KeyRound } from "lucide-react";
import { api } from "@/api";
import "../../styles/login-animations.css";
import GenericNavbar from "../../Shared/GenericNavbar";
import { guestNavbarConfig } from "../../Shared/navbarConfigs";

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || "";
  const token = location.state?.token || "";

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if no email or token
  useEffect(() => {
    if (!email || !token) {
      navigate("/forgotPassword");
    }
  }, [email, token, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      console.log("Reset password data:", { email, token, password: data.password });
      
      // Call the reset password API
      const response = await api.resetPassword({
        email: email,
        newPassword: data.password,
        token: token
      });
      console.log("Reset password response:", response.data);
      
      // Show success message briefly before navigation
      setSuccessMessage("Password reset successful!");
      
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Password reset successful! Please login with your new password."
          }
        });
      }, 1500);
      
    } catch (error: any) {
      console.error("Reset password error:", error);
      const message = error.response?.data?.message || "Failed to reset password. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    
    strength = checks.filter(Boolean).length;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return "bg-red-500";
    if (strength < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return "Weak";
    if (strength < 4) return "Medium";
    return "Strong";
  };

  const watchedPassword = methods.watch("password");
  const passwordStrength = getPasswordStrength(watchedPassword);

  return (
    <div className="reset-container min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Guest Navbar */}
      <GenericNavbar config={guestNavbarConfig} fullWidth={true} />
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-accent-100 to-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-reverse"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-secondary-100 to-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-300 rounded-full animate-particle-1"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent-400 rounded-full animate-particle-2"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-secondary-300 rounded-full animate-particle-3"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-primary-400 rounded-full animate-particle-4"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-accent-300 rounded-full animate-particle-5"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md space-y-4 animate-fade-in-up">
          <Card className="login-card shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-300 mt-2 hover:shadow-3xl sm:p-8 p-6">
            {/* Header */}
            <div className="text-center mb-6 animate-slide-in-left">
              <div className="login-header-icon mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform transition-transform duration-300 hover:scale-110 animate-float">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">Reset Password</h1>
              <p className="text-neutral-600 mb-4">
                Create a new strong password for your account
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-200 text-primary-700 rounded-full text-sm font-medium border border-primary-200">
                <Shield className="w-4 h-4" />
                Password Reset
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-4 animate-slide-in-right animation-delay-200">
              {/* New Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <FormInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="New Password"
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
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

              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Password strength:</span>
                    <span className={`text-sm font-semibold transition-colors duration-200 ${
                      passwordStrength < 2 ? "text-red-600" : 
                      passwordStrength < 4 ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 transition-colors duration-200 ${watchedPassword.length >= 8 ? "text-green-500" : "text-neutral-300"}`} />
                      <span className={watchedPassword.length >= 8 ? "text-green-700" : "text-neutral-500"}>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 transition-colors duration-200 ${/[a-z]/.test(watchedPassword) ? "text-green-500" : "text-neutral-300"}`} />
                      <span className={/[a-z]/.test(watchedPassword) ? "text-green-700" : "text-neutral-500"}>Lowercase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 transition-colors duration-200 ${/[A-Z]/.test(watchedPassword) ? "text-green-500" : "text-neutral-300"}`} />
                      <span className={/[A-Z]/.test(watchedPassword) ? "text-green-700" : "text-neutral-500"}>Uppercase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 transition-colors duration-200 ${/\d/.test(watchedPassword) ? "text-green-500" : "text-neutral-300"}`} />
                      <span className={/\d/.test(watchedPassword) ? "text-green-700" : "text-neutral-500"}>Number</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <FormInput
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading || !!successMessage}
                className="w-full transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                iconLeft={<KeyRound className="w-4 h-4" />}
              >
                {isLoading ? "Resetting Password..." : successMessage ? "Password Reset!" : "Reset Password"}
              </Button>
            </Form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
              <p className="text-xs text-neutral-500">
                Need help? {" "}
                <Link
                  to="/contact"
                  className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </Card>

          {/* Additional Security Info */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Reset</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Token Verified</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Password reset successful? {" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 hover:underline transition-colors font-medium"
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