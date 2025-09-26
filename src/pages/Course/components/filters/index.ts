// Export all filter components for easy importing
export { default as CategoryFilter } from './CategoryFilter';
export { default as LevelFilter } from './LevelFilter';
export { default as PriceFilter } from './PriceFilter';
export { default as SkillsFilter } from './SkillsFilter';
export { default as RequirementsFilter } from './RequirementsFilter';
export { default as BenefitsFilter } from './BenefitsFilter';
export { default as FilterSeparator } from './FilterSeparator';
export { default as CollapsibleFilter } from './CollapsibleFilter';

// Type exports
export type FacetItem = { 
  key: string; 
  label?: string | null; 
  count: number; 
  selected?: boolean; 
};
