import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { handlePaymentSuccess, handlePaymentFailure } from '@/services/paymentService';
import { apiClient } from '@/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  // Sử dụng useRef để tránh gọi API nhiều lần - track orderCode đã xử lý
  const processedOrderCode = useRef<string | null>(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      // Get payment parameters from URL
      const code = searchParams.get('code');
      const id = searchParams.get('id');
      const cancel = searchParams.get('cancel');
      const status = searchParams.get('status');
      const orderCode = searchParams.get('orderCode');
      
      // Kiểm tra nếu orderCode này đã được xử lý rồi thì return
      if (orderCode && processedOrderCode.current === orderCode) {
        return;
      }
      
      // Đánh dấu orderCode này đã được xử lý
      if (orderCode) {
        processedOrderCode.current = orderCode;
      }
      
      try {

        // Check if this is a backend callback with redirect URL
        if (code && id) {
          try {
            // Get invoiceId, studentId, and reservationItemId from localStorage if available
            const storedPayment = localStorage.getItem('currentPayment');
            let invoiceId = '';
            let studentId = '';
            let reservationItemId = '';
            if (storedPayment) {
              try {
                const payment = JSON.parse(storedPayment);
                invoiceId = payment.invoiceId || '';
                studentId = payment.studentId || '';
                reservationItemId = payment.reservationItemId || '';
              } catch (e) {
                console.warn('Error parsing stored payment data:', e);
              }
            }

            // Build API URL with invoiceId, studentId, and reservationItemId parameters
            const params = new URLSearchParams({
              code: code || '',
              id: id || '',
              cancel: cancel || 'false',
              status: status || '',
              orderCode: orderCode || ''
            });
            
            if (invoiceId) params.append('invoiceId', invoiceId);
            if (studentId) params.append('studentId', studentId);
            if (reservationItemId) params.append('reservationItemId', reservationItemId);
            
            const apiUrl = `/api/FIN_Payment/success?${params.toString()}`;
            
            // Call backend API to get payment status and redirect URL
            const response = await apiClient.get(apiUrl);
            
            const data = response.data;

            if (data.success && data.redirectUrl) {
              // Backend provided a redirect URL, navigate to it
              window.location.href = data.redirectUrl;
              return;
            } else if (data.success) {
              // Payment successful, redirect to success page
              const successInvoiceId = data.invoiceId || invoiceId || '';
              const successUrl = `/payment/success?orderCode=${data.orderCode}&status=${data.status}&amount=${data.amount || ''}&invoiceId=${successInvoiceId}`;
              navigate(successUrl);
              return;
            } else {
              // Payment failed, redirect to cancel page
              const cancelUrl = `/payment/cancel?orderCode=${orderCode}&status=${status}&reason=${data.message || 'Payment failed'}`;
              navigate(cancelUrl);
              return;
            }
          } catch (apiError) {
            // Fallback to direct URL parameter handling
          }
        }

        // Fallback: Handle direct URL parameters (for cases where backend doesn't provide redirect URL)
        if (orderCode && status) {
          
          // Get stored payment info for invoiceId
          const storedPayment = localStorage.getItem('currentPayment');

          const webhookData = {
            orderCode: parseInt(orderCode),
            amount: parseFloat(searchParams.get('amount') || '0'),
            description: searchParams.get('description') || '',
            accountNumber: searchParams.get('accountNumber') || '',
            reference: searchParams.get('reference') || '',
            transactionDateTime: searchParams.get('transactionDateTime') || '',
            currency: searchParams.get('currency') || 'VND',
            paymentLinkId: searchParams.get('paymentLinkId') || '',
            code: code || '',
            desc: searchParams.get('desc') || '',
            counterAccountBankId: searchParams.get('counterAccountBankId') || '',
            virtualAccountName: searchParams.get('virtualAccountName') || '',
            virtualAccountNumber: searchParams.get('virtualAccountNumber') || '',
            expectedAmount: parseFloat(searchParams.get('expectedAmount') || '0')
          };

          // Handle the webhook (this would typically be done by backend)
          // Determine payment status based on the response
          const isSuccess = status?.toUpperCase() === 'PAID' || 
                           status?.toLowerCase() === 'success' || 
                           code === '00' || 
                           cancel === 'false';
          
          if (isSuccess) {
            setPaymentStatus('success');
            handlePaymentSuccess(webhookData.orderCode, webhookData.paymentLinkId);
            
            // Get stored payment info
            if (storedPayment) {
              setPaymentData(JSON.parse(storedPayment));
              // Clear the stored payment info
              localStorage.removeItem('currentPayment');
            }
          } else {
            setPaymentStatus('failed');
            handlePaymentFailure(webhookData.desc || 'Payment failed');
            setError(webhookData.desc || 'Payment was not successful');
          }
        } else {
          // No valid payment data, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling payment callback:', error);
        setPaymentStatus('failed');
        setError('An error occurred while processing your payment');
        handlePaymentFailure('Payment callback error');
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleViewLearningPath = () => {
    // Navigate to learning path page
    navigate('/student/learning-path');
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {paymentStatus === 'success' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Order Code:</span>
                    <span className="font-medium">{paymentData.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('vi-VN').format(paymentData.amount)} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item:</span>
                    <span className="font-medium">{paymentData.itemName}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleViewLearningPath}
                className="w-full"
              >
                Go Learning Path
              </Button>
              <Button
                variant="secondary"
                onClick={handleReturnHome}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Your payment could not be processed. Please try again.'}
            </p>
            
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleReturnHome}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/student/choose-paid-item')}
                className="w-full"
              >
                Back to Payment Options
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

