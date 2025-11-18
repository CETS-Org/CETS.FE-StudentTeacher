import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { 
  Clock,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

import PaymentHistoryList from "./components/PaymentHistoryList";

export default function PaymentHistory() {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Class Reservations", href: "/student/choose-paid-item" },
    { label: "Payment History" }
  ];

  return (
    <div className="p-6 max-w-full space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Payment History"
        description="View all your payment transactions and invoices"
        icon={<Clock className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Back to Reservations',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: () => {
              navigate("/student/choose-paid-item");
            }
          }
        ]}
      />

      {/* Main Content */}
      <PaymentHistoryList />
    </div>
  );
}
