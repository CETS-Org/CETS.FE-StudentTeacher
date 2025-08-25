import { NavLink } from "react-router-dom";

export type Crumb = {
  label: string;
  to?: string;
};

export type BreadcrumbsProps = {
  items: Crumb[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <NavLink to={item.to} className="hover:text-neutral-900">
                  {item.label}
                </NavLink>
              ) : (
                <span className="text-neutral-900 font-medium">{item.label}</span>
              )}
              {!isLast && <span className="text-neutral-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


