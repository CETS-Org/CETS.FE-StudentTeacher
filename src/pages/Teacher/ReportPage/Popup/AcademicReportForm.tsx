// src/components/modals/ScheduleChangeForm.tsx

import React from "react"; // Thêm import React
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { AlertCircle } from "lucide-react";

// 1. ĐỊNH NGHĨA TYPE CHO PROPS
type AcademicReportFormProps = {
  studentId: string;
  setStudentId: React.Dispatch<React.SetStateAction<string>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  courseId: string;
  setCourseId: React.Dispatch<React.SetStateAction<string>>;
  selectedClass: string;
  setSelectedClass: React.Dispatch<React.SetStateAction<string>>;
  newDate: string;
  setNewDate: React.Dispatch<React.SetStateAction<string>>;
  newTime: string;
  setNewTime: React.Dispatch<React.SetStateAction<string>>;
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
};


export default function AcademicReportForm({
  studentId, setStudentId,
  fullName, setFullName,
  courseId, setCourseId,
  selectedClass, setSelectedClass,
  newDate, setNewDate,
  newTime, setNewTime,
  reason, setReason
}: AcademicReportFormProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input label="Student/Teacher ID" placeholder="Enter your ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input label="Course ID" placeholder="Enter course ID" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
      <Select 
        label="Class" 
        value={selectedClass} 
        onChange={(e) => setSelectedClass(e.target.value)}
        options={[{ value: "", label: "Select a class" }, { value: "SE1701", label: "SE1701" }]}
      />
      <Select
        label="Current Schedule"
        value={"mon-1000"}
        disabled
        options={[{ value: "mon-1000", label: "Monday, 10:00 AM - 11:30 AM" }]}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="New Date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        <Input label="New Time" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
      </div>
      <textarea
        placeholder="Please explain why you need to make this change..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border rounded-md p-2 text-sm min-h-[100px]"
      />
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-md flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Important Notice</p>
          <p>Class changes are subject to availability and approval. Processing may take 3-5 business days.</p>
        </div>
      </div>
    </div>
  );
}