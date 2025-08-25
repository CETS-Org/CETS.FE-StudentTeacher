import { usePageTitle } from "../hooks/usePageTitle";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Breadcrumbs from "../components/ui/Breadcrumbs";

export default function Home() {
  usePageTitle("Home");

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home" },
        ]}
      />
      
      <PageHeader
        title="Home Dashboard"
        subtitle="Welcome to the CETS Admin Portal"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Quick Stats" description="Overview of system status">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Active Requests</span>
              <span className="text-lg font-semibold text-primary-600">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Pending Reports</span>
              <span className="text-lg font-semibold text-accent-600">7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">System Status</span>
              <span className="text-sm font-medium text-success-600">Online</span>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity" description="Latest system events">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm">
                <p className="text-neutral-900">New request submitted</p>
                <p className="text-neutral-500 text-xs">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-success-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm">
                <p className="text-neutral-900">Report generated</p>
                <p className="text-neutral-500 text-xs">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm">
                <p className="text-neutral-900">System maintenance completed</p>
                <p className="text-neutral-500 text-xs">3 hours ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions" description="Common tasks">
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <p className="font-medium text-neutral-900">Create New Request</p>
              <p className="text-sm text-neutral-600">Submit a new service request</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <p className="font-medium text-neutral-900">View Reports</p>
              <p className="text-sm text-neutral-600">Access system reports</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <p className="font-medium text-neutral-900">System Settings</p>
              <p className="text-sm text-neutral-600">Configure system parameters</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
