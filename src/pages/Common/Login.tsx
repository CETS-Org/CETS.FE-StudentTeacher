import { useState } from "react";
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
  { value: "accountant", label: "Accountant Staff" },
  { value: "academic", label: "Academic Staff" },
  { value: "admin", label: "Admin" },
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
  };
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        case "accountant":
        case "academic":
        case "admin":
          throw new Error(`Login for ${role} role is not implemented yet`);
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
        const errorMessage = error.response.data?.message || `HTTP error! status: ${error.response.status}`;
        throw new Error(errorMessage);
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
    try {
      console.log("Login data:", data);
      
      const response = await callLoginAPI(data);
      
      // Check if account is verified
      // For testing: if email is "test.unverified@example.com", simulate unverified account
      const isVerified = data.email === "test.unverified@example.com" 
        ? false 
        : (response.account.isVerified ?? true); // Default to true if not present
      
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
      alert(error instanceof Error ? error.message : "Login failed!");
    } finally {
      setIsLoading(false);
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
