import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { 
  ArrowLeft,
  ShoppingCart,
  Package, 
  DollarSign
} from "lucide-react";

import type { PaymentPlan } from "../data/mockPaymentPlansData";
import type { PaidItem } from "@/types/payment";
import PaymentItemCard from "./PaymentItemCard";

interface PlanItemsListProps {
  plan: PaymentPlan;
  onBack: () => void;
  onItemSelect: (item: PaidItem) => void;
  className?: string;
}

export default function PlanItemsList({ 
  plan, 
  onBack, 
  onItemSelect, 
  className = "" 
}: PlanItemsListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "one_time": return <DollarSign className="w-5 h-5" />;
      case "installment": return <ShoppingCart className="w-5 h-5" />;
      case "flexible": return <Package className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getItemsByCategory = () => {
    const categories = plan.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, PaidItem[]>);

    return categories;
  };

  const itemsByCategory = getItemsByCategory();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-secondary-200 to-secondary-300 border-primary-200">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="secondary"
            iconLeft={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
          >
            Back to Plans
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-600 rounded-xl text-white">
            {getPlanIcon(plan.type)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
            <p className="text-gray-700 mb-2">{plan.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {plan.totalItems} Items Available
              </span>
              <span>
                {formatPrice(plan.priceRange.min)} - {formatPrice(plan.priceRange.max)}
              </span>
            </div>
          </div>
          <div className="text-3xl">{plan.icon}</div>
        </div>
      </Card>

      {/* Plan Features */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Plan Benefits</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Items by Category */}
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {items.length} items
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <PaymentItemCard
                key={item.id}
                item={item}
                onSelect={onItemSelect}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {plan.totalItems === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Package className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No items available
              </h3>
              <p className="text-gray-600">
                This payment plan doesn't have any items yet.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={onBack}
            >
              Back to Plans
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
