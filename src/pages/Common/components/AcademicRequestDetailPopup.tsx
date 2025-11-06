import React, { useState, useEffect } from "react";
import { X, File, Download, Calendar, User, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { getAcademicRequestDetails, getReportDownloadUrl } from "@/api/report.api";
import type { AcademicReportResponse } from "@/types/report";
import { toast } from "@/components/ui/Toast";

interface AcademicRequestDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

const AcademicRequestDetailPopup: React.FC<AcademicRequestDetailPopupProps> = ({
  isOpen,
  onClose,
  requestId,
}) => {
  const [request, setRequest] = useState<AcademicReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
    } else {
      setRequest(null);
    }
  }, [isOpen, requestId]);

  const fetchRequestDetails = async () => {
    if (!requestId) return;

    setIsLoading(true);
    try {
      const response = await getAcademicRequestDetails(requestId);
      setRequest(response.data);
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      toast.error(error.response?.data?.error || 'Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusLower = status?.toLowerCase() || 'pending';
    
    if (statusLower === 'pending' || statusLower === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <Clock size={14} /> {status || 'Pending'}
        </span>
      );
    }
    
    if (statusLower === 'approved' || statusLower === 'resolved') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle size={14} /> {status || 'Approved'}
        </span>
      );
    }
    
    if (statusLower === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircle size={14} /> {status || 'Rejected'}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        {status || 'Unknown'}
      </span>
    );
  };

  const handleDownloadAttachment = async () => {
    if (!request?.id || !request?.attachmentUrl) {
      toast.error('No attachment available to download');
      return;
    }

    try {
      const response = await getReportDownloadUrl(request.id);

      // Backend returns JSON with downloadUrl
      const presignedUrl = response.data?.downloadUrl;
      if (!presignedUrl) {
        throw new Error("No presigned URL returned from server");
      }

      // Open the file in a new tab (Cloudflare R2 presigned URL)
      const link = document.createElement("a");
      link.href = presignedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error("Download attachment error:", error);
      toast.error(
        `Failed to download attachment: ${
          error.response?.data?.error || error.message || "Unknown error"
        }`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg" className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Academic Request Details
              </DialogTitle>
              {request && (
                <p className="text-sm text-gray-500 mt-1">
                  Created on {new Date(request.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {request && (
            <div className="mt-2">
              {getStatusBadge(request.statusName)}
            </div>
          )}
        </DialogHeader>

        <DialogBody className="space-y-6 pt-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Loading request details...</p>
            </div>
          ) : request ? (
            <>
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {request.reportTypeName || 'N/A'}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {request.title}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-4 rounded-md leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </div>
              </div>

              {/* Attachment */}
              {request.attachmentUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Document
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {request.attachmentUrl.split('/').pop() || 'Attachment'}
                        </p>
                        <p className="text-xs text-gray-500">Supporting document</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleDownloadAttachment}
                      className="flex items-center gap-2"
                      iconLeft={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Submitter Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Submitted By</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Name: </span>
                    <span className="text-sm text-gray-900">{request.submitterName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email: </span>
                    <span className="text-sm text-blue-600">{request.submitterEmail || 'N/A'}</span>
                  </div>
                  {request.submitterRole && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Role: </span>
                      <span className="text-sm text-gray-900">{request.submitterRole}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Information */}
              {(request.resolvedAt || request.resolvedByName) && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Resolution Details</span>
                  </div>
                  <div className="space-y-2">
                    {request.resolvedByName && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Resolved by: </span>
                        <span className="text-sm text-gray-900">{request.resolvedByName}</span>
                      </div>
                    )}
                    {request.resolvedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Resolved on: </span>
                        <span className="text-sm text-gray-900">
                          {new Date(request.resolvedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-800 mb-1">
                      Request Status
                    </h4>
                    <p className="text-sm text-orange-700">
                      {request.statusName?.toLowerCase() === 'pending' 
                        ? "Your request is currently under review. Academic staff will review it within 3-5 business days."
                        : request.statusName?.toLowerCase() === 'approved'
                        ? "Your request has been approved. Please check your email or notifications for further instructions."
                        : request.statusName?.toLowerCase() === 'rejected'
                        ? "Your request has been reviewed and was not approved. Please contact academic staff for more information."
                        : "Your request has been processed."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Request not found</p>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicRequestDetailPopup;

