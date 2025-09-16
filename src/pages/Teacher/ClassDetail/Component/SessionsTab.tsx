// src/pages/teacher/classes/[classId]/SessionsTab.tsx

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
      <h2 className="text-xl font-bold text-primary-800 mb-6">Sessions</h2>
      <div className="space-y-4">
        {/* 4. RENDER DANH SÁCH CỦA TRANG HIỆN TẠI */}
        {currentSessions.map((session) => (
          <Card key={session.id} className="p-4 border border-accent-100 shadow-lg bg-white hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <NotebookPen className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-primary-800">{session.name}</span>
              </div>
                <Button 
                variant="primary" 
                className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-300 hover:to-accent-400 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
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