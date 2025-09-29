import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface PaymentStatusCheckerProps {
  orderCode: number;
  onStatusChange?: (status: 'pending' | 'success' | 'failed') => void;
  className?: string;
}

export default function PaymentStatusChecker({ 
  orderCode, 
  onStatusChange,
  className = '' 
}: PaymentStatusCheckerProps) {
  const [status, setStatus] = useState<'checking' | 'pending' | 'success' | 'failed'>('checking');
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPaymentStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      // Check localStorage for payment status
      const storedPayment = localStorage.getItem('currentPayment');
      const lastSuccess = localStorage.getItem('lastPaymentSuccess');
      const lastFailure = localStorage.getItem('lastPaymentFailure');
      
      if (lastSuccess) {
        const successData = JSON.parse(lastSuccess);
        if (successData.orderCode === orderCode) {
          setStatus('success');
          onStatusChange?.('success');
          setLastChecked(new Date());
          return;
        }
      }
      
      if (lastFailure) {
        const failureData = JSON.parse(lastFailure);
        if (failureData.orderCode === orderCode) {
          setStatus('failed');
          onStatusChange?.('failed');
          setLastChecked(new Date());
          return;
        }
      }
      
      // If no specific status found, check if payment exists in current payment
      if (storedPayment) {
        const payment = JSON.parse(storedPayment);
        if (payment.orderCode === orderCode) {
          setStatus('pending');
          onStatusChange?.('pending');
        } else {
          setStatus('pending');
          onStatusChange?.('pending');
        }
      } else {
        setStatus('pending');
        onStatusChange?.('pending');
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('failed');
      onStatusChange?.('failed');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check status immediately when component mounts
    checkPaymentStatus();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkPaymentStatus, 30000);
    
    return () => clearInterval(interval);
  }, [orderCode]);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking payment status...';
      case 'success':
        return 'Payment completed successfully';
      case 'failed':
        return 'Payment failed or was cancelled';
      case 'pending':
        return 'Payment is pending confirmation';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <div className="flex-1">
        <div className="font-medium">{getStatusText()}</div>
        {lastChecked && (
          <div className="text-sm opacity-75">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
      {status === 'pending' && (
        <button
          onClick={checkPaymentStatus}
          disabled={isChecking}
          className="px-3 py-1 text-sm bg-white border border-current rounded-md hover:bg-opacity-10 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check Again'}
        </button>
      )}
    </div>
  );
}

