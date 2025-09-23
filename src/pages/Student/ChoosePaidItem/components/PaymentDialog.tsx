import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { 
  CreditCard, 
  Smartphone, 
  Building2,
  DollarSign,
  Shield,
  Lock
} from "lucide-react";

import type { PaymentDialogProps, PaymentMethod } from "@/types/payment";

export default function PaymentDialog({ 
  open, 
  onOpenChange, 
  item, 
  onPaymentSubmit 
}: PaymentDialogProps) {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "credit_card" as PaymentMethod,
    installmentPlan: null as any,
    studentInfo: {
      studentId: "STU001", // In real app, get from auth context
      fullName: "John Doe", // In real app, get from user profile
      email: "john.doe@example.com", // In real app, get from user profile
      phone: "+84 123 456 789"
    },
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    {
      id: "credit_card" as PaymentMethod,
      name: "Credit Card",
      icon: <CreditCard className="w-5 h-5" />,
      description: "Visa, Mastercard, JCB"
    },
    {
      id: "debit_card" as PaymentMethod,
      name: "Debit Card",
      icon: <CreditCard className="w-5 h-5" />,
      description: "ATM cards from local banks"
    },
    {
      id: "bank_transfer" as PaymentMethod,
      name: "Bank Transfer",
      icon: <Building2 className="w-5 h-5" />,
      description: "Direct bank transfer"
    },
    {
      id: "digital_wallet" as PaymentMethod,
      name: "Digital Wallet",
      icon: <Smartphone className="w-5 h-5" />,
      description: "MoMo, ZaloPay, VNPay"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method,
      installmentPlan: null // Reset installment plan when payment method changes
    }));
  };

  const handleInstallmentPlanChange = (plan: any) => {
    setPaymentData(prev => ({
      ...prev,
      installmentPlan: plan
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalPaymentData = {
        itemId: item.id,
        itemName: item.name,
        amount: paymentData.installmentPlan ? paymentData.installmentPlan.monthlyAmount : item.price,
        paymentMethod: paymentData.paymentMethod,
        installmentPlan: paymentData.installmentPlan,
        studentInfo: paymentData.studentInfo,
        notes: paymentData.notes
      };

      await onPaymentSubmit(finalPaymentData);
    } catch (error) {
      console.error("Payment submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalAmount = () => {
    if (paymentData.installmentPlan) {
      return paymentData.installmentPlan.totalAmount;
    }
    return item.price;
  };

  const getPaymentAmount = () => {
    if (paymentData.installmentPlan) {
      return paymentData.installmentPlan.monthlyAmount;
    }
    return item.price;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-600 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
              <p className="text-sm text-gray-600">Secure checkout for your purchase</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Item Summary */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Item Summary</h3>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Installment Options */}
          {item.installmentOptions && item.installmentOptions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Payment Plan</h3>
              <div className="space-y-3">
                {/* One-time Payment */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    !paymentData.installmentPlan 
                      ? "border-primary-600 bg-primary-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleInstallmentPlanChange(null)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">One-time Payment</div>
                      <div className="text-sm text-gray-600">
                        Pay {formatPrice(item.price)} now
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installment Options */}
                {item.installmentOptions.map((option, index) => (
                  <div 
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentData.installmentPlan === option
                        ? "border-primary-600 bg-primary-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInstallmentPlanChange(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {option.plan.charAt(0).toUpperCase() + option.plan.slice(1)} Installment
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.installments} payments of {formatPrice(option.monthlyAmount)}
                        </div>
                        {option.interestRate && option.interestRate > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            Interest rate: {option.interestRate}%
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-600">
                          {formatPrice(option.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                    paymentData.paymentMethod === method.id
                      ? "border-primary-600 bg-primary-50 shadow-sm ring-1 ring-primary-600" 
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  onClick={() => handlePaymentMethodChange(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${
                      paymentData.paymentMethod === method.id
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-0.5">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentData.paymentMethod === method.id
                        ? "border-primary-600 bg-primary-600"
                        : "border-gray-300"
                    }`}>
                      {paymentData.paymentMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={paymentData.studentInfo.fullName}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    studentInfo: { ...prev.studentInfo, fullName: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={paymentData.studentInfo.email}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    studentInfo: { ...prev.studentInfo, email: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={paymentData.studentInfo.phone}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    studentInfo: { ...prev.studentInfo, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your phone number (optional)"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Item Price:</span>
                <span>{formatPrice(item.price)}</span>
              </div>
              {paymentData.installmentPlan && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Plan:</span>
                    <span>{paymentData.installmentPlan.installments} installments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span>{formatPrice(paymentData.installmentPlan.monthlyAmount)}</span>
                  </div>
                  {paymentData.installmentPlan.interestRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interest:</span>
                      <span>{formatPrice(paymentData.installmentPlan.totalAmount - item.price)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-primary-600">
                    {formatPrice(getTotalAmount())}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment Amount:</span>
                  <span>{formatPrice(getPaymentAmount())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-1">Secure Payment</div>
              <div>Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.</div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !paymentData.studentInfo.fullName || !paymentData.studentInfo.email}
              className="flex-1"
              iconLeft={<Lock className="w-4 h-4" />}
            >
              {isSubmitting ? "Processing Payment..." : `Pay ${formatPrice(getPaymentAmount())}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
