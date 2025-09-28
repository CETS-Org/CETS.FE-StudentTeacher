import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, BookOpen, Star, CheckCircle, Users, ChevronDown, ChevronUp, Clock } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import RelatedPackages from "./components/RelatedPackages";
import { api } from "@/lib/config";
import type { CoursePackageDetail } from "@/types/coursePackage";

export default function CoursePackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [packageDetail, setPackageDetail] = useState<CoursePackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [allCoursesExpanded, setAllCoursesExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPackageDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getCoursePackageDetail(id);
        setPackageDetail(response.data);
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card className="sticky top-8">
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
              onClick={() => {
                // TODO: Implement enrollment logic
                console.log("Enroll in package:", packageDetail.id);
              }}
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
    </div>
  );
}
