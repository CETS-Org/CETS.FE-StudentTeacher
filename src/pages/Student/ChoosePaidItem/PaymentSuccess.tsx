import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment data from URL parameters
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    const invoiceId = searchParams.get('invoiceId');

    if (orderCode) {
      setPaymentData({
        orderCode,
        status: status || 'PAID',
        amount: amount ? parseFloat(amount) : null,
        invoiceId: invoiceId || null
      });
    }

    setLoading(false);
  }, [searchParams]);

  const handleReturnToPayment = () => {
    navigate('/student/choose-paid-item');
  };

  const handleViewMyClasses = () => {
    navigate('/student/my-classes');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Payment Successful"
      />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100 text-lg">
              Your payment has been processed successfully
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8">
            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Code:</span>
                    <span className="font-mono font-medium text-gray-900">
                      #{paymentData.orderCode}
                    </span>
                  </div>
                  
                  {paymentData.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600 text-lg">
                        {formatPrice(paymentData.amount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {paymentData.status}
                    </span>
                  </div>
                  
                  {paymentData.invoiceId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Invoice ID:</span>
                      <span className="font-mono text-sm text-gray-900">
                        {paymentData.invoiceId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    What happens next?
                  </h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• You will receive a confirmation email shortly</li>
                    <li>• Your course access will be activated within 5 minutes</li>
                    <li>• You can start learning immediately in "My Classes"</li>
                    <li>• Your payment receipt is available in your account</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                variant="primary"
                onClick={handleViewMyClasses}
                className="w-full"
                iconLeft={<ExternalLink className="w-5 h-5" />}
              >
                Go to My Classes
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleReturnToPayment}
                className="w-full"
                iconLeft={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Payment Options
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact our support team at{' '}
                <a 
                  href="mailto:support@cets.edu.vn" 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  support@cets.edu.vn
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
