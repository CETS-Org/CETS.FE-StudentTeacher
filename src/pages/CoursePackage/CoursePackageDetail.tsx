import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, BookOpen, Star, CheckCircle, Users, ChevronDown, ChevronUp, Clock } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import RelatedPackages from "./components/RelatedPackages";
import PackageEnrollmentDialog from "./components/PackageEnrollmentDialog";
import Toast from "@/components/ui/Toast";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { api } from "@/api";
import { getUserInfo } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { planTypeService } from "@/services/planTypeService";
import type { CoursePackageDetail } from "@/types/coursePackage";

export default function CoursePackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [packageDetail, setPackageDetail] = useState<CoursePackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [allCoursesExpanded, setAllCoursesExpanded] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, hideToast, success, error: showError } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchPackageDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getCoursePackageDetail(id);
        
        // Add mock feedback data since APIs don't exist yet
        const packageWithFeedback = {
          ...response.data,
          rating: 4.6,
          studentsCount: 89,
          feedbacks: [
            {
              id: "1",
              studentName: "Alex Thompson",
              studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "This package is incredible value! I learned so much from all the courses. The progression from basic to advanced topics was perfect. Highly recommend for anyone serious about mastering these skills.",
              date: "1 week ago",
              isVerified: true
            },
            {
              id: "2",
              studentName: "Maria Garcia",
              studentAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "Amazing package deal! Each course builds upon the previous one beautifully. The instructors are top-notch and the content is always up-to-date. Worth every penny!",
              date: "2 weeks ago",
              isVerified: true
            },
            {
              id: "3",
              studentName: "John Chen",
              rating: 4,
              comment: "Great comprehensive learning path. The package saved me a lot of money compared to buying courses individually. Some courses were better than others, but overall very satisfied.",
              date: "3 weeks ago",
              isVerified: true
            },
            {
              id: "4",
              studentName: "Sophie Williams",
              studentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "Perfect for career advancement! This package gave me all the skills I needed for my new role. The structured approach and practical projects were exactly what I was looking for.",
              date: "1 month ago",
              isVerified: true
            },
            {
              id: "5",
              studentName: "Robert Kim",
              rating: 4,
              comment: "Solid package with good variety. I appreciated how the courses complemented each other. The community support and resources were also very helpful throughout my learning journey.",
              date: "3 days ago",
              isVerified: false
            },
            {
              id: "6",
              studentName: "Emma Davis",
              studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
              rating: 5,
              comment: "Exceeded my expectations! The package format allowed me to learn at my own pace while following a logical progression. The instructors clearly put a lot of thought into the curriculum design.",
              date: "4 days ago",
              isVerified: true
            },
            {
              id: "7",
              studentName: "Daniel Brown",
              rating: 4,
              comment: "Good value for money. The courses are well-structured and the content is practical. I was able to apply what I learned immediately in my work projects.",
              date: "1 week ago",
              isVerified: true
            }
          ]
        };
        
        setPackageDetail(packageWithFeedback);
      } catch (err: any) {
        console.error("Failed to fetch package detail:", err);
        setError("Failed to load package details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetail();
  }, [id]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Helper functions for course expansion
  const toggleCourseItem = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const toggleAllCourses = () => {
    if (allCoursesExpanded) {
      setExpandedCourses(new Set());
      setAllCoursesExpanded(false);
    } else {
      const allIds = new Set(packageDetail?.courses.map(course => course.courseId) || []);
      setExpandedCourses(allIds);
      setAllCoursesExpanded(true);
    }
  };

  // Enrollment handler
  const handleEnrollmentSubmit = async (enrollmentData: any) => {
    setIsSubmitting(true);
    
    try {
      // Get current user info
      const userInfo = getUserInfo();
      if (!userInfo?.id) {
        showError("User not found. Please login again.");
        setIsSubmitting(false);
        return;
      }

      if (!packageDetail) {
        showError("Package details not found. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Get plan type ID dynamically
      const planTypeID = await planTypeService.getPlanTypeId(enrollmentData.paymentPlan || 'one_time');

      // Create complete reservation with all items in single transaction
      const response = await api.createCompleteReservation({
        studentID: userInfo.id,
        coursePackageID: packageDetail.id,
        items: packageDetail.courses.map((course, index) => ({
          courseID: course.courseId,
          invoiceID: null,
          paymentSequence: index + 1, // Sequential payment sequence for each course
          planTypeID: planTypeID
        }))
      });

      console.log("Package reservation created successfully:", response.data);
      
      setIsSubmitting(false);
      
      // Show success message
      success(`Course package reservation created successfully! ${packageDetail.courses.length} courses reserved. Redirecting...`);
      
      // Navigate to reservations page after a short delay
      setTimeout(() => {
        navigate('/student/choose-paid-item');
      }, 1500);
      
    } catch (err: any) {
      console.error("Error creating package reservation:", err);
      
      setIsSubmitting(false);
      
      // Show specific error message if available
      const errorMessage = err.response?.data?.message || err.message || "Failed to create package reservation. Please try again.";
      showError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-neutral-600">Loading package details...</span>
      </div>
    );
  }

  if (error || !packageDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-semibold text-neutral-900 mb-4">Package Not Found</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button 
            onClick={() => {
              navigate("/courses", { replace: false });
              setTimeout(() => {
                window.location.hash = '#packages';
              }, 50);
            }} 
            variant="secondary"
          >
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => {
            navigate("/courses", { replace: false });
            // Use setTimeout to ensure navigation completes before hash update
            setTimeout(() => {
              window.location.hash = '#packages';
            }, 50);
          }}
          iconLeft={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Packages
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Package Hero */}
          <Card>
            <div className="relative">
              {/* Package Image */}
              {packageDetail.packageImageUrl ? (
                <img
                  src={packageDetail.packageImageUrl}
                  alt={packageDetail.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-accent-100 rounded-t-lg flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <Package className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  📦 Package
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-accent-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {packageDetail.packageCode}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {packageDetail.courses.length} Courses
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{packageDetail.name}</h2>
              {packageDetail.description && (
                <p className="text-lg text-gray-600 mb-6">{packageDetail.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{packageDetail.courses.length} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Course Package</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>Combo Deal</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Courses Included */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Courses Included ({packageDetail.courses.length})</h3>
                <p className="text-gray-600 text-sm">
                  {packageDetail.courses.length} courses • Total value: {packageDetail.totalIndividualPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              {packageDetail.courses && packageDetail.courses.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={toggleAllCourses}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {allCoursesExpanded ? 'Collapse all courses' : 'Expand all courses'}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {packageDetail.courses.length > 0 ? (
                packageDetail.courses
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((course, index) => {
                    const isExpanded = expandedCourses.has(course.courseId);
                    
                    return (
                      <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Course Header */}
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isExpanded ? 'bg-gray-50' : 'bg-white'
                          }`}
                          onClick={() => toggleCourseItem(course.courseId)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <button className="text-gray-400 hover:text-gray-600">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                              <div className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {course.courseName}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-900">
                                {course.standardPrice.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                            <div className="space-y-4 pt-4">
                              {/* Course Description */}
                              {course.description && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-700">{course.description}</p>
                                </div>
                              )}

                              {/* Course Objectives */}
                              {course.courseObjective && course.courseObjective.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                      <BookOpen className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-2">What You'll Learn</p>
                                      <ul className="space-y-1">
                                        {course.courseObjective.slice(0, 3).map((objective, idx) => (
                                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <CheckCircle className="w-3 h-3 text-success-600 flex-shrink-0 mt-0.5" />
                                            <span>{objective}</span>
                                          </li>
                                        ))}
                                        {course.courseObjective.length > 3 && (
                                          <li className="text-sm text-gray-500 italic">
                                            + {course.courseObjective.length - 3} more objectives
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Course Details Grid */}
                              <div className="grid md:grid-cols-2 gap-4">
                                {course.duration && (
                                  <div className="flex gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                      <Clock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">Duration</p>
                                      <p className="text-sm text-gray-600">{course.duration}</p>
                                    </div>
                                  </div>
                                )}

                                {course.courseLevel && (
                                  <div className="flex gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                      <Users className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">Level</p>
                                      <p className="text-sm text-gray-600">{course.courseLevel}</p>
                                    </div>
                                  </div>
                                )}

                                {course.categoryName && (
                                  <div className="flex gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                      <BookOpen className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">Category</p>
                                      <p className="text-sm text-gray-600">{course.categoryName}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-3">
                                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <Star className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Rating</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                      {course.rating > 0 ? (
                                        <>
                                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                          {course.rating} ({course.studentsCount.toLocaleString()} students)
                                        </>
                                      ) : (
                                        'No ratings yet'
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex justify-end pt-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/course/${course.courseId}`);
                                  }}
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  View Full Course Details
                                </Button>
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
                  <p>No courses found in this package.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Package Benefits */}
          <Card title="Package Benefits">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Cost Savings</h4>
                  <p className="text-gray-600 text-sm">Get multiple courses at a discounted bundle price</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Learning</h4>
                  <p className="text-gray-600 text-sm">Structured learning path across multiple subjects</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Curated Content</h4>
                  <p className="text-gray-600 text-sm">Expertly selected courses that complement each other</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Expert Instruction</h4>
                  <p className="text-gray-600 text-sm">Learn from experienced instructors across all courses</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Package Feedback */}
          {packageDetail.feedbacks && packageDetail.feedbacks.length > 0 && (
            <Card title="Student Feedback">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold text-gray-900">{packageDetail.rating || 0}</span>
                      <span className="text-gray-600">({packageDetail.studentsCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {packageDetail.feedbacks.slice(0, 5).map((feedback) => (
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
                
                {packageDetail.feedbacks.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="secondary" className="text-primary-600 hover:text-primary-700">
                      Show More Reviews ({packageDetail.feedbacks.length - 5} more)
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
              {/* Show original total if there's a discount */}
              {packageDetail.totalIndividualPrice > packageDetail.totalPrice && (
                <div className="text-lg text-gray-500 line-through mb-1">
                  {packageDetail.totalIndividualPrice.toLocaleString('vi-VN')} ₫
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">{packageDetail.totalPrice.toLocaleString('vi-VN')} ₫</span>
              </div>
              <p className="text-gray-600 text-sm">Package Price</p>
              {/* Show savings */}
              {packageDetail.totalIndividualPrice > packageDetail.totalPrice && (
                <div className="text-green-600 font-semibold mt-2">
                  You save {(packageDetail.totalIndividualPrice - packageDetail.totalPrice).toLocaleString('vi-VN')} ₫!
                </div>
              )}
            </div>

            <Button
              onClick={() => setEnrollmentDialogOpen(true)}
              className="w-full font-semibold mb-4"
            >
              Enroll in Package
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                // TODO: Implement wishlist logic
                console.log("Add to wishlist:", packageDetail.id);
              }}
              className="w-full"
            >
              Add to Wishlist
            </Button>

           
          </Card>

          {/* Package Statistics */}
          <Card title="Package Statistics">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total courses</span>
                <span className="font-semibold">{packageDetail.courses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Individual total</span>
                <span className="font-semibold">{packageDetail.totalIndividualPrice.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Package price</span>
                <span className="font-semibold text-primary-600">{packageDetail.totalPrice.toLocaleString('vi-VN')} ₫</span>
              </div>
              {packageDetail.totalIndividualPrice > packageDetail.totalPrice && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Your savings</span>
                  <span className="font-bold text-green-600">
                    {(packageDetail.totalIndividualPrice - packageDetail.totalPrice).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Related Packages */}
          <RelatedPackages currentPackage={packageDetail} />
        </div>
      </div>

      {/* Enrollment Dialog */}
      {packageDetail && (
        <PackageEnrollmentDialog
          open={enrollmentDialogOpen}
          onOpenChange={setEnrollmentDialogOpen}
          coursePackage={packageDetail}
          onSubmit={handleEnrollmentSubmit}
        />
      )}

      {/* Loading Overlay */}
      {isSubmitting && <LoadingOverlay message="Creating package reservation..." />}

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
