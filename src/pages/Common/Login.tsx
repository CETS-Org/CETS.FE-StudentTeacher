import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/card";
import { Eye, EyeOff, UserCheck, CheckCircle, AlertCircle, BookOpen, GraduationCap, Users } from "lucide-react";
import { api } from "@/api";
import "../../styles/login-animations.css";
import GenericNavbar from "../../Shared/GenericNavbar";
import { guestNavbarConfig } from "../../Shared/navbarConfigs";

// Role options for tabs
const roleOptions = [
  { 
    value: "student", 
    label: "Student", 
    icon: GraduationCap,
    color: "blue"
  },
  { 
    value: "teacher", 
    label: "Teacher", 
    icon: Users,
    color: "green"
  },
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
    phoneNumber?: string;
    roleNames: string[];
    isVerified?: boolean;
    avatarUrl?: string;
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
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return URL and message from navigation state
  const returnUrl = location.state?.returnUrl;
  const loginMessage = location.state?.message;

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  // Update form when role tab changes
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    methods.setValue('role', role);
    setErrorMessage(""); // Clear any existing errors when switching roles
  };

  // Load remember me preference and handle URL errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }

    // Load remember me preference
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(savedRememberMe);
    
    if (savedRememberMe) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        methods.setValue('email', savedEmail);
      }
    }

  }, [methods]);

  const callLoginAPI = async (data: LoginFormData): Promise<LoginResponse> => {
    const { email, password, role } = data;
    const credentials = { email, password };

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
      const response = await callLoginAPI(data);
      
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      
      // Normalize field names: convert PascalCase to camelCase for consistency
      const normalizedAccount = {
        ...response.account,
        phoneNumber: (response.account as any).PhoneNumber || response.account.phoneNumber || "",
        fullName: (response.account as any).FullName || response.account.fullName || "",
        avatarUrl: (response.account as any).AvatarUrl || response.account.avatarUrl,
        // Use !== undefined to preserve false values
        isVerified: (response.account as any).IsVerified !== undefined 
          ? (response.account as any).IsVerified 
          : (response.account.isVerified !== undefined ? response.account.isVerified : true),
        roleNames: (response.account as any).RoleNames || response.account.roleNames || []
      };
      
      // Always store token and user info in localStorage first
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userInfo", JSON.stringify(normalizedAccount));
      
      // Check if account is verified and navigate accordingly
      if (!normalizedAccount.isVerified) {
        // Redirect to courses page for unverified accounts to show popup
        navigate("/courses");
        return;
      }
      
      // Navigate to return URL or default based on role for verified users
      if (returnUrl) {
        navigate(returnUrl);
      } else if (data.role === "student") {
        navigate("/student/my-classes");
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
      
      // Create Google OAuth URL
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(scope)}&` +
        `prompt=consent`;
      
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
          
          // Store token and user info 
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          
          // Navigate based on user role from backend response
          if (!userInfo.isVerified) {
            // Account not verified - redirect to courses page to show verification popup
            navigate("/courses");
          } else if (userInfo.roleNames && userInfo.roleNames.includes('Student')) {
            navigate("/student/my-classes");
          } else if (userInfo.roleNames && userInfo.roleNames.includes('Teacher')) {
            navigate("/teacher/courses");
          } else {
            // Default navigation for verified users without specific role
            navigate("/");
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
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base transition-all duration-500">
              {selectedRole === 'student' 
                ? 'Sign in to access your courses and assignments' 
                : 'Sign in to manage your classes and students'
              }
            </p>
            
            {/* Role-based subtitle */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border transition-all duration-500 mt-2 ${
              selectedRole === 'student' 
                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                : 'bg-green-100 text-green-700 border-green-200'
            }`}>
              {selectedRole === 'student' ? (
                <GraduationCap className="w-4 h-4" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              {selectedRole === 'student' ? 'Student Portal' : 'Teacher Dashboard'}
            </div>
           
          </div>



          {/* Role Tabs */}
          <div className="space-y-2 animate-slide-in-right animation-delay-200 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 text-center block">Choose Your Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => {
                  const IconComponent = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleChange(role.value)}
                      className={`
                        role-tab relative px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isSelected 
                          ? `role-tab-selected ${role.color === 'blue' 
                            ? 'role-tab-student-selected border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200' 
                            : 'role-tab-teacher-selected border-green-500 bg-green-50 text-green-700 shadow-md ring-2 ring-green-200'}`
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:shadow-sm'
                        }
                      `}
                      aria-pressed={isSelected}
                      aria-label={`Select ${role.label} role`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className={`role-checkmark absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          role.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                        } animate-pulse-gentle`}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-md transition-all duration-300 ${
                          isSelected 
                            ? role.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                            : 'bg-neutral-100'
                        }`}>
                          <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                            isSelected 
                              ? `role-icon-pulse ${role.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`
                              : 'text-neutral-500'
                          }`} />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`font-medium text-sm transition-colors duration-300 ${
                            isSelected ? 'text-current' : 'text-neutral-700'
                          }`}>
                            {role.label}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form */}
          <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-4">

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
              autoComplete="current-password"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-neutral-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              
            <Link
              to="/forgotPassword"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

            {/* Error Message */}
            {loginMessage && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{loginMessage}</span>
              </div>
            )}
            
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
              disabled={isLoading}
              className={`w-full transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 ${
                selectedRole === 'student' 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
              iconLeft={isLoading ? undefined : <UserCheck className="w-5 h-5" />}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                `Sign In as ${selectedRole === 'student' ? 'Student' : 'Teacher'}`
              )}
          </Button>
        </Form>

        {/* Divider */}
          <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <Button
          type="button"        
          size="lg"
          loading={isGoogleLoading}
            disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          iconLeft={
              !isGoogleLoading && (
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
              )
            }
          >
            {isGoogleLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in with Google...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-primary">
                Sign in with Google account
              </div>
            )}
        </Button>

        {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{" "}
            <Link
              to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors"
            >
                Create Account
            </Link>
          </p>
        </div>
      </Card>

      {/* Additional Info */}
        <div className="mt-6 text-center space-y-4">
          
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          By signing in, you agree to our{" "}
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
    </div>
  );
}
