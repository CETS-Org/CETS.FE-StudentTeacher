import Button from "@/components/ui/Button";
import { 
  CreditCard, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  FileText
} from "lucide-react";

import type { PaymentHistoryRecord } from "@/types/payment";

interface PaymentHistoryItemProps {
  payment: PaymentHistoryRecord;
  className?: string;
}

export default function PaymentHistoryItem({ payment, className = "" }: PaymentHistoryItemProps) {
  
  const getPaymentIcon = (status?: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("paid") || statusLower.includes("complete")) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (statusLower.includes("pending")) {
      return <Clock className="w-5 h-5" />;
    }
    if (statusLower.includes("failed") || statusLower.includes("cancel")) {
      return <XCircle className="w-5 h-5" />;
    }
    return <CreditCard className="w-5 h-5" />;
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
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("paid") || statusLower.includes("complete")) {
      return "bg-green-100 text-green-800";
    }
    if (statusLower.includes("pending")) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (statusLower.includes("failed") || statusLower.includes("cancel")) {
      return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  const getPaymentMethodDisplay = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "credit_card": return "Credit Card";
      case "debit_card": return "Debit Card";
      case "bank_transfer": return "Bank Transfer";
      case "digital_wallet": return "Digital Wallet";
      case "cash": return "Cash";
      case "vnpay": return "VNPay";
      case "momo": return "MoMo";
      default: return method || "N/A";
    }
  };

  const handleDownloadInvoice = () => {
    // TODO: Implement invoice download
  };

  const handleViewDetails = () => {
    // TODO: Implement view payment details
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Icon and Payment Details */}
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            payment.invoiceStatus?.toLowerCase().includes('paid') || payment.invoiceStatus?.toLowerCase().includes('complete')
              ? 'bg-green-100 text-green-600' 
              : payment.invoiceStatus?.toLowerCase().includes('pending')
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-red-100 text-red-600'
          }`}>
            {getPaymentIcon(payment.invoiceStatus)}
          </div>
          
          {/* Payment Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {payment.name || 'Payment Transaction'}
              </h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(payment.invoiceStatus)}`}>
                {payment.invoiceStatus || 'Unknown'}
              </span>
            </div>
            
            {/* Invoice ID */}
            <p className="text-xs text-gray-500 mb-1">
              Invoice ID: {payment.invoiceId}
            </p>
            
            {/* Payment Method */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>{getPaymentMethodDisplay(payment.paymentMethod)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Student: {payment.studentName}</span>
              </div>
            </div>
            
            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Payment Date: {formatDate(payment.createdAt)}</span>
              </div>
            </div>

            {/* Installment Info */}
            {payment.installmentInfo && payment.installmentInfo.currentInstallment > 0 && (
              <div className="mt-2 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded inline-block">
                Installment Payment {payment.installmentInfo.currentInstallment}/2
                {payment.installmentInfo.nextDueDate && (
                  <span className="ml-2">
                    • Next Due: {formatDate(payment.installmentInfo.nextDueDate)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Amount */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(payment.amount)}
          </div>
          <div className="text-xs text-gray-500">
            Total Amount
          </div>
        </div>

        
        
      </div>
    </div>
  );
}
