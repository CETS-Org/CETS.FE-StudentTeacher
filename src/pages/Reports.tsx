import { usePageTitle } from "../hooks/usePageTitle";
import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Breadcrumbs from "../components/ui/Breadcrumbs";

type ReportType = {
  id: string;
  name: string;
  description: string;
  category: "operational" | "financial" | "performance";
  lastGenerated: string;
  status: "ready" | "generating" | "failed";
};

const sampleReports: ReportType[] = [
  {
    id: "RPT-001",
    name: "Monthly Request Summary",
    description: "Overview of all service requests for the current month",
    category: "operational",
    lastGenerated: "2024-01-15",
    status: "ready"
  },
  {
    id: "RPT-002", 
    name: "System Performance Metrics",
    description: "Detailed analysis of system performance and uptime",
    category: "performance",
    lastGenerated: "2024-01-14",
    status: "ready"
  },
  {
    id: "RPT-003",
    name: "Budget Analysis Report",
    description: "Financial breakdown of departmental expenses and allocations",
    category: "financial",
    lastGenerated: "2024-01-10",
    status: "generating"
  },
  {
    id: "RPT-004",
    name: "User Activity Report",
    description: "Analysis of user engagement and system usage patterns",
    category: "operational",
    lastGenerated: "2024-01-08",
    status: "failed"
  }
];

export default function Reports() {
  usePageTitle("Reports");
  const [filter, setFilter] = useState<"all" | "operational" | "financial" | "performance">("all");

  const filteredReports = filter === "all" 
    ? sampleReports 
    : sampleReports.filter(report => report.category === filter);

  const getCategoryBadge = (category: ReportType['category']) => {
    const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    switch (category) {
      case "operational":
        return `${baseClasses} bg-primary-100 text-primary-800`;
      case "financial":
        return `${baseClasses} bg-success-100 text-success-800`;
      case "performance":
        return `${baseClasses} bg-accent-100 text-accent-800`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-800`;
    }
  };

  const getStatusBadge = (status: ReportType['status']) => {
    const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    switch (status) {
      case "ready":
        return `${baseClasses} bg-success-100 text-success-800`;
      case "generating":
        return `${baseClasses} bg-warning-100 text-warning-800`;
      case "failed":
        return `${baseClasses} bg-error-100 text-error-800`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-800`;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Reports" },
        ]}
      />
      
      <PageHeader
        title="System Reports"
        subtitle="Generate and access various system reports"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Schedule Report</Button>
            <Button>Generate Custom Report</Button>
          </div>
        }
      />

      <Card title="Report Categories" description="Filter reports by category">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === "all" ? "primary" : "ghost"}
            onClick={() => setFilter("all")}
          >
            All ({sampleReports.length})
          </Button>
          <Button 
            variant={filter === "operational" ? "primary" : "ghost"}
            onClick={() => setFilter("operational")}
          >
            Operational ({sampleReports.filter(r => r.category === "operational").length})
          </Button>
          <Button 
            variant={filter === "financial" ? "primary" : "ghost"}
            onClick={() => setFilter("financial")}
          >
            Financial ({sampleReports.filter(r => r.category === "financial").length})
          </Button>
          <Button 
            variant={filter === "performance" ? "primary" : "ghost"}
            onClick={() => setFilter("performance")}
          >
            Performance ({sampleReports.filter(r => r.category === "performance").length})
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card 
            key={report.id} 
            title={report.name} 
            description={report.description}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={getCategoryBadge(report.category)}>
                  {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                </span>
                <span className={getStatusBadge(report.status)}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              
              <div className="text-sm text-neutral-600">
                <p>Last generated: {report.lastGenerated}</p>
                <p className="text-xs text-neutral-500 mt-1">Report ID: {report.id}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-200">
                <Button 
                  size="sm" 
                  variant="primary"
                  disabled={report.status !== "ready"}
                >
                  {report.status === "ready" ? "Download" : "Generating..."}
                </Button>
                <Button size="sm" variant="ghost">
                  View Details
                </Button>
                <Button size="sm" variant="ghost">
                  Schedule
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card title="No Reports Found" description="No reports match the selected filter">
          <div className="text-center py-8">
            <p className="text-neutral-600 mb-4">Try selecting a different category or generate a new report.</p>
            <Button>Generate New Report</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
