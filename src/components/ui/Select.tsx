import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

export type SelectOption = {
  label: string;
  value: string | number;
};

export type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options = [], className = "", id, children, ...props },
  ref
) {
  const selectId = id || props.name || undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={[
          "block w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm text-neutral-900",
          "focus:outline-none focus:ring-2 focus:ring-primary-500",
          error ? "border-red-500" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;


