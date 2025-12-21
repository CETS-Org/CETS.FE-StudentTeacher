import React, { useState, useEffect } from "react";
import { X, File, Download, Calendar, User, AlertCircle, CheckCircle, Clock, XCircle, MapPin, PauseCircle, Star, ExternalLink, AlertTriangle, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { getAcademicRequestDetails, getAttachmentDownloadUrl, getAttachmentUploadUrl, updateRequestAttachment } from "@/api/academicRequest.api";
import { getAllClasses, getClassDetailsById } from "@/api/classes.api";
import { getClassMeetingsByClassId, type ClassMeeting } from "@/api/classMeetings.api";
import { getTimeSlots } from "@/api/lookup.api";
import type { AcademicRequestResponse } from "@/types/academicRequest";
import { SuspensionReasonCategoryLabels } from "@/types/suspensionRequest";
import { DropoutReasonCategoryLabels, type ExitSurveyData } from "@/types/dropoutRequest";
import { AcademicRequestReasonCategoryLabels } from "@/types/academicRequestReasonCategories";
import { toast } from "@/components/ui/Toast";
import axios from "axios";

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
  const [request, setRequest] = useState<AcademicRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<Map<string, string>>(new Map());
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [exitSurveyData, setExitSurveyData] = useState<ExitSurveyData | null>(null);
  const [isLoadingExitSurvey, setIsLoadingExitSurvey] = useState(false);
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const [isUpdatingAttachment, setIsUpdatingAttachment] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showUpdateAttachment, setShowUpdateAttachment] = useState(false);
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [fromClassMeetings, setFromClassMeetings] = useState<ClassMeeting[]>([]);
  const [toClassMeetings, setToClassMeetings] = useState<ClassMeeting[]>([]);
  const [fromClassDetail, setFromClassDetail] = useState<any>(null);
  const [toClassDetail, setToClassDetail] = useState<any>(null);
  const [isLoadingClassData, setIsLoadingClassData] = useState(false);
  const [fromClassCurrentMonth, setFromClassCurrentMonth] = useState<Date>(new Date());
  const [toClassCurrentMonth, setToClassCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
      fetchClassesAndTimeSlots();
    } else {
      setRequest(null);
    }
  }, [isOpen, requestId]);

  // Fetch class meetings and details for class transfer requests
  useEffect(() => {
    const loadClassData = async () => {
      if (!isOpen || !request || (!request.fromClassID && !request.toClassID)) {
        setFromClassMeetings([]);
        setToClassMeetings([]);
        setFromClassDetail(null);
        setToClassDetail(null);
        return;
      }

      setIsLoadingClassData(true);
      try {
        // Fetch from class data
        if (request.fromClassID) {
          try {
            const [meetings, detailRes] = await Promise.all([
              getClassMeetingsByClassId(request.fromClassID),
              getClassDetailsById(request.fromClassID)
            ]);
            setFromClassMeetings(meetings || []);
            setFromClassDetail(detailRes.data);
            
            // Initialize current month to first meeting date if available
            if (meetings && meetings.length > 0) {
              const firstDate = new Date(meetings[0].date);
              if (!isNaN(firstDate.getTime())) {
                setFromClassCurrentMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
              }
            }
          } catch (error: any) {
            console.error("Error loading from class data:", error);
            setFromClassMeetings([]);
            setFromClassDetail(null);
          }
        }

        // Fetch to class data
        if (request.toClassID) {
          try {
            const [meetings, detailRes] = await Promise.all([
              getClassMeetingsByClassId(request.toClassID),
              getClassDetailsById(request.toClassID)
            ]);
            setToClassMeetings(meetings || []);
            setToClassDetail(detailRes.data);
            
            // Initialize current month to first meeting date if available
            if (meetings && meetings.length > 0) {
              const firstDate = new Date(meetings[0].date);
              if (!isNaN(firstDate.getTime())) {
                setToClassCurrentMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
              }
            }
          } catch (error: any) {
            console.error("Error loading to class data:", error);
            setToClassMeetings([]);
            setToClassDetail(null);
          }
        }
      } catch (error: any) {
        console.error("Error loading class data:", error);
      } finally {
        setIsLoadingClassData(false);
      }
    };

    loadClassData();
  }, [isOpen, request?.id, request?.fromClassID, request?.toClassID]);

  const fetchClassesAndTimeSlots = async () => {
    setIsLoadingClasses(true);
    try {
      // Fetch classes and time slots in parallel
      const [classesResponse, timeSlotsResponse] = await Promise.all([
        getAllClasses(),
        getTimeSlots()
      ]);

      // Set classes
      setAllClasses(classesResponse.data || []);

      // Map time slots
      const slots = timeSlotsResponse.data || [];
      const slotMap = new Map<string, string>();
      slots.forEach((slot: any) => {
        const code = slot.code || slot.Code || '';
        const name = slot.name || slot.Name || '';
        if (code) {
          const timeMatch = name.match(/(\d{2}:\d{2})/);
          if (timeMatch) {
            const times = name.match(/(\d{2}:\d{2})/g);
            if (times && times.length > 1) {
              slotMap.set(code, `${times[0]} - ${times[1]}`);
            } else {
              slotMap.set(code, timeMatch[1]);
            }
          } else {
            slotMap.set(code, name || code);
          }
        }
      });
      setTimeSlots(slotMap);
    } catch (error: any) {
      console.error('Error fetching classes/time slots:', error);
      // Don't show error toast as this is not critical
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Helper function to get time from slot code
  const getTimeFromSlot = (slotCode: string): string => {
    if (!slotCode) return slotCode;
    const time = timeSlots.get(slotCode);
    return time || slotCode;
  };

  // Helper function to get time from slot string (e.g., "Slot 1 (09:00 - 10:30)")
  const getTimeFromSlotString = (slot: string): string => {
    if (!slot) return slot;
    // Try to extract time from slot string
    const timeMatch = slot.match(/(\d{2}:\d{2})/);
    if (timeMatch) {
      const times = slot.match(/(\d{2}:\d{2})/g);
      if (times && times.length > 1) {
        return `${times[0]} - ${times[1]}`;
      }
      return timeMatch[1];
    }
    return slot;
  };

  // Schedule Calendar Component
  const ScheduleCalendar = ({ 
    meetings, 
    currentMonth, 
    onMonthChange,
    theme = "blue" 
  }: { 
    meetings: ClassMeeting[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    theme?: "blue" | "green";
  }) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Parse meeting dates
    const meetingDates: Date[] = [];
    const meetingTimes = new Map<string, string>();
    
    meetings.forEach((meeting) => {
      const dateStr = meeting.date;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;
      
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      meetingDates.push(normalizedDate);
      const slotCode = meeting.slot || '';
      const timeDisplay = getTimeFromSlotString(slotCode);
      const dateKey = normalizedDate.toISOString().split('T')[0];
      meetingTimes.set(dateKey, timeDisplay);
    });

    // Group by month
    const meetingsByMonth = new Map<string, Date[]>();
    meetingDates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!meetingsByMonth.has(monthKey)) {
        meetingsByMonth.set(monthKey, []);
      }
      meetingsByMonth.get(monthKey)!.push(date);
    });

    const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const dates = meetingsByMonth.get(currentMonthKey) || [];
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    
    // Get calendar days for current month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const calendarDays: (Date | null)[] = [];
    
    let firstDayOfWeek = firstDay.getDay();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      calendarDays.push(new Date(year, month - 1, i));
    }

    // Navigation handlers
    const handlePrevMonth = () => {
      onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const borderColor = theme === "blue" ? "border-blue-200" : "border-green-200";
    const bgColor = theme === "blue" ? "bg-blue-500" : "bg-green-500";
    const hoverColor = theme === "blue" ? "hover:bg-blue-50" : "hover:bg-green-50";
    const todayBgColor = theme === "blue" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";

    return (
      <div className={`mt-3 bg-white rounded-lg border ${borderColor}`}>
        {/* Navigation */}
        <div className={`flex items-center justify-between px-3 py-2.5 border-b ${borderColor}`}>
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 ${hoverColor} transition-colors`}
            aria-label="Previous month"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h5 className="text-sm font-bold text-gray-900">
            {monthNames[month - 1]} {year}
          </h5>
          <button
            type="button"
            onClick={handleNextMonth}
            className={`h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 ${hoverColor} transition-colors`}
            aria-label="Next month"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 h-7 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={idx} className="h-7"></div>;
              }
              
              const dayKey = day.toISOString().split('T')[0];
              const hasMeeting = dates.some((d: Date) => d.toISOString().split('T')[0] === dayKey);
              const isToday = day.toDateString() === new Date().toDateString();
              const time = meetingTimes.get(dayKey);
              
              return (
                <div
                  key={idx}
                  className={`h-7 flex items-center justify-center text-xs rounded ${
                    hasMeeting
                      ? `${bgColor} text-white font-semibold`
                      : isToday
                      ? `${todayBgColor} font-medium`
                      : 'text-gray-700'
                  }`}
                  title={hasMeeting && time ? `Class at ${time}` : undefined}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className={`mt-3 pt-3 border-t ${borderColor} flex items-center gap-4 text-xs text-gray-600`}>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 ${bgColor} rounded`}></div>
              <span>Class session</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 ${todayBgColor} rounded`}></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get class details by ID
  const getClassById = (classId: string) => {
    return allClasses.find((cls: any) => (cls.id || cls.Id) === classId);
  };

  // Check if request is a suspension
  const isSuspension = (): boolean => {
    if (!request) return false;
    const typeName = (request.requestTypeName || '').toLowerCase();
    return typeName.includes('suspension') || typeName.includes('suspend');
  };

  // Check if request is a dropout
  const isDropout = (): boolean => {
    if (!request) return false;
    const typeName = (request.requestTypeName || '').toLowerCase();
    return typeName.includes('dropout') || typeName.includes('drop out') || typeName.includes('dropping out');
  };

  // Calculate suspension duration
  const calculateSuspensionDuration = (): number | null => {
    if (!request?.suspensionStartDate || !request?.suspensionEndDate) return null;
    const start = new Date(request.suspensionStartDate);
    const end = new Date(request.suspensionEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Load exit survey data
  const handleViewExitSurvey = async () => {
    if (!request?.exitSurveyId) {
      toast.error('Exit survey not available');
      return;
    }

    setIsLoadingExitSurvey(true);
    try {
      // Fetch exit survey from MongoDB
      const { getExitSurveyById } = await import('@/api/exitSurvey.api');
      const surveyResponse = await getExitSurveyById(request.exitSurveyId);
      
      // Map MongoDB response to ExitSurveyData format
      const surveyData: ExitSurveyData = {
        studentID: surveyResponse.studentId,
        reasonCategory: surveyResponse.reasonCategory as any,
        reasonDetail: surveyResponse.reasonDetail,
        feedback: surveyResponse.feedback,
        futureIntentions: surveyResponse.futureIntentions,
        comments: surveyResponse.comments,
        acknowledgesPermanent: surveyResponse.acknowledgesPermanent,
        completedAt: surveyResponse.completedAt,
      };
      
      setExitSurveyData(surveyData);
      setShowExitSurvey(true);
    } catch (error: any) {
      console.error('Error loading exit survey:', error);
      toast.error('Failed to load exit survey');
    } finally {
      setIsLoadingExitSurvey(false);
    }
  };

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating}/5
        </span>
      </div>
    );
  };

  // Get reason category label
  const getReasonCategoryLabel = (category?: string): string => {
    if (!category) return 'N/A';
    // Try dropout categories first
    if (category in DropoutReasonCategoryLabels) {
      return DropoutReasonCategoryLabels[category as keyof typeof DropoutReasonCategoryLabels];
    }
    // Try suspension categories
    if (category in SuspensionReasonCategoryLabels) {
      return SuspensionReasonCategoryLabels[category as keyof typeof SuspensionReasonCategoryLabels];
    }
    // Try general academic request categories
    if (category in AcademicRequestReasonCategoryLabels) {
      return AcademicRequestReasonCategoryLabels[category as keyof typeof AcademicRequestReasonCategoryLabels];
    }
    return category;
  };

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
    
    if (statusLower === 'needinfo' || statusLower === 'need info') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <AlertCircle size={14} /> {status || 'Need Info'}
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
    if (!request?.attachmentUrl) {
      toast.error('No attachment available to download');
      return;
    }

    try {
      toast.info('Preparing download...');
      
      // Get the presigned download URL from the backend
      const response = await getAttachmentDownloadUrl(request.attachmentUrl);
      const downloadUrl = response.data.downloadUrl;

      // Open the presigned URL in a new tab
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } catch (error: any) {
      console.error("Download attachment error:", error);
      toast.error(
        `Failed to download attachment: ${
          error.response?.data?.error || error.message || "Unknown error"
        }`
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setNewAttachmentFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!newAttachmentFile || !request) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploadingFile(true);
    try {
      // Step 1: Get presigned upload URL
      const uploadResponse = await getAttachmentUploadUrl({
        fileName: newAttachmentFile.name,
        contentType: newAttachmentFile.type || 'application/octet-stream',
      });

      const { uploadUrl, filePath } = uploadResponse.data;

      // Step 2: Upload file to S3
      await axios.put(uploadUrl, newAttachmentFile, {
        headers: {
          'Content-Type': newAttachmentFile.type || 'application/octet-stream',
        },
      });

      // Step 3: Store file path for confirmation
      setUploadedFilePath(filePath);
      toast.success('File uploaded successfully. Please confirm to update your request.');
    } catch (error: any) {
      console.error('Upload file error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!uploadedFilePath || !request) {
      toast.error('No file uploaded to confirm');
      return;
    }

    setIsUpdatingAttachment(true);
    try {
      // Update request with new attachment URL
      await updateRequestAttachment({
        requestID: request.id,
        attachmentUrl: uploadedFilePath,
        additionalNotes: additionalNotes || undefined,
      });

      toast.success('Attachment updated successfully. Request status changed to Pending for staff review.');
      setShowUpdateAttachment(false);
      setNewAttachmentFile(null);
      setUploadedFilePath(null);
      setAdditionalNotes('');
      
      // Refresh request details
      await fetchRequestDetails();
    } catch (error: any) {
      console.error('Update attachment error:', error);
      toast.error(error.response?.data?.message || 'Failed to update attachment');
    } finally {
      setIsUpdatingAttachment(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateAttachment(false);
    setNewAttachmentFile(null);
    setUploadedFilePath(null);
    setAdditionalNotes('');
  };

  const isNeedInfoStatus = () => {
    const statusLower = request?.statusName?.toLowerCase() || '';
    return statusLower === 'needinfo' || statusLower === 'need info';
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
                  {request.requestTypeName || 'N/A'}
                </div>
              </div>

              {/* Reason Category */}
              {request.reasonCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason Category
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {getReasonCategoryLabel(request.reasonCategory)}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Request
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-4 rounded-md leading-relaxed whitespace-pre-wrap">
                  {request.reason}
                </div>
              </div>

              {/* Suspension Details */}
              {isSuspension() && (request.suspensionStartDate || request.suspensionEndDate) && (
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 bg-orange-50/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <PauseCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      Suspension Period Details
                    </label>
                    <div className="space-y-4">
                      {/* Suspension Period */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {request.suspensionStartDate && (
                          <div className="bg-white rounded-md p-3 border border-orange-200">
                            <div className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Start Date
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.suspensionStartDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        {request.suspensionEndDate && (
                          <div className="bg-white rounded-md p-3 border border-orange-200">
                            <div className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              End Date
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.suspensionEndDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Duration */}
                      {calculateSuspensionDuration() !== null && (
                        <div className="bg-white rounded-md p-3 border border-orange-200">
                          <div className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Duration
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {calculateSuspensionDuration()} days
                          </div>
                        </div>
                      )}

                      {/* Expected Return Date */}
                      {request.expectedReturnDate && (
                        <div className="bg-green-50 rounded-md p-3 border border-green-200">
                          <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Expected Return Date
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(request.expectedReturnDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            You are expected to return on this date
                          </p>
                        </div>
                      )}

                      {/* Status-specific information */}
                      {request.statusName?.toLowerCase() === 'suspended' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-yellow-800">
                              <p className="font-semibold mb-1">Currently Suspended</p>
                              <p>Your suspension is currently active. You cannot join classes during this period, but you retain access to online materials.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.statusName?.toLowerCase() === 'awaitingreturn' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-800">
                              <p className="font-semibold mb-1">Awaiting Your Return</p>
                              <p>Your suspension period has ended. Please confirm your return with academic staff.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.statusName?.toLowerCase() === 'completed' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-green-800">
                              <p className="font-semibold mb-1">Suspension Completed</p>
                              <p>You have successfully returned from suspension. Welcome back!</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dropout Details */}
              {isDropout() && (
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 bg-red-50/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      Dropout Request Details
                    </label>
                    <div className="space-y-4">
                      {/* Effective Date */}
                      {request.effectiveDate && (
                        <div className="bg-white rounded-md p-3 border border-red-200">
                          <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Effective Date
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(request.effectiveDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            Your enrollment will be terminated on this date
                          </p>
                        </div>
                      )}

                      {/* Exit Survey Status */}
                      {request.completedExitSurvey !== undefined && (
                        <div className={`rounded-md p-3 border ${
                          request.completedExitSurvey 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                            request.completedExitSurvey ? 'text-green-700' : 'text-yellow-700'
                          }`}>
                            {request.completedExitSurvey ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            Exit Survey Status
                          </div>
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {request.completedExitSurvey ? 'Completed' : 'Not Completed'}
                          </div>
                          {request.completedExitSurvey && request.exitSurveyId && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleViewExitSurvey}
                              loading={isLoadingExitSurvey}
                              iconLeft={<ExternalLink className="w-4 h-4 mr-1" />}
                            >
                              View Exit Survey
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Status-specific information */}
                      {request.statusName?.toLowerCase() === 'droppedout' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-gray-800">
                              <p className="font-semibold mb-1">Dropout Completed</p>
                              <p>Your enrollment has been terminated. You are no longer an active student.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.statusName?.toLowerCase() === 'approved' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-red-800">
                              <p className="font-semibold mb-1">Dropout Approved</p>
                              <p>Your dropout request has been approved. Your enrollment will be terminated on the effective date.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* From/To Class with Schedule Details */}
              {(request.fromClassName || request.toClassName) && (
                <div className="space-y-4">
                  {request.fromClassID && (
                    <div className="border-l-4 border-blue-500 bg-blue-50/50 rounded-lg p-4">
                      <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        From Class
                      </label>
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-md">
                          {request.fromClassName || 'N/A'}
                        </div>
                        {fromClassDetail && (
                          <>
                            {fromClassDetail.teacherName && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Teacher:</span>
                                <span>{fromClassDetail.teacherName}</span>
                              </div>
                            )}
                            {fromClassDetail.room && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Room:</span>
                                <span>{fromClassDetail.room}</span>
                              </div>
                            )}
                            {(fromClassDetail.startDate || fromClassDetail.endDate) && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Duration:</span>
                                <span>
                                  {fromClassDetail.startDate && new Date(fromClassDetail.startDate).toLocaleDateString()} - {fromClassDetail.endDate && new Date(fromClassDetail.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {/* Schedule Calendar */}
                        {isLoadingClassData ? (
                          <div className="mt-3 text-xs text-gray-500 italic">Loading schedule...</div>
                        ) : fromClassMeetings.length > 0 ? (
                          <ScheduleCalendar
                            meetings={fromClassMeetings}
                            currentMonth={fromClassCurrentMonth}
                            onMonthChange={setFromClassCurrentMonth}
                            theme="blue"
                          />
                        ) : (
                          !isLoadingClassData && (
                            <div className="mt-3 text-xs text-gray-500 italic">No schedule information available</div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {request.toClassID && (
                    <div className="border-l-4 border-green-500 bg-green-50/50 rounded-lg p-4">
                      <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        To Class
                      </label>
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-900 bg-white px-3 py-2 rounded-md">
                          {request.toClassName || 'N/A'}
                        </div>
                        {toClassDetail && (
                          <>
                            {toClassDetail.teacherName && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Teacher:</span>
                                <span>{toClassDetail.teacherName}</span>
                              </div>
                            )}
                            {toClassDetail.room && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Room:</span>
                                <span>{toClassDetail.room}</span>
                              </div>
                            )}
                            {(toClassDetail.startDate || toClassDetail.endDate) && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Duration:</span>
                                <span>
                                  {toClassDetail.startDate && new Date(toClassDetail.startDate).toLocaleDateString()} - {toClassDetail.endDate && new Date(toClassDetail.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        {/* Schedule Calendar */}
                        {isLoadingClassData ? (
                          <div className="mt-3 text-xs text-gray-500 italic">Loading schedule...</div>
                        ) : toClassMeetings.length > 0 ? (
                          <ScheduleCalendar
                            meetings={toClassMeetings}
                            currentMonth={toClassCurrentMonth}
                            onMonthChange={setToClassCurrentMonth}
                            theme="green"
                          />
                        ) : (
                          !isLoadingClassData && (
                            <div className="mt-3 text-xs text-gray-500 italic">No schedule information available</div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Meeting Reschedule Details */}
              {request.classMeetingID && (
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 bg-purple-50/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      Meeting Reschedule Details
                    </label>
                    <div className="space-y-4">
                      {/* Original Meeting */}
                      <div className="bg-white rounded-md p-3 border border-purple-200">
                        <div className="text-xs font-semibold text-purple-700 mb-2">Original Meeting</div>
                        <div className="space-y-1.5 text-xs">
                          {request.fromMeetingDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-gray-700">Date:</span>
                              <span className="text-gray-900">
                                {new Date(request.fromMeetingDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {request.fromSlotName && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-gray-700">Time:</span>
                              <span className="text-gray-900">{request.fromSlotName}</span>
                            </div>
                          )}
                          {!request.fromMeetingDate && !request.fromSlotName && (
                            <div className="text-xs text-gray-500">Original meeting details not available</div>
                          )}
                        </div>
                      </div>

                      {/* Arrow indicating change */}
                      <div className="flex justify-center py-1">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>

                      {/* New Meeting Details */}
                      <div className="bg-white rounded-md p-3 border border-green-200">
                        <div className="text-xs font-semibold text-green-700 mb-2">New Meeting Details</div>
                        <div className="space-y-1.5 text-xs">
                          {request.toMeetingDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-gray-700">New Date:</span>
                              <span className="text-gray-900">
                                {new Date(request.toMeetingDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {request.toSlotName && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-gray-700">New Time:</span>
                              <span className="text-gray-900">{request.toSlotName}</span>
                            </div>
                          )}
                          {request.newRoomName && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-gray-700">New Room:</span>
                              <span className="text-gray-900">{request.newRoomName}</span>
                            </div>
                          )}
                          {!request.toMeetingDate && !request.toSlotName && !request.newRoomName && (
                            <div className="text-xs text-gray-500">New meeting details not specified</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Effective Date */}
              {request.effectiveDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {request.effectiveDate}
                  </div>
                </div>
              )}

              {/* Staff Response */}
              {request.staffResponse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Response
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2 leading-relaxed whitespace-pre-wrap">
                          {request.staffResponse}
                        </p>
                        <div className="text-xs text-gray-600">
                          {request.processedByName && (
                            <>
                              <span className="font-medium">{request.processedByName}</span>
                              {request.processedAt && (
                                <>
                                  {" • "}
                                  <span>{new Date(request.processedAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Student Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Student Information</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Name: </span>
                    <span className="text-sm text-gray-900">{request.studentName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email: </span>
                    <span className="text-sm text-blue-600">{request.studentEmail || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Processing Information */}
              {(request.processedAt || request.processedByName) && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Processing Details</span>
                  </div>
                  <div className="space-y-2">
                    {request.processedByName && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Processed by: </span>
                        <span className="text-sm text-gray-900">{request.processedByName}</span>
                      </div>
                    )}
                    {request.processedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Processed on: </span>
                        <span className="text-sm text-gray-900">
                          {new Date(request.processedAt).toLocaleDateString('en-US', {
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

              {/* Update Attachment Section for NeedInfo Status */}
              {isNeedInfoStatus() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        Additional Information Required
                      </h4>
                      <p className="text-sm text-blue-700 mb-3">
                        {request.staffResponse || "The staff has requested additional information. Please update your attachment."}
                      </p>
                      
                      {!showUpdateAttachment ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowUpdateAttachment(true)}
                          iconLeft={<Upload className="w-4 h-4 mr-2" />}
                        >
                          Update Attachment
                        </Button>
                      ) : !uploadedFilePath ? (
                        <div className="space-y-3 mt-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Upload New Attachment
                            </label>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              disabled={isUploadingFile}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100
                                disabled:opacity-50"
                            />
                            {newAttachmentFile && (
                              <p className="text-xs text-gray-500 mt-1">
                                Selected: {newAttachmentFile.name} ({(newAttachmentFile.size / 1024 / 1024).toFixed(2)} MB)
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Notes (Optional)
                            </label>
                            <textarea
                              value={additionalNotes}
                              onChange={(e) => setAdditionalNotes(e.target.value)}
                              disabled={isUploadingFile}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                              rows={3}
                              placeholder="Explain what you've updated or added..."
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleUploadFile}
                              disabled={!newAttachmentFile || isUploadingFile}
                              loading={isUploadingFile}
                            >
                              Upload File
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelUpdate}
                              disabled={isUploadingFile}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 mt-3">
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 mb-1">
                                  File Uploaded Successfully
                                </p>
                                <p className="text-xs text-green-700">
                                  {newAttachmentFile?.name}
                                </p>
                              </div>
                            </div>
                          </div>

                          {additionalNotes && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Notes:
                              </label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                                {additionalNotes}
                              </p>
                            </div>
                          )}

                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <p className="text-xs text-yellow-800">
                              <strong>Note:</strong> Click "Confirm Update" to finalize the change. This will change the request status back to "Pending" for staff review.
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleConfirmUpdate}
                              disabled={isUpdatingAttachment}
                              loading={isUpdatingAttachment}
                              iconLeft={<CheckCircle className="w-4 h-4 mr-2" />}
                            >
                              Confirm Update
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFilePath(null);
                                setNewAttachmentFile(null);
                              }}
                              disabled={isUpdatingAttachment}
                            >
                              Change File
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelUpdate}
                              disabled={isUpdatingAttachment}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
                        : isNeedInfoStatus()
                        ? "Staff requires additional information. Please update your attachment above."
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

      {/* Exit Survey Viewing Modal */}
      {showExitSurvey && exitSurveyData && (
        <Dialog open={showExitSurvey} onOpenChange={setShowExitSurvey}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <File className="w-5 h-5 text-blue-600" />
                </div>
                Exit Survey Response
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Reason Category</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {DropoutReasonCategoryLabels[exitSurveyData.reasonCategory as keyof typeof DropoutReasonCategoryLabels] || exitSurveyData.reasonCategory}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Reason Detail</div>
                    <div className="text-sm text-gray-900">{exitSurveyData.reasonDetail}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Completed At</div>
                    <div className="text-sm text-gray-900">
                      {new Date(exitSurveyData.completedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Feedback Ratings</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Teacher Quality</div>
                      {renderRatingStars(exitSurveyData.feedback.teacherQuality)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Class Pacing</div>
                      {renderRatingStars(exitSurveyData.feedback.classPacing)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Materials Quality</div>
                      {renderRatingStars(exitSurveyData.feedback.materials)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Staff Service</div>
                      {renderRatingStars(exitSurveyData.feedback.staffService)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Schedule Flexibility</div>
                      {renderRatingStars(exitSurveyData.feedback.schedule)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Facilities</div>
                      {renderRatingStars(exitSurveyData.feedback.facilities)}
                    </div>
                  </div>
                </div>

                {/* Comments & Future Intentions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Comments</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {exitSurveyData.comments || 'No comments provided'}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Would recommend to others?
                    </div>
                    <div className={`text-sm font-medium ${
                      exitSurveyData.futureIntentions.wouldRecommendToOthers ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {exitSurveyData.futureIntentions.wouldRecommendToOthers ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Would return in future?
                    </div>
                    <div className={`text-sm font-medium ${
                      exitSurveyData.futureIntentions.wouldReturnInFuture ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {exitSurveyData.futureIntentions.wouldReturnInFuture ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => setShowExitSurvey(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default AcademicRequestDetailPopup;

