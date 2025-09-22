import { ArrowRight, Star, Clock, CreditCard, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { PaymentPlan } from "@/types/payment";

interface SeriesPlanCardProps {
  plan: PaymentPlan;
  onSelect: (plan: PaymentPlan) => void;
  onPayDirectly: (plan: PaymentPlan) => void;
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default function SeriesPlanCard({ 
  plan, 
  onSelect, 
  onPayDirectly, 
  className = "" 
}: SeriesPlanCardProps) {
  
  const totalSavings = plan.originalTotalPrice ? plan.originalTotalPrice - plan.totalPrice : 0;
  const savingsPercentage = plan.originalTotalPrice ? 
    Math.round((totalSavings / plan.originalTotalPrice) * 100) : 0;

  return (
    <Card className={`group relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${className}`}>
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            🔥 Most Popular
          </span>
        </div>
      )}

      {/* Savings Badge */}
      {totalSavings > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Save {savingsPercentage}%
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {plan.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(plan.totalPrice)}
            </span>
            {plan.originalTotalPrice && plan.originalTotalPrice > plan.totalPrice && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(plan.originalTotalPrice)}
              </span>
            )}
          </div>
          
          {totalSavings > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              You save {formatPrice(totalSavings)}!
            </p>
          )}

          {/* Installment Info */}
          {plan.installmentOptions && plan.installmentOptions.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Or from {formatPrice(plan.installmentOptions[0].monthlyAmount)}/month
            </p>
          )}
        </div>

        {/* Course Count & Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">{plan.items.length}</span>
            <p className="text-xs text-gray-500">Courses</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {plan.items.length * 20}+
            </span>
            <p className="text-xs text-gray-500">Hours</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-yellow-600 fill-current" />
            </div>
            <span className="text-sm font-semibold text-gray-900">4.8</span>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
        </div>

      

        {/* Benefits */}
        {plan.benefits && plan.benefits.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Plan Benefits:</h4>
            <ul className="space-y-1">
              {plan.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="text-xs text-primary-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Course Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Courses in this plan:</h4>
          <div className="space-y-2">
            {plan.items.slice(0, 3).map((course, index) => (
              <div key={course.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate">{index + 1}. {course.name}</span>
                <span className="text-xs text-gray-500">{formatPrice(course.price)}</span>
              </div>
            ))}
            {plan.items.length > 3 && (
              <div className="text-xs text-gray-500 text-center pt-1">
                +{plan.items.length - 3} more courses
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Pay Directly Button */}
          <Button
            onClick={() => onPayDirectly(plan)}
            className="w-full btn-primary text-sm font-semibold"
            iconLeft={<CreditCard className="w-4 h-4" />}
          >
            Pay for Entire Plan - {formatPrice(plan.totalPrice)}
          </Button>

          {/* View Details Button */}
          <Button
            onClick={() => onSelect(plan)}
            variant="secondary"
            className="w-full text-sm"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            View Course Details
          </Button>
        </div>

 
      </div>
    </Card>
  );
}
