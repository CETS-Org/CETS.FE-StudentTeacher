import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { 
  Clock,
  Package
} from "lucide-react";

import ClassReservationsList from "./components/ClassReservationsList";

export default function ChoosePaidItem() {

  const breadcrumbItems = [
    { label: "Class Reservations" }
  ];

  return (
    <div className="p-6 max-w-full space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title="Class Reservations"
        description="View and manage your reserved course packages"
        icon={<Package className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Payment History',
            variant: 'secondary',
            icon: <Clock className="w-4 h-4" />,
            onClick: () => {
              console.log("Navigate to payment history");
            }
          }
        ]}
      />

      {/* Main Content */}
      <ClassReservationsList />
    </div>
  );
}
