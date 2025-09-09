// src/pages/teacher/classes/[classId]/CourseMaterialsTab.tsx

import React, { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Course Materials</h2>
        <Button 
          variant="primary" 
          iconLeft={<Upload className="w-4 h-4" />}
          onClick={() => setPopupOpen(true)}
        >
          Upload Materials
        </Button>
      </div>
      <div className="space-y-3">
        {/* 4. RENDER DANH SÁCH CỦA TRANG HIỆN TẠI */}
        {currentMaterials.map((material) => (
          <Card key={material.id} className="p-4 border border-gray-200 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-500" />
                <span className="font-medium text-gray-800">{material.name}</span>
              </div>
              <span className="text-sm text-gray-500">{material.date}</span>
            </div>
          </Card>
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