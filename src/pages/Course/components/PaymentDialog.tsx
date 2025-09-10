import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface SyllabusItem {
  sessionNumber: number;
  topicTitle: string;
  estimatedMinutes?: number;
  required: boolean;
  objectives?: string;
  contentSummary?: string;
}

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
  categoryName: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  detailedDescription?: string;
  syllabusItems?: SyllabusItem[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  teacherBio?: string;
  teacherImage?: string;
  teacherRating?: number;
  teacherStudents?: number;
  teacherCourses?: number;
}

interface EnrollmentData {
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  paymentPlan: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onSubmit: (data: EnrollmentData) => void;
}

export default function PaymentDialog({ open, onOpenChange, course, onSubmit }: PaymentDialogProps) {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "credit_card",
    paymentPlan: "one_time", // "one_time" or "quarterly"
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  // Calculate payment amounts
  const getPaymentAmount = () => {
    if (enrollmentData.paymentPlan === "quarterly") {
      return Math.round(course.price / 4);
    }
    return course.price;
  };

  const getTotalAmount = () => {
    if (enrollmentData.paymentPlan === "quarterly") {
      return course.price;
    }
    return course.price;
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
          <DialogTitle>Complete Your Enrollment</DialogTitle>
        </DialogHeader>
      
        <DialogBody>
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={course.image}
                  alt={course.courseName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{course.courseName}</h3>
                  <p className="text-sm text-gray-600">by {course.teacher}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary-600">{course.price.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
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

            {/* Payment Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <Select
                    value={enrollmentData.paymentMethod}
                    onChange={(e) => setEnrollmentData({...enrollmentData, paymentMethod: e.target.value})}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Plan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        enrollmentData.paymentPlan === "one_time" 
                          ? "border-primary-600 bg-primary-50" 
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
                        <div className="font-medium text-lg text-primary-600">{course.price.toLocaleString('vi-VN')}₫</div>
                        <div>Pay once and get lifetime access</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        enrollmentData.paymentPlan === "quarterly" 
                          ? "border-primary-600 bg-primary-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setEnrollmentData({...enrollmentData, paymentPlan: "quarterly"})}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={enrollmentData.paymentPlan === "quarterly"}
                          onChange={() => {}}
                          className="text-primary-600"
                        />
                        <span className="font-semibold text-gray-900">Quarterly Payment</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium text-lg text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')}₫/quarter</div>
                        <div>4 payments of {getPaymentAmount().toLocaleString('vi-VN')}₫ each</div>
                        <div className="text-xs text-gray-500 mt-1">Total: {getTotalAmount().toLocaleString('vi-VN')}₫</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {enrollmentData.paymentMethod === "credit_card" || enrollmentData.paymentMethod === "debit_card" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <Input
                        type="text"
                        value={enrollmentData.cardNumber}
                        onChange={(e) => setEnrollmentData({...enrollmentData, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <Input
                          type="text"
                          value={enrollmentData.expiryDate}
                          onChange={(e) => setEnrollmentData({...enrollmentData, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <Input
                          type="text"
                          value={enrollmentData.cvv}
                          onChange={(e) => setEnrollmentData({...enrollmentData, cvv: e.target.value})}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <Input
                        type="text"
                        value={enrollmentData.cardholderName}
                        onChange={(e) => setEnrollmentData({...enrollmentData, cardholderName: e.target.value})}
                        placeholder="Name on card"
                      />
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {enrollmentData.paymentMethod === "paypal" 
                        ? "You will be redirected to PayPal to complete your payment."
                        : "Bank transfer details will be provided after enrollment."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div className="text-sm text-gray-600">
                  <p>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>
                  <p className="mt-1">I understand that I have 30 days to request a refund if I'm not satisfied with the course.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-lg font-semibold">
              {enrollmentData.paymentPlan === "quarterly" ? (
                <div>
                  <div>Per Quarter: <span className="text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')}₫</span></div>
                  <div className="text-sm text-gray-600">Total: <span className="text-primary-600">{getTotalAmount().toLocaleString('vi-VN')}₫</span></div>
                </div>
              ) : (
                <div>Total: <span className="text-primary-600">{getPaymentAmount().toLocaleString('vi-VN')}₫</span></div>
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
                className="bg-primary-600 hover:bg-primary-700"
              >
                Complete Enrollment
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
