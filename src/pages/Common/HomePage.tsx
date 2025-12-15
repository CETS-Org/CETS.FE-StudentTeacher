import { useNavigate, useLocation } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/card";
import HeroImage from "../../assets/Gateway1.png";
import { useState, useEffect } from "react";
import { isTokenValid, getUserInfo } from "@/lib/utils";
import VerificationDialog from "@/components/ui/VerificationDialog";
import { api } from "@/api";
import { useToast } from "@/hooks/useToast";

export default function HomePage() {
  usePageTitle("Home - Online Learning Platform");
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError, success: showSuccess } = useToast();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Check if user is logged in and not verified
  useEffect(() => {
    if (isTokenValid()) {
      const userInfo = getUserInfo();
      if (userInfo && userInfo.isVerified === false) {
        setUserEmail(userInfo.email || "");
        // Use a combination of userId and a flag to track if dialog was shown
        const dialogKey = `verificationDialog_${userInfo.id}_shown`;
        const hasSeenInThisVisit = sessionStorage.getItem(dialogKey);
        if (!hasSeenInThisVisit) {
          setShowVerificationDialog(true);
        }
      }
    }
  }, []);

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  const handleResendVerification = async () => {
    try {
      await api.resendVerificationEmail(userEmail);
      showSuccess('Verification email has been resent successfully!');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      showError('Failed to resend verification email. Please try again later.');
      throw error;
    }
  };

  const handleCloseVerificationDialog = () => {
    setShowVerificationDialog(false);
    // Remember that user has seen the dialog for this page visit
    const userInfo = getUserInfo();
    if (userInfo?.id) {
      const dialogKey = `verificationDialog_${userInfo.id}_shown`;
      sessionStorage.setItem(dialogKey, 'true');
    }
  };

  // Featured courses data
  const featuredCourses = [
    {
      id: 1,
      category: "Programming",
      title: "JavaScript Fundamentals",
      description: "Learn JavaScript from basic concepts to advanced techniques with practical examples.",
      price: "$299",
      rating: 4.8,
      students: 1250,
      level: "Beginner"
    },
    {
      id: 2,
      category: "Design",
      title: "UI/UX Design Principles",
      description: "Master modern design principles and create stunning user experiences.",
      price: "$399",
      rating: 4.9,
      students: 890,
      level: "Intermediate"
    },
    {
      id: 3,
      category: "Marketing", 
      title: "Digital Marketing Strategy",
      description: "Build effective marketing campaigns using modern digital tools and analytics.",
      price: "$349",
      rating: 4.7,
      students: 654,
      level: "Beginner"
    }
  ];

  return (
    <>
      {/* Verification Dialog */}
      <VerificationDialog
        isOpen={showVerificationDialog}
        onClose={handleCloseVerificationDialog}
        onResendVerification={handleResendVerification}
        userEmail={userEmail}
      />

    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-accent-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                The leading{" "}
                <span className="text-primary-600">online learning</span>{" "}
                platform
              </h1>
              
              <p className="text-lg text-neutral-600 leading-relaxed">
                Discover thousands of high-quality courses from industry experts. 
                Learn anytime, anywhere with modern technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base px-8 py-4" onClick={handleExploreCourses}>
                Explore Courses
              </Button>
              <Button variant="secondary" size="lg" className="text-base px-8 py-4">
                Watch Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">15K+</div>
                <div className="text-sm text-neutral-500">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">1.2K+</div>
                <div className="text-sm text-neutral-500">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">98%</div>
                <div className="text-sm text-neutral-500">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative h-[400px] lg:h-[500px]">
            <div className="h-full rounded-2xl overflow-hidden shadow-lg bg-gray-200">
              <img 
                src={HeroImage} 
                alt="Online Learning Platform"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Featured Courses</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Start your learning journey with our most popular courses designed by industry experts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-medium">
                    {course.category}
                  </span>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-neutral-900">
                  {course.title}
                </h3>

                <p className="text-sm text-neutral-600 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-primary-600">
                      {course.price}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-neutral-500">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {course.students.toLocaleString()} students
                  </span>
                </div>

                <Button className="w-full">
                  Enroll Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" className="text-primary-600 hover:text-primary-700" onClick={handleExploreCourses}>
            View All Courses →
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Experience quality education with our comprehensive learning ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Expert Instructors */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-300 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">Expert Instructors</h3>
              <p className="text-neutral-600">
                Learn from certified professionals with years of industry experience.
              </p>
            </div>

            {/* Interactive Learning */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-300 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">Interactive Learning</h3>
              <p className="text-neutral-600">
                Engage with multimedia content, quizzes, and hands-on projects.
              </p>
            </div>

            {/* Flexible Schedule */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-300 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">Flexible Schedule</h3>
              <p className="text-neutral-600">
                Study at your own pace with live classes and recorded sessions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of students who have transformed their careers with our courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="!bg-accent text-primary-600 hover:bg-neutral-50 px-8 py-4"
              onClick={handleExploreCourses}
            >
              Get Started Today
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}