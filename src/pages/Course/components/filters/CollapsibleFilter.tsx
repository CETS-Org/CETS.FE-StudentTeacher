import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface CollapsibleFilterProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  selectedCount?: number;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export default function CollapsibleFilter({
  title,
  subtitle,
  icon,
  selectedCount = 0,
  defaultExpanded = true,
  children
}: CollapsibleFilterProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg bg-white">
      {/* Header - Clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-neutral-800">{title}</div>
            {subtitle && !selectedCount && (
              <div className="text-xs text-neutral-500">{subtitle}</div>
            )}
            {selectedCount > 0 && (
              <div className="text-xs text-neutral-500">
                {selectedCount} selected
              </div>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-neutral-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Content - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <div className="mt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
