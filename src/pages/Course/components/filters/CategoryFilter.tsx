import { BookOpen } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

type FacetItem = { 
  key: string; 
  label?: string | null; 
  count: number; 
  selected?: boolean; 
};

interface CategoryFilterProps {
  categoriesFacet: FacetItem[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categoriesFacet, 
  selectedCategories, 
  onToggleCategory 
}: CategoryFilterProps) {
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-info-500 to-info-600 rounded-lg flex items-center justify-center shadow-sm">
      <BookOpen className="w-3 h-3 text-white" />
    </div>
  );

  return (
    <CollapsibleFilter
      title="Category"
      subtitle="Filter by subject area"
      icon={icon}
      selectedCount={selectedCategories.length}
    >
      <div className="space-y-2 max-h-48 overflow-auto">
        {categoriesFacet.length > 0 ? (
          categoriesFacet.map((f) => (
            <label key={f.key} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-neutral-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(f.key)}
                onChange={() => onToggleCategory(f.key)}
                className="w-4 h-4 text-info-600 rounded focus:ring-info-500 focus:ring-1"
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
          <div className="text-sm text-neutral-500 text-center py-4">No categories available</div>
        )}
      </div>
      
      {/* Show more/less if many items */}
      {categoriesFacet.length > 8 && (
        <button className="text-xs text-info-600 hover:text-info-700 mt-2 font-medium">
          Show more
        </button>
      )}
    </CollapsibleFilter>
  );
}
