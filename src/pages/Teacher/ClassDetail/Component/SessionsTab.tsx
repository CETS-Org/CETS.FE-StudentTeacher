// src/pages/teacher/classes/[classId]/SessionsTab.tsx

import React, { useState, useMemo } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { NotebookPen } from "lucide-react";
import Pagination from "@/Shared/Pagination"; // 1. IMPORT component Pagination
import { useNavigate } from "react-router-dom";

// 2. MỞ RỘNG DỮ LIỆU MẪU ĐỂ CÓ NHIỀU TRANG
const mockSessions = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Session ${i + 1}`,
}));

export default function SessionsTab() {
  // 3. THÊM STATE VÀ LOGIC CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Số buổi học trên mỗi trang
  const navigate = useNavigate();

  const totalPages = Math.ceil(mockSessions.length / itemsPerPage);

  // Lấy ra danh sách các buổi học cho trang hiện tại
  const currentSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return mockSessions.slice(startIndex, endIndex);
  }, [currentPage]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

 

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sessions</h2>
      <div className="space-y-4">
        {/* 4. RENDER DANH SÁCH CỦA TRANG HIỆN TẠI */}
        {currentSessions.map((session) => (
          <Card key={session.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <NotebookPen className="w-6 h-6 text-gray-500" />
                <span className="font-medium text-gray-800">{session.name}</span>
              </div>
                <Button 
                variant="secondary" 
                onClick={() => navigate('/teacher/sessionDetail')}
              >
                Go to Session
              </Button>
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
            totalItems={mockSessions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}