import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Spinner from "./Spinner";

export type LoaderProps = ComponentPropsWithoutRef<"div"> & {
  fullscreen?: boolean;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  overlayClassName?: string;
};

export default function Loader({
  fullscreen = false,
  label,
  size = "md",
  className = "",
  overlayClassName = "",
  ...props
}: LoaderProps) {
  const containerClasses = [
    fullscreen ? "fixed inset-0" : "absolute inset-0",
    "z-50 flex items-center justify-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const overlayClasses = [
    "absolute inset-0 bg-white/70 backdrop-blur-sm",
    overlayClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} {...props}>
      <div className={overlayClasses} />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Spinner size={size} />
        {label ? <div className="text-sm text-gray-700">{label}</div> : null}
      </div>
    </div>
  );
}


