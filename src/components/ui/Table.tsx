import type { ReactNode } from "react";

export type TableColumn<T> = {
  header: ReactNode;
  accessor: (row: T, rowIndex: number) => ReactNode;
  className?: string;
};

export type SimpleTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  emptyState?: ReactNode;
  className?: string;
};

export default function Table<T>({ columns, data, emptyState, className = "" }: SimpleTableProps<T>) {
  return (
    <div className={["overflow-x-auto", className].join(" ")}> 
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" className={["px-4 py-2 text-left text-sm font-semibold text-neutral-700", col.className || ""].join(" ")}> 
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-neutral-0">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-neutral-500">
                {emptyState || "No data"}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-neutral-0" : "bg-neutral-50"}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={["px-4 py-2 text-sm text-neutral-900", col.className || ""].join(" ")}> 
                    {col.accessor(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


