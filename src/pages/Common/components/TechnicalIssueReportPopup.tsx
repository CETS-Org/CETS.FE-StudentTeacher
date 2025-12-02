import React, { useState, useRef, useEffect } from "react";
import { X, Upload, File, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { getUserInfo, getStudentId, getTeacherId } from "@/lib/utils";
import { createComplaint, getReportTypes, getReportStatuses, getReportImageUploadUrl, type CreateComplaintRequest, type ReportType } from "@/api/complaint.api";
import { uploadToPresignedUrl } from "@/api/file.api";
import { useToast } from "@/hooks/useToast";

interface TechnicalIssueReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const TechnicalIssueReportPopup: React.FC<TechnicalIssueReportPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const userInfo = getUserInfo();
  const userId = getStudentId() || getTeacherId();
  const { success: showSuccess, error: showError } = useToast();
  
  const [formData, setFormData] = useState<{
    reportTypeID: string;
    title: string;
    description: string;
  }>({
    reportTypeID: "",
    title: "",
    description: "",
  });
  
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch report types on mount
  useEffect(() => {
    if (isOpen) {
      fetchReportTypes();
    }
  }, [isOpen]);

  const fetchReportTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const types = await getReportTypes();
      setReportTypes(types.filter(type => type.isActive));
      // Auto-select first type if available
      if (types.length > 0 && !formData.reportTypeID) {
        setFormData(prev => ({ ...prev, reportTypeID: types[0].id }));
      }
    } catch (error) {
      console.error('Error fetching report types:', error);
      showError('Failed to load report types. Please try again.');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only images allowed
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showError('Please select an image file (jpg, jpeg, png, gif, or webp)');
        return;
      }
      
      // Validate file size (max 10MB for images)
      if (file.size > 10 * 1024 * 1024) {
        showError('Image size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type - only images allowed
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showError('Please select an image file (jpg, jpeg, png, gif, or webp)');
        return;
      }
      
      // Validate file size (max 10MB for images)
      if (file.size > 10 * 1024 * 1024) {
        showError('Image size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit clicked', { userId, formData, selectedFile });
    
    if (!userId) {
      showError('User ID not found. Please login again.');
      return;
    }

    if (!formData.reportTypeID) {
      showError('Please select a report type');
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      showError('Please enter a title');
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      showError('Please enter a description');
      return;
    }

    setIsSubmitting(true);
    try {
      let reportUrl: string | undefined;

      // Upload image if selected
      if (selectedFile) {
        try {
          // Get presigned upload URL from backend
          const uploadUrlResponse = await getReportImageUploadUrl({
            fileName: selectedFile.name,
            contentType: selectedFile.type
          });
          
          // Upload file to presigned URL
          await uploadToPresignedUrl(uploadUrlResponse.uploadUrl, selectedFile, selectedFile.type);
          
          // Use the filePath returned from backend as the reportUrl
          reportUrl = uploadUrlResponse.filePath;
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          showError('Image upload failed. Please try again or submit without image.');
          setIsSubmitting(false);
          return;
        }
      }

      // Get "Open" status ID
      const reportStatuses = await getReportStatuses();
      const openStatus = reportStatuses.find((s) => s.name?.toLowerCase() === 'open' || s.code?.toLowerCase() === 'open' || s.code?.toLowerCase() === 'pending');
      if (!openStatus) {
        showError('Could not find Open status. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Auto-determine priority based on report type
      const selectedReportType = reportTypes.find(t => t.id === formData.reportTypeID);
      const reportTypeName = selectedReportType?.name?.toLowerCase() || '';
      const reportTypeCode = selectedReportType?.code?.toLowerCase() || '';
      
      let priority: string = 'Low'; // Default priority
      
      // Priority mapping: incident -> High, academic/finance -> Medium, other -> Low
      if (reportTypeCode.includes('incident') || reportTypeName.includes('incident')) {
        priority = 'High';
      } else if (
        reportTypeCode.includes('academic') || reportTypeName.includes('academic') ||
        reportTypeCode.includes('finance') || reportTypeName.includes('finance') ||
        reportTypeCode.includes('financial') || reportTypeName.includes('financial')
      ) {
        priority = 'Medium';
      } else {
        priority = 'Low';
      }

      const complaintData: CreateComplaintRequest = {
        reportTypeID: formData.reportTypeID,
        submittedBy: userId,
        title: formData.title,
        description: formData.description,
        reportStatusID: openStatus.id,
        priority: priority,
        reportUrl: reportUrl,
      };
      
      await createComplaint(complaintData);
      
      showSuccess('System complaint submitted successfully!');
      
      // Reset form
      setFormData({
        reportTypeID: reportTypes[0]?.id || "",
        title: "",
        description: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      showError(error.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      reportTypeID: reportTypes[0]?.id || "",
      title: "",
      description: "",
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        handleCancel();
      }
    }}>
      <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Submit System Complaint
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto max-h-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Info Display (Read-only) */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">Submitting as:</span>
              </div>
              <p className="text-sm text-blue-800 font-medium">
                {userInfo?.fullName || userInfo?.email || "User"}
              </p>
              {userInfo?.email && userInfo?.fullName && (
                <p className="text-xs text-blue-600 mt-1">{userInfo.email}</p>
              )}
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                name="reportTypeID"
                value={formData.reportTypeID}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting || isLoadingTypes}
              >
                <option value="">Select a type...</option>
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief title of the complaint"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={255}
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please describe the issue in detail..."
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            {/* Problem Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Image (Optional)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Image Preview */}
                    <div className="relative bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Problem preview"
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Drag & drop your file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Supported formats: JPG, JPEG, PNG, GIF, WEBP (Max 10MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Choose Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isSubmitting}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 mb-1">
                    Important Notice
                  </h4>
                  <p className="text-sm text-orange-700">
                    Your complaint will be reviewed by admin staff. High priority issues are addressed within 24 hours. 
                    You will be notified once your complaint has been reviewed.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : isLoadingTypes ? 'Loading...' : 'Submit Complaint'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicalIssueReportPopup;