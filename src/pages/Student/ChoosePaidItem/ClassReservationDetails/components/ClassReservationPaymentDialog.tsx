import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { 
  X, 
  CreditCard, 
  Package,
  User,
  DollarSign
} from "lucide-react";

import type { ClassReservationResponse } from "@/types/payment";
import type { ReservationItem } from "../data/mockReservationDetailsData";
import { getUserInfo } from "@/lib/utils";

interface ClassReservationPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ClassReservationResponse;
  reservationItems: ReservationItem[];
  onPaymentSubmit: (paymentData: ReservationPaymentRequest) => void;
}

export interface ReservationPaymentRequest {
  reservationId: string;
  packageName: string;
  totalAmount: number;
  paymentMethod: string;
  studentInfo: {
    studentId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  notes?: string;
}

export default function ClassReservationPaymentDialog({
  open,
  onOpenChange,
  reservation,
  reservationItems,
  onPaymentSubmit
}: ClassReservationPaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData: ReservationPaymentRequest = {
        reservationId: reservation.id,
        packageName: reservation.packageName || '',
        totalAmount: reservation.totalPrice,
        paymentMethod,
        studentInfo: {
          studentId: reservation.studentID,
          fullName: studentName,
          email: studentEmail,
          phone: studentPhone
        },
        notes: notes || undefined
      };

      onPaymentSubmit(paymentData);
    } catch (error) {
      console.error("Payment failed:", error);
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
                {isLoadingProfile ? "Loading..." : isProcessing ? "Processing..." : `Pay ${formatPrice(reservation.totalPrice)}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
