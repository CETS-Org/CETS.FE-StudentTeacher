import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;                 // trang hiện tại
  pageSize: number;             // số item mỗi trang
  total: number;                // tổng số item
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / Math.max(1, pageSize)));
  if (totalPages <= 1) return null;

  // Tạo dãy số trang có ...
  const getPages = (): (number | string)[] => {
    const arr: (number | string)[] = [];
    const delta = 2; // số trang hiển thị hai bên

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    arr.push(1);
    if (left > 2) arr.push("...");
    for (let i = left; i <= right; i++) arr.push(i);
    if (right < totalPages - 1) arr.push("...");
    if (totalPages > 1) arr.push(totalPages);
    return arr;
  };

  const pages = getPages();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Prev */}
      <button
        className="p-2 rounded-md border text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        typeof p === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-md border ${
              p === page
                ? "bg-sky-600 text-white border-sky-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-400">…</span>
        )
      )}

      {/* Next */}
      <button
        className="p-2 rounded-md border text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
