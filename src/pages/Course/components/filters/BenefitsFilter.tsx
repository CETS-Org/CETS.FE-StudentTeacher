import { Gift } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

type FacetItem = { 
  key: string; 
  label?: string | null; 
  count: number; 
  selected?: boolean; 
};

interface BenefitsFilterProps {
  benefitsFacet: FacetItem[];
  selectedBenefits: string[];
  onToggleBenefit: (benefitId: string) => void;
}

export default function BenefitsFilter({ 
  benefitsFacet, 
  selectedBenefits, 
  onToggleBenefit 
}: BenefitsFilterProps) {
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
      <Gift className="w-3 h-3 text-white" />
    </div>
  );

  return (
    <CollapsibleFilter
      title="Benefits"
      subtitle="Filter by course benefits"
      icon={icon}
      selectedCount={selectedBenefits.length}
      defaultExpanded={false}
    >
      <div className="space-y-2 max-h-48 overflow-auto">
        {benefitsFacet.length > 0 ? (
          benefitsFacet.map((f) => (
            <label key={f.key} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBenefits.includes(f.key)}
                onChange={() => onToggleBenefit(f.key)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 focus:ring-1"
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
          <div className="text-sm text-neutral-500 text-center py-4">No benefits available</div>
        )}
      </div>
      
      {/* Show more/less if many items */}
      {benefitsFacet.length > 8 && (
        <button className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 font-medium">
          Show more
        </button>
      )}
    </CollapsibleFilter>
  );
}
