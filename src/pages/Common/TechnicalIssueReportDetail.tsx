import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, User } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

interface ReportDetailData {
  id: string;
  title: string;
  status: "Pending" | "Resolved" | "Responsed";
  createdDate: string;
  studentId: string;
  fullName: string;
  reportType: string;
  description: string;
  uploadedFiles: {
    name: string;
    size: string;
    uploadedOn: string;
  }[];
  adminResponse?: {
    message: string;
    responder: string;
    date: string;
  };
}

// Mock data - in real app, this would be fetched based on the ID
const mockReportDetail: ReportDetailData = {
  id: "IIR-2025-0127",
  title: "Classroom Projector Not Working",
  status: "Pending",
  createdDate: "January 27, 2025",
  studentId: "STU-2025-001234",
  fullName: "John Michael Anderson",
  reportType: "Technical Issue",
  description: "I am experiencing difficulties accessing the student portal. When I try to log in, the page loads indefinitely and eventually times out. This has been happening for the past two days, and I need to access my course materials for upcoming assignments. I have tried clearing my browser cache and using different browsers, but the issue persists.",
  uploadedFiles: [
    {
      name: "screenshot-error.png",
      size: "2.5 KB",
      uploadedOn: "Jan 27, 2025"
    },
    {
      name: "browser-console-log.pdf",
      size: "54 KB",
      uploadedOn: "Jan 27, 2025"
    }
  ],
  adminResponse: {
    message: "Hi [Student's Name], The student portal issue has now been resolved. You should be able to log in and access your course materials without any problems. Please try again and let us know if you encounter any further issues.",
    responder: "Student Support Team",
    date: "January 28, 2025"
  }
};

const TechnicalIssueReportDetail: React.FC = () => {
  usePageTitle("Issue Report Detail");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // In real app, fetch report data based on ID
  const report = mockReportDetail;

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = (fileName: string) => {
    // In real app, implement file download
  };

  const handleView = (fileName: string) => {
    // In real app, implement file view
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
        <div className=" mx-auto">
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

          {/* Report Detail Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Issue Report #{report.id}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Created on {report.createdDate}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
            </div>

            {/* Form Data Section */}
            <div className="p-6 space-y-6">
              {/* Your ID */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your ID
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {report.studentId}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {report.fullName}
                  </div>
                </div>
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {report.reportType}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {report.title}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-4 rounded-md leading-relaxed">
                  {report.description}
                </div>
              </div>

              {/* Uploaded Files */}
              {report.uploadedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    📎 Uploaded Files
                  </label>
                  <div className="space-y-2">
                    {report.uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size} • Uploaded on {file.uploadedOn}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(file.name)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(file.name)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {report.adminResponse && (
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
                          {report.adminResponse.message}
                        </p>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">{report.adminResponse.responder}</span>
                          {" • "}
                          <span>{report.adminResponse.date}</span>
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

export default TechnicalIssueReportDetail;