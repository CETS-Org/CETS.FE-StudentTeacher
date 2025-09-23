import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Package, 
  CreditCard, 
  Award,
  DollarSign,
  ShoppingCart
} from "lucide-react";

import type { PaymentItemCardProps } from "@/types/payment";

export default function PaymentItemCard({ item, onSelect, className = "" }: PaymentItemCardProps) {
  const getItemIcon = (type: string) => {
    switch (type) {
      case "book": return <BookOpen className="w-5 h-5" />;
      case "course": return <GraduationCap className="w-5 h-5" />;
      case "exam": return <FileText className="w-5 h-5" />;
      case "material": return <Package className="w-5 h-5" />;
      case "installment": return <CreditCard className="w-5 h-5" />;
      case "certificate": return <Award className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const getDiscountPercentage = () => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    return 0;
  };

  const hasInstallmentOptions = item.installmentOptions && item.installmentOptions.length > 0;
  const discountPercentage = getDiscountPercentage();

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Header with Icon and Badges */}
      <div className="relative mb-4 flex items-center justify-between">
        <div className="text-primary-600">
          {getItemIcon(item.type)}
        </div>
        
        <div className="flex gap-2">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Badge */}
          {item.stock !== undefined && item.stock < 10 && (
            <div className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Only {item.stock} left
            </div>
          )}

          {/* Availability Badge */}
          {!item.isAvailable && (
            <div className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Out of Stock
            </div>
          )}
        </div>
      </div>

      {/* Item Info */}
      <div className="space-y-3">
        {/* Category and Type */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary-600 bg-accent-100 px-2 py-1 rounded-full">
            {item.category}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            {getItemIcon(item.type)}
            <span className="text-xs capitalize">{item.type}</span>
          </div>
        </div>

        {/* Item Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {item.description}
        </p>


        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          {/* Installment Options */}
          {hasInstallmentOptions && (
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <CreditCard className="w-3 h-3" />
                <span>Installment available</span>
              </div>
              {item.installmentOptions!.slice(0, 1).map((option, index) => (
                <div key={index} className="text-gray-500">
                  From {formatPrice(option.monthlyAmount)}/month
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Action Button */}
        <Button
          className="w-full"
          variant={item.isAvailable ? "primary" : "secondary"}
          disabled={!item.isAvailable}
          iconLeft={<ShoppingCart className="w-4 h-4" />}
          onClick={() => onSelect(item)}
        >
          {item.isAvailable ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
}
