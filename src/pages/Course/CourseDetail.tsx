import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, Users, BookOpen, CheckCircle, Download, Award, Shield, Headphones, Video, FileText, Globe, Smartphone, Wifi, Calendar, MessageCircle, ChevronDown, ChevronUp, CalendarCheck, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/card";
import RelatedCourses from "./components/RelatedCourses";
import CourseSchedule from "@/components/ui/CourseSchedule";
import Toast from "@/components/ui/Toast";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useCourseSchedule } from "@/hooks/useCourseSchedule";
import { useToast } from "@/hooks/useToast";
import { isTokenValid, getUserInfo, getUserRole } from "@/lib/utils";
import { api } from "@/api";
import { planTypeService } from "@/services/planTypeService";
import { getStudentById } from "@/api/student.api";
import type { CourseDetailProps } from "@/types/course";

export default function CourseDetail({ course }: CourseDetailProps) {
  const navigate = useNavigate();
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [expandedSyllabus, setExpandedSyllabus] = useState<Set<string>>(new Set());
  const [allSyllabusExpanded, setAllSyllabusExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courseStatus, setCourseStatus] = useState({ isEnrolled: false, inReservation: false });
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [placementTestGrade, setPlacementTestGrade] = useState<number | null>(null);
  const [loadingPlacementScore, setLoadingPlacementScore] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);
  
  // Use schedules from course if available, otherwise fetch them
  const shouldFetchSchedules = !course.schedules || course.schedules.length === 0;
  const { schedules: fetchedSchedules, loading: schedulesLoading } = useCourseSchedule(shouldFetchSchedules ? course.id : undefined);
  const schedules = course.schedules || fetchedSchedules;
  const { toasts, hideToast, success, error } = useToast();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [course.id]);

  // Check if student is already enrolled or has course in reservation
  useEffect(() => {
    const checkStatus = async () => {
      // Only check if user is logged in and is a student
      if (!isTokenValid()) {
        setCourseStatus({ isEnrolled: false, inReservation: false });
        return;
      }

      const userRole = getUserRole();
      if (userRole?.toLowerCase() !== 'student') {
        setCourseStatus({ isEnrolled: false, inReservation: false });
        return;
      }

      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        setCourseStatus({ isEnrolled: false, inReservation: false });
        return;
      }

      try {
        setCheckingStatus(true);
        const status = await api.checkCourseStatus(userInfo.id, course.id);
        setCourseStatus(status);
      } catch (err) {
        console.error('Error checking course status:', err);
        setCourseStatus({ isEnrolled: false, inReservation: false });
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [course.id]);

  // Fetch placement test grade for student
  useEffect(() => {
    const loadPlacementTestGrade = async () => {
      // Only load if user is logged in and is a student
      if (!isTokenValid()) {
        setPlacementTestGrade(null);
        return;
      }

      const userRole = getUserRole();
      if (userRole?.toLowerCase() !== 'student') {
        setPlacementTestGrade(null);
        return;
      }

      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        setPlacementTestGrade(null);
        return;
      }

      try {
        setLoadingPlacementScore(true);
        const student = await getStudentById(userInfo.id);
        const grade = student.studentInfo?.placementTestGrade ?? null;
        setPlacementTestGrade(grade);
      } catch (err) {
        console.error('Error loading placement test grade:', err);
        setPlacementTestGrade(null);
      } finally {
        setLoadingPlacementScore(false);
      }
    };

    loadPlacementTestGrade();
  }, []);

  // Function to calculate start date based on course schedule
  const getCalculatedStartDate = (): Date | null => {
    // If there's an explicit start date from the API, use it
    if (course.startDate) {
      return new Date(course.startDate);
    }

    // Otherwise, calculate from schedules
    if (!schedules || schedules.length === 0) {
      return null;
    }

    // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
    const dayMap: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    // Get all days of week from schedules and convert to numbers
    const scheduleDays = schedules
      .map(schedule => dayMap[schedule.dayOfWeek])
      .filter(day => day !== undefined)
      .sort((a, b) => a - b);

    if (scheduleDays.length === 0) {
      return null;
    }

    // Get the first day of the week from the schedule
    const firstScheduleDay = scheduleDays[0];

    // Get current date
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate the next occurrence of the first schedule day
    let daysUntilStart = firstScheduleDay - currentDay;
    
    // If the day has already passed this week, move to next week
    if (daysUntilStart <= 0) {
      daysUntilStart += 7;
    }

    // Calculate the start date
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilStart);

    return startDate;
  };

  const calculatedStartDate = getCalculatedStartDate();

  // Use course.rating (from AverageRating column) if available and valid, otherwise calculate from feedbacks as fallback
  const averageRating = course.rating != null && course.rating > 0
    ? course.rating.toFixed(1)
    : (course.feedbacks && course.feedbacks.length > 0
      ? (course.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / course.feedbacks.length).toFixed(1)
      : '0.0');

  // Function to get appropriate icon for benefit content
  const getBenefitIcon = (benefitName: string) => {
    const benefit = benefitName.toLowerCase();
    
    if (benefit.includes('lifetime') || benefit.includes('access')) {
      return <CheckCircle className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('download') || benefit.includes('resource')) {
      return <Download className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('certificate') || benefit.includes('completion')) {
      return <Award className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('guarantee') || benefit.includes('money') || benefit.includes('refund')) {
      return <Shield className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('support') || benefit.includes('help') || benefit.includes('assistance')) {
      return <Headphones className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('video') || benefit.includes('lecture')) {
      return <Video className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('mobile') || benefit.includes('phone') || benefit.includes('app')) {
      return <Smartphone className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('offline') || benefit.includes('wifi')) {
      return <Wifi className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('schedule') || benefit.includes('time') || benefit.includes('flexible')) {
      return <Calendar className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('community') || benefit.includes('forum') || benefit.includes('discussion')) {
      return <MessageCircle className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('material') || benefit.includes('document') || benefit.includes('pdf')) {
      return <FileText className="w-4 h-4 text-success-600" />;
    }
    if (benefit.includes('online') || benefit.includes('web') || benefit.includes('anywhere')) {
      return <Globe className="w-4 h-4 text-success-600" />;
    }
    
    // Default icon
    return <CheckCircle className="w-4 h-4 text-success-600" />;
  };

  const structuredSyllabi = course.syllabi || [];
  const hasStructuredSyllabus = structuredSyllabi.length > 0;
  const fallbackSyllabusItems = hasStructuredSyllabus ? [] : (course.syllabusItems || []);
  const flattenedSyllabusItems = hasStructuredSyllabus
    ? structuredSyllabi.flatMap(section => section.items || [])
    : fallbackSyllabusItems;
  const totalSyllabusSlots = flattenedSyllabusItems.reduce((total, item) => total + (item.totalSlots || 0), 0);

  // Helper functions for syllabus expansion
  const toggleSyllabusItem = (itemId: string) => {
    const newExpanded = new Set(expandedSyllabus);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedSyllabus(newExpanded);
  };

  const toggleAllSyllabus = () => {
    if (allSyllabusExpanded) {
      setExpandedSyllabus(new Set());
      setAllSyllabusExpanded(false);
    } else {
      const allIds = new Set(flattenedSyllabusItems.map(item => item.id));
      setExpandedSyllabus(allIds);
      setAllSyllabusExpanded(true);
    }
  };

  const handleEnroll = () => {
    // Check if user is logged in
    if (!isTokenValid()) {
      // Redirect to login page
      navigate('/login', { 
        state: { 
          returnUrl: `/course/${course.id}`,
          message: 'Please log in to enroll in this course'
        }
      });
      return;
    }
    
    // User is logged in, show enrollment dialog - removed per requirements
    // setShowEnrollmentDialog(true);
  };

  const handleEnrollmentSubmit = async (enrollmentData: any) => {
    setIsLoading(true);
    
    try {
      // Get current user info
      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        error("User not found. Please login again.");
        setIsLoading(false);
        return;
      }

      // Get plan type ID dynamically
      const planTypeID = await planTypeService.getPlanTypeId(enrollmentData.paymentPlan || 'one_time');

      // Create complete reservation with item in single transaction
      const response = await api.createCompleteReservation({
        studentID: userInfo.id,
        coursePackageID: null, // Individual course, not a package
        items: [
          {
            courseID: course.id,
            invoiceID: null,
            paymentSequence: 1,
            planTypeID: planTypeID
          }
        ]
      });
      
      setIsLoading(false);
      
      success("Class reservation created successfully! Redirecting...");
      
      // Navigate to reservations page after a short delay
      setTimeout(() => {
        navigate('/student/choose-paid-item');
      }, 1500);
      
    } catch (err: any) {
      console.error("Error creating class reservation:", err);
      
      setIsLoading(false);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to create class reservation. Please try again.";
      error(errorMessage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Hero */}
            <Card className="overflow-hidden">
              <div className="relative h-80 overflow-hidden">
                <img
                  src={course.courseImageUrl}
                  alt={course.courseName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  {course.isPopular && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      🔥 Popular
                    </span>
                  )}
                  {course.isNew && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      ✨ New
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gradient-to-r from-primary-500/80 to-primary-600/80 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg border border-primary-400/50">
                      {course.categoryName}
                    </span>
                    <span className="bg-gradient-to-r from-accent-500/80 to-accent-600/80 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg border border-accent-400/50">
                      {course.courseCode}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">{course.courseName}</h1>
                  <p className="text-white/90 text-base line-clamp-2">{course.description}</p>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="text-sm font-bold text-gray-900">{averageRating}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-bold text-gray-900">{course.duration.replace(/sessions?/gi, 'sessions')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="text-sm font-bold text-gray-900">{course.courseLevel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Enrolled</p>
                      <p className="text-sm font-bold text-gray-900">{(course.enrolledCount ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                {calculatedStartDate && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-secondary-100 rounded-lg">
                    <CalendarCheck className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-primary-600 font-medium">Estimated Start Date</p>
                      <p className="text-sm font-bold text-primary-900">
                        {calculatedStartDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* What You'll Learn */}
            {course.courseObjective && (
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What You'll Learn</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(course.courseObjective) ? (
                    course.courseObjective.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objective}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{course.courseObjective}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}


            {/* Course Syllabus */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <FileText className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Course Syllabus</h3>
                    {flattenedSyllabusItems.length > 0 && (
                      <p className="text-gray-600 text-sm">
                        {hasStructuredSyllabus
                          ? `${structuredSyllabi.length} sections`
                          : `${fallbackSyllabusItems.length} sessions`
                        } • {totalSyllabusSlots} sessions total
                      </p>
                    )}
                  </div>
                </div>
                {flattenedSyllabusItems.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={toggleAllSyllabus}
                    className="text-primary-600 hover:text-primary-700"
                    iconRight={allSyllabusExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  >
                    {allSyllabusExpanded ? 'Collapse All' : 'Expand All'}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {hasStructuredSyllabus ? (
                  structuredSyllabi.map((section) => (
                    <div key={section.id} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                        <h4 className="text-lg font-bold text-gray-900">{section.title}</h4>
                        {section.description && (
                          <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                        )}
                      </div>
                      <div className="divide-y divide-gray-200">
                        {section.items && section.items.length > 0 ? (
                          section.items.map((item) => {
                            const isExpanded = expandedSyllabus.has(item.id);
                            const hasContent = item.objectives || item.contentSummary || item.preReadingUrl;

                            return (
                              <div key={item.id} className="bg-white">
                                <div
                                  className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                                    isExpanded ? 'bg-secondary-100' : 'bg-white hover:bg-gray-50'
                                  }`}
                                  onClick={() => toggleSyllabusItem(item.id)}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                      {hasContent && (
                                        <button className={`text-gray-400 hover:text-primary-600 transition-all duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                          <ChevronDown className="w-4 h-4" />
                                        </button>
                                      )}
                                      <span className="text-sm font-semibold text-gray-900">
                                        Session {item.sessionNumber}: {item.topicTitle}
                                      </span>
                                      {item.required && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                                      <Clock className="w-4 h-4 text-gray-500" />
                                      <span className="font-medium">{item.totalSlots ? `${item.totalSlots} session${item.totalSlots > 1 ? 's' : ''}` : 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>

                                {hasContent && (
                                  <div 
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="px-4 pb-4 bg-secondary-100">
                                      <div className="space-y-4 pt-4">
                                      {item.objectives && (
                                        <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">Learning Objectives</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{item.objectives}</p>
                                          </div>
                                        </div>
                                      )}

                                      {item.contentSummary && (
                                        <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                            <FileText className="w-4 h-4 text-green-600" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">Content Summary</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{item.contentSummary}</p>
                                          </div>
                                        </div>
                                      )}

                                      {item.preReadingUrl && (
                                        <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                          <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                            <Download className="w-4 h-4 text-purple-600" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 mb-2">Pre-reading Material</p>
                                            <a 
                                              href={item.preReadingUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                            >
                                              <Download className="w-4 h-4" />
                                              Download Resource
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <p>No sessions added for this section yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : fallbackSyllabusItems.length > 0 ? (
                  fallbackSyllabusItems.map((item) => {
                    const isExpanded = expandedSyllabus.has(item.id);
                    const hasContent = item.objectives || item.contentSummary || item.preReadingUrl;
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                            isExpanded ? 'bg-accent-50' : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => toggleSyllabusItem(item.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              {hasContent && (
                                <button className={`text-gray-400 hover:text-primary-600 transition-all duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              )}
                              <span className="text-sm font-semibold text-gray-900">
                                Session {item.sessionNumber}: {item.topicTitle}
                              </span>
                              {item.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{item.totalSlots ? `${item.totalSlots} session${item.totalSlots > 1 ? 's' : ''}` : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {hasContent && (
                          <div 
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-4 pb-4 bg-secondary-100 border-t border-gray-200">
                              <div className="space-y-4 pt-4">
                              {item.objectives && (
                                <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Learning Objectives</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{item.objectives}</p>
                                  </div>
                                </div>
                              )}
                              
                              {item.contentSummary && (
                                <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                    <FileText className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Content Summary</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{item.contentSummary}</p>
                                  </div>
                                </div>
                              )}
                              
                              {item.preReadingUrl && (
                                <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                    <Download className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 mb-2">Pre-reading Material</p>
                                    <a 
                                      href={item.preReadingUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download Resource
                                    </a>
                                  </div>
                                </div>
                              )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No course content available yet.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Course Schedule */}
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Class Schedule</h3>
              </div>
              {schedulesLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading schedule...</div>
                </div>
              ) : (
                <CourseSchedule schedules={schedules} compact={false} />
              )}
            </Card>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Requirements</h3>
                </div>
                <ul className="space-y-3">
                  {course.requirements.map((req) => (
                    <li key={req.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req.requirementName}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Teachers */}
            {course.teacherDetails && course.teacherDetails.length > 0 && (
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {course.teacherDetails.length > 1 ? "About the Teachers" : "About the Teacher"}
                  </h3>
                </div>
                <div className="space-y-6">
                  {course.teacherDetails.map((teacher, index) => (
                    <div key={teacher.id} className={`p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 ${index > 0 ? 'mt-6' : ''}`}>
                      <div className="flex items-start gap-5">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          {teacher.avatarUrl ? (
                            <img src={teacher.avatarUrl} alt={teacher.fullName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-white text-2xl font-bold">
                              {teacher.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{teacher.fullName}</h3>
                          <p className="text-gray-700 mb-4 leading-relaxed">{teacher.bio}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-semibold text-gray-900">{teacher.rating || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-gray-900">{teacher.totalStudents?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                              <BookOpen className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-gray-900">{teacher.totalCourses || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-gray-900">{teacher.yearsExperience || 0}y</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Student Feedback */}
            {course.feedbacks && course.feedbacks.length > 0 && (
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Student Feedback</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-xl font-bold text-gray-900">{averageRating}</span>
                      <span className="text-gray-600">({course.feedbacks.length} reviews)</span>
                    </div>
                  </div>
                </div>
                  
                <div className="space-y-4">
                  {course.feedbacks.slice(0, 5).map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          {feedback.studentAvatar ? (
                            <img 
                              src={feedback.studentAvatar} 
                              alt={feedback.studentName} 
                              className="w-full h-full object-cover rounded-full" 
                            />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {feedback.studentName.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{feedback.studentName}</h4>
                            <span className="text-sm text-gray-500">{feedback.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= feedback.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                  
                  {course.feedbacks.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="secondary" className="text-primary-600 hover:text-primary-700">
                        Show More Reviews ({course.feedbacks.length - 5} more)
                      </Button>
                    </div>
                  )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-20 border-2 border-primary-200 shadow-lg">
              <div className="bg-secondary-200/60 p-6 rounded-t-lg border-b border-primary-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Course Price</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-primary-600">{course.standardPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              </div>
              

              {/* Check if student meets course requirement */}
              {(() => {
                const isStudent = isTokenValid() && getUserRole()?.toLowerCase() === 'student';
                const hasInsufficientScore = isStudent && 
                  course.standardScore !== undefined && 
                  placementTestGrade !== null && 
                  course.standardScore > placementTestGrade;
                
                return (
                  <>
                    <Button
                      onClick={handleEnroll}
                      variant="primary"
                      className="w-full font-semibold mb-4 py-3 text-lg"
                      disabled={
                        checkingStatus || 
                        courseStatus.isEnrolled || 
                        courseStatus.inReservation || 
                        (isTokenValid() && getUserRole()?.toLowerCase() !== 'student') ||
                        hasInsufficientScore
                      }
                      iconLeft={!checkingStatus && !courseStatus.isEnrolled && !courseStatus.inReservation ? <CheckCircle className="w-5 h-5" /> : undefined}
                    >
                      {checkingStatus 
                        ? 'Checking...' 
                        : courseStatus.isEnrolled 
                          ? 'Already Enrolled' 
                          : courseStatus.inReservation
                            ? 'In Reservation'
                            : 'Reserve Your Spot'}
                    </Button>

                    {courseStatus.isEnrolled && (
                      <p className="text-sm text-success-600 text-center mb-4">
                        ✓ You are already enrolled in this course
                      </p>
                    )}

                    {courseStatus.inReservation && !courseStatus.isEnrolled && (
                      <p className="text-sm text-primary-600 text-center mb-4">
                        This course is already in your reservation.<br></br> Please complete payment.
                      </p>
                    )}

                    {hasInsufficientScore && !courseStatus.isEnrolled && !courseStatus.inReservation && (
                      <p className="text-sm text-red-600 text-center mb-4">
                        You are not eligible to take the course
                      </p>
                    )}

                    {isTokenValid() && getUserRole()?.toLowerCase() !== 'student' && !courseStatus.isEnrolled && !courseStatus.inReservation && !hasInsufficientScore && (
                      <p className="text-sm text-warning-600 text-center mb-4">
                        Only students can enroll in courses
                      </p>
                    )}
                  </>
                );
              })()}
            </Card>

            {/* What's Included - Separate non-sticky card */}
            {course.benefits && course.benefits.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    What's Included
                  </h4>
                  {course.benefits.length > 4 && (
                    <button
                      onClick={() => setBenefitsExpanded(!benefitsExpanded)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      {benefitsExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Show All ({course.benefits.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {course.benefits.map((benefit, index) => {
                    // Show first 4 by default, all if expanded
                    if (!benefitsExpanded && course.benefits && course.benefits.length > 4 && index >= 4) {
                      return null;
                    }
                    return (
                      <div key={benefit.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="mt-0.5">{getBenefitIcon(benefit.benefitName)}</div>
                        <span className="text-sm text-gray-700 flex-1">{benefit.benefitName}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}


            {/* Related Courses */}
            <RelatedCourses currentCourse={course} />
          </div>
        </div>


      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message="Creating reservation..." />}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}