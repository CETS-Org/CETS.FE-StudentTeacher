import { Star } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

const MIN_PRICE = 0;
const MAX_PRICE = 20000000; // 20M VND

interface PriceFilterProps {
  priceMin: number;
  priceMax: number;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  onPageChange: (page: number) => void;
}

export default function PriceFilter({ 
  priceMin, 
  priceMax, 
  onPriceMinChange, 
  onPriceMaxChange, 
  onPageChange 
}: PriceFilterProps) {
  const handlePriceMinChange = (value: number) => {
    if (value <= priceMax) {
      onPriceMinChange(value);
      onPageChange(1);
    }
  };

  const handlePriceMaxChange = (value: number) => {
    if (value >= priceMin) {
      onPriceMaxChange(value);
      onPageChange(1);
    }
  };

  const setPresetRange = (min: number, max: number) => {
    onPriceMinChange(min);
    onPriceMaxChange(max);
    onPageChange(1);
  };

  const hasCustomRange = priceMin > MIN_PRICE || priceMax < MAX_PRICE;
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center shadow-sm">
      <Star className="w-3 h-3 text-white" />
    </div>
  );

  const subtitle = hasCustomRange 
    ? `${(priceMin / 1000000).toFixed(1)}M - ${priceMax >= MAX_PRICE ? `${(MAX_PRICE / 1000000).toFixed(0)}M+` : `${(priceMax / 1000000).toFixed(1)}M`} VND`
    : "Set your budget";

  return (
    <CollapsibleFilter
      title="Price Range"
      subtitle={subtitle}
      icon={icon}
    >
      <div className="space-y-3">
        {/* Price Display */}
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{(priceMin / 1000000).toFixed(1)}M VND</span>
          <span>{priceMax >= MAX_PRICE ? `${(MAX_PRICE / 1000000).toFixed(0)}M+ VND` : `${(priceMax / 1000000).toFixed(1)}M VND`}</span>
        </div>
        
        {/* Dual Range Slider */}
        <div className="relative">
          {/* Track */}
          <div className="h-2 bg-neutral-200 rounded-full relative">
            <div 
              className="absolute h-2 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full"
              style={{
                left: `${(priceMin / MAX_PRICE) * 100}%`,
                width: `${((priceMax - priceMin) / MAX_PRICE) * 100}%`
              }}
            />
          </div>
          
          {/* Min Range Input */}
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            value={priceMin}
            onChange={(e) => handlePriceMinChange(parseInt(e.target.value))}
            className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-warning-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-warning-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
          />
          
          {/* Max Range Input */}
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            value={priceMax}
            onChange={(e) => handlePriceMaxChange(parseInt(e.target.value))}
            className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-warning-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-warning-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
          />
        </div>
        
        {/* Quick Preset Buttons */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setPresetRange(MIN_PRICE, 2000000)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              priceMin === MIN_PRICE && priceMax === 2000000
                ? 'bg-warning-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Under 2M
          </button>
          <button
            onClick={() => setPresetRange(2000000, 5000000)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              priceMin === 2000000 && priceMax === 5000000
                ? 'bg-warning-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            2-5M
          </button>
          <button
            onClick={() => setPresetRange(5000000, 10000000)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              priceMin === 5000000 && priceMax === 10000000
                ? 'bg-warning-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            5-10M
          </button>
          <button
            onClick={() => setPresetRange(10000000, MAX_PRICE)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              priceMin === 10000000 && priceMax === MAX_PRICE
                ? 'bg-warning-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            10M+
          </button>
        </div>
      </div>
    </CollapsibleFilter>
  );
}
