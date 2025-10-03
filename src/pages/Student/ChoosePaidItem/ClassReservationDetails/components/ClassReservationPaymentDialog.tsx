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
import type { ClassReservationPaymentDialogProps } from "@/types/payment";
import type { FullPaymentRequest } from "@/services/paymentService";

export default function ClassReservationPaymentDialog({
  open,
  onOpenChange,
  reservation,
  reservationItems
}: Omit<ClassReservationPaymentDialogProps, 'onPaymentSubmit'>) {
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'monthly'>('full');
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

  // Calculate total from reservation items (for the item being paid)
  const totalAmount = useMemo(() => {
    return reservationItems.reduce((sum, item) => sum + item.price, 0);
  }, [reservationItems]);

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
        console.log('Processing payment for reservation item ID:', reservationItemId);
      } else {
        throw new Error('No reservation items available');
      }

      // Prepare payment data for API
      const paymentData = {
        reservationItemId: reservationItemId,
        studentId: studentId,
        fullName: studentName.trim(),
        email: studentEmail.trim(),
        phoneNumber: studentPhone.trim(),
        note: notes || ""
      };
      
      console.log(`${paymentPlan === 'full' ? 'Full' : 'Monthly'} payment data:`, paymentData);

      // Call the appropriate payment API based on payment plan
      let paymentResponse;
      if (paymentPlan === 'full') {
        paymentResponse = await paymentService.createFullPayment(paymentData as FullPaymentRequest);
      } else {
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
          paymentPlan: paymentPlan,
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
          {/* Payment Item Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">
                {isSingleItem ? 'Item Details' : 'Package Summary'}
              </h3>
            </div>
            
            <div className="space-y-3">
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
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Payment Amount:</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Plan
              </label>
              <div className="space-y-3">
                {/* Full Payment */}
                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentPlan === 'full' ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="full"
                    checked={paymentPlan === 'full'}
                    onChange={(e) => setPaymentPlan(e.target.value as 'full')}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`w-5 h-5 ${paymentPlan === 'full' ? 'text-primary-600' : 'text-gray-500'}`} />
                        <span className="text-base font-semibold text-gray-900">Full Payment</span>
                      </div>
                      <span className="text-xl font-bold text-primary-600">{formatPrice(totalAmount)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Pay the entire amount at once</p>
                  </div>
                </label>

                {/* Monthly Payment */}
                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentPlan === 'monthly' ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="paymentPlan"
                    value="monthly"
                    checked={paymentPlan === 'monthly'}
                    onChange={(e) => setPaymentPlan(e.target.value as 'monthly')}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Package className={`w-5 h-5 ${paymentPlan === 'monthly' ? 'text-primary-600' : 'text-gray-500'}`} />
                        <span className="text-base font-semibold text-gray-900">Monthly Payment</span>
                      </div>
                      <span className="text-xl font-bold text-primary-600">{formatPrice(Math.ceil(totalAmount / 2))}</span>
                    </div>
                    <p className="text-sm text-gray-600">First installment payment</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Total amount: {formatPrice(totalAmount)}
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
                  paymentPlan === 'full' 
                    ? `Pay ${formatPrice(totalAmount)}` 
                    : `Pay First Installment ${formatPrice(Math.ceil(totalAmount / 2))}`
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
