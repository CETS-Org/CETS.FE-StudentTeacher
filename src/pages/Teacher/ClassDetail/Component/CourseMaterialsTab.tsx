// src/pages/teacher/classes/[classId]/CourseMaterialsTab.tsx

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import { FileText, Upload } from "lucide-react";
import UploadMaterialsPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UploadMaterialsPopup"; 
import Pagination from "@/Shared/Pagination"; // 1. IMPORT component Pagination

// 2. MỞ RỘNG DỮ LIỆU BAN ĐẦU
const initialMaterials = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  name: `Course Material - Chapter ${i + 1}.pdf`,
  date: `Aug ${15 + i}, 2025`,
}));

export default function CourseMaterialsTab() {
  const [materials, setMaterials] = useState(initialMaterials);
  const [isPopupOpen, setPopupOpen] = useState(false);

  // 3. THÊM STATE VÀ LOGIC CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số tài liệu trên mỗi trang

  const totalPages = Math.ceil(materials.length / itemsPerPage);

  // Lấy ra danh sách tài liệu cho trang hiện tại
  const currentMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return materials.slice(startIndex, endIndex);
  }, [currentPage, materials]); // Phụ thuộc vào cả `materials` để tự cập nhật khi có file mới

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpload = (files: File[]) => {
    console.log("Files received from popup:", files);
    const newMaterials = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      date: new Date().toLocaleDateString('en-GB'),
    }));

    setMaterials(prevMaterials => [...newMaterials, ...prevMaterials]); // Thêm vào đầu danh sách
    alert(`${files.length} file(s) uploaded successfully!`);
    setPopupOpen(false);
    setCurrentPage(1); // Quay về trang đầu tiên để thấy tài liệu mới
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary-800">Course Materials</h2>
        <Button 
          variant="primary" 
          iconLeft={<Upload className="w-4 h-4" />}
          onClick={() => setPopupOpen(true)}
          className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
        >
          Upload Materials
        </Button>
      </div>
      <div className="space-y-4">
        {/* 4. RENDER DANH SÁCH CỦA TRANG HIỆN TẠI */}
        {currentMaterials.map((material) => (
          <div key={material.id} className="flex items-center justify-between p-4 border border-accent-200 rounded-lg bg-white hover:bg-accent-25 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-primary-800">{material.name}</h4>
                <p className="text-sm text-accent-600 font-medium">{material.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-primary-600 bg-neutral-200 px-3 py-1 rounded-full">PDF</span>
              <Button
                variant="primary"
                size="sm"
                iconLeft={<FileText className="w-4 h-4" />}
                className="bg-accent-500 hover:bg-accent-600 shadow-md hover:shadow-lg transition-all duration-200"
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. THÊM COMPONENT PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={materials.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <UploadMaterialsPopup 
        open={isPopupOpen} 
        onOpenChange={setPopupOpen} 
        onUpload={handleUpload}
      />
    </div>
  );
}