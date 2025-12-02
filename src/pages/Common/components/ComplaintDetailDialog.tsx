import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { 
  MessageSquare, 
  Clock, 
  Calendar, 
  Flag, 
  Download, 
  User, 
  Mail,
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText,
  X,
  Image
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { getComplaintById, getComplaintDownloadUrl, type SystemComplaint } from '@/api/complaint.api';
import { config } from '@/lib/config';

interface ComplaintDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string | null;
}

export default function ComplaintDetailDialog({
  isOpen,
  onClose,
  complaintId
}: ComplaintDetailDialogProps) {
  const [complaint, setComplaint] = useState<SystemComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  // Fetch complaint details when dialog opens
  useEffect(() => {
    if (isOpen && complaintId) {
      fetchComplaintDetails();
    } else {
      setComplaint(null);
    }
  }, [isOpen, complaintId]);

  const fetchComplaintDetails = async () => {
    if (!complaintId) return;
    
    setIsLoading(true);
    try {
      const data = await getComplaintById(complaintId);
      setComplaint(data);
    } catch (error: any) {
      console.error('Error fetching complaint details:', error);
      showError(error.response?.data?.message || 'Failed to load complaint details');
    } finally {
      setIsLoading(false);
    }
  };

  // Build full image URL from reportUrl using storage public URL
  const getImageUrl = (reportUrl: string | undefined): string | null => {
    if (!reportUrl) return null;
    
    // If reportUrl already starts with http/https, return as is
    if (reportUrl.startsWith('http://') || reportUrl.startsWith('https://')) {
      return reportUrl;
    }
    
    // Use storage public URL from config
    const storageBaseURL = config.storagePublicUrl;
    // Remove trailing slash from storageBaseURL if exists
    const cleanStorageBaseURL = storageBaseURL.replace(/\/$/, '');
    // Ensure reportUrl starts with /
    const cleanReportUrl = reportUrl.startsWith('/') ? reportUrl : `/${reportUrl}`;
    
    return `${cleanStorageBaseURL}${cleanReportUrl}`;
  };

  const handleDownloadAttachment = async () => {
    if (!complaint?.id || !complaint?.attachmentUrl) return;

    setIsDownloading(true);
    try {
      const response = await getComplaintDownloadUrl(complaint.id);
      const downloadUrl = response.downloadUrl;
      
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
      showSuccess('Attachment download started');
    } catch (error: any) {
      console.error('Error downloading attachment:', error);
      showError(error.response?.data?.message || 'Failed to download attachment');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'open') {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    if (statusLower === 'in progress' || statusLower === 'inprogress') {
      return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
    if (statusLower === 'resolved') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (statusLower === 'closed') {
      return <XCircle className="w-5 h-5 text-gray-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-600" />;
  };

  const getStatusColor = (status?: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'open') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (statusLower === 'in progress' || statusLower === 'inprogress') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (statusLower === 'resolved') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (statusLower === 'closed') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Complaint Details
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : !complaint ? (
            <div className="text-center py-12 text-gray-500">
              <p>Complaint not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{complaint.title}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.statusName)}`}>
                      {getStatusIcon(complaint.statusName)}
                      {complaint.statusName || 'Open'}
                    </span>
                    {complaint.priority && (
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(complaint.priority)}`}>
                        <Flag className="w-4 h-4" />
                        {complaint.priority}
                      </span>
                    )}
                    {complaint.reportTypeName && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        <FileText className="w-4 h-4" />
                        {complaint.reportTypeName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Submitted Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {complaint.submitterEmail && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Your Email</p>
                      <p className="text-sm font-medium text-gray-900">{complaint.submitterEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Problem Image */}
              {complaint.reportUrl && (() => {
                const imageUrl = getImageUrl(complaint.reportUrl);
                return imageUrl ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Problem Image
                    </h3>
                    <div className="space-y-3">
                      <div className="relative bg-white rounded-lg overflow-hidden border border-purple-100">
                        <img
                          src={imageUrl}
                          alt="Problem image"
                          className="w-full h-auto max-h-96 object-contain"
                          onError={(e) => {
                            console.error('Failed to load problem image:', imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => window.open(imageUrl, '_blank')}
                          className="!bg-purple-600 hover:!bg-purple-700 !text-white"
                          iconLeft={<Download className="w-4 h-4 mr-2" />}
                        >
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Attachment */}
              {complaint.attachmentUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Attachment Available</p>
                        <p className="text-xs text-blue-700">Click download to view the file</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadAttachment}
                      disabled={isDownloading}
                      className="!bg-blue-600 hover:!bg-blue-700 !text-white"
                      iconLeft={<Download className="w-4 h-4 mr-2" />}
                    >
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Response Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  Admin Response
                </h3>
                
                {complaint.adminResponse ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{complaint.adminResponse}</p>
                        </div>
                        {(complaint.resolvedByName || complaint.resolvedAt) && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                            <User className="w-4 h-4" />
                            {complaint.resolvedByName && (
                              <span className="font-medium">By {complaint.resolvedByName}</span>
                            )}
                            {complaint.resolvedAt && (
                              <>
                                {complaint.resolvedByName && <span>•</span>}
                                <span className="text-green-600">
                                  {new Date(complaint.resolvedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No admin response yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your complaint is being reviewed. You will be notified once admin responds.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            iconLeft={<X className="w-4 h-4 mr-2" />}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

