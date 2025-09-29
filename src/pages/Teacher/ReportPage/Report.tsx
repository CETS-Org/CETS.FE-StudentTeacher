// src/pages/teacher/ReportIssuesPage.tsx

import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom"; // 1. IMPORT useParams
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Button from "@/components/ui/Button";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import ReportItem from "@/pages/Teacher/ReportPage/Components/ReportItem";
import SubmitReportPopup from "@/pages/Teacher/ReportPage/Popup/CreateReportPopup";
import ViewReportPopup, { type ReportData, type ReportStatus } from "@/pages/Teacher/ReportPage/Popup/ReportDetailPopup";
import Pagination from "@/Shared/Pagination";
import { Tabs } from "@/components/ui/Tabs"; 
import Card from "@/components/ui/Card";

// Dữ liệu mẫu (đã dọn dẹp mục trùng lặp)
const allMockReports: ReportData[] = [
  { type: 'Technical', id: "IR-2025-0127", title: "Classroom Projector Not Working", category: "Technical", createdDate: "Jan 15, 2025", status: 'Pending', studentId: "STU-2025-001234", fullName: "John Michael Anderson", reportType: "Technical Issue", description: "The projector in room 304 is not turning on.", files: [], adminResponse: "Our team will check it." },
  { type: 'Technical', id: "IR-2025-0124", title: "Classroom Projector Not Working", category: "Technical", createdDate: "Jan 15, 2025", status: 'Pending', studentId: "STU-2025-001234", fullName: "John Michael Anderson", reportType: "Technical Issue", description: "The projector in room 304 is not turning on.", files: [], adminResponse: "Our team will check it." },
  { type: 'Technical', id: "IR-2025-0121", title: "Classroom Projector Not Working", category: "Technical", createdDate: "Jan 15, 2025", status: 'Pending', studentId: "STU-2025-001234", fullName: "John Michael Anderson", reportType: "Technical Issue", description: "The projector in room 304 is not turning on.", files: [], adminResponse: "Our team will check it." },
  { type: 'Technical', id: "IR-2025-0123", title: "Classroom Projector Not Working", category: "Technical", createdDate: "Jan 15, 2025", status: 'Pending', studentId: "STU-2025-001234", fullName: "John Michael Anderson", reportType: "Technical Issue", description: "The projector in room 304 is not turning on.", files: [], adminResponse: "Our team will check it." },
  { type: 'Technical', id: "IR-2025-0120", title: "Classroom Projector Not Working", category: "Technical", createdDate: "Jan 15, 2025", status: 'Pending', studentId: "STU-2025-001234", fullName: "John Michael Anderson", reportType: "Technical Issue", description: "The projector in room 304 is not turning on.", files: [], adminResponse: "Our team will check it." },
  { type: 'Academic', id: "IR-2025-0128", title: "Request schedule change for CS-301-A", category: "Academic", createdDate: "Jan 12, 2025", status: 'Responded', studentId: "STU-2025-001234", fullName: "John Michael Anderson", courseId: "CS-301", class: "CS-301-A", currentSchedule: "Monday, 10:00 AM", newDate: "20/09/2025", newTime: "10:30 AM", reason: "Conflict with another class." },
  { type: 'Technical', id: "IR-2025-0130", title: "Cannot access online materials", category: "Technical", createdDate: "Jan 11, 2025", status: 'Pending', studentId: "STU-2025-00567", fullName: "Emily White", reportType: "Access Issue", description: "The link to course materials is broken.", files: [], adminResponse: "" },
  { type: 'Technical', id: "IR-2025-0132", title: "Audio issue in recorded lecture", category: "Technical", createdDate: "Jan 09, 2025", status: 'Pending', studentId: "STU-2025-01122", fullName: "Jessica Green", reportType: "Media Issue", description: "There is no audio in the Week 2 lecture video.", files: [], adminResponse: "" },
  { type: 'Technical', id: "IR-2025-0129", title: "Wi-Fi Connection Problems", category: "Technical", createdDate: "Jan 10, 2025", status: 'Resolved', studentId: "STU-2025-00567", fullName: "Emily White", reportType: "Network Issue", description: "The Wi-Fi in the library was unstable.", files: [], adminResponse: "The issue was resolved by restarting the main router." },
  { type: 'Academic', id: "IR-2025-0125", title: "Approved schedule change for MA-202", category: "Academic", createdDate: "Jan 08, 2025", status: 'Approved', studentId: "STU-2025-00432", fullName: "David Harris", courseId: "MA-202", class: "MA-202-B", currentSchedule: "Tuesday, 2:00 PM", newDate: "25/09/2025", newTime: "3:00 PM", reason: "Medical appointment.", adminResponse: "Your request has been approved." },
];

const tabsData: { id: ReportStatus, label: string }[] = [
    { id: 'Pending', label: 'Pending' },
    { id: 'Responded', label: 'Responded' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Resolved', label: 'Resolved' },
];

const crumbs: Crumb[] = [{ label: "Report Issues" }];

export default function ReportIssuesPage() {
  // 2. LẤY CATEGORY TỪ URL
  const { category } = useParams<{ category: 'technical' | 'academic' }>();
  
  const [activeTab, setActiveTab] = useState<ReportStatus>('Pending');
  const [isSubmitOpen, setSubmitOpen] = useState(false);
  const [isViewOpen, setViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 3. CẬP NHẬT LOGIC LỌC ĐỂ KẾT HỢP CẢ 2 BỘ LỌC
  const reportsToDisplay = useMemo(() => {
    // Lọc theo category từ URL trước
    const categoryFiltered = allMockReports.filter(r => {
        if (!category) return true; // Nếu không có category trên URL, hiển thị tất cả
        return r.category.toLowerCase() === category.toLowerCase();
    });
    // Sau đó lọc theo status từ tab
    return categoryFiltered.filter(r => r.status === activeTab);
  }, [activeTab, category]);

  const totalPages = Math.ceil(reportsToDisplay.length / itemsPerPage);
  
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return reportsToDisplay.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, reportsToDisplay]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, category]);

  const handleViewDetails = (report: ReportData) => setSelectedReport(report);
  const handleReportSubmit = (data: any) => { /* ... */ };
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs items={crumbs} />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Issues List</h1>
          <Button onClick={() => setSubmitOpen(true)}>Report Issue</Button>
        </div>
        
        <Card className="border border-gray-200 shadow-md" >
          <Tabs
              tabs={tabsData}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as ReportStatus)}
          />
          
          <div className="p-6 min-h-[607px]">
            <div className="space-y-4">
              {paginatedReports.length > 0 ? (
                  paginatedReports.map(report => (
                      <ReportItem
                          key={report.id}
                          report={{
                              id: report.id,
                              title: report.title,
                              category: report.category,
                              date: report.createdDate,
                              status: report.status
                          }}
                          onViewDetails={() => handleViewDetails(report)}
                      />
                  ))
              ) : (
                  <div className="text-center py-12 text-gray-500">
                      <p>No reports found for this status.</p>
                  </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={reportsToDisplay.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </Card>
        
        
        <SubmitReportPopup open={isSubmitOpen} onOpenChange={setSubmitOpen} onSubmit={handleReportSubmit} />
        <ViewReportPopup open={isViewOpen} onOpenChange={setViewOpen} report={selectedReport} />
    </div>
  );
}