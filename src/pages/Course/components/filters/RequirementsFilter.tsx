import { CheckSquare } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

type FacetItem = { 
  key: string; 
  label?: string | null; 
  count: number; 
  selected?: boolean; 
};

interface RequirementsFilterProps {
  requirementsFacet: FacetItem[];
  selectedRequirements: string[];
  onToggleRequirement: (requirementId: string) => void;
}

export default function RequirementsFilter({ 
  requirementsFacet, 
  selectedRequirements, 
  onToggleRequirement 
}: RequirementsFilterProps) {
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
      <CheckSquare className="w-3 h-3 text-white" />
    </div>
  );

  return (
    <CollapsibleFilter
      title="Requirements"
      subtitle="Filter by prerequisites"
      icon={icon}
      selectedCount={selectedRequirements.length}
      defaultExpanded={false}
    >
      <div className="space-y-2 max-h-48 overflow-auto">
        {requirementsFacet.length > 0 ? (
          requirementsFacet.map((f) => (
            <label key={f.key} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRequirements.includes(f.key)}
                onChange={() => onToggleRequirement(f.key)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-1"
              />
              <span className="text-neutral-700 flex-1 text-sm">
                {f.label ?? f.key}
              </span>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                {f.count}
              </span>
            </label>
          ))
        ) : (
          <div className="text-sm text-neutral-500 text-center py-4">No requirements available</div>
        )}
      </div>
      
      {/* Show more/less if many items */}
      {requirementsFacet.length > 8 && (
        <button className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium">
          Show more
        </button>
      )}
    </CollapsibleFilter>
  );
}
