import { usePageTitle } from "../hooks/usePageTitle";
import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Breadcrumbs from "../components/ui/Breadcrumbs";

type Request = {
  id: string;
  title: string;
  owner: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
};

const sampleRequests: Request[] = [
  { 
    id: "REQ-1001", 
    title: "Room booking for event", 
    owner: "Alice Johnson", 
    status: "open", 
    priority: "high",
    createdAt: "2024-01-15"
  },
  { 
    id: "REQ-1002", 
    title: "Equipment maintenance", 
    owner: "Bob Smith", 
    status: "in_progress", 
    priority: "medium",
    createdAt: "2024-01-14"
  },
  { 
    id: "REQ-1003", 
    title: "Software installation request", 
    owner: "Carol Davis", 
    status: "closed", 
    priority: "low",
    createdAt: "2024-01-13"
  },
  { 
    id: "REQ-1004", 
    title: "Network access issue", 
    owner: "David Wilson", 
    status: "open", 
    priority: "high",
    createdAt: "2024-01-12"
  },
];

export default function Requests() {
  usePageTitle("Requests");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "closed">("all");

  const filteredRequests = filter === "all" 
    ? sampleRequests 
    : sampleRequests.filter(req => req.status === filter);

  const getPriorityBadge = (priority: Request['priority']) => {
    const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    switch (priority) {
      case "high":
        return `${baseClasses} bg-error-100 text-error-800`;
      case "medium":
        return `${baseClasses} bg-warning-100 text-warning-800`;
      case "low":
        return `${baseClasses} bg-success-100 text-success-800`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-800`;
    }
  };

  const getStatusBadge = (status: Request['status']) => {
    const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    switch (status) {
      case "open":
        return `${baseClasses} bg-success-100 text-success-800`;
      case "in_progress":
        return `${baseClasses} bg-accent-100 text-accent-800`;
      case "closed":
        return `${baseClasses} bg-neutral-100 text-neutral-800`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-800`;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Requests" },
        ]}
      />
      
      <PageHeader
        title="Service Requests"
        subtitle="Manage and track all service requests"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">Export</Button>
            <Button>New Request</Button>
          </div>
        }
      />

      <Card title="Request Filters" description="Filter requests by status">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === "all" ? "primary" : "ghost"}
            onClick={() => setFilter("all")}
          >
            All ({sampleRequests.length})
          </Button>
          <Button 
            variant={filter === "open" ? "primary" : "ghost"}
            onClick={() => setFilter("open")}
          >
            Open ({sampleRequests.filter(r => r.status === "open").length})
          </Button>
          <Button 
            variant={filter === "in_progress" ? "primary" : "ghost"}
            onClick={() => setFilter("in_progress")}
          >
            In Progress ({sampleRequests.filter(r => r.status === "in_progress").length})
          </Button>
          <Button 
            variant={filter === "closed" ? "primary" : "ghost"}
            onClick={() => setFilter("closed")}
          >
            Closed ({sampleRequests.filter(r => r.status === "closed").length})
          </Button>
        </div>
      </Card>

      <Card title="Requests List" description={`Showing ${filteredRequests.length} request(s)`}>
        <Table
          columns={[
            { header: "ID", accessor: (r) => r.id },
            { header: "Title", accessor: (r) => r.title },
            { header: "Owner", accessor: (r) => r.owner },
            { header: "Priority", accessor: (r) => (
              <span className={getPriorityBadge(r.priority)}>
                {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
              </span>
            )},
            { header: "Status", accessor: (r) => (
              <span className={getStatusBadge(r.status)}>
                {r.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            )},
            { header: "Created", accessor: (r) => r.createdAt },
            { header: "Actions", accessor: () => (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">View</Button>
                <Button size="sm" variant="ghost">Edit</Button>
              </div>
            )},
          ]}
          data={filteredRequests}
          emptyState="No requests found"
        />
      </Card>
    </div>
  );
}
