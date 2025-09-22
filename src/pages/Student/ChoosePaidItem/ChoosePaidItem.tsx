import { useState, useMemo } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { 
  ShoppingCart,
  Search,
  Clock,
  Layers,
  ArrowLeft
} from "lucide-react";

import type { PaidItem } from "@/types/payment";
import PaymentDialog from "./components/PaymentDialog";
import PaymentPlanCard from "./components/PaymentPlanCard";
import PlanItemsList from "./components/PlanItemsList";
import { mockPaymentPlans, type PaymentPlan } from "./data/mockPaymentPlansData";

export default function ChoosePaidItem() {
  const [currentView, setCurrentView] = useState<"plans" | "items">("plans");
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<PaidItem | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Debug: Log the imported data
  console.log("Mock payment plans imported:", mockPaymentPlans.length, "plans");

  // Filter plans based on search term
  const filteredPlans = useMemo(() => {
    if (!searchTerm) return mockPaymentPlans;

    return mockPaymentPlans.filter(plan => 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setCurrentView("items");
  };

  const handleBackToPlans = () => {
    setCurrentView("plans");
    setSelectedPlan(null);
    setSearchTerm("");
  };

  const handleItemSelect = (item: PaidItem) => {
    setSelectedItem(item);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = (paymentData: any) => {
    // In real app, submit payment to backend
    console.log("Payment submitted:", paymentData);
    setShowPaymentDialog(false);
    setSelectedItem(null);
    // Show success message or redirect
  };

  const breadcrumbItems = [
    { label: "Payment Plans" }
  ];

  return (
    <StudentLayout>
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title={currentView === "plans" ? "Payment Plans" : `${selectedPlan?.name} Items`}
        description={currentView === "plans" 
          ? "Choose a payment plan that works best for you"
          : `Browse items available in your selected plan`
        }
        icon={currentView === "plans" 
          ? <Layers className="w-5 h-5 text-white" />
          : <ShoppingCart className="w-5 h-5 text-white" />
        }
        controls={currentView === "plans" ? [
          {
            type: 'button',
            label: 'Payment History',
            variant: 'secondary',
            icon: <Clock className="w-4 h-4" />,
            onClick: () => {
              console.log("Navigate to payment history");
            }
          }
        ] : [
          {
            type: 'button',
            label: 'Back to Plans',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: handleBackToPlans
          }
        ]}
      />

      {/* Search Section - Only show when viewing plans */}
      {currentView === "plans" && (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search payment plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {currentView === "plans" ? (
        // Payment Plans View
        <div className="py-6">
          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <PaymentPlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handlePlanSelect}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Layers className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No payment plans found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "No payment plans available"
                    }
                  </p>
                </div>
                {searchTerm && (
                  <Button
                    variant="secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      ) : (
        // Plan Items View
        selectedPlan && (
          <PlanItemsList
            plan={selectedPlan}
            onBack={handleBackToPlans}
            onItemSelect={handleItemSelect}
          />
        )
      )}

      {/* Payment Dialog */}
      {selectedItem && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          item={selectedItem}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}
    </StudentLayout>
  );
}
