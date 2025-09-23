import type { ReactNode } from "react";
import Button from "./Button";
import Select from "./Select";

export interface PageHeaderAction {
  type: 'button';
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface PageHeaderSelect {
  type: 'select';
  label: string;
  options: Array<{ label: string; value: string | number }>;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export type PageHeaderControl = PageHeaderAction | PageHeaderSelect;

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  controls?: PageHeaderControl[];
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon,
  controls = [],
  className = ""
}: PageHeaderProps) {
  const defaultIcon = (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mt-4 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              {icon || defaultIcon}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-gray-600 text-lg">{description}</p>
          )}
        </div>
        
        {controls.length > 0 && (
          <div className="flex flex-col xs:flex-row md:flex-row items-start md:items-center gap-3">
            {controls.map((control, index) => {
              if (control.type === 'select') {
                return (
                  <Select
                    key={index}
                    label={control.label}
                    options={control.options}
                    value={control.value}
                    onChange={control.onChange}
                    className={control.className || "w-full md:w-48"}
                  />
                );
              } else if (control.type === 'button') {
                return (
                  <Button
                    key={index}
                    variant={control.variant || 'secondary'}
                    onClick={control.onClick}
                    iconLeft={control.icon}
                    className={`w-full md:w-auto whitespace-nowrap ${control.className || ''}`}
                  >
                    {control.label}
                  </Button>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}