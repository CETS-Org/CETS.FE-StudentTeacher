// src/components/teacher/SessionAssignmentsTab.tsx

import React, { useState, useMemo } from "react";
import { PlusCircle, FileText, Calendar, Users, Eye, MessageSquare, FilePenLine, ArrowLeft, Download } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Pagination from "@/Shared/Pagination";
import CreateAssignmentPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UploadAssignmentPopup";
import FeedbackPopup from "@/pages/Teacher/ClassDetail/Component/Popup/FeedbackPopup";
import GradeScorePopup from "@/pages/Teacher/ClassDetail/Component/Popup/GradeScorePopup";

// --- CẤU TRÚC DỮ LIỆU ---
type Submission = {
  id: number;
  studentName: string;
  file: string;
  submittedDate: string;
};

type Assignment = {
  id: number;
  title: string;
  dueDate: string;
  submissions: Submission[];
};

type AssignmentData = {
  title: string;
  instructions: string;
  dueDate: string;
};

// --- DỮ LIỆU MẪU ---
const initialAssignments: Assignment[] = [
  {
    id: 1, title: "Unit 1: Vocabulary Quiz", dueDate: "2025-09-10",
    submissions: [
      { id: 101, studentName: "Sarah Johnson", file: "sarah_asm1.docx", submittedDate: "2025-09-10" },
      { id: 102, studentName: "Michael Chen", file: "michael_chen_asm1.pdf", submittedDate: "2025-09-09" },
    ]
  },
  { id: 2, title: "Unit 2: Reading Comprehension", dueDate: "2025-09-17", submissions: [] },
];

// --- COMPONENT CHÍNH ---
export default function SessionAssignmentsTab() {
  // State chung
  const [assignments, setAssignments] = useState(initialAssignments);
  const [viewMode, setViewMode] = useState<'assignments' | 'submissions'>('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // State cho các popup
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isGradeOpen, setGradeOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- HÀM XỬ LÝ ---
  const handleCreateAssignment = (assignmentData: AssignmentData) => {
    const newAssignment: Assignment = {
        id: Date.now(),
        title: assignmentData.title,
        dueDate: assignmentData.dueDate,
        submissions: [], // Mới tạo chưa có bài nộp
    };
    setAssignments(prev => [newAssignment, ...prev]);
    alert("Assignment created successfully!");
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewMode('submissions');
    setCurrentPage(1);
  };

  const handleBackToAssignments = () => {
    setSelectedAssignment(null);
    setViewMode('assignments');
  };

  const handleOpenFeedback = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackOpen(true);
  };

  const handleOpenGrade = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeOpen(true);
  };

  const handleFeedbackSubmit = (feedback: string) => { /* ... */ };
  const handleGradeSubmit = (score: string) => { /* ... */ };
  
  // --- LOGIC PHÂN TRANG ---
  const submissionsToDisplay = selectedAssignment?.submissions || [];
  const totalPages = Math.ceil(submissionsToDisplay.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return submissionsToDisplay.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, submissionsToDisplay]);
  const handlePageChange = (page: number) => setCurrentPage(page);

  // --- RENDER ---
  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Chế độ xem danh sách Assignments */}
      {viewMode === 'assignments' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Session Assignments</h2>
            <Button onClick={() => setCreateOpen(true)} iconLeft={<PlusCircle size={16} />}>
              Create Assignment
            </Button>
          </div>
          <div className="space-y-4">
            {assignments.map(asm => (
              <Card key={asm.id} className="p-4 hover:shadow-md transition-shadow border border-gray-200 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" size={20}/>
                      <h3 className="font-semibold text-lg text-gray-900">{asm.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 pl-8">
                      <span className="flex items-center gap-1.5"><Calendar size={14}/> Due: {asm.dueDate}</span>
                      <span className="flex items-center gap-1.5"><Users size={14}/> {asm.submissions.length} Submissions</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2 self-end sm:self-center">
                    <Button variant="secondary" onClick={() => handleViewSubmissions(asm)}>View Submissions</Button>
                    <Button variant="secondary">Edit</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Chế độ xem danh sách Submissions */}
      {viewMode === 'submissions' && selectedAssignment && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Button variant="ghost" onClick={handleBackToAssignments} className="mb-2 -ml-3">
                <ArrowLeft size={16} className="mr-2"/> 
              </Button>
              <h2 className="text-xl font-semibold">{selectedAssignment.title}: Submissions</h2>
            </div>
            <Button disabled={selectedAssignment.submissions.length === 0} className="flex items-center">
                 Download All
            </Button>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full bg-white">
              {/* ... thead ... */}
              <tbody className="divide-y divide-gray-200">
                {paginatedSubmissions.map((sub, index) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4">{sub.studentName}</td>
                    <td className="px-6 py-4">{sub.file}</td>
                    <td className="px-6 py-4">{sub.submittedDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-500 hover:text-blue-600"><Eye size={20} /></button>
                        <button onClick={() => handleOpenFeedback(sub)} className="text-gray-500 hover:text-green-600"><MessageSquare size={20} /></button>
                        <button onClick={() => handleOpenGrade(sub)} className="text-gray-500 hover:text-purple-600"><FilePenLine size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage} totalPages={totalPages}
                totalItems={submissionsToDisplay.length} itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Popups */}
      <CreateAssignmentPopup open={isCreateOpen} onOpenChange={setCreateOpen} onSubmit={handleCreateAssignment} />
      <FeedbackPopup open={isFeedbackOpen} onOpenChange={setFeedbackOpen} onSubmit={handleFeedbackSubmit} />
      <GradeScorePopup open={isGradeOpen} onOpenChange={setGradeOpen} onSubmit={handleGradeSubmit} />
    </div>
  );
}