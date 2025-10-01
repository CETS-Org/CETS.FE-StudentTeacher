import { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import { 
  X, 
  CreditCard, 
  Package,
  User,
  DollarSign
} from "lucide-react";

import { getUserInfo } from "@/lib/utils";
import { paymentService, redirectToPayOS, handlePaymentFailure } from "@/services/paymentService";
import type { 
  ClassReservationPaymentDialogProps,
  InstallmentInfo
} from "@/types/payment";

export default function ClassReservationPaymentDialog({
  open,
  onOpenChange,
  reservation,
  reservationItems
}: Omit<ClassReservationPaymentDialogProps, 'onPaymentSubmit'>) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentPlan, setPaymentPlan] = useState<'one_time' | 'two_time'>('one_time');
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

  const fetchPersonalDetails = async () => {
    setIsLoadingProfile(true);
    try {
      // Get user info from localStorage (set during login)
      const userInfo = getUserInfo();
      
      console.log("Raw userInfo from localStorage:", userInfo);
      
      if (userInfo) {
        // Use actual user data from authentication
        setStudentName(userInfo.fullName || "");
        setStudentEmail(userInfo.email || "");
        setStudentPhone(userInfo.phoneNumber || "");
        
        console.log("Loaded user profile:", {
          name: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phoneNumber,
          allFields: Object.keys(userInfo)
        });
      } else {
        // If no user info found, user might not be logged in
        console.warn("No user info found in localStorage. User might not be logged in.");
        
        // Set fallback values
        setStudentName("");
        setStudentEmail("");
        setStudentPhone("");
        
        // Optional: You could redirect to login here
        // navigate('/login');
      }
      
      // Small delay to show loading state (optional)
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
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

  // Calculate total from all reservation items
  const totalAmount = useMemo(() => {
    return reservation.totalPrice;
  }, [reservation.totalPrice]);

  // Calculate installment info for the currently selected type
  const installmentInfo = useMemo((): InstallmentInfo => {
    if (paymentPlan === 'two_time') {
      return {
        numberOfInstallments: 2,
        installmentAmount: Math.ceil(totalAmount / 2),
        description: '2 equal payments'
      };
    }
    
    return {
      numberOfInstallments: 1,
      installmentAmount: totalAmount,
      description: 'Full payment'
    };
  }, [paymentPlan, totalAmount]);

  // Calculate amounts for each payment option
  const twoPaymentAmount = useMemo(() => {
    return Math.ceil(totalAmount / 2);
  }, [totalAmount]);

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
        console.log('Processing payment for reservation item ID:', reservationItemId);
      } else {
        throw new Error('No reservation items available');
      }

      // Prepare payment data for API
      const monthlyPaymentData = {
        reservationItemId: reservationItemId, // Use actual reservation item ID
        studentId: studentId, // Get from localStorage
        fullName: studentName.trim(),
        email: studentEmail.trim(),
        phoneNumber: studentPhone.trim(),
        note: notes || ""
      };
      
      console.log('Monthly payment data:', monthlyPaymentData);

      // Call the payment API
      const paymentResponse = await paymentService.createMonthlyPayment(monthlyPaymentData);
      
      if (paymentResponse.success && paymentResponse.paymentUrl) {
        // Store payment info for later reference
        localStorage.setItem('currentPayment', JSON.stringify({
          orderCode: paymentResponse.orderCode,
          invoiceId: paymentResponse.invoiceId,
          amount: paymentResponse.amount,
          itemId: reservation.id,
          reservationItemId: reservationItemId, // Add reservationItemId for callback
          itemName: reservation.packageName || 'Class Reservation',
          studentId: studentId, // Use studentId from localStorage
          timestamp: new Date().toISOString()
        }));

        // Redirect to PAYOS payment page
        redirectToPayOS(paymentResponse.paymentUrl);
        
        // Close the dialog
        onOpenChange(false);
        
        // Show success message (optional)
        console.log('Payment initiated successfully:', paymentResponse);
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

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if clicking on the background, not the dialog content
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment Confirmation</h2>
              <p className="text-sm text-gray-600">Complete your reservation payment</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reservation Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Reservation Summary</h3>
            </div>
            
            <div className="space-y-3">
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
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.reservationStatus)}`}>
                  {reservation.reservationStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reserved:</span>
                <span className="font-medium">{formatDate(reservation.createdAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">{formatDate(reservation.expiresAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{reservationItems.length} items</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(reservation.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'credit_card' ? 'border-primary-500 bg-secondary-200' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <CreditCard className="w-4 h-4 mr-2 text-primary-600" />
                  <span className="text-sm font-medium">Credit Card</span>
                </label>
                
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'bank_transfer' ? 'border-primary-500 bg-secondary-200' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <DollarSign className="w-4 h-4 mr-2 text-primary-600" />
                  <span className="text-sm font-medium">Bank Transfer</span>
                </label>
              </div>
            </div>

            {/* Payment Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Plan
              </label>
              <div className="space-y-3">
                {/* One-time Payment */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentPlan === 'one_time' ? 'border-primary-500 bg-secondary-200' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="one_time"
                    checked={paymentPlan === 'one_time'}
                    onChange={(e) => setPaymentPlan(e.target.value as 'one_time')}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">One-time Payment</span>
                      <span className="text-lg font-bold text-primary-600">{formatPrice(totalAmount)}</span>
                    </div>
                    <p className="text-xs text-gray-600">Pay the entire amount now</p>
                  </div>
                </label>

                {/* Two-time Payment */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentPlan === 'two_time' ? 'border-primary-500 bg-secondary-200' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="two_time"
                    checked={paymentPlan === 'two_time'}
                    onChange={(e) => setPaymentPlan(e.target.value as 'two_time')}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Two-time Payment</span>
                      <span className="text-lg font-bold text-primary-600">{formatPrice(twoPaymentAmount)}/payment</span>
                    </div>
                    <p className="text-xs text-gray-600">Split into 2 equal payments</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Total: {formatPrice(totalAmount)}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Student Information
                {isLoadingProfile && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 ml-2"></div>
                )}
              </h4>
              
              {/* Show message if no user data loaded */}
              {!isLoadingProfile && !studentName && !studentEmail && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Please fill in your information manually</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    We couldn't load your profile data. Please enter your details below.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoadingProfile}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoadingProfile}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isLoadingProfile}
                  placeholder="+84 123 456 789"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Any special instructions or notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isProcessing || isLoadingProfile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isProcessing || isLoadingProfile}
                iconLeft={isProcessing ? undefined : <CreditCard className="w-4 h-4" />}
              >
                {isLoadingProfile ? "Loading..." : isProcessing ? "Processing..." : 
                  paymentPlan === 'one_time' 
                    ? `Pay ${formatPrice(totalAmount)}` 
                    : `Pay First Installment ${formatPrice(installmentInfo.installmentAmount)}`
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
