import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, Lock } from "lucide-react";
import { api } from "@/api";
import { clearAuthData } from "@/lib/utils";

// Validation schema
const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      // Get user email from localStorage
      const userData = localStorage.getItem('userInfo');
      const authToken = localStorage.getItem('authToken');
      
      console.log("Auth token exists:", !!authToken); // Debug log
      console.log("User data exists:", !!userData); // Debug log
      
      if (!userData) {
        alert("User information not found. Please login again.");
        navigate("/login");
        return;
      }
      
      if (!authToken) {
        alert("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const email = JSON.parse(userData).email;
      console.log("Using email for change password:", email); // Debug log
      console.log("JWT Token will be automatically attached to the request via axios interceptor");

      // Call the change password API (JWT token will be automatically attached by interceptor)
      const response = await api.changePassword({
        email: email,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      
      console.log("Change password response:", response);
      
      // Show success message and redirect
      alert("Password changed successfully!");
      navigate(-1); // Go back to previous page
    } catch (error: any) {
      console.error("Change password error:", error);
      console.error("Error response:", error.response); // Debug log
      
      // Handle different error types
      if (error.response?.status === 400) {
        alert("Invalid request. Please check your information and try again.");
      } else if (error.response?.status === 401) {
        // JWT authorization error - token expired or invalid
        alert("Session expired. Please login again.");
        clearAuthData();
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("Access denied. Insufficient permissions.");
        navigate("/login");
      } else if (error.response?.status === 404) {
        alert("Account not found. Please login again.");
        navigate("/login");
      } else if (error.message?.includes('Authentication token not found')) {
        alert("Authentication required. Please login again.");
        navigate("/login");
      } else if (error.message?.includes('Session expired')) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        alert("Failed to change password. Please try again later.");
      }
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

  const watchedPassword = methods.watch("newPassword");
  const passwordStrength = getPasswordStrength(watchedPassword);

  return (
    <div className="w-full px-70 pt-40">
      <Card className="shadow-xl border-0 w-1/2 mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Change Password</h1>
          <p className="text-sm text-neutral-600 mt-2">
            Enter your current password and create a new secure password for your account.
          </p>
        </div>

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit} className="space-y-6">
          {/* Old Password Field */}
          <div className="relative">
            <FormInput
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              label="Old Password *"
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showOldPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* New Password Field */}
          <div className="relative">
            <FormInput
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              label="New Password *"
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {watchedPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Password strength:</span>
                <span className={`text-sm font-medium ${
                  passwordStrength < 2 ? "text-red-600" : 
                  passwordStrength < 4 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
              <div className="text-xs text-neutral-500 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-3 h-3 ${watchedPassword.length >= 8 ? "text-green-500" : "text-neutral-300"}`} />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-3 h-3 ${/[a-z]/.test(watchedPassword) ? "text-green-500" : "text-neutral-300"}`} />
                  <span>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(watchedPassword) ? "text-green-500" : "text-neutral-300"}`} />
                  <span>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-3 h-3 ${/\d/.test(watchedPassword) ? "text-green-500" : "text-neutral-300"}`} />
                  <span>One number</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="relative">
            <FormInput
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password *"
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
            iconLeft={<CheckCircle className="w-4 h-4" />}
          >
            {isLoading ? "Processing..." : "Change Password"}
          </Button>
        </Form>

        {/* Back to Previous Page */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            ← Back to Previous Page
          </button>
        </div>
      </Card>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          Password changed successfully?{" "}
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:underline"
          >
            Return to dashboard
          </button>
        </p>
      </div>
    </div>
  );
}
