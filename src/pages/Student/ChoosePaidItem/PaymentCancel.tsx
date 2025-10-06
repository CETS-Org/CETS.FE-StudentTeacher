import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment data from URL parameters
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');

    if (orderCode) {
      setPaymentData({
        orderCode,
        status: status || 'CANCELLED',
        reason: reason || 'Payment was cancelled by user'
      });
    }

    setLoading(false);
  }, [searchParams]);

  const handleTryAgain = () => {
    navigate('/student/choose-paid-item');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // You can implement contact support functionality here
    window.open('mailto:support@cets.edu.vn?subject=Payment Issue&body=Order Code: ' + (paymentData?.orderCode || 'N/A'), '_blank');
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
        title="Payment Cancelled"
      />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cancel Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12 text-center">
            <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-orange-100 text-lg">
              Your payment was not completed
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
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <XCircle className="w-4 h-4 mr-1" />
                      {paymentData.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Reason:</span>
                    <span className="text-sm text-gray-700 text-right max-w-xs">
                      {paymentData.reason}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Information Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    What can you do now?
                  </h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Try the payment again with a different method</li>
                    <li>• Check your payment method details</li>
                    <li>• Contact support if you're having issues</li>
                    <li>• Your course selection is still saved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                variant="primary"
                onClick={handleTryAgain}
                className="w-full"
                iconLeft={<RefreshCw className="w-5 h-5" />}
              >
                Try Payment Again
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="secondary"
                  onClick={handleReturnHome}
                  className="w-full"
                  iconLeft={<ArrowLeft className="w-5 h-5" />}
                >
                  Back to Home
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleContactSupport}
                  className="w-full"
                  iconLeft={<ExternalLink className="w-5 h-5" />}
                >
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Having trouble with payment? Our support team is here to help at{' '}
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
