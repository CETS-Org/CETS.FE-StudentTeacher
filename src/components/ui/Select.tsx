import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<ComponentPropsWithoutRef<"select">, "children"> & {
  label?: string | ReactNode;
  options?: SelectOption[];
  error?: string;
  hint?: string;
  loading?: boolean;
  loadingText?: string;
  placeholder?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { 
    label, 
    options = [], 
    error, 
    hint, 
    loading = false,
    loadingText = "Loading...",
    placeholder = "Select an option...",
    className = "", 
    id, 
    ...props 
  },
  ref
) {
  const selectId = id || props.name || undefined;
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={[
          "w-full border border-neutral-300 rounded-md px-3 py-2 text-sm",
          "focus:outline-none focus:ring-1 focus:ring-primary-200",
          error ? "border-red-500" : "",
          loading ? "opacity-50 cursor-not-allowed" : "",
          className,
        ].join(" ")}
        disabled={loading || props.disabled}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {safeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {loading && (
        <p className="text-xs text-neutral-500 mt-1">{loadingText}</p>
      )}
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;
