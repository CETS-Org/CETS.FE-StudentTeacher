import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { 
  GraduationCap, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Eye
} from "lucide-react";

import type { ClassReservationResponse } from "@/types/payment";

interface ClassReservationItemProps {
  reservation: ClassReservationResponse;
  className?: string;
}

export default function ClassReservationItem({ reservation, className = "" }: ClassReservationItemProps) {
  const navigate = useNavigate();
  const getReservationIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="w-5 h-5" />;
      case "confirmed": return <CheckCircle className="w-5 h-5" />;
      case "expired": return <AlertCircle className="w-5 h-5" />;
      case "cancelled": return <Package className="w-5 h-5" />;
      default: return <GraduationCap className="w-5 h-5" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const isExpiringSoon = () => {
    const expiryDate = new Date(reservation.expiresAt);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 1 && daysDiff > 0;
  };

  const isExpired = () => {
    return new Date(reservation.expiresAt) < new Date();
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

  const handleViewDetails = () => {
    // Navigate to reservation details page
    navigate(`/student/choose-paid-item/reservations/${reservation.id}`);
  };


  return (
    <div className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Icon, Name, and Details */}
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 p-2 bg-secondary-100 rounded-lg text-primary-600">
            {getReservationIcon(reservation.reservationStatus)}
          </div>
          
          {/* Reservation Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {reservation.packageName || 'Course Package'}
              </h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${getReservationTypeColor()}`}>
                {getReservationType()}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(reservation.reservationStatus)}`}>
                {reservation.reservationStatus || 'Reserved'}
              </span>
            </div>
            
            {/* Package Code */}
            {reservation.packageCode && (
              <p className="text-xs text-gray-500 mb-1">
                Code: {reservation.packageCode}
              </p>
            )}
            
            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {reservation.description || 'Course package reservation'}
            </p>
            
            {/* Expiry Info */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Clock className={`w-3 h-3 ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : 'text-red-600'}`} />
                <span className={isExpired() ? 'text-red-600 font-medium' : isExpiringSoon() ? 'text-orange-600 font-medium' : 'text-red-700 font-medium'}>
                  Expires: <span className={isExpired() ? 'text-red-800' : isExpiringSoon() ? 'text-orange-800' : 'text-red-900'}>{formatDate(reservation.expiresAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Pricing */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-2 justify-end">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(reservation.totalPrice)}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Total Price
              </div>
              
              {/* Status Indicators */}
              <div className="flex justify-end">
                {/* Expiry Warning */}
                {isExpired() && (
                  <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Expired
                  </div>
                )}

                {/* Expiring Soon Warning */}
                {isExpiringSoon() && !isExpired() && (
                  <div className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Expires Soon
                  </div>
                )}

                {/* Active Status */}
                {!isExpired() && !isExpiringSoon() && reservation.reservationStatus?.toLowerCase() === 'pending' && (
                  <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Action Button */}
          <Button
            variant="secondary"
            iconLeft={<Eye className="w-4 h-4" />}
            onClick={handleViewDetails}
            className="min-w-[140px] text-sm"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
