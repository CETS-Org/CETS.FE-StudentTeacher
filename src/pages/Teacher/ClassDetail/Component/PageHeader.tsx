import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode; // button hoặc menu hành động bên phải
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>

      {/* Right (actions) */}
      {actions && <div className="mt-4 md:mt-0">{actions}</div>}
    </div>
  );
}
