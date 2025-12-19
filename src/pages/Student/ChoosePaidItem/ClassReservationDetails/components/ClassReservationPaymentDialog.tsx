import { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { 
  CreditCard, 
  Package,
  User,
  DollarSign,
  AlertCircle,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  BookOpen
} from "lucide-react";

import { getUserInfo, getStudentId, setUserInfo } from "@/lib/utils";
import { getStudentById } from "@/api/student.api";
import { paymentService, redirectToPayOS, handlePaymentFailure } from "@/services/paymentService";
import type { ClassReservationPaymentDialogProps } from "@/types/payment";
import type { FullPaymentRequest } from "@/services/paymentService";

export default function ClassReservationPaymentDialog({
  open,
  onOpenChange,
  reservation,
  reservationItems
}: Omit<ClassReservationPaymentDialogProps, 'onPaymentSubmit'>) {
  const [paymentPlan, setPaymentPlan] = useState<'OneTime' | 'TwoTime'>('OneTime');
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Auto-fetch personal details when dialog opens
  useEffect(() => {
    if (open && !studentName && !studentEmail) {
      fetchPersonalDetails();
    }
  }, [open, studentName, studentEmail]);

  // Preselect payment plan based on reservation item's planType and reset on close
  useEffect(() => {
    if (open && reservationItems.length > 0) {
      const firstItem = reservationItems[0];
      
      // If this is a second payment (1stPaid status), force OneTime payment
      if (firstItem.invoiceStatusCode === '1stPaid' && firstItem.secondPayment) {
        setPaymentPlan('OneTime');
        return;
      }
      
      const firstItemPlanType = firstItem.planType;
      
      // Normalize the planType string to lowercase for comparison
      const normalizedPlanType = firstItemPlanType?.toLowerCase() || '';
      
      // Map the planType from API to payment plan state
      if (normalizedPlanType.includes('one-time') || normalizedPlanType.includes('onetime') || 
          firstItemPlanType === 'OneTime' || firstItemPlanType === 'one_time') {
        setPaymentPlan('OneTime');
      } else if (normalizedPlanType.includes('two-time') || normalizedPlanType.includes('twotime') || 
                 firstItemPlanType === 'TwoTime' || firstItemPlanType === 'two_time') {
        setPaymentPlan('TwoTime');
      }
    } else if (!open) {
      // Reset form state when dialog closes
      setPaymentPlan('OneTime');
      setNotes('');
    }
  }, [open, reservationItems]);

  const fetchPersonalDetails = async () => {
    setIsLoadingProfile(true);
    try {
      // Get user info from localStorage (set during login)
      const userInfo = getUserInfo();
      
      if (userInfo) {
        // Use actual user data from authentication
        // Support both camelCase and PascalCase field names from backend
        const phoneNumber = (userInfo as any).PhoneNumber || userInfo.phoneNumber || "";
        
        // First, set data from localStorage (fast)
        setStudentName(userInfo.fullName || "");
        setStudentEmail(userInfo.email || "");
        setStudentPhone(phoneNumber);
      } else {
        // If no user info found, user might not be logged in
        console.warn("No user info found in localStorage. User might not be logged in.");
        
        // Set fallback values
        setStudentName("");
        setStudentEmail("");
        setStudentPhone("");
      }
      
      // Small delay to show loading state (optional)
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error("Failed to fetch personal details:", error);
      // Set fallback values if there's an error
      setStudentName("");
      setStudentEmail("");
      setStudentPhone("");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const isPackage = () => {
    return reservation?.coursePackageID && reservation?.packageCode;
  };

  const getReservationType = () => {
    return isPackage() ? "Course Package" : "Individual Course";
  };

  const getReservationTypeColor = () => {
    return isPackage() ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
  };

  // Check if this is a second payment scenario
  const isSecondPayment = useMemo(() => {
    return reservationItems.length > 0 && 
           reservationItems[0].invoiceStatusCode === '1stPaid' && 
           reservationItems[0].secondPayment;
  }, [reservationItems]);

  // Calculate total from reservation items (for the item being paid)
  const totalAmount = useMemo(() => {
    // If this is a second payment, use the second payment amount
    if (isSecondPayment && reservationItems[0].secondPayment) {
      return reservationItems[0].secondPayment.amount;
    }
    // Otherwise, use the regular price
    return reservationItems.reduce((sum, item) => sum + item.price, 0);
  }, [reservationItems, isSecondPayment]);

  // Calculate total with 10% increase for two-time payment
  const totalWithFee = useMemo(() => {
    if (paymentPlan === 'TwoTime') {
      return Math.round(totalAmount * 1.1);
    }
    return totalAmount;
  }, [totalAmount, paymentPlan]);

  // Calculate per payment amount for two-time payment
  const perPaymentAmount = useMemo(() => {
    if (paymentPlan === 'TwoTime') {
      return Math.round(totalWithFee / 2);
    }
    return totalAmount;
  }, [totalAmount, totalWithFee, paymentPlan]);

  // Get the item name for display
  const itemName = useMemo(() => {
    if (reservationItems.length === 1) {
      return reservationItems[0].courseName;
    }
    return reservation.packageName;
  }, [reservationItems, reservation.packageName]);

  // Check if paying for single item
  const isSingleItem = reservationItems.length === 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate required fields
      if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim()) {
        alert('Please fill in all required student information fields.');
        setIsProcessing(false);
        return;
      }

      // Get studentId from localStorage
      const userInfo = getUserInfo();
      const studentId = userInfo?.id;
      
      if (!studentId) {
        alert('Student ID not found. Please login again.');
        setIsProcessing(false);
        return;
      }

      // Use the first reservation item for payment
      let reservationItemId: string;
      
      if (reservationItems.length > 0) {
        reservationItemId = reservationItems[0].id;
      } else {
        throw new Error('No reservation items available');
      }

      // Calculate amount based on payment scenario
      let amount: number;
      
      if (isSecondPayment && reservationItems[0].secondPayment) {
        // Second installment - use amount from secondPayment
        amount = reservationItems[0].secondPayment.amount;
      } else if (paymentPlan === 'OneTime') {
        // Full one-time payment - original price
        amount = totalAmount;
      } else {
        // First installment of two-time payment - half of (price * 1.1)
        amount = Math.round((totalAmount * 1.1) / 2);
      }
      
      // Prepare payment data for API
      const paymentData = {
        reservationItemId: reservationItemId,
        studentId: studentId,
        fullName: studentName.trim(),
        email: studentEmail.trim(),
        phoneNumber: studentPhone.trim(),
        note: notes || "",
        amount: amount
      };
      
      // Determine payment type
      const isSecondInstallment = isSecondPayment;
      const paymentType = isSecondInstallment ? '2nd Installment' : paymentPlan === 'OneTime' ? 'Full Payment' : '1st Installment';

      // Call the appropriate payment API based on payment scenario
      let paymentResponse;
      
      if (isSecondInstallment) {
        // Second installment payment - always use monthly payment API
        paymentResponse = await paymentService.createMonthlyPayment(paymentData);
      } else if (paymentPlan === 'OneTime') {
        // Full one-time payment
        paymentResponse = await paymentService.createFullPayment(paymentData as FullPaymentRequest);
      } else {
        // First installment of two-time payment
        paymentResponse = await paymentService.createMonthlyPayment(paymentData);
      }
      
      if (paymentResponse.success && paymentResponse.paymentUrl) {
        // Store payment info for later reference
        localStorage.setItem('currentPayment', JSON.stringify({
          orderCode: paymentResponse.orderCode,
          invoiceId: paymentResponse.invoiceId,
          amount: paymentResponse.amount,
          itemId: reservation.id,
          reservationItemId: reservationItemId,
          itemName: itemName,
          studentId: studentId,
          paymentPlan: isSecondPayment ? 'SecondInstallment' : paymentPlan,
          isSecondPayment: isSecondPayment,
          timestamp: new Date().toISOString()
        }));

        // Redirect to PAYOS payment page
        redirectToPayOS(paymentResponse.paymentUrl);
        
        // Close the dialog
        onOpenChange(false);
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      handlePaymentFailure(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // You can show an error message to the user here
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary-600" />
            Payment Confirmation
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="overflow-y-auto">
          <div className="space-y-6">
          {/* Payment Item Summary */}
          <div className=" border border-primary-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {isSecondPayment ? 'Second Payment Details' : isSingleItem ? 'Item Details' : 'Package Summary'}
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* Show second payment notice */}
              {isSecondPayment && reservationItems[0].secondPayment && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Second Installment Payment</span>
                  </div>
                  <p className="text-sm text-orange-600 mb-2">
                    You have already paid the first installment. This is your second and final payment.
                  </p>
                  {reservationItems[0].secondPayment.dueDate && (
                    <p className="text-sm text-orange-700 font-medium">
                      Due Date: {new Date(reservationItems[0].secondPayment.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}
              
              {isSingleItem ? (
                // Single Item View
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Course Name:</span>
                    <span className="font-medium">{reservationItems[0].courseName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Course Code:</span>
                    <span className="font-medium">{reservationItems[0].courseCode}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{reservationItems[0].category}</span>
                  </div>

                  {reservationItems[0].description && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600">Description:</span>
                      <span className="text-sm text-gray-700">{reservationItems[0].description}</span>
                    </div>
                  )}
                  
                  {/* Show pricing breakdown for second payment */}
                  {isSecondPayment && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Original Course Price:</span>
                        <span className="font-medium text-gray-500 line-through">{formatPrice(reservationItems[0].price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total with 10% Fee:</span>
                        <span className="font-medium text-gray-900">{formatPrice(Math.round(reservationItems[0].price * 1.1))}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">1st Installment (Paid):</span>
                        <span className="font-medium text-green-600">{formatPrice(Math.round((reservationItems[0].price * 1.1) / 2))}</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                // Multiple Items / Package View
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Package Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reservation.packageName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReservationTypeColor()}`}>
                        {getReservationType()}
                      </span>
                    </div>
                  </div>
                  
                  {reservation.packageCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Package Code:</span>
                      <span className="font-medium">{reservation.packageCode}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{reservationItems.length} items</span>
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.reservationStatus)}`}>
                  {reservation.reservationStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">{formatDate(reservation.expiresAt)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-primary-200 mt-3">
                <span className="text-lg font-semibold text-gray-900">
                  {isSecondPayment ? '2nd Installment Amount:' : 'Payment Amount:'}
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  {paymentPlan === 'TwoTime' ? formatPrice(perPaymentAmount) : formatPrice(totalAmount)}
                </span>
              </div>
              {/* Show fee breakdown for first installment */}
              {paymentPlan === 'TwoTime' && !isSecondPayment && (
                <>
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-2">
                    <span>Total (with 10% fee):</span>
                    <span className="font-semibold text-gray-900">{formatPrice(totalWithFee)}</span>
                  </div>
                  <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 p-3 rounded-lg mt-2">
                    <strong>Note:</strong> Two-time payment includes 10% processing fee. Each installment is half of the total with fee.
                  </div>
                </>
              )}
              {/* Show info for second installment */}
              {isSecondPayment && (
                <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 p-3 rounded-lg mt-2">
                  <strong>Info:</strong> This is your final payment. After this, you'll have full access to the course.
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Plan */}
            {!isSecondPayment && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Payment Plan</h4>
                </div>
                <div className="space-y-4">
                  {/* Full Payment */}
                  <div 
                    className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentPlan === 'OneTime' 
                        ? 'border-accent-200 bg-accent-100 shadow-md' 
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentPlan('OneTime')}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentPlan === 'OneTime' 
                          ? 'border-primary-600 bg-primary-600' 
                          : 'border-gray-300'
                      }`}>
                        {paymentPlan === 'OneTime' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary-600" />
                            <span className="font-bold text-gray-900">One-time Payment</span>
                          </div>
                          <span className="text-2xl font-bold text-primary-600">{formatPrice(totalAmount)}</span>
                        </div>
                        <p className="text-sm text-gray-600">Pay the entire amount at once</p>
                      </div>
                    </div>
                  </div>

                  {/* Two-time Payment */}
                  <div 
                    className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentPlan === 'TwoTime' 
                        ? 'border-accent-200 bg-accent-100 shadow-md' 
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentPlan('TwoTime')}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentPlan === 'TwoTime' 
                          ? 'border-primary-600 bg-primary-600' 
                          : 'border-gray-300'
                      }`}>
                        {paymentPlan === 'TwoTime' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary-600" />
                            <span className="font-bold text-gray-900">Two-time Payment</span>
                          </div>
                          <span className="text-2xl font-bold text-primary-600">{formatPrice(Math.round((totalAmount * 1.1) / 2))}</span>
                        </div>
                        <p className="text-sm text-gray-600">First installment payment</p>
                        <div className="text-xs text-orange-600 font-medium mt-2">
                          Total amount: {formatPrice(Math.round(totalAmount * 1.1))} (includes 10% fee)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Student Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
                {isLoadingProfile && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 ml-2"></div>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Your profile information has been automatically filled and cannot be edited here.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none transition-all"
                placeholder="Any special instructions or notes..."
              />
            </div>
          </form>
          </div>
        </DialogBody>

        <DialogFooter className="border-t border-gray-200 pt-4 mt-4">
          <div className="bg-gradient-to-r from-secondary-100 to-accent-100 border border-primary-200 rounded-xl shadow-sm p-5 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Total Amount:</div>
                <div className="text-3xl font-bold text-primary-600">
                  {isSecondPayment 
                    ? formatPrice(totalAmount)
                    : paymentPlan === 'OneTime' 
                      ? formatPrice(totalAmount) 
                      : formatPrice(perPaymentAmount)
                  }
                </div>
                {paymentPlan === 'TwoTime' && !isSecondPayment && (
                  <div className="text-sm text-gray-600 pt-2 border-t border-primary-200 mt-2">
                    Total: <span className="font-semibold text-gray-900">{formatPrice(totalWithFee)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1 sm:flex-initial"
                  disabled={isProcessing}
                  iconLeft={isProcessing ? undefined : <CheckCircle2 className="w-4 h-4" />}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  {isProcessing ? "Processing..." : 
                    isSecondPayment 
                      ? `Pay 2nd Installment`
                      : paymentPlan === 'OneTime' 
                        ? `Pay Now` 
                        : `Pay First Installment`
                  }
                </Button>
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
