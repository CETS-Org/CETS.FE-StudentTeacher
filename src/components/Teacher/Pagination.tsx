// Tạo file mới tại: src/Shared/Pagination.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button'; // Giả sử bạn có component Button

type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: Props) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Logic để tạo ra các số trang (ví dụ: 1, 2, ..., 5)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Thông tin hiển thị */}
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> results
      </p>

      {/* Các nút điều khiển */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        {/* Phần hiển thị các nút số trang có thể thêm ở đây nếu muốn */}
        {/* Ví dụ đơn giản:
        {pageNumbers.map(number => (
           <Button 
              key={number}
              variant={currentPage === number ? 'primary' : 'secondary'}
              onClick={() => onPageChange(number)}
              className="h-9 w-9 p-0"
           >
              {number}
           </Button>
        ))}
        */}
        
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}