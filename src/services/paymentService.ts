import { api } from '@/lib/config';

// Payment API response types
export interface MonthlyPaymentRequest {
  reservationItemId: string;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  note: string;
}

export interface MonthlyPaymentResponse {
  success: boolean;
  paymentUrl: string;
  orderCode: number;
  amount: number;
  invoiceId: string;
}

export interface PaymentWebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId: string;
  virtualAccountName: string;
  virtualAccountNumber: string;
  expectedAmount: number;
}

// Payment service functions
export const paymentService = {
  // Create monthly payment and get PAYOS redirect URL
  createMonthlyPayment: async (paymentData: MonthlyPaymentRequest): Promise<MonthlyPaymentResponse> => {
    try {
      const response = await api.createMonthlyPayment(paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating monthly payment:', error);
      throw error;
    }
  },

  // Handle payment webhook from PAYOS
  handlePaymentWebhook: async (webhookData: PaymentWebhookData): Promise<{ success: boolean; message: string }> => {
    try {
      // This would typically be handled by your backend
      // For now, we'll just log the webhook data
      console.log('Payment webhook received:', webhookData);
      
      // In a real implementation, you would:
      // 1. Verify the webhook signature
      // 2. Update payment status in your database
      // 3. Send confirmation email to user
      // 4. Update user's subscription/access status
      
      return {
        success: true,
        message: 'Payment webhook processed successfully'
      };
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      throw error;
    }
  },

};

// Utility function to redirect to PAYOS
export const redirectToPayOS = (paymentUrl: string): void => {
  // Open PAYOS payment page in a new window/tab
  window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  
  // Or redirect in the same window
  // window.location.href = paymentUrl;
};

// Utility function to handle payment success callback
export const handlePaymentSuccess = (orderCode: number, invoiceId: string): void => {
  // Store payment success data
  localStorage.setItem('lastPaymentSuccess', JSON.stringify({
    orderCode,
    invoiceId,
    timestamp: new Date().toISOString()
  }));
  
  // You can also trigger other actions like:
  // - Show success notification
  // - Update UI state
  // - Redirect to success page
  console.log('Payment successful:', { orderCode, invoiceId });
};

// Utility function to handle payment failure callback
export const handlePaymentFailure = (error: string): void => {
  // Store payment failure data
  localStorage.setItem('lastPaymentFailure', JSON.stringify({
    error,
    timestamp: new Date().toISOString()
  }));
  
  console.error('Payment failed:', error);
};
