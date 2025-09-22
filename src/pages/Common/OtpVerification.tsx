import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ArrowLeft, Shield, RotateCcw, Check } from "lucide-react";
import { api } from "@/lib/config";

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
    try {
      console.log("OTP verification data:", data);
      
      // Call the OTP verification API
      const response = await api.verifyOtp({
        email: email,
        otp: data.otp,
        token: token
      });
      console.log("OTP verification response:", response.data);
      
      // Store the new token from response for password reset
      const newToken = response.data.token;
      
      // Navigate to reset password with email and new token
      navigate("/resetPassword", { 
        state: { 
          email: email, 
          token: newToken 
        } 
      });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const errorMessage = error.response?.data?.message || "Invalid OTP code!";
      alert(errorMessage);
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
    try {
      console.log("Resending OTP to:", email);
      
      // Call the forgot password API again to resend OTP
      const response = await api.forgotPassword(email);
      console.log("Resend OTP response:", response.data);
      
      // Update token for future verification
      const newToken = response.data;
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      alert("Verification code sent!");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage = error.response?.data?.message || "Failed to resend verification code!";
      alert(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <div className="w-full px-70 pt-40">
      <Card className="shadow-xl border-0 w-1/2 mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Verify Your Email</h1>
          <p className="text-sm text-neutral-600 mt-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-neutral-900 mt-1">{maskedEmail}</p>
        </div>

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-3 mb-4">
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
                  className="w-12 h-12 text-center text-lg font-semibold border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ))}
            </div>
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-neutral-600">
                Didn't receive the code? Resend in{" "}
                <span className="font-medium text-primary-600">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={otp.join("").length !== 6}
            className="w-full"
            iconLeft={<Check className="w-4 h-4" />}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
        </Form>

        {/* Back to Forgot Password */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Email Entry
          </Link>
        </div>
      </Card>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          Having trouble?{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}