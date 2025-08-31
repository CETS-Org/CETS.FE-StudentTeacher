import React from "react";

export interface ProgressBarProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "error";
  showLabel?: boolean;
  className?: string;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = "md",
  variant = "primary",
  showLabel = true,
  className = "",
  label
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-2";
      case "lg": return "h-4";
      case "md":
      default: return "h-3";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "success": return "bg-success-500";
      case "warning": return "bg-warning-500";
      case "error": return "bg-error-500";
      case "primary":
      default: return "bg-primary-500";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm": return "text-xs";
      case "lg": return "text-sm";
      case "md":
      default: return "text-xs";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-neutral-700 ${getTextSize()}`}>
            {label || "Progress"}
          </span>
          <span className={`font-semibold text-neutral-900 ${getTextSize()}`}>
            {normalizedProgress}%
          </span>
        </div>
      )}
      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${getSizeClasses()}`}>
        <div
          className={`${getSizeClasses()} ${getVariantClasses()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${normalizedProgress}% complete`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;