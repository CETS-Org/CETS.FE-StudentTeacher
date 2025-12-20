import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import { getUserInfo, getStudentId } from "@/lib/utils";
import { getStudentById } from "@/api/student.api";
import { User, Mail, CreditCard, FileText, CheckCircle2, AlertCircle, BookOpen, DollarSign } from "lucide-react";
import type { Course } from "@/types/course";

interface ClassReservationData {
  fullName: string;
  email: string;
  phone: string;
  paymentPlan: string;
  notes?: string;
}

interface ClassReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onSubmit: (data: ClassReservationData) => void;
}

export default function ClassReservationDialog({ open, onOpenChange, course, onSubmit }: ClassReservationDialogProps) {
  const [reservationData, setReservationData] = useState<ClassReservationData>({
    fullName: "",
    email: "",
    phone: "",
    paymentPlan: "OneTime", // "OneTime" or "TwoTime"
    notes: ""
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  // Auto-populate user data when dialog opens and reset when closed
  useEffect(() => {
    if (open) {
      const loadUserData = async () => {
        const userInfo = getUserInfo();
        if (userInfo) {
          // First, set data from localStorage (fast)
          setReservationData(prev => ({
            ...prev,
            fullName: userInfo.fullName || "",
            email: userInfo.email || "",
            phone: userInfo.phoneNumber || "",
          }));

          // Then, try to fetch complete student data
          const studentId = getStudentId();
          if (studentId) {
            try {
              const student = await getStudentById(studentId);
              if (student) {
                setReservationData(prev => ({
                  ...prev,
                  fullName: student.fullName || prev.fullName,
                  email: student.email || prev.email,
                  phone: student.phoneNumber || prev.phone,
                }));
              }
            } catch (error) {
              // If fetching fails, keep the data from localStorage
              console.error('Error fetching student data:', error);
            }
          }
        }
      };

      loadUserData();
    } else {
      // Reset form when dialog closes
      setReservationData({
        fullName: "",
        email: "",
        phone: "",
        paymentPlan: "OneTime",
        notes: ""
      });
      setAgreedToTerms(false);
      setTermsError("");
    }
  }, [open]);

  // Calculate payment amounts
  const getPaymentAmount = () => {
    if (reservationData.paymentPlan === "TwoTime") {
      // Two-time payment: total + 10%, divided by 2
      return Math.round((course.standardPrice * 1.1) / 2);
    }
    return course.standardPrice;
  };

  const getTotalAmount = () => {
    if (reservationData.paymentPlan === "TwoTime") {
      // Two-time payment total is 10% more than standard price
      return Math.round(course.standardPrice * 1.1);
    }
    return course.standardPrice;
  };

  const handleSubmit = () => {
    // Validate terms agreement
    if (!agreedToTerms) {
      setTermsError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    
    setTermsError("");
    onSubmit(reservationData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            Reserve Your Class Spot
          </DialogTitle>
        </DialogHeader>
      
        <DialogBody className="overflow-y-auto">
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-gradient-to-r from-secondary-100 to-accent-100 border border-primary-200 p-5 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <img
                  src={course.courseImageUrl}
                  alt={course.courseName}
                  className="w-20 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{course.courseName}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    by {course.teacherDetails && course.teacherDetails.length > 0 
                      ? course.teacherDetails.length === 1 
                        ? course.teacherDetails[0].fullName
                        : `${course.teacherDetails[0].fullName} +${course.teacherDetails.length - 1} more`
                      : 'Unknown Teacher'
                    }
                  </p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                    <span className="text-2xl font-bold text-primary-600">{course.standardPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
              </div>
              <p className="text-sm text-gray-500 mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Your profile information has been automatically filled and cannot be edited here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={reservationData.fullName}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed border-gray-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={reservationData.email}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed border-gray-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Payment Plan Selection */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900">Payment Plan</h4>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose your payment plan</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        reservationData.paymentPlan === "OneTime" 
                          ? "border-accent-200 bg-accent-100 shadow-md" 
                          : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setReservationData({...reservationData, paymentPlan: "OneTime"})}
                    >
                      {reservationData.paymentPlan === "OneTime" && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-primary-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          reservationData.paymentPlan === "OneTime" 
                            ? "border-primary-600 bg-primary-600" 
                            : "border-gray-300"
                        }`}>
                          {reservationData.paymentPlan === "OneTime" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-bold text-gray-900">One-time Payment</span>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="font-bold text-xl text-primary-600">{course.standardPrice.toLocaleString('vi-VN')} ₫</div>
                        <div className="text-gray-600">Pay once and get lifetime access</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        reservationData.paymentPlan === "TwoTime" 
                          ? "border-accent-200 bg-accent-100 shadow-md" 
                          : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setReservationData({...reservationData, paymentPlan: "TwoTime"})}
                    >
                      {reservationData.paymentPlan === "TwoTime" && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-primary-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          reservationData.paymentPlan === "TwoTime" 
                            ? "border-primary-600 bg-primary-600" 
                            : "border-gray-300"
                        }`}>
                          {reservationData.paymentPlan === "TwoTime" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-bold text-gray-900">Two-time Payment</span>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="font-bold text-xl text-primary-600">{Math.round((course.standardPrice * 1.1) / 2).toLocaleString('vi-VN')} ₫</div>
                        <div className="text-gray-600">2 payments of {Math.round((course.standardPrice * 1.1) / 2).toLocaleString('vi-VN')} ₫ each</div>
                        <div className="text-xs text-orange-600 font-medium mt-2">Total: {Math.round(course.standardPrice * 1.1).toLocaleString('vi-VN')} ₫ (includes 10% fee)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={reservationData.notes || ""}
                    onChange={(e) => setReservationData({...reservationData, notes: e.target.value})}
                    placeholder="Any special requests or notes for your reservation..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className={`bg-gray-50 border-2 rounded-xl p-5 transition-all ${
              termsError ? "border-red-200 bg-red-50" : "border-gray-200"
            }`}>
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) {
                      setTermsError("");
                    }
                  }}
                  className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded cursor-pointer"
                  required
                />
                <div className="text-sm text-gray-700 flex-1">
                  <p className="leading-relaxed">
                    I agree to the <Link to="/terms-of-service" className="text-primary-600 hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>.
                    <span className="text-red-500 ml-1">*</span>
                  </p>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    I understand that this is a class reservation and payment will be processed separately. The reservation will expire in 7 days if not confirmed.
                  </p>
                  {termsError && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{termsError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter className="border-t border-gray-200 pt-4 mt-4">
          <div className="bg-gradient-to-r from-secondary-100 to-accent-100 border border-primary-200 rounded-xl shadow-sm p-5 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                {reservationData.paymentPlan === "TwoTime" ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">Per Payment:</div>
                    <div className="text-2xl font-bold text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')} ₫</div>
                    <div className="text-sm text-gray-600 pt-2 border-t border-primary-300 mt-2">Total: <span className="font-bold text-gray-900 text-base">{getTotalAmount().toLocaleString('vi-VN')} ₫</span></div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-600 mb-2 font-medium">Total Amount:</div>
                    <div className="text-3xl font-bold text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')} ₫</div>
                  </div>
                )}
              </div>
              <div className="w-full sm:w-auto">
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  className="w-full sm:w-auto"
                  iconLeft={<CheckCircle2 className="w-4 h-4" />}
                >
                  Reserve Class Spot
                </Button>
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
