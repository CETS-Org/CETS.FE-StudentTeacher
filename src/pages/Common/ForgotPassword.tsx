import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ArrowLeft, Mail, Send } from "lucide-react";

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
  const navigate = useNavigate();

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      console.log("Forgot password data:", data);
      // TODO: Implement actual forgot password API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Navigate to OTP verification with email
      navigate("/otp-verification", { state: { email: data.email } });
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("Failed to send reset email!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-70">
      <Card className="shadow-xl border-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Forgot Password</h1>
          <p className="text-sm text-neutral-600 mt-2">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit} className="space-y-6">
          {/* Email Field */}
          <FormInput
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            autoComplete="email"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
            iconLeft={<Send className="w-4 h-4" />}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
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
          Remember your password?{" "}
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