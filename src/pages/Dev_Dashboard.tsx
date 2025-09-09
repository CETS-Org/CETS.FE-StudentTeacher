import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Form, { FormInput, FormSelect } from "../components/ui/Form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from "../components/ui/Dialog";
import Spinner from "../components/ui/Spinner";

import Breadcrumbs from "../components/ui/Breadcrumbs";
import { usePageTitle } from "../hooks/usePageTitle";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

type Request = {
  id: string;
  title: string;
  owner: string;
  status: "open" | "in_progress" | "closed";
};

const sample: Request[] = [
  { id: "REQ-1001", title: "Room booking for event", owner: "Alice", status: "open" },
  { id: "REQ-1002", title: "Equipment maintenance", owner: "Bob", status: "in_progress" },
];

// Static color map based on CSS custom properties
const colorPalette = {
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    300: 'var(--color-primary-300)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    800: 'var(--color-primary-800)',
    900: 'var(--color-primary-900)',
    950: 'var(--color-primary-950)',
  },
  neutral: {
    0: 'var(--color-neutral-0)',
    50: 'var(--color-neutral-50)',
    100: 'var(--color-neutral-100)',
    200: 'var(--color-neutral-200)',
    300: 'var(--color-neutral-300)',
    400: 'var(--color-neutral-400)',
    500: 'var(--color-neutral-500)',
    600: 'var(--color-neutral-600)',
    700: 'var(--color-neutral-700)',
    800: 'var(--color-neutral-800)',
    900: 'var(--color-neutral-900)',
    950: 'var(--color-neutral-950)',
  },
  accent: {
    50: 'var(--color-accent-50)',
    100: 'var(--color-accent-100)',
    200: 'var(--color-accent-200)',
    300: 'var(--color-accent-300)',
    400: 'var(--color-accent-400)',
    500: 'var(--color-accent-500)',
    600: 'var(--color-accent-600)',
    700: 'var(--color-accent-700)',
    800: 'var(--color-accent-800)',
    900: 'var(--color-accent-900)',
    950: 'var(--color-accent-950)',
  },
  success: {
    50: 'var(--color-success-50)',
    100: 'var(--color-success-100)',
    200: 'var(--color-success-200)',
    300: 'var(--color-success-300)',
    400: 'var(--color-success-400)',
    500: 'var(--color-success-500)',
    600: 'var(--color-success-600)',
    700: 'var(--color-success-700)',
    800: 'var(--color-success-800)',
    900: 'var(--color-success-900)',
  },
  warning: {
    50: 'var(--color-warning-50)',
    100: 'var(--color-warning-100)',
    200: 'var(--color-warning-200)',
    300: 'var(--color-warning-300)',
    400: 'var(--color-warning-400)',
    500: 'var(--color-warning-500)',
    600: 'var(--color-warning-600)',
    700: 'var(--color-warning-700)',
    800: 'var(--color-warning-800)',
    900: 'var(--color-warning-900)',
  },
  error: {
    50: 'var(--color-error-50)',
    100: 'var(--color-error-100)',
    200: 'var(--color-error-200)',
    300: 'var(--color-error-300)',
    400: 'var(--color-error-400)',
    500: 'var(--color-error-500)',
    600: 'var(--color-error-600)',
    700: 'var(--color-error-700)',
    800: 'var(--color-error-800)',
    900: 'var(--color-error-900)',
  },
  info: {
    50: 'var(--color-info-50)',
    100: 'var(--color-info-100)',
    200: 'var(--color-info-200)',
    300: 'var(--color-info-300)',
    400: 'var(--color-info-400)',
    500: 'var(--color-info-500)',
    600: 'var(--color-info-600)',
    700: 'var(--color-info-700)',
    800: 'var(--color-info-800)',
    900: 'var(--color-info-900)',
  },
};

export default function Dev_Dashboard() {
  usePageTitle("Dev Dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const quickRequestSchema = z.object({
    title: z.string().min(1, "Title is required"),
    owner: z.string().min(1, "Owner is required"),
    status: z.enum(["open", "in_progress", "closed"] as const, {
      message: "Status is required",
    }),
  });

  type QuickRequestForm = z.infer<typeof quickRequestSchema>;

  const methods = useForm<QuickRequestForm>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: { title: "", owner: "", status: "open" },
  });

  function handleCreate(data: QuickRequestForm) {
    // Replace with your create action
    console.log("Quick request submitted:", data);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }

  function handleShowDialog() {
    setShowDialog(true);
  }

  return (
    
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Dev Dashboard" },
        ]}
      />
      
      <PageHeader
        title="Dev Dashboard"
        subtitle="Quick overview of recent activity"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleShowDialog}>Open Dialog</Button>
            <Button>New Request</Button>
          </div>
        }
      />

      <Card title="Quick Request" description="Create a simple request inline">
        <Form methods={methods} onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput<QuickRequestForm> name="title" label="Title" placeholder="Enter title" />
            <FormInput<QuickRequestForm> name="owner" label="Owner" placeholder="Owner name" />
            <FormSelect<QuickRequestForm>
              name="status"
              label="Status"
              options={[
                { label: "Open", value: "open" },
                { label: "In progress", value: "in_progress" },
                { label: "Closed", value: "closed" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </Form>
      </Card>

             <Card title="Component Examples" description="Testing various UI components">
         <div className="space-y-4">
           <div className="flex items-center gap-4">
             <span className="text-sm font-medium">Spinners:</span>
             <Spinner size="sm" />
             <Spinner size="md" />
             <Spinner size="lg" />
           </div>
           
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Button Variants:</span>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Loading Button:</span>
            <Button loading={true}>Loading State</Button>
            <Button 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 3000);
              }}
              loading={isLoading}
            >
              Click to Show Loader
            </Button>
          </div>
         </div>
       </Card>

       <Card title="Color Palette" description="Design system colors">
         <div className="space-y-8">
           {/* Primary Colors */}
           <div>
             <h3 className="text-lg font-semibold text-neutral-900 mb-4">Primary Colors</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-11 gap-2">
               {Object.entries(colorPalette.primary).map(([shade, color]) => (
                 <div key={shade} className="text-center">
                   <div 
                     className="w-full h-16 rounded-lg border border-neutral-200"
                     style={{ backgroundColor: color }}
                     title={`primary-${shade}`}
                   />
                   <p className="text-xs mt-1 font-mono text-neutral-600">primary-{shade}</p>
                 </div>
               ))}
             </div>
           </div>

           {/* Neutral Colors */}
           <div>
             <h3 className="text-lg font-semibold text-neutral-900 mb-4">Neutral Colors</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-12 gap-2">
               {Object.entries(colorPalette.neutral).map(([shade, color]) => (
                 <div key={shade} className="text-center">
                   <div 
                     className="w-full h-16 rounded-lg border border-neutral-200"
                     style={{ backgroundColor: color }}
                     title={`neutral-${shade}`}
                   />
                   <p className="text-xs mt-1 font-mono text-neutral-600">neutral-{shade}</p>
                 </div>
               ))}
             </div>
           </div>

           {/* Accent Colors */}
           <div>
             <h3 className="text-lg font-semibold text-neutral-900 mb-4">Accent Colors (Orange/Yellow)</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-11 gap-2">
               {Object.entries(colorPalette.accent).map(([shade, color]) => (
                 <div key={shade} className="text-center">
                   <div 
                     className="w-full h-16 rounded-lg border border-neutral-200"
                     style={{ backgroundColor: color }}
                     title={`accent-${shade}`}
                   />
                   <p className="text-xs mt-1 font-mono text-neutral-600">accent-{shade}</p>
                 </div>
               ))}
             </div>
           </div>

           {/* Semantic Colors */}
           <div>
             <h3 className="text-lg font-semibold text-neutral-900 mb-4">Semantic Colors</h3>
             
             {/* Success */}
             <div className="mb-6">
               <h4 className="text-md font-medium text-neutral-700 mb-3">Success</h4>
               <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                 {Object.entries(colorPalette.success).map(([shade, color]) => (
                   <div key={shade} className="text-center">
                     <div 
                       className="w-full h-12 rounded-lg border border-neutral-200"
                       style={{ backgroundColor: color }}
                       title={`success-${shade}`}
                     />
                     <p className="text-xs mt-1 font-mono text-neutral-600">success-{shade}</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* Warning */}
             <div className="mb-6">
               <h4 className="text-md font-medium text-neutral-700 mb-3">Warning</h4>
               <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                 {Object.entries(colorPalette.warning).map(([shade, color]) => (
                   <div key={shade} className="text-center">
                     <div 
                       className="w-full h-12 rounded-lg border border-neutral-200"
                       style={{ backgroundColor: color }}
                       title={`warning-${shade}`}
                     />
                     <p className="text-xs mt-1 font-mono text-neutral-600">warning-{shade}</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* Error */}
             <div className="mb-6">
               <h4 className="text-md font-medium text-neutral-700 mb-3">Error</h4>
               <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                 {Object.entries(colorPalette.error).map(([shade, color]) => (
                   <div key={shade} className="text-center">
                     <div 
                       className="w-full h-12 rounded-lg border border-neutral-200"
                       style={{ backgroundColor: color }}
                       title={`error-${shade}`}
                     />
                     <p className="text-xs mt-1 font-mono text-neutral-600">error-{shade}</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* Info */}
             <div>
               <h4 className="text-md font-medium text-neutral-700 mb-3">Info</h4>
               <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                 {Object.entries(colorPalette.info).map(([shade, color]) => (
                   <div key={shade} className="text-center">
                     <div 
                       className="w-full h-12 rounded-lg border border-neutral-200"
                       style={{ backgroundColor: color }}
                       title={`info-${shade}`}
                     />
                     <p className="text-xs mt-1 font-mono text-neutral-600">info-{shade}</p>
                   </div>
                 ))}
               </div>
             </div>
           </div>

           {/* Usage Examples */}
           <div>
             <h3 className="text-lg font-semibold text-neutral-900 mb-4">Usage Examples</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div 
                 className="p-4 rounded-lg border"
                 style={{ 
                   backgroundColor: colorPalette.primary[100], 
                   borderColor: colorPalette.primary[200],
                   color: colorPalette.primary[900]
                 }}
               >
                 <h4 className="font-medium mb-2">Primary Background</h4>
                 <p className="text-sm" style={{ color: colorPalette.primary[700] }}>
                   Using primary-100 background with primary-900 text
                 </p>
               </div>
               <div 
                 className="p-4 rounded-lg border"
                 style={{ 
                   backgroundColor: colorPalette.accent[100], 
                   borderColor: colorPalette.accent[200],
                   color: colorPalette.accent[900]
                 }}
               >
                 <h4 className="font-medium mb-2">Accent Background</h4>
                 <p className="text-sm" style={{ color: colorPalette.accent[700] }}>
                   Using accent-100 background with accent-900 text
                 </p>
               </div>
               <div 
                 className="p-4 rounded-lg border"
                 style={{ 
                   backgroundColor: colorPalette.success[100], 
                   borderColor: colorPalette.success[200],
                   color: colorPalette.success[900]
                 }}
               >
                 <h4 className="font-medium mb-2">Success Background</h4>
                 <p className="text-sm" style={{ color: colorPalette.success[700] }}>
                   Using success-100 background with success-900 text
                 </p>
               </div>
               <div 
                 className="p-4 rounded-lg border"
                 style={{ 
                   backgroundColor: colorPalette.warning[100], 
                   borderColor: colorPalette.warning[200],
                   color: colorPalette.warning[900]
                 }}
               >
                 <h4 className="font-medium mb-2">Warning Background</h4>
                 <p className="text-sm" style={{ color: colorPalette.warning[700] }}>
                   Using warning-100 background with warning-900 text
                 </p>
               </div>
               <div 
                 className="p-4 rounded-lg border"
                 style={{ 
                   backgroundColor: colorPalette.error[100], 
                   borderColor: colorPalette.error[200],
                   color: colorPalette.error[900]
                 }}
               >
                 <h4 className="font-medium mb-2">Error Background</h4>
                 <p className="text-sm" style={{ color: colorPalette.error[700] }}>
                   Using error-100 background with error-900 text
                 </p>
               </div>
               <div 
                 className="p-4 rounded-lg border"
                 style={{ 
                   backgroundColor: colorPalette.neutral[100], 
                   borderColor: colorPalette.neutral[200],
                   color: colorPalette.neutral[900]
                 }}
               >
                 <h4 className="font-medium mb-2">Neutral Background</h4>
                 <p className="text-sm" style={{ color: colorPalette.neutral[700] }}>
                   Using neutral-100 background with neutral-900 text
                 </p>
               </div>
             </div>
           </div>
         </div>
       </Card>

      <Card title="Recent Requests" description="Latest items that need your attention">
        <Table
          columns={[
            { header: "ID", accessor: (r) => r.id },
            { header: "Title", accessor: (r) => r.title },
            { header: "Owner", accessor: (r) => r.owner },
            {
              header: "Status",
              accessor: (r) => (
                <span
                  className={
                    r.status === "open"
                      ? "inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-800"
                      : r.status === "in_progress"
                      ? "inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-800"
                      : "inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800"
                  }
                >
                  {r.status.replace("_", " ")}
                </span>
              ),
            },
          ]}
          data={sample}
          emptyState="No recent requests"
        />
      </Card>

      {/* Dialog Example */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              This will create a new request. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>This is an example dialog with custom styling using our design tokens.</p>
            <p className="mt-2 text-sm text-neutral-600">
              The dialog should be properly sized and centered on the screen.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={() => setShowDialog(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loader Example (commented out to avoid blocking UI) */}
      {/* <Loader fullscreen label="Loading dashboard..." /> */}
    </div>
  );
}


