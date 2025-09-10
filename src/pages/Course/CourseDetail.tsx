import { useState } from "react";
import { Star, Clock, Users, BookOpen, CheckCircle, Play, Download, Award, Shield, Headphones } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PaymentDialog from "./components/PaymentDialog";

interface Course {
  id: string;
  courseName: string;
  description: string;
  teacher: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  image: string;
  category: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  detailedDescription?: string;
  curriculum?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  teacherBio?: string;
  teacherImage?: string;
  teacherRating?: number;
  teacherStudents?: number;
  teacherCourses?: number;
}

interface CourseDetailProps {
  course: Course;
}

export default function CourseDetail({ course }: CourseDetailProps) {
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);

  const handleEnroll = () => {
    setShowEnrollmentDialog(true);
  };

  const handleEnrollmentSubmit = (enrollmentData: any) => {
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
                  src={course.image}
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
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {course.level}
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
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* What You'll Learn */}
            <Card title="What You'll Learn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Curriculum */}
            <Card title="Course Curriculum">
              <div className="space-y-4">
                {course.curriculum?.map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{lesson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>15 min</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Requirements */}
            <Card title="Requirements">
              <ul className="space-y-2">
                {course.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Instructor */}
            <Card title="About the Instructor">
              <div className="flex items-start gap-6">
                <img
                  src={course.teacherImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"}
                  alt={course.teacher}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.teacher}</h3>
                  <p className="text-gray-600 mb-4">{course.teacherBio}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{course.teacherRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.teacherStudents?.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.teacherCourses} courses</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{course.price.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <Button
                onClick={handleEnroll}
                 className="w-full font-semibold mb-4"
              >
                Enroll Now
              </Button>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-success-600" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-success-600" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success-600" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-success-600" />
                  <span>24/7 support</span>
                </div>
              </div>
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
                  <span className="font-semibold">{course.level}</span>
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