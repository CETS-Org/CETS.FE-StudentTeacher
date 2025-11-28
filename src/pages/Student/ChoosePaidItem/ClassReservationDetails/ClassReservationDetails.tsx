import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { 
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  CreditCard,
  BookOpen,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Eye
} from "lucide-react";

import type { ClassReservationResponse, ReservationItem } from "@/types/payment";
import ClassReservationPaymentDialog from "./components/ClassReservationPaymentDialog";
import { api } from "@/api";
import { getUserInfo } from "@/lib/utils";

export default function ClassReservationDetails() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ClassReservationResponse | null>(null);
  const [reservationItems, setReservationItems] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<ReservationItem | null>(null);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        
        if (reservationId) {
          // Get studentId from localStorage
          const userInfo = getUserInfo();
          const studentId = userInfo?.id;
          
          if (!studentId) {
            console.error('Student ID not found in localStorage');
            return;
          }

          // Call API to get class reservations
          const reservationsResponse = await api.getClassReservations(studentId);
          const reservations = reservationsResponse.data;
          
          console.log('Class Reservations API Response:', reservations);
          
          // Find the specific reservation by ID
          const foundReservation = reservations.find((res: any) => res.id === reservationId);
          
          if (foundReservation) {
            // Transform API response to ClassReservationResponse format
            const transformedReservation: ClassReservationResponse = {
              id: foundReservation.id,
              studentID: foundReservation.studentID,
              coursePackageID: foundReservation.coursePackageID,
              packageCode: foundReservation.packageCode,
              packageName: foundReservation.packageName,
              packageImageUrl: foundReservation.packageImageUrl,
              totalPrice: foundReservation.totalPrice,
              description: foundReservation.description,
              reservationStatus: foundReservation.reservationStatus,
              expiresAt: foundReservation.expiresAt,
              createdAt: foundReservation.createdAt
            };
            
            setReservation(transformedReservation);
            
            // Call API to get reservation items
            const itemsResponse = await api.getReservationItems(reservationId);
            const apiItems = itemsResponse.data;
            
            console.log('Reservation Items API Response:', apiItems);
            
            // Transform API response to ReservationItem format
            const transformedItems: ReservationItem[] = apiItems.map((item: any) => ({
              id: item.id,
              courseId: item.courseId,
              courseCode: item.courseCode,
              courseName: item.courseName,
              courseImageUrl: item.courseImageUrl,
              description: item.description,
              price: item.standardPrice,
              category: item.categoryName,
              invoiceId: item.invoiceId,
              invoiceStatus: item.invoiceStatus,
              invoiceStatusCode: item.invoiceStatusCode,
              planType: item.planType,
              classReservationId: item.classReservationId,
              secondPayment: item.secondPayment ? {
                invoiceId: item.secondPayment.invoiceId,
                invoiceStatus: item.secondPayment.invoiceStatus,
                invoiceStatusCode: item.secondPayment.invoiceStatusCode,
                amount: item.secondPayment.amount,
                dueDate: item.secondPayment.dueDate
              } : undefined
            }));
            
            setReservationItems(transformedItems);
          } else {
            console.error('Reservation not found');
          }
        }
      } catch (error) {
        console.error("Error fetching reservation details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchReservationDetails();
    }
  }, [reservationId]);

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


  const isExpired = () => {
    return !!reservation && new Date(reservation.expiresAt) < new Date();
  };

  const isExpiringSoon = () => {
    if (!reservation) return false;
    const expiryDate = new Date(reservation.expiresAt);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 1 && daysDiff > 0;
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

  const handleBack = () => {
    navigate('/student/choose-paid-item');
  };

  const handlePayForItem = (item: ReservationItem) => {
    // Pay for a specific item
    setSelectedItemForPayment(item);
    setShowPaymentDialog(true);
  };

  const handleViewCourseDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };


  const breadcrumbItems = [
    { label: "Class Reservations", href: "/student/choose-paid-item" },
    { label: reservation?.packageName || "Reservation Details" }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-6 max-w-full space-y-8">
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reservation not found
              </h3>
              <p className="text-gray-600">
                The requested reservation could not be found.
              </p>
            </div>
            <Button variant="secondary" onClick={handleBack}>
              Back to Reservations
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title={`Reservation Details`}
        description={`View details and items for your class reservation`}
        icon={<Package className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Back to Reservations',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: handleBack
          }
        ]}
      />

      {/* Reservation Overview */}
      <Card>
        <div className="flex items-start justify-between gap-6">
          {/* Left Section: Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-200 rounded-xl text-primary-600">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{reservation.packageName}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReservationTypeColor()}`}>
                    {getReservationType()}
                  </span>
                </div>
                {reservation.packageCode && (
                  <p className="text-gray-600">Code: {reservation.packageCode}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.reservationStatus)}`}>
                {reservation.reservationStatus}
              </span>
            </div>

            <p className="text-gray-700 mb-6">{reservation.description}</p>

            {/* Dates and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium">Reserved: <span className="text-blue-900">{formatDate(reservation.createdAt)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className={`w-4 h-4 ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-orange-600' : 'text-red-600'}`} />
                <span className={isExpired() ? 'text-red-600 font-medium' : isExpiringSoon() ? 'text-orange-600 font-medium' : 'text-red-700 font-medium'}>
                  Expires: <span className={isExpired() ? 'text-red-800' : isExpiringSoon() ? 'text-orange-800' : 'text-red -900'}>{formatDate(reservation.expiresAt)}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Total: <span className="text-green-900 font-semibold">{formatPrice(reservation.totalPrice)}</span></span>
              </div>
            </div>
          </div>

          {/* Right Section: Summary */}
          <div className="flex-shrink-0">
            <div className="text-right mb-4">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {formatPrice(reservation.totalPrice)}
              </div>
              <p className="text-sm text-gray-600">Total Package Price</p>
            </div>

            {/* Status Warnings */}
            {isExpired() && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Reservation Expired</span>
                </div>
              </div>
            )}

            {isExpiringSoon() && !isExpired() && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Expires Soon</span>
                </div>
                <p className="text-xs text-orange-600 mt-1">Please pay for items before expiry</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reservation Items */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isPackage() ? 'Package Items' : 'Course Items'} ({reservationItems.length})
        </h3>
        
        <div className="space-y-3">
          {reservationItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                {/* Item Info */}
                 <div className="flex items-center gap-3 flex-1">
                   <div className="p-2 bg-secondary-200 rounded-lg text-primary-600">
                     <BookOpen className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-medium text-gray-900">{item.courseName}</h4>
                     <p className="text-sm text-gray-600 line-clamp-1">{item.description || 'No description available'}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs text-primary-600 bg-accent2-200 px-2 py-1 rounded-full">
                         {item.courseCode}
                       </span>
                       <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                         {item.category}
                       </span>
                       
                     </div>
                   </div>
                 </div>

                 {/* Item Price and Action */}
                 <div className="flex items-center gap-3">
                   <div className="text-right">
                     {/* Show second payment amount if status is 1stPaid */}
                     {item.invoiceStatusCode === '1stPaid' && item.secondPayment ? (
                       <>
                         <div className="font-semibold text-orange-600 text-lg">{formatPrice(item.secondPayment.amount * 1.1)}</div>
                         <div className="text-xs text-gray-500">
                           Original: <span className="line-through">{formatPrice(item.price)}</span>
                         </div>
                         <div className="text-xs text-gray-600">
                           Total with 10% fee: {formatPrice(Math.round(item.price * 1.1))}
                         </div>
                         <div className="text-xs text-orange-600 mt-1 font-medium">
                           <span className="flex items-center gap-1 justify-end">
                             <AlertCircle className="w-3 h-3" />
                             2nd Installment Due
                           </span>
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="font-semibold text-gray-900">{formatPrice(item.price)}</div>
                         <div className="text-xs text-gray-600 mt-1">
                           {item.invoiceStatus ? (
                             <span className={`flex items-center gap-1 ${
                               item.invoiceStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                             }`}>
                               <CheckCircle className="w-3 h-3" />
                               {item.invoiceStatus}
                             </span>
                           ) : (
                             <span className="text-gray-500">Not Paid</span>
                           )}
                         </div>
                       </>
                     )}
                   </div>
                   
                   {/* View Details Button */}
                   <Button
                     variant="secondary"
                     size="sm"
                     iconLeft={<Eye className="w-3 h-3" />}
                     onClick={() => handleViewCourseDetails(item.courseId)}
                   >
                     View Details
                   </Button>
                   
                   {/* Pay Button - Show for 1stPaid (second payment) or unpaid items */}
                   {item.invoiceStatusCode === '1stPaid' && item.secondPayment ? (
                     <Button
                       variant="primary"
                       size="sm"
                       iconLeft={<CreditCard className="w-3 h-3" />}
                       onClick={() => handlePayForItem(item)}
                       disabled={isExpired()}
                     >
                       Pay 2nd Installment
                     </Button>
                   ) : !item.invoiceStatus || item.invoiceStatus !== 'Paid' ? (
                     <Button
                       variant="primary"
                       size="sm"
                       iconLeft={<CreditCard className="w-3 h-3" />}
                       onClick={() => handlePayForItem(item)}
                       disabled={isExpired()}
                     >
                       Pay Now
                     </Button>
                   ) : (
                     <div className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                       Paid
                     </div>
                   )}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Items Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Items: {reservationItems.length}</span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(reservationItems.reduce((sum, item) => sum + item.price, 0))}
              </div>
              <div className="text-xs text-gray-500">Sum of individual prices</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Dialog */}
      {reservation && (
        <ClassReservationPaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          reservation={reservation}
          reservationItems={selectedItemForPayment ? [selectedItemForPayment] : reservationItems}
        />
      )}
    </div>
  );
}
