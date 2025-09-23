import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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
    paymentPlan: "one_time", // "one_time" or "quarterly"
    notes: ""
  });

  // Calculate payment amounts
  const getPaymentAmount = () => {
    if (reservationData.paymentPlan === "quarterly") {
      return Math.round(course.standardPrice / 4);
    }
    return course.standardPrice;
  };

  const getTotalAmount = () => {
    if (reservationData.paymentPlan === "quarterly") {
      return course.standardPrice;
    }
    return course.standardPrice;
  };

  const handleSubmit = () => {
    onSubmit(reservationData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Reserve Your Class Spot</DialogTitle>
        </DialogHeader>
      
        <DialogBody>
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={course.courseImageUrl}
                  alt={course.courseName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{course.courseName}</h3>
                  <p className="text-sm text-gray-600">
                    by {course.teacherDetails && course.teacherDetails.length > 0 
                      ? course.teacherDetails.length === 1 
                        ? course.teacherDetails[0].fullName
                        : `${course.teacherDetails[0].fullName} +${course.teacherDetails.length - 1} more`
                      : 'Unknown Teacher'
                    }
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary-600">{course.standardPrice.toLocaleString('vi-VN')}₫</span>
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
                    value={reservationData.fullName}
                    onChange={(e) => setReservationData({...reservationData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={reservationData.email}
                    onChange={(e) => setReservationData({...reservationData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={reservationData.phone}
                    onChange={(e) => setReservationData({...reservationData, phone: e.target.value})}
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
                        reservationData.paymentPlan === "one_time" 
                          ? "border-primary-600 bg-primary-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setReservationData({...reservationData, paymentPlan: "one_time"})}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={reservationData.paymentPlan === "one_time"}
                          onChange={() => {}}
                          className="text-primary-600"
                        />
                        <span className="font-semibold text-gray-900">One-time Payment</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium text-lg text-primary-600">{course.standardPrice.toLocaleString('vi-VN')}₫</div>
                        <div>Pay once and get lifetime access</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        reservationData.paymentPlan === "quarterly" 
                          ? "border-primary-600 bg-primary-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setReservationData({...reservationData, paymentPlan: "quarterly"})}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="radio" 
                          checked={reservationData.paymentPlan === "quarterly"}
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
                
                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={reservationData.notes || ""}
                    onChange={(e) => setReservationData({...reservationData, notes: e.target.value})}
                    placeholder="Any special requests or notes for your reservation..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <div className="text-sm text-gray-600">
                  <p>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>
                  <p className="mt-1">I understand that this is a class reservation and payment will be processed separately. The reservation will expire in 7 days if not confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-lg font-semibold">
              {reservationData.paymentPlan === "quarterly" ? (
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
                Reserve Class Spot
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
