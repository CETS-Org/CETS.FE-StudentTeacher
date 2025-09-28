import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

interface PaginationProps {
  page: number;                 // current page
  pageSize: number;             // items per page
  total: number;                // total items
  onPageChange: (page: number) => void;
  loading?: boolean;            // loading state
  showPageInfo?: boolean;       // show "Page X of Y" info
  className?: string;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  loading = false,
  showPageInfo = true,
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / Math.max(1, pageSize)));
  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center items-center mt-12 gap-2 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1 || loading}
        className="px-4 py-2"
        iconLeft={<ChevronLeft className="w-4 h-4" />}
      >
        Previous
      </Button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }

          return (
            <Button
              key={pageNum}
              variant={page === pageNum ? "primary" : "secondary"}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className="w-10 h-10 p-0 text-sm"
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages || loading}
        className="px-4 py-2"
        iconRight={<ChevronRight className="w-4 h-4" />}
      >
        Next
      </Button>

      {/* Page Info */}
      {showPageInfo && (
        <div className="ml-4 text-sm text-neutral-600">
          Page {page} of {totalPages}
        </div>
      )}
    </div>
  );
}
