// src/components/teacher/SessionAssignmentsTab.tsx

import { useState, useMemo } from "react";
import { PlusCircle, Calendar, Users, Eye, MessageSquare, FilePenLine, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
  const [, setSelectedSubmission] = useState<Submission | null>(null);

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

  const handleFeedbackSubmit = () => { /* ... */ };
  const handleGradeSubmit = () => { /* ... */ };
  
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
            <h2 className="text-xl font-bold text-primary-800">Session Assignments</h2>
            <Button 
              onClick={() => setCreateOpen(true)} 
              iconLeft={<PlusCircle size={16} />}
              className="bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25 hover:shadow-accent-600/30 transition-all duration-200"
            >
              Create Assignment
            </Button>
          </div>
          <div className="space-y-4">
            {assignments.map(asm => (
              <Card key={asm.id} className="p-6 border border-accent-200 bg-white hover:shadow-lg hover:bg-gradient-to-br hover:from-white hover:to-accent-25/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-800 mb-3">
                      {asm.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-error-200 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">Due: {asm.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-warning-200 px-3 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">{asm.submissions.length} Submissions</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="primary"
                    onClick={() => handleViewSubmissions(asm)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-accent-500 hover:to-accent-600 shadow-lg shadow-primary-500/25"
                  >
                    View Submissions
                  </Button>
                  <Button variant="secondary">Edit</Button>
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