// src/components/modals/SubmitReportPopup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/button";
import Select from "@/components/ui/Select";
import TechnicalReportForm from "@/pages/Teacher/ReportPage/Popup/TechnicalReportForm"; // Form con cho Technical Report
import ScheduleChangeForm from "@/pages/Teacher/ReportPage/Popup/AcademicReportForm"; // Form con cho Schedule Change

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void; // Dùng 'any' để linh hoạt với cả 2 loại formn
};

export default function SubmitReportPopup({ open, onOpenChange, onSubmit }: Props) {
  // State chính để quyết định loại report
  const [reportType, setReportType] = useState<'technical' | 'academic'>('technical');

  // State chung cho cả 2 form
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");

  // State riêng cho Technical Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  // State riêng cho Schedule Change Form
  const [courseId, setCourseId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  
  // Reset form khi popup được mở
  useEffect(() => {
    if (open) {
      setReportType('technical');
      setStudentId('');
      setFullName('');
      setTitle('');
      setDescription('');
      setAttachments([]);
      setCourseId('');
      setSelectedClass('');
      setNewDate('');
      setNewTime('');
      setReason('');
    }
  }, [open]);

  const handleSubmit = () => {
    let formData;
    if (reportType === 'technical') {
      formData = { reportType, studentId, fullName, title, description, attachments };
      if (!studentId || !fullName || !title || !description) {
        alert("Please fill in all required fields.");
        return;
      }
    } else { // schedule change
      formData = { reportType, studentId, fullName, courseId, class: selectedClass, newDate, newTime, reason };
       if (!studentId || !fullName || !courseId || !selectedClass || !newDate || !newTime || !reason) {
        alert("Please fill in all required fields.");
        return;
      }
    }
    onSubmit(formData);
    onOpenChange(false);
  };
  
  const formTitle = reportType === 'technical' ? "Technical Issue Report" : "Request Academic";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4 pt-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'technical' | 'academic')}
            options={[
              { value: "technical", label: "Technical Issue" },
              { value: "academic", label: "Academic Request" },
            ]}
          />
          <hr/>
          {/* Dựa vào reportType để render form tương ứng */}
          {reportType === 'technical' ? (
            <TechnicalReportForm
              studentId={studentId} setStudentId={setStudentId}
              fullName={fullName} setFullName={setFullName}
              title={title} setTitle={setTitle}
              description={description} setDescription={setDescription}
              attachments={attachments} setAttachments={setAttachments}
            />
          ) : (
            <ScheduleChangeForm
              studentId={studentId} setStudentId={setStudentId}
              fullName={fullName} setFullName={setFullName}
              courseId={courseId} setCourseId={setCourseId}
              selectedClass={selectedClass} setSelectedClass={setSelectedClass}
              newDate={newDate} setNewDate={setNewDate}
              newTime={newTime} setNewTime={setNewTime}
              reason={reason} setReason={setReason}
            />
          )}
        </DialogBody>
        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}