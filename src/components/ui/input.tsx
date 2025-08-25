import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

export type InputProps = ComponentPropsWithoutRef<"input"> & {
  label?: string;
  error?: string;
  hint?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = "", id, ...props },
  ref
) {
  const inputId = id || props.name || undefined;
  return (
    <div className={"w-full"}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={[
          "block w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-500",
          error ? "border-red-500" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;


