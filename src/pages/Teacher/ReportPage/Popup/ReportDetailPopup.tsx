// src/components/modals/ViewReportPopup.tsx

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CheckCircle, Clock, File, Eye, Download, MessageSquare } from "lucide-react";

// --- ĐỊNH NGHĨA CHUẨN VÀ EXPORT RA NGOÀI ---
// --- ĐỊNH NGHĨA CHUẨN VÀ EXPORT RA NGOÀI ---
export type ReportStatus = 'Pending' | 'Approved' | 'Rejected' | 'Resolved' | 'Responded';

export type BaseReport = {
  id: string;
  title: string;
  category: 'Technical' | 'Academic';
  createdDate: string;
  studentId: string;
  fullName: string;
  status: ReportStatus;
  adminResponse?: string;
};

export type TechnicalReport = BaseReport & {
  type: 'Technical';
  reportType: string;
  description: string;
  files: { name: string; size: string; uploadedDate: string }[];
};

// SỬA LẠI TÊN TYPE TẠI ĐÂY
export type AcademicReport = BaseReport & {
  type: 'Academic';
  courseId: string;
  class: string;
  currentSchedule: string;
  newDate: string;
  newTime: string;
  reason: string;
};

export type ReportData = TechnicalReport | AcademicReport;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportData | null;
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded-md mt-1">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: BaseReport['status'] }) => {
  const baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1";
  if (status === 'Approved') return <span className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle size={14}/> Approved</span>;
  if (status === 'Pending') return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Clock size={14}/> Pending</span>;
  if (status === 'Responded') return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Responded</span>;
  if (status === 'Resolved') return <span className={`${baseClasses} bg-green-100 text-green-800`}>Resolved</span>;
  return null;
};

export default function ViewReportPopup({ open, onOpenChange, report }: Props) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div>
            <DialogTitle>Issue Report #{report.id}</DialogTitle>
            <p className="text-sm text-gray-500">Created on {report.createdDate}</p>
          </div>
          <StatusBadge status={report.status} />
        </DialogHeader>
        <DialogBody className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Your ID" value={report.studentId} />
            <DetailItem label="Full Name" value={report.fullName} />
          </div>

          {report.type === 'Academic' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Course ID" value={report.courseId} />
                <DetailItem label="Class" value={report.class} />
              </div>
              <DetailItem label="Current Schedule" value={report.currentSchedule} />
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="New Date" value={report.newDate} />
                <DetailItem label="New Time" value={report.newTime} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Reason for Change</p>
                <p className="text-gray-800 bg-gray-50 p-2 rounded-md mt-1 text-sm whitespace-pre-wrap">{report.reason}</p>
              </div>
            </div>
          )}

          {report.type === 'Technical' && (
            <div className="space-y-4 pt-2">
              <DetailItem label="Report Type" value={report.reportType} />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-gray-800 bg-gray-50 p-2 rounded-md mt-1 text-sm whitespace-pre-wrap">{report.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</p>
                <ul className="space-y-2">
                  {report.files.map((file, index) => (
                    <li key={index} className="flex justify-between items-center border p-2 rounded-md">
                      <div className="flex items-center gap-3">
                        <File className="text-gray-500" size={24}/>
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} • Uploaded {file.uploadedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" className="h-8 w-8 p-0"><Eye size={16}/></Button>
                        <Button variant="ghost" className="h-8 w-8 p-0"><Download size={16}/></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {report.adminResponse && (
            <div className="pt-4">
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><MessageSquare size={18}/> Admin Response</p>
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-900 border border-blue-200 whitespace-pre-wrap">
                {report.adminResponse}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}