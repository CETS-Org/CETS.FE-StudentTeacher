import type { PaymentWebhookData } from './paymentService';

/**
 * Webhook handler for PAYOS payment notifications
 * This can be used both on the frontend and backend
 */
export class WebhookHandler {
  private static instance: WebhookHandler;
  private webhookSecret: string;

  constructor(webhookSecret?: string) {
    this.webhookSecret = webhookSecret || process.env.PAYOS_WEBHOOK_SECRET || '';
  }

  static getInstance(webhookSecret?: string): WebhookHandler {
    if (!WebhookHandler.instance) {
      WebhookHandler.instance = new WebhookHandler(webhookSecret);
    }
    return WebhookHandler.instance;
  }

  /**
   * Verify webhook signature (implement based on PAYOS documentation)
   */
  private verifySignature(payload: string, signature: string): boolean {
    // TODO: Implement signature verification based on PAYOS webhook documentation
    // This is a placeholder implementation
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured, skipping signature verification');
      return true;
    }

    // Example implementation (replace with actual PAYOS signature verification)
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Process incoming webhook from PAYOS
   */
  async processWebhook(
    payload: any,
    signature?: string,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Verify signature if provided
      if (signature && !this.verifySignature(JSON.stringify(payload), signature)) {
        return {
          success: false,
          message: 'Invalid webhook signature'
        };
      }

      // Parse webhook data
      const webhookData: PaymentWebhookData = {
        orderCode: payload.orderCode || payload.order_code,
        amount: payload.amount || 0,
        description: payload.description || '',
        accountNumber: payload.accountNumber || payload.account_number || '',
        reference: payload.reference || '',
        transactionDateTime: payload.transactionDateTime || payload.transaction_date_time || '',
        currency: payload.currency || 'VND',
        paymentLinkId: payload.paymentLinkId || payload.payment_link_id || '',
        code: payload.code || '',
        desc: payload.desc || '',
        counterAccountBankId: payload.counterAccountBankId || payload.counter_account_bank_id || '',
        virtualAccountName: payload.virtualAccountName || payload.virtual_account_name || '',
        virtualAccountNumber: payload.virtualAccountNumber || payload.virtual_account_number || '',
        expectedAmount: payload.expectedAmount || payload.expected_amount || 0
      };

      // Validate required fields
      if (!webhookData.orderCode) {
        return {
          success: false,
          message: 'Missing required field: orderCode'
        };
      }

      // Process the webhook
      const result = await this.processWebhookData(webhookData);

      // Log webhook processing
      console.log('Webhook processed successfully:', {
        orderCode: webhookData.orderCode,
        amount: webhookData.amount,
        status: webhookData.code === '00' ? 'success' : 'failed'
      });

      return {
        success: true,
        message: result.message,
        data: webhookData
      };

    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        message: 'Internal server error while processing webhook'
      };
    }
  }

  /**
   * Process webhook data
   */
  private async processWebhookData(webhookData: PaymentWebhookData): Promise<{ success: boolean; message: string }> {
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
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(webhookData: PaymentWebhookData): Promise<void> {
    try {
      // Update payment status in database
      // Send confirmation email
      // Update user subscription/access
      // Log payment success
      
      console.log('Payment success handled:', {
        orderCode: webhookData.orderCode,
        amount: webhookData.amount,
        transactionDateTime: webhookData.transactionDateTime
      });

      // Store in localStorage for frontend reference
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPaymentSuccess', JSON.stringify({
          orderCode: webhookData.orderCode,
          amount: webhookData.amount,
          timestamp: new Date().toISOString(),
          transactionId: webhookData.reference
        }));
      }

    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(webhookData: PaymentWebhookData): Promise<void> {
    try {
      // Update payment status in database
      // Send failure notification
      // Log payment failure
      
      console.log('Payment failure handled:', {
        orderCode: webhookData.orderCode,
        amount: webhookData.amount,
        error: webhookData.desc
      });

      // Store in localStorage for frontend reference
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastPaymentFailure', JSON.stringify({
          orderCode: webhookData.orderCode,
          amount: webhookData.amount,
          error: webhookData.desc,
          timestamp: new Date().toISOString()
        }));
      }

    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const webhookHandler = WebhookHandler.getInstance();

// Export utility functions for easy use
export const processPaymentWebhook = async (
  payload: any,
  signature?: string,
  headers?: Record<string, string>
) => {
  return webhookHandler.processWebhook(payload, signature, headers);
};

export const handleWebhookSuccess = async (webhookData: PaymentWebhookData) => {
  return webhookHandler.handlePaymentSuccess(webhookData);
};

export const handleWebhookFailure = async (webhookData: PaymentWebhookData) => {
  return webhookHandler.handlePaymentFailure(webhookData);
};

