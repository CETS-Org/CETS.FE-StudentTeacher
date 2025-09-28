import { useState } from "react";
import { X, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { PaymentPlan, PlanPaymentRequest, PaymentMethod } from "@/types/payment";

interface PlanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PaymentPlan;
  onPaymentSubmit: (paymentData: PlanPaymentRequest) => void;
}

const paymentMethodIcons = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_transfer: Building2,
  digital_wallet: Smartphone,
  cash: Banknote,
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default function PlanPaymentDialog({ 
  open, 
  onOpenChange, 
  plan, 
  onPaymentSubmit 
}: PlanPaymentDialogProps) {
  
  const [paymentData, setPaymentData] = useState<Partial<PlanPaymentRequest>>({
    seriesId: plan.seriesId,
    planName: plan.name,
    totalAmount: plan.totalPrice,
    paymentMethod: 'credit_card',
    studentInfo: {
      studentId: '',
      fullName: '',
      email: '',
      phone: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.studentInfo?.fullName || !paymentData.studentInfo?.email || !paymentData.studentInfo?.studentId) {
      alert('Please fill in all required student information');
      return;
    }

    onPaymentSubmit(paymentData as PlanPaymentRequest);
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleInstallmentPlanChange = (installmentOption: any) => {
    setPaymentData(prev => ({
      ...prev,
      installmentPlan: installmentOption ? {
        plan: installmentOption.plan,
        installments: installmentOption.installments,
        monthlyAmount: installmentOption.monthlyAmount,
        totalAmount: installmentOption.totalAmount
      } : undefined,
      totalAmount: installmentOption ? installmentOption.totalAmount : plan.totalPrice
    }));
  };

  const handleStudentInfoChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      studentInfo: {
        ...prev.studentInfo!,
        [field]: value
      }
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete Plan Payment</h2>
            <p className="text-sm text-gray-600 mt-1">Pay for the entire {plan.name} plan</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Courses Included</span>
                <p className="font-semibold text-gray-900">{plan.items.length} courses</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Value</span>
                <div>
                  <p className="font-bold text-lg text-primary-600">{formatPrice(plan.totalPrice)}</p>
                  {plan.originalTotalPrice && plan.originalTotalPrice > plan.totalPrice && (
                    <p className="text-sm text-gray-500 line-through">{formatPrice(plan.originalTotalPrice)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Course List */}
            <div className="space-y-2">
              <span className="text-sm text-gray-500">Included Courses:</span>
              {plan.items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{index + 1}. {item.name}</span>
                  <span className="text-gray-600">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Plan Selection */}
          {plan.installmentOptions && plan.installmentOptions.length > 0 && (
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
                        Pay {formatPrice(plan.totalPrice)} now
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600">
                        {formatPrice(plan.totalPrice)}
                      </div>
                      <div className="text-xs text-green-600">Best Value</div>
                    </div>
                  </div>
                </div>

                {/* Installment Options */}
                {plan.installmentOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentData.installmentPlan?.plan === option.plan 
                        ? "border-primary-600 bg-primary-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInstallmentPlanChange(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {option.installments}x {option.plan === "monthly" ? "Monthly" : "Quarterly"} Installments
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(option.monthlyAmount)} per {option.plan === "monthly" ? "month" : "quarter"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice(option.totalAmount)}
                        </div>
                        {option.interestRate && (
                          <div className="text-xs text-gray-500">
                            {option.interestRate}% interest
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {plan.supportedPaymentMethods.map((method) => {
                const Icon = paymentMethodIcons[method];
                return (
                  <div
                    key={method}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                      paymentData.paymentMethod === method
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodChange(method)}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                <Input
                  type="text"
                  value={paymentData.studentInfo?.studentId || ''}
                  onChange={(e) => handleStudentInfoChange('studentId', e.target.value)}
                  placeholder="Enter student ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={paymentData.studentInfo?.fullName || ''}
                  onChange={(e) => handleStudentInfoChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={paymentData.studentInfo?.email || ''}
                  onChange={(e) => handleStudentInfoChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={paymentData.studentInfo?.phone || ''}
                  onChange={(e) => handleStudentInfoChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={paymentData.notes || ''}
              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions or notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
            >
              Complete Payment - {formatPrice(paymentData.totalAmount || plan.totalPrice)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
