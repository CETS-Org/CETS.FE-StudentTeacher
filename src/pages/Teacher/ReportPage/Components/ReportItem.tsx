// src/components/teacher/ReportItem.tsx

import React from "react";
import { Tag, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import type { ReportStatus } from "@/pages/Teacher/ReportPage/Popup/ReportDetailPopup";

type StatusBadgeProps = {
  status: ReportStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full";
  if (status === 'Pending') return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
  if (status === 'Responded') return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Responded</span>;
  if (status === 'Resolved' || status === 'Approved') return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
  return null;
};

type ReportItemProps = {
  report: {
    id: string;
    title: string;
    category: string;
    date: string;
    status: ReportStatus;
  };
  onViewDetails: () => void;
};

export default function ReportItem({ report, onViewDetails }: ReportItemProps) {
  return (
    <div className="bg-white p-4 border rounded-lg shadow-sm flex justify-between items-center border border-gray-200 shadow-md">
      <div>
        <h3 className="font-semibold text-gray-800">{report.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1.5"><Tag size={14}/> {report.category}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14}/> {report.date}</span>
          <StatusBadge status={report.status} />
        </div>
      </div>
      <Button variant="secondary" onClick={onViewDetails}>
        View Details
      </Button>
    </div>
  );
}