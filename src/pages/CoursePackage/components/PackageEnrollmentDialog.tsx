import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getUserInfo } from "@/lib/utils";
import { Package, BookOpen, ChevronDown, ChevronUp, Clock, Users, Star } from "lucide-react";
import type { CoursePackageDetail } from "@/types/coursePackage";

interface PackageEnrollmentData {
  fullName: string;
  email: string;
  phone: string;
  paymentPlan: string;
  notes?: string;
}

interface PackageEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coursePackage: CoursePackageDetail;
  onSubmit: (data: PackageEnrollmentData) => void;
}

export default function PackageEnrollmentDialog({ 
  open, 
  onOpenChange, 
  coursePackage, 
  onSubmit 
}: PackageEnrollmentDialogProps) {
  const [enrollmentData, setEnrollmentData] = useState<PackageEnrollmentData>({
    fullName: "",
    email: "",
    phone: "",
    paymentPlan: "one_time", // "one_time" or "two_time"
    notes: ""
  });

  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Auto-populate user data when dialog opens and reset when closed
  useEffect(() => {
    if (open) {
      const userInfo = getUserInfo();
      if (userInfo) {
        setEnrollmentData(prev => ({
          ...prev,
          fullName: userInfo.fullName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
        }));
      }
    } else {
      // Reset form when dialog closes
      setEnrollmentData({
        fullName: "",
        email: "",
        phone: "",
        paymentPlan: "one_time",
        notes: ""
      });
      setExpandedCourses(new Set());
    }
  }, [open]);

  // Get first course for payment calculation
  const getFirstCourse = () => {
    return coursePackage.courses.sort((a, b) => a.sequence - b.sequence)[0];
  };

  // Calculate payment amounts - only for first course
  const getPaymentAmount = () => {
    const firstCourse = getFirstCourse();
    if (!firstCourse) return 0;
    
    if (enrollmentData.paymentPlan === "two_time") {
      return Math.round(firstCourse.standardPrice / 2); // 2 payments for first course
    }
    return firstCourse.standardPrice;
  };

  const getTotalAmount = () => {
    const firstCourse = getFirstCourse();
    return firstCourse ? firstCourse.standardPrice : 0;
  };

  const getSavingsAmount = () => {
    return coursePackage.totalIndividualPrice - coursePackage.totalPrice;
  };

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleSubmit = () => {
    onSubmit(enrollmentData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Enroll in Course Package</DialogTitle>
        </DialogHeader>
      
        <DialogBody>
          <div className="space-y-6">
            {/* Package Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                {coursePackage.packageImageUrl ? (
                  <img
                    src={coursePackage.packageImageUrl}
                    alt={coursePackage.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{coursePackage.name}</h3>
                  <p className="text-sm text-gray-600">
                    {coursePackage.packageCode} • {coursePackage.courses.length} courses
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary-600">
                      {getTotalAmount().toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-sm text-gray-600">
                      (First course only)
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium">
                    Start with Course 1: {getFirstCourse()?.courseName}
                  </p>
                </div>
              </div>
            </div>

            {/* Courses Included Dropdown List */}
            <div className="bg-gradient-to-br from-secondary-100 to-accent-50 p-4 rounded-lg border border-primary-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Courses Included ({coursePackage.courses.length})
              </h4>
              <div className="space-y-2">
                {coursePackage.courses
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((course, index) => {
                    const isExpanded = expandedCourses.has(course.courseId);
                    
                    return (
                      <div key={course.id} className="border border-primary-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        {/* Course Header - Clickable */}
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleCourseExpansion(course.courseId)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{course.courseName}</div>
                              <div className="text-sm text-primary-600 font-semibold">
                                {course.standardPrice.toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-primary-400 hover:text-primary-600 transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Course Details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 bg-white border-t border-primary-100">
                            <div className="space-y-3 pt-3">
                              {/* Course Description */}
                              {course.description && (
                                <div>
                                  <p className="text-sm text-gray-700">{course.description}</p>
                                </div>
                              )}

                              {/* Course Details Grid */}
                              <div className="grid grid-cols-1 gap-3 text-sm">
                               
                                {course.courseLevel && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600">{course.courseLevel}</span>
                                  </div>
                                )}
                                
                                {course.categoryName && (
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600">{course.categoryName}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <Star className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">
                                    {course.rating > 0 ? `${course.rating} rating` : 'No ratings yet'}
                                  </span>
                                </div>
                              </div>

                              {/* Course Objectives */}
                              {course.courseObjective && course.courseObjective.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">What You'll Learn:</p>
                                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                    {course.courseObjective.map((objective, idx) => (
                                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span>{objective}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <p className="text-sm text-gray-600 mb-4">Your profile information has been automatically filled. Please review and update if needed.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={enrollmentData.fullName}
                    onChange={(e) => setEnrollmentData({...enrollmentData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={enrollmentData.email}
                    onChange={(e) => setEnrollmentData({...enrollmentData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={enrollmentData.phone}
                    onChange={(e) => setEnrollmentData({...enrollmentData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Payment Plan Selection */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Plan</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose your payment plan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        enrollmentData.paymentPlan === "one_time" 
                          ? "border-accent-100 bg-secondary-200" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setEnrollmentData({...enrollmentData, paymentPlan: "one_time"})}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={enrollmentData.paymentPlan === "one_time"}
                          onChange={() => {}}
                          className="text-primary-600"
                        />
                        <span className="font-semibold text-gray-900">One-time Payment</span>
                      </div>
                       <div className="text-sm text-gray-600">
                         <div className="font-medium text-lg text-primary-600">
                           {getTotalAmount().toLocaleString('vi-VN')}₫
                         </div>
                         <div>Pay for first course, unlock package access</div>
                         <div className="text-blue-600 font-medium text-xs mt-1">
                           Remaining courses: Pay as you progress
                         </div>
                       </div>
                    </div>
                    
                     <div 
                       className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                         enrollmentData.paymentPlan === "two_time" 
                           ? "border-accent-100 bg-secondary-200" 
                           : "border-gray-200 hover:border-gray-300"
                       }`}
                       onClick={() => setEnrollmentData({...enrollmentData, paymentPlan: "two_time"})}
                     >
                       <div className="flex items-center gap-2 mb-2">
                         <input 
                           type="radio" 
                           checked={enrollmentData.paymentPlan === "two_time"}
                           onChange={() => {}}
                           className="text-primary-600"
                         />
                         <span className="font-semibold text-gray-900">Two-time Payment</span>
                       </div>
                       <div className="text-sm text-gray-600">
                         <div className="font-medium text-lg text-primary-600">
                           {Math.round((getFirstCourse()?.standardPrice || 0) / 2).toLocaleString('vi-VN')}₫/payment
                         </div>
                         <div>2 payments of {Math.round((getFirstCourse()?.standardPrice || 0) / 2).toLocaleString('vi-VN')}₫ each for first course</div>
                         <div className="text-xs text-gray-500 mt-1">
                           First course total: {getFirstCourse()?.standardPrice?.toLocaleString('vi-VN') || '0'}₫
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
                
                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={enrollmentData.notes || ""}
                    onChange={(e) => setEnrollmentData({...enrollmentData, notes: e.target.value})}
                    placeholder="Any special requests or notes for your enrollment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-accent-200 focus:border-accent-300 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

         

            {/* Payment Structure Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">📚 Package Payment Structure</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• <strong>Pay for Course 1 now:</strong> Get immediate access to the first course</p>
                <p>• <strong>Package access included:</strong> Unlock all courses in the learning path</p>
                <p>• <strong>Pay as you progress:</strong> Pay for remaining courses when you're ready to start them</p>
                <p>• <strong>Structured learning:</strong> Complete courses in the recommended sequence</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div className="text-sm text-gray-600">
                  <p>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>
                  <p className="mt-1">I understand that I'm enrolling in a package with pay-as-you-progress structure, starting with the first course.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
        
         <DialogFooter>
           <div className="flex justify-between items-center w-full">
             <div className="text-lg font-semibold">
               {enrollmentData.paymentPlan === "two_time" ? (
                 <div>
                   <div>Per Payment: <span className="text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')}₫</span></div>
                   <div className="text-sm text-gray-600">Total: <span className="text-primary-600">{getTotalAmount().toLocaleString('vi-VN')}₫</span></div>
                 </div>
               ) : (
                 <div>
                   <div>First Course: <span className="text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')}₫</span></div>
                   <div className="text-sm text-blue-600">Package access included</div>
                 </div>
               )}
             </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary-600 hover:bg-secondary-700"
              >
                Enroll in Package
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
