import type { ReactNode } from "react";

export type CardProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  divider?: boolean;        // bật/tắt divider
  dividerColor?: string;    // màu border (vd: "border-gray-200", "border-neutral-300")
};

export default function Card({
  title,
  description,
  actions,
  children,
  className = "",
  divider = true,
  dividerColor = "border-gray-200",
}: CardProps) {
  return (
    <section className={["bg-neutral-0 rounded-lg border shadow-sm", className].join(" ")}>
      {(title || actions || description) && (
        <div
          className={[
            "px-4 py-3 flex items-center justify-between",
            divider ? `border-b ${dividerColor}` : "",
          ].join(" ")}
        >
          <div>
            {title && <h2 className="text-base font-semibold text-neutral-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-neutral-600">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
