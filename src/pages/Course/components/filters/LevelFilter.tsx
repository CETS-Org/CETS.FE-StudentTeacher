import { Award } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

type FacetItem = { 
  key: string; 
  label?: string | null; 
  count: number; 
  selected?: boolean; 
};

interface LevelFilterProps {
  levelsFacet: FacetItem[];
  selectedLevels: string[];
  onToggleLevel: (levelId: string) => void;
}

export default function LevelFilter({ 
  levelsFacet, 
  selectedLevels, 
  onToggleLevel 
}: LevelFilterProps) {
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center shadow-sm">
      <Award className="w-3 h-3 text-white" />
    </div>
  );

  return (
    <CollapsibleFilter
      title="Level"
      subtitle="Choose your skill level"
      icon={icon}
      selectedCount={selectedLevels.length}
    >
      <div className="space-y-2 max-h-48 overflow-auto">
        {levelsFacet.length > 0 ? (
          levelsFacet.map((f) => (
            <label key={f.key} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLevels.includes(f.key)}
                onChange={() => onToggleLevel(f.key)}
                className="w-4 h-4 text-success-600 rounded focus:ring-success-500 focus:ring-1"
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
          <div className="text-sm text-neutral-500 text-center py-4">No levels available</div>
        )}
      </div>
      
      {/* Show more/less if many items */}
      {levelsFacet.length > 8 && (
        <button className="text-xs text-success-600 hover:text-success-700 mt-2 font-medium">
          Show more
        </button>
      )}
    </CollapsibleFilter>
  );
}
