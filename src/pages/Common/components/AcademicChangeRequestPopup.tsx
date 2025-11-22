import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, Upload, File } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { submitAcademicRequest } from "@/api/academicRequest.api";
import { getAcademicRequestTypes } from "@/api/lookup.api";
import { getUserInfo, getStudentId } from "@/lib/utils";
import { uploadToPresignedUrl } from "@/api/file.api";
import { studentLearningClassesService } from "@/services/studentLearningClassesService";
import type { SubmitAcademicRequest } from "@/types/report";
import type { MyClass } from "@/types/class";

interface AcademicChangeRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void; // Callback to refresh the reports list
}

const AcademicChangeRequestPopup: React.FC<AcademicChangeRequestPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const userInfo = getUserInfo();
  const userId = getStudentId();

  const [formData, setFormData] = useState({
    requestTypeID: "", 
    reason: "",
    fromClassID: "",
    toClassID: "",
    attachmentUrl: "",
  });

  const [requestTypes, setRequestTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<MyClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch request types and classes on mount
  useEffect(() => {
    if (isOpen && userId) {
      fetchRequestTypes();
      fetchClasses();
    }
  }, [isOpen, userId]);

  const fetchRequestTypes = async () => {
    setIsLoading(true);
    try {
      // Fetch academic request types
      const requestTypesResponse = await getAcademicRequestTypes();
      const requestTypesList = requestTypesResponse.data as any[];
      setRequestTypes(requestTypesList);
    } catch (error: any) {
      console.error('Error fetching request types:', error);
      toast.error(error.response?.data?.error || 'Failed to load request types');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!userId) return;
    
    setIsLoadingClasses(true);
    try {
      const classesData = await studentLearningClassesService.getStudentLearningClasses(userId);
      setClasses(classesData);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes. Please try again.');
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // If request type changes and it's not class transfer, clear class transfer fields
    if (name === 'requestTypeID') {
      const newSelectedType = requestTypes.find(type => {
        const typeId = type.lookUpId || (type as any).LookUpId || type.id;
        return typeId === value;
      });
      
      const isNewTypeClassTransfer = newSelectedType && (
        (newSelectedType.name || '').toLowerCase().includes('class transfer') ||
        (newSelectedType.name || '').toLowerCase().includes('class-transfer') ||
        (newSelectedType.code || '').toLowerCase().includes('classtransfer') ||
        (newSelectedType.code || '').toLowerCase().includes('class_transfer') ||
        (newSelectedType.code || '').toLowerCase() === 'classtransfer'
      );

      if (!isNewTypeClassTransfer) {
        // Clear class transfer fields if switching away from class transfer
        setFormData(prev => ({
          ...prev,
          [name]: value,
          fromClassID: "",
          toClassID: "",
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
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
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
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

  // Check if the selected request type is "class transfer"
  const isClassTransfer = (): boolean => {
    if (!formData.requestTypeID) return false;
    
    const selectedType = requestTypes.find(type => {
      const typeId = type.lookUpId || (type as any).LookUpId || type.id;
      return typeId === formData.requestTypeID;
    });

    if (!selectedType) return false;

    const typeName = (selectedType.name || '').toLowerCase();
    const typeCode = (selectedType.code || '').toLowerCase();
    
    return typeName.includes('class transfer') || 
           typeName.includes('class-transfer') ||
           typeCode.includes('classtransfer') ||
           typeCode.includes('class_transfer') ||
           typeCode === 'classtransfer';
  };

  const validateForm = (): boolean => {
    if (!formData.requestTypeID) {
      toast.error('Please select a request type');
      return false;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for your request');
      return false;
    }

    // Validate class transfer specific fields
    if (isClassTransfer()) {
      if (!formData.fromClassID?.trim()) {
        toast.error('From Class is required for class transfer requests');
        return false;
      }

      if (!formData.toClassID?.trim()) {
        toast.error('To Class is required for class transfer requests');
        return false;
      }

      if (formData.fromClassID === formData.toClassID) {
        toast.error('From Class and To Class must be different');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !userId || !userInfo) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file first if one was selected to get the URL
      let attachmentUrl = "";
      if (selectedFile) {
        try {
          // You may need to implement file upload logic here
          // For now, we'll just store the file name
          // In a real implementation, you'd upload to S3/R2 and get a URL
          toast.info('File upload functionality needs to be implemented');
        } catch (uploadError: any) {
          console.error('Error uploading file:', uploadError);
          toast.error('File upload failed. Please try again or submit without attachment.');
          setIsSubmitting(false);
          return;
        }
      }

      const requestData: SubmitAcademicRequest = {
        studentID: userId,
        requestTypeID: formData.requestTypeID,
        reason: formData.reason,
        fromClassID: formData.fromClassID || undefined,
        toClassID: formData.toClassID || undefined,
        attachmentUrl: attachmentUrl || undefined,
      };

      await submitAcademicRequest(requestData);

      toast.success('Academic request submitted successfully! It will be reviewed by staff within 3-5 business days.');
      
      // Reset form
      setFormData({
        requestTypeID: "",
        reason: "",
        fromClassID: "",
        toClassID: "",
        attachmentUrl: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSubmit(); // Callback to refresh the reports list
      onClose();
    } catch (error: any) {
      console.error('Error submitting academic request:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit request. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
      // Reset form
      setFormData({
        requestTypeID: "",
        reason: "",
        fromClassID: "",
        toClassID: "",
        attachmentUrl: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity px-4 sm:px-6 md:px-8 scrollbar-hide">
      <div className="bg-white rounded-lg shadow-xl w-[60%] mx-40 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Submit Academic Request</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info Display (Read-only) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">Submitting as:</span>
            </div>
            <p className="text-sm text-blue-800 font-medium">
              {userInfo?.fullName || userInfo?.email}
            </p>
            {userInfo?.email && userInfo?.fullName && (
              <p className="text-xs text-blue-600 mt-1">{userInfo.email}</p>
            )}
          </div>

          {/* Request Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Type <span className="text-red-500">*</span>
            </label>
            <select
              name="requestTypeID"
              value={formData.requestTypeID}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading || isSubmitting}
            >
              <option value="" disabled>Select request type</option>
              {requestTypes.map(type => {
                // Handle different possible field names from API (LookUpId, lookUpId, or id)
                const typeId = type.lookUpId || (type as any).LookUpId || type.id;
                return (
                  <option key={typeId} value={typeId}>
                    {type.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Request <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Please provide a detailed explanation of your request, including any relevant course/class and schedule information if applicable..."
              rows={4}
              maxLength={2000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.reason.length}/2000 characters</p>
          </div>

          {/* From Class - Only shown for class transfer, required when shown */}
          {isClassTransfer() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Class <span className="text-red-500">*</span>
              </label>
              <select
                name="fromClassID"
                value={formData.fromClassID}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting || isLoadingClasses}
              >
                <option value="" disabled>Select a class</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.className} {classItem.courseName ? `- ${classItem.courseName}` : ''}
                  </option>
                ))}
              </select>
              {isLoadingClasses && (
                <p className="text-xs text-gray-500 mt-1">Loading classes...</p>
              )}
              {!isLoadingClasses && classes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No classes available</p>
              )}
            </div>
          )}

          {/* To Class - Only shown for class transfer, required when shown */}
          {isClassTransfer() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Class <span className="text-red-500">*</span>
              </label>
              <select
                name="toClassID"
                value={formData.toClassID}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting || isLoadingClasses}
              >
                <option value="" disabled>Select a class</option>
                {classes
                  .filter(classItem => classItem.id !== formData.fromClassID) // Exclude the selected "From Class"
                  .map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.className} {classItem.courseName ? `- ${classItem.courseName}` : ''}
                    </option>
                  ))}
              </select>
              {isLoadingClasses && (
                <p className="text-xs text-gray-500 mt-1">Loading classes...</p>
              )}
              {!isLoadingClasses && classes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No classes available</p>
              )}
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supporting Document (Optional)
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
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop your file here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Maximum file size: 50MB
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isSubmitting}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
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
                  All academic requests are subject to approval by academic staff. 
                  Processing typically takes 3-5 business days. You will be notified once 
                  your request has been reviewed.
                </p>
                {isClassTransfer() && (
                  <p className="text-sm text-orange-700 mt-2">
                    <strong>Class Transfer:</strong> Your request will be valid for 7 days from submission. 
                    If not processed within this period, it will automatically expire.
                  </p>
                )}
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
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicChangeRequestPopup;
