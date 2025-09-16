import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormInput, FormSelect } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Eye, EyeOff, LogIn, UserCheck } from "lucide-react";
import { api } from "@/lib/config";

// Role options
const roleOptions = [
  { value: "", label: "Select your role" },
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z
    .string()
    .min(1, "Please select a role"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// API response types
interface LoginResponse {
  message: string;
  token: string;
  account: {
    id: string;
    email: string;
    fullName: string;
    roleNames: string[];
    isVerified?: boolean;
    studentInfo?: any;
    teacherInfo?: any;
    staffInfo?:any;
  };
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Xử lý lỗi từ URL parameters (khi redirect từ Google)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, []);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
    },
  });

  const callLoginAPI = async (data: LoginFormData): Promise<LoginResponse> => {
    const { email, password, role } = data;
    const credentials = { email, password };
    
    console.log("Request payload:", credentials); // Debug log

    try {
      let response;
      
      // Call appropriate API method based on role
      switch (role) {
        case "student":
          response = await api.loginStudent(credentials);
          break;
        case "teacher":
          response = await api.loginTeacher(credentials);
          break;
        default:
          throw new Error("Invalid role selected");
      }

      console.log("Response status:", response.status); // Debug log
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        throw new Error("Wrong email or password");
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("Network error. Please check your connection.");
      } else {
        // Something else happened
        throw error;
      }
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      console.log("Login data:", data);
      
      const response = await callLoginAPI(data);
      
      // Check if account is verified
      // For testing: if email is "test.unverified@example.com", simulate unverified account
      const isVerified = response.account.isVerified ?? true;
      if (!isVerified) {
        // Account not verified - navigate to Gateway with verification state
        navigate("/gateway", {
          state: {
            showVerification: true,
            email: response.account.email
          }
        });
        return;
      }
      
      // Store token and user info in localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userInfo", JSON.stringify(response.account));
      
      // Navigate based on role
      if (data.role === "student") {
        navigate("/student/myCourses");
      } else if (data.role === "teacher") {
        navigate("/teacher/courses");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    
    try {
      // Google OAuth configuration
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/google-callback`;
      const scope = "email profile";
      
      console.log("Google OAuth Config:", { clientId, redirectUri, scope });
      
      // Create Google OAuth URL
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(scope)}&` +
        `prompt=consent`;
      
      console.log("Google Auth URL:", googleAuthUrl);
      
      // Open Google OAuth popup
      const popup = window.open(
        googleAuthUrl,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }
      
      // Listen for popup messages
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { token, userInfo } = event.data;
          
          console.log('Received from GoogleCallback:', { token, userInfo });
          
          // Store token and user info 
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          
          // Navigate based on user role from backend response
          if (userInfo.roleNames && userInfo.roleNames.includes('student')) {
            navigate("/student/myCourses");
          } else if (userInfo.roleNames && userInfo.roleNames.includes('teacher')) {
            navigate("/teacher/courses");
          } else {
            // Default navigation if role not determined
            if(!userInfo.isVerified){

            }
            if (!userInfo.isVerified) {
                  // Account not verified - navigate to Gateway with verification state
                  navigate("/gateway", {
                    state: {
                      showVerification: true,
                      email: userInfo.email
                    }
                  });
                  return;
            }
          }
          
          popup.close();
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          setErrorMessage(event.data.error || "Google login failed");
          popup.close();
          window.removeEventListener('message', messageListener);
        }
      };
      
      window.addEventListener('message', messageListener);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setIsGoogleLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Google login failed!");
      setIsGoogleLoading(false);
    }
  };



  return (
    <div className="w-full px-70 pt-40">
      <Card className="shadow-xl border-0 w-1/2 mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Login</h1>
          <p className="text-sm text-neutral-600 mt-2">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Form */}
        <Form methods={methods} onSubmit={onSubmit} className="space-y-6">{/*[!!! KEEP CHANGES BELOW]*/}
          {/* Role Selection */}
          <div className="w-40">
            <FormSelect
              name="role"
              label="Role"
              options={roleOptions}
              className="text-sm py-1.5 px-2"
            />
          </div>

          {/* Email Field */}
          <FormInput
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            autoComplete="email"
          />

          {/* Password Field */}
          <div className="relative">
            <FormInput
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
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

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgotPassword"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
            iconLeft={<UserCheck className="w-4 h-4" />}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </Form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <Button
          type="button"        
          size="lg"
          loading={isGoogleLoading}
          onClick={handleGoogleLogin}
          className="w-full border-neutral-300 "
          iconLeft={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          {isGoogleLoading ? "Signing in with Google..." : "Continue with Google"}
        </Button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>
      </Card>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
