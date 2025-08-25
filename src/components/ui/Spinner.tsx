import type { ComponentPropsWithoutRef } from "react";

export type SpinnerProps = ComponentPropsWithoutRef<"div"> & {
  size?: "sm" | "md" | "lg";
  colorClassName?: string;
};

function getSize(size: NonNullable<SpinnerProps["size"]>): { outer: string; border: string } {
  switch (size) {
    case "sm":
      return { outer: "h-4 w-4", border: "border-2" };
    case "lg":
      return { outer: "h-10 w-10", border: "border-4" };
    case "md":
    default:
      return { outer: "h-6 w-6", border: "border-2" };
  }
}

export default function Spinner({ size = "md", colorClassName = "border-blue-600", className = "", ...props }: SpinnerProps) {
  const s = getSize(size);
  return (
    <div
      className={[
        "inline-flex items-center justify-center",
        s.outer,
        className,
      ].join(" ")}
      {...props}
    >
      <span
        className={[
          "animate-spin rounded-full",
          s.outer,
          s.border,
          "border-t-transparent",
          colorClassName,
        ].join(" ")}
      />
    </div>
  );
}


