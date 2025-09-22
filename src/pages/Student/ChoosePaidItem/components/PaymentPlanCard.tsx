import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  ChevronRight,
  Star,
  CheckCircle,
  Clock,
  CreditCard,
  Target
} from "lucide-react";

import type { PaymentPlan } from "../data/mockPaymentPlansData";

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  onSelect: (plan: PaymentPlan) => void;
  className?: string;
}

export default function PaymentPlanCard({ plan, onSelect, className = "" }: PaymentPlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "one_time": return <CreditCard className="w-6 h-6" />;
      case "installment": return <Clock className="w-6 h-6" />;
      case "flexible": return <Target className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 relative ${className} ${
      plan.isPopular ? 'ring-2 ring-primary-500 shadow-lg' : ''
    }`}>
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-accent2-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Plan Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-secondary-200 rounded-xl text-primary-600">
            {getPlanIcon(plan.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-gray-600 text-sm">{plan.description}</p>
          </div>
          <div className="text-2xl">{plan.icon}</div>
        </div>

        {/* Plan Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{plan.totalItems}</div>
            <div className="text-sm text-gray-600">Available Items</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Starting from</div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(plan.priceRange.min)}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Plan Features</h4>
          <div className="space-y-2">
            {plan.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6 p-4 bg-secondary-200 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-primary-700">Price Range</span>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-900">
                {formatPrice(plan.priceRange.min)} - {formatPrice(plan.priceRange.max)}
              </div>
              <div className="text-xs text-primary-600">Per item</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          variant="primary"
          iconRight={<ChevronRight className="w-4 h-4" />}
          onClick={() => onSelect(plan)}
        >
          View {plan.totalItems} Items
        </Button>
      </div>
    </Card>
  );
}
