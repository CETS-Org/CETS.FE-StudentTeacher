import React from "react";
import Button from "@/components/ui/Button";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  X,
  Clock,
  MapPin
} from "lucide-react";
import type { ClassAttendanceSummary } from "@/types/attendance";

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassAttendanceSummary;
}

const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  classData 
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-800">{classData.className}</h2>
              <p className="text-sm text-accent-600">Detailed Attendance Records</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-primary-100 rounded-full"
          >
            <X className="w-5 h-5 text-primary-600" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-accent-50 rounded-lg">
              <p className="text-sm font-medium text-accent-700">Total Sessions</p>
              <p className="text-lg font-bold text-accent-600">{classData.totalSessions}</p>
            </div>
            <div className="text-center p-3 bg-success-50 rounded-lg">
              <p className="text-sm font-medium text-success-700">Present</p>
              <p className="text-lg font-bold text-success-600">{classData.attendedSessions}</p>
            </div>
            <div className="text-center p-3 bg-error-50 rounded-lg">
              <p className="text-sm font-medium text-error-700">Absent</p>
              <p className="text-lg font-bold text-error-600">{classData.absentSessions}</p>
            </div>
          </div>

          {/* Attendance Records List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary-800 mb-3">Session Records</h3>
            {classData.records.length > 0 ? (
              classData.records.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border ${
                    record.attendanceStatus === 'Present'
                      ? 'bg-success-50 border-success-200'
                      : 'bg-error-50 border-error-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.attendanceStatus === 'Present'
                          ? 'bg-success-100'
                          : 'bg-error-100'
                      }`}>
                        {record.attendanceStatus === 'Present' ? (
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold ${
                            record.attendanceStatus === 'Present'
                              ? 'text-success-700'
                              : 'text-error-700'
                          }`}>
                            {record.attendanceStatus}
                          </p>
                          <span className="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded-full">
                            {formatDate(record.meeting.startsAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-neutral-800">
                          {record.meeting.coveredTopic}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTime(record.meeting.startsAt)} - {formatTime(record.meeting.endsAt)}
                            </span>
                          </div>
                          {record.meeting.roomName && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{record.meeting.roomName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-neutral-500">
                      <p>Checked by: {record.checkedByName}</p>
                      {record.notes && (
                        <p className="mt-1 text-neutral-600 italic">Note: {record.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="w-8 h-8 text-accent-600" />
                </div>
                <p className="text-accent-600">No detailed records available for this class</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-accent-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;
