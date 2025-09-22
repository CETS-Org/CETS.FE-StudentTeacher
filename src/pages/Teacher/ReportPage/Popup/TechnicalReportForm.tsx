// src/components/modals/TechnicalReportForm.tsx

import React from "react"; // Thêm import React
import Input from "@/components/ui/Input";
import { UploadCloud } from "lucide-react";

// 1. ĐỊNH NGHĨA TYPE CHO PROPS
type TechnicalFormProps = {
  studentId: string;
  setStudentId: React.Dispatch<React.SetStateAction<string>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
};

// 2. ÁP DỤNG TYPE VÀO PROPS
export default function TechnicalReportForm({
  studentId, setStudentId,
  fullName, setFullName,
  title, setTitle,
  description, setDescription,
}: TechnicalFormProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input label="Student/Teacher ID" placeholder="Enter your ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input label="Title" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        placeholder="Provide detailed information about the issue or request..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded-md p-2 text-sm min-h-[100px]"
      />
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Attachments (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <UploadCloud className="mx-auto mb-2 text-gray-400" size={32}/>
          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
        </div>
      </div>
    </div>
  );
}