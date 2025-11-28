import { Award } from 'lucide-react';
import CollapsibleFilter from './CollapsibleFilter';

const MIN_SCORE = 0;
const MAX_SCORE = 10;

interface StandardScoreFilterProps {
  scoreMin: number;
  scoreMax: number;
  onScoreMinChange: (value: number) => void;
  onScoreMaxChange: (value: number) => void;
  onPageChange: (page: number) => void;
}

export default function StandardScoreFilter({ 
  scoreMin, 
  scoreMax, 
  onScoreMinChange, 
  onScoreMaxChange, 
  onPageChange 
}: StandardScoreFilterProps) {
  const handleScoreMinChange = (value: number) => {
    if (value <= scoreMax) {
      onScoreMinChange(value);
      onPageChange(1);
    }
  };

  const handleScoreMaxChange = (value: number) => {
    if (value >= scoreMin) {
      onScoreMaxChange(value);
      onPageChange(1);
    }
  };

  const setPresetRange = (min: number, max: number) => {
    onScoreMinChange(min);
    onScoreMaxChange(max);
    onPageChange(1);
  };

  const hasCustomRange = scoreMin > MIN_SCORE || scoreMax < MAX_SCORE;
  const icon = (
    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
      <Award className="w-3 h-3 text-white" />
    </div>
  );

  const subtitle = hasCustomRange 
    ? `${scoreMin.toFixed(1)} - ${scoreMax >= MAX_SCORE ? `${MAX_SCORE.toFixed(1)}+` : scoreMax.toFixed(1)} / 10`
    : "Set required score range";

  return (
    <CollapsibleFilter
      title="Placement Test Score"
      subtitle={subtitle}
      icon={icon}
    >
      <div className="space-y-3">
        {/* Score Display */}
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{scoreMin.toFixed(1)} / 10</span>
          <span>{scoreMax >= MAX_SCORE ? `${MAX_SCORE.toFixed(1)}+ / 10` : `${scoreMax.toFixed(1)} / 10`}</span>
        </div>
        
        {/* Dual Range Slider */}
        <div className="relative">
          {/* Track */}
          <div className="h-2 bg-neutral-200 rounded-full relative">
            <div 
              className="absolute h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
              style={{
                left: `${(scoreMin / MAX_SCORE) * 100}%`,
                width: `${((scoreMax - scoreMin) / MAX_SCORE) * 100}%`
              }}
            />
          </div>
          
          {/* Min Range Input */}
          <input
            type="range"
            min={MIN_SCORE}
            max={MAX_SCORE}
            step={0.1}
            value={scoreMin}
            onChange={(e) => handleScoreMinChange(parseFloat(e.target.value))}
            className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-purple-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
          />
          
          {/* Max Range Input */}
          <input
            type="range"
            min={MIN_SCORE}
            max={MAX_SCORE}
            step={0.1}
            value={scoreMax}
            onChange={(e) => handleScoreMaxChange(parseFloat(e.target.value))}
            className="absolute top-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg"
          />
        </div>
        
        {/* Quick Preset Buttons */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setPresetRange(MIN_SCORE, 3)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              scoreMin === MIN_SCORE && scoreMax === 3
                ? 'bg-purple-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            0-3
          </button>
          <button
            onClick={() => setPresetRange(3, 5)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              scoreMin === 3 && scoreMax === 5
                ? 'bg-purple-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            3-5
          </button>
          <button
            onClick={() => setPresetRange(5, 7)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              scoreMin === 5 && scoreMax === 7
                ? 'bg-purple-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            5-7
          </button>
          <button
            onClick={() => setPresetRange(7, MAX_SCORE)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              scoreMin === 7 && scoreMax === MAX_SCORE
                ? 'bg-purple-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            7-10
          </button>
        </div>
      </div>
    </CollapsibleFilter>
  );
}

