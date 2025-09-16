import { useState } from "react";
import { Star, Clock, Users, BookOpen, CheckCircle, Play, Download, Award, Shield, Headphones, Video, FileText, Globe, Smartphone, Wifi, Calendar, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PaymentDialog from "./components/PaymentDialog";
import type { CourseDetailProps } from "@/types/course";

export default function CourseDetail({ course }: CourseDetailProps) {
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);

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

  const handleEnroll = () => {
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
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button className="bg-white/90 hover:bg-white text-gray-900">
                    <Play className="w-5 h-5 mr-2" />
                    Preview Course
                  </Button>
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


            {/* Course Curriculum */}
            <Card title="Course Syllabus">
              <div className="space-y-4">
                {course.syllabusItems && course.syllabusItems.length > 0 ? (
                  course.syllabusItems.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {item.sessionNumber}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{item.topicTitle}</span>
                            {item.required && (
                              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{item.estimatedMinutes ? `${item.estimatedMinutes} min` : 'N/A'}</span>
                        </div>
                      </div>
                      {item.objectives && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Objectives:</strong> {item.objectives}
                        </div>
                      )}
                      {item.contentSummary && (
                        <div className="mt-1 text-sm text-gray-600">
                          <strong>Summary:</strong> {item.contentSummary}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No curriculum available for this course yet.</p>
                  </div>
                )}
              </div>
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
                          {teacher.fullName.charAt(0)}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-8">
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
          </div>
        </div>

      {/* Enrollment Dialog */}
      <PaymentDialog
        open={showEnrollmentDialog}
        onOpenChange={setShowEnrollmentDialog}
        course={course}
        onSubmit={handleEnrollmentSubmit}
      />
    </div>
  );
}