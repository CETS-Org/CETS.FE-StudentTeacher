import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

interface AcademicRequestDetailData {
  id: string;
  status: "Pending" | "Resolved" | "Responsed";
  createdDate: string;
  studentId: string;
  fullName: string;
  courseId: string;
  fromClass: string;
  toClass: string;
  reasonForChange: string;
  adminResponse?: {
    message: string;
    responder: string;
    date: string;
  };
}

// Mock data - in real app, this would be fetched based on the ID
const mockAcademicRequestDetail: AcademicRequestDetailData = {
  id: "IIR-2025-0128",
  status: "Pending",
  createdDate: "January 27, 2025",
  studentId: "STU-2025-001234",
  fullName: "John Michael Anderson",
  courseId: "CS-301",
  fromClass: "CS-301A (Morning)",
  toClass: "CS-301B (Evening)",
  reasonForChange: "Due to a change in my work schedule, I need to switch from the morning class to the evening class to accommodate my new job requirements. This change will help me maintain my academic progress while fulfilling my work responsibilities.",
  adminResponse: {
    message: "Hi [Student's Name], The student portal issue has now been resolved. You should be able to log in and access your course materials without any problems. Please try again and let us know if you encounter any further issues.",
    responder: "Student Support Team",
    date: "January 28, 2025"
  }
};

const AcademicChangeRequestDetail: React.FC = () => {
  usePageTitle("Academic Change Request Detail");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // In real app, fetch request data based on ID
  const request = mockAcademicRequestDetail;

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Responsed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-full space-y-8">
      <div className="p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          </div>

          {/* Request Detail Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Issue Report #{request.id}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Created on {request.createdDate}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            </div>

            {/* Form Data Section */}
            <div className="p-6 space-y-6">
              {/* Your ID and Full Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your ID
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {request.studentId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {request.fullName}
                  </div>
                </div>
              </div>

              {/* Course ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course ID
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {request.courseId}
                </div>
              </div>

              {/* From Class and To Class */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Class
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {request.fromClass}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Class
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {request.toClass}
                  </div>
                </div>
              </div>

              {/* Reason for Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-4 rounded-md leading-relaxed">
                  {request.reasonForChange}
                </div>
              </div>

              {/* Admin Response */}
              {request.adminResponse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    👤 Admin Response
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2 leading-relaxed">
                          {request.adminResponse.message}
                        </p>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">{request.adminResponse.responder}</span>
                          {" • "}
                          <span>{request.adminResponse.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicChangeRequestDetail;