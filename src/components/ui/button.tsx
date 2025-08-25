import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

function getVariantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case "secondary":
      return "bg-neutral-0 text-neutral-900 border border-neutral-300 hover:bg-neutral-50";
    case "danger":
      return "bg-error-600 text-white hover:bg-error-700";
    case "ghost":
      return "bg-transparent text-neutral-700 hover:bg-neutral-100";
    case "primary":
    default:
      return "bg-primary-600 text-white hover:bg-accent-500";
  }
}

function getSizeClasses(size: ButtonSize): string {
  switch (size) {
    case "sm":
      return "h-9 px-3 text-sm";
    case "lg":
      return "h-12 px-6 text-base";
    case "md":
    default:
      return "h-10 px-4 text-sm";
  }
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const base = "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed gap-2";
  const classes = [base, getVariantClasses(variant), getSizeClasses(size), className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {iconLeft && <span className="shrink-0" aria-hidden>{iconLeft}</span>}
      <span className={loading ? "opacity-0" : undefined}>{children}</span>
      {iconRight && <span className="shrink-0" aria-hidden>{iconRight}</span>}
      {loading && (
        <span className="absolute inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" aria-hidden />
      )}
    </button>
  );
}


