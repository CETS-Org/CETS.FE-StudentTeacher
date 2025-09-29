import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, Users, BookOpen, CheckCircle, Play, Download, Award, Shield, Headphones, Video, FileText, Globe, Smartphone, Wifi, Calendar, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ClassReservationDialog from "./components/ClassReservationDialog";
import RelatedCourses from "./components/RelatedCourses";
import CourseSchedule from "@/components/ui/CourseSchedule";
import { useCourseSchedule } from "@/hooks/useCourseSchedule";
import { isTokenValid } from "@/lib/utils";
import type { CourseDetailProps } from "@/types/course";

export default function CourseDetail({ course }: CourseDetailProps) {
  const navigate = useNavigate();
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [expandedSyllabus, setExpandedSyllabus] = useState<Set<string>>(new Set());
  const [allSyllabusExpanded, setAllSyllabusExpanded] = useState(false);
  const { schedules, loading: schedulesLoading } = useCourseSchedule(course.id);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [course.id]);

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
      const allIds = new Set(course.syllabusItems?.map(item => item.id) || []);
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
    
    // User is logged in, show enrollment dialog
    setShowEnrollmentDialog(true);
  };

  const handleEnrollmentSubmit = (enrollmentData: unknown) => {
    // Handle enrollment submission
    console.log("Enrollment data:", enrollmentData);
    // You can add success notification here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Hero */}
            <Card>
              <div className="relative">
                <img
                  src={course.courseImageUrl}
                  alt={course.courseName}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {course.isPopular && (
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      🔥 Popular
                    </span>
                  )}
                  {course.isNew && (
                    <span className="bg-accent-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✨ New
                    </span>
                  )}
                </div>
               
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-accent-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {course.categoryName}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {course.courseLevel}
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.courseName}</h2>
                <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                    <span>({course.studentsCount.toLocaleString()} students)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.courseLevel}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* What You'll Learn */}
            {course.courseObjective && (
              <Card title="What You'll Learn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(course.courseObjective) ? (
                    course.courseObjective.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objective}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3">
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
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Course Syllabus</h3>
                  {course.syllabusItems && course.syllabusItems.length > 0 && (
                    <p className="text-gray-600 text-sm">
                      {course.syllabusItems.length} sections • {course.syllabusItems.reduce((total, item) => total + (item.totalSlots || 0), 0)} slots total
                    </p>
                  )}
                </div>
                {course.syllabusItems && course.syllabusItems.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={toggleAllSyllabus}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {allSyllabusExpanded ? 'Collapse all sections' : 'Expand all sections'}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {course.syllabusItems && course.syllabusItems.length > 0 ? (
                  course.syllabusItems.map((item) => {
                    const isExpanded = expandedSyllabus.has(item.id);
                    const hasContent = item.objectives || item.contentSummary || item.preReadingUrl;
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Section Header */}
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isExpanded ? 'bg-gray-50' : 'bg-white'
                          }`}
                          onClick={() => toggleSyllabusItem(item.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              {hasContent && (
                                <button className="text-gray-400 hover:text-gray-600">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                Session {item.sessionNumber}: {item.topicTitle}
                              </span>
                              {item.required && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{item.totalSlots ? `${item.totalSlots} slot${item.totalSlots > 1 ? 's' : ''}` : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && hasContent && (
                          <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                            <div className="space-y-3 pt-3">
                              {item.objectives && (
                                <div className="flex gap-3">
                                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Learning Objectives</p>
                                    <p className="text-sm text-gray-600">{item.objectives}</p>
                                  </div>
                                </div>
                              )}
                              
                              {item.contentSummary && (
                                <div className="flex gap-3">
                                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Content Summary</p>
                                    <p className="text-sm text-gray-600">{item.contentSummary}</p>
                                  </div>
                                </div>
                              )}
                              
                              {item.preReadingUrl && (
                                <div className="flex gap-3">
                                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <Download className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Pre-reading Material</p>
                                    <a 
                                      href={item.preReadingUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                                    >
                                      Download Resource
                                    </a>
                                  </div>
                                </div>
                              )}
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
            <Card title="Class Schedule">
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
              <Card title="Requirements">
                <ul className="space-y-2">
                  {course.requirements.map((req) => (
                    <li key={req.id} className="flex items-start gap-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-gray-700">{req.requirementName}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Teachers */}
            {course.teacherDetails && course.teacherDetails.length > 0 && (
              <Card title={course.teacherDetails.length > 1 ? "About the Teachers" : "About the Teacher"}>
                <div className="space-y-6">
                  {course.teacherDetails.map((teacher, index) => (
                    <div key={teacher.id} className={`flex items-start gap-6 ${index > 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                      <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-2xl font-bold">
                          {teacher.avatarUrl ? (
                            <img src={teacher.avatarUrl} alt={teacher.fullName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            teacher.fullName.charAt(0)
                          )}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{teacher.fullName}</h3>
                        <p className="text-gray-600 mb-4">{teacher.bio}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{teacher.rating || 'No rating yet'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{teacher.totalStudents?.toLocaleString()} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{teacher.totalCourses} courses</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{teacher.yearsExperience} years experience</span>
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
              <Card title="Student Feedback">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold text-gray-900">{course.rating}</span>
                        <span className="text-gray-600">({course.studentsCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {course.feedbacks.slice(0, 5).map((feedback) => (
                      <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{feedback.studentName}</h4>
                              {feedback.isVerified && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Verified Purchase
                                </span>
                              )}
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
                              <span className="text-sm text-gray-500">{feedback.date}</span>
                            </div>
                            
                            <p className="text-gray-700">{feedback.comment}</p>
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
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-20">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{course.standardPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <Button
                onClick={handleEnroll}
                 className="w-full font-semibold mb-4"
              >
                Enroll Now
              </Button>

               {course.benefits && course.benefits.length > 0 && (
                <div className="space-y-3 text-sm text-gray-600">
                  {course.benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center gap-2">
                      {getBenefitIcon(benefit.benefitName)}
                      <span>{benefit.benefitName}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Course Stats */}
            <Card title="Course Statistics">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students enrolled</span>
                  <span className="font-semibold">{course.studentsCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course duration</span>
                  <span className="font-semibold">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">{course.courseLevel}</span>
                </div>
              </div>
            </Card>

            {/* Related Courses */}
            <RelatedCourses currentCourse={course} />
          </div>
        </div>

      {/* Enrollment Dialog */}
      <ClassReservationDialog
        open={showEnrollmentDialog}
        onOpenChange={setShowEnrollmentDialog}
        course={course}
        onSubmit={handleEnrollmentSubmit}
      />
    </div>
  );
}