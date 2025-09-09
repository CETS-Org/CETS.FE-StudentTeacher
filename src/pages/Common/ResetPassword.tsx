import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

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
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const methods = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if no email or OTP
  useState(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      console.log("Reset password data:", { email, otp, password: data.password });
      // TODO: Implement actual reset password API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Show success message and redirect to login
      alert("Password reset successful! Please login with your new password.");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Failed to reset password!");
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
    <div className="w-full px-70">
      <Card className="shadow-xl border-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Reset Password</h1>
          <p className="text-sm text-neutral-600 mt-2">
            Create a new strong password for your account
          </p>
        </div>

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="relative">
            <FormInput
              name="password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              placeholder="Enter your new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? (
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
              label="Confirm Password"
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
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </Form>

        {/* Back to Login */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </Card>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          Password changed successfully?{" "}
          <Link
            to="/login"
            className="text-primary-600 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}