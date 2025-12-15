import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, Upload, File, Calendar, Clock, MapPin, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/Toast";
import { submitAcademicRequest, getAttachmentUploadUrl } from "@/api/academicRequest.api";
import { validateSuspensionRequest } from "@/api/suspensionRequest.api";
import { validateDropoutRequest } from "@/api/dropoutRequest.api";
import { getAcademicRequestTypes, getTimeSlots } from "@/api/lookup.api";
import { getClassMeetingsByClassId, getTeacherSchedule } from "@/api/classMeetings.api";
import { getAllClasses } from "@/api/classes.api";
import { getCourses } from "@/api/course.api";
import { getStudentEnrollments } from "@/api/enrollment.api";
import { getUserInfo, getStudentId, getUserRole, getTeacherId } from "@/lib/utils";
import { uploadToPresignedUrl } from "@/api/file.api";
import type { SubmitAcademicRequest } from "@/types/academicRequest";
import type { MyClass } from "@/types/class";
import type { TeacherScheduleApiResponse } from "@/types/teacherSchedule";
import {
  SuspensionReasonCategories,
  SuspensionReasonCategoryLabels,
  type SuspensionValidationResult,
} from "@/types/suspensionRequest";
import {
  DropoutReasonCategories,
  DropoutReasonCategoryLabels,
  type DropoutValidationResult,
} from "@/types/dropoutRequest";
import {
  AcademicRequestReasonCategoryLabels,
} from "@/types/academicRequestReasonCategories";
import ExitSurveyModal from "./ExitSurveyModal";
import DropoutWarningModal from "./DropoutWarningModal";

interface AcademicChangeRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void; // Callback to refresh the reports list
  initialSessionData?: {
    classMeetingID?: string;
    classId?: string;
    date?: string;
    time?: string;
    roomNumber?: string;
    courseName?: string;
    className?: string;
  } | null;
  enrollmentID?: string; // For suspension/dropout requests - which enrollment to affect
  enrollmentInfo?: {
    courseName?: string;
    className?: string;
    courseCode?: string;
    enrollmentStatus?: string;
  }; // Display info about the enrollment being affected
}

const AcademicChangeRequestPopup: React.FC<AcademicChangeRequestPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSessionData,
  enrollmentID,
  enrollmentInfo,
}) => {
  const userInfo = getUserInfo();
  const userId = getStudentId();
  const userRole = getUserRole();

  const [formData, setFormData] = useState({
    requestTypeID: "", 
    reason: "",
    courseID: "",
    fromClassID: "",
    toClassID: "",
    // For class transfer - specific meeting details
    fromMeetingDate: "",
    fromSlotID: "",
    toMeetingDate: "",
    toSlotID: "",
    attachmentUrl: "",
    // For meeting reschedule (uses toMeetingDate and toSlotID)
    classID: "",
    classMeetingID: "",
    newRoomID: "",
    // For suspension requests
    suspensionStartDate: "",
    suspensionEndDate: "",
    reasonCategory: "",
  });

  // For dropout requests
  const [dropoutEffectiveDate, setDropoutEffectiveDate] = useState("");
  const [dropoutExitSurveyUrl, setDropoutExitSurveyUrl] = useState("");
  const [dropoutCompletedExitSurvey, setDropoutCompletedExitSurvey] = useState(false);
  const [showDropoutWarning, setShowDropoutWarning] = useState(false);
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const [dropoutValidationResult, setDropoutValidationResult] = useState<DropoutValidationResult | null>(null);
  const [isValidatingDropout, setIsValidatingDropout] = useState(false);
  const [showDropoutValidation, setShowDropoutValidation] = useState(false);

  // For enrollment selection (when enrollmentID not provided via prop)
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  const [requestTypes, setRequestTypes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<MyClass[]>([]);
  const [timeSlots, setTimeSlots] = useState<Map<string, string>>(new Map());
  
  // Calendar month navigation state
  const [fromClassCurrentMonth, setFromClassCurrentMonth] = useState<Date>(new Date());
  const [toClassCurrentMonth, setToClassCurrentMonth] = useState<Date>(new Date());
  const [timeSlotLookups, setTimeSlotLookups] = useState<any[]>([]);
  const [classMeetings, setClassMeetings] = useState<any[]>([]);
  const [fromClassMeetings, setFromClassMeetings] = useState<any[]>([]);
  const [toClassMeetings, setToClassMeetings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [isLoadingFromMeetings, setIsLoadingFromMeetings] = useState(false);
  const [isLoadingToMeetings, setIsLoadingToMeetings] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suspensionValidationResult, setSuspensionValidationResult] = useState<SuspensionValidationResult | null>(null);
  const [isValidatingSuspension, setIsValidatingSuspension] = useState(false);
  const [showSuspensionValidation, setShowSuspensionValidation] = useState(false);
  const [teacherSchedule, setTeacherSchedule] = useState<TeacherScheduleApiResponse[]>([]);

  // Get filtered classes based on selected course
  const filteredClasses = formData.courseID 
    ? allClasses.filter((classItem: any) => {
        const courseId = (classItem as any).courseId;
        return courseId === formData.courseID;
      })
    : [];

  // Get selected class details for schedule display
  const getSelectedClass = (classId: string) => {
    return allClasses.find(cls => cls.id === classId);
  };

  // Helper function to get time from slot code
  const getTimeFromSlot = (slotCode: string): string => {
    if (!slotCode) return slotCode;
    const time = timeSlots.get(slotCode);
    if (time) {
      // If time contains a time format (HH:MM), use it
      // Otherwise, return the slot code as fallback
      return time;
    }
    // Fallback to slot code if no mapping found
    return slotCode;
  };

  // Helper to get slot code from lookup ID
  const getSlotCodeFromLookupId = (slotId: string): string | null => {
    if (!slotId) return null;
    const slot = timeSlotLookups.find((s: any) => {
      const id = s.lookUpId || s.LookUpId || s.id;
      return id === slotId;
    });
    if (!slot) return null;
    return (slot.code || slot.Code || "") as string;
  };

  // Normalize date string (compare by date only)
  const normalizeDate = (value: string | Date): string => {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const fromClass = formData.fromClassID ? getSelectedClass(formData.fromClassID) : null;
  const toClass = formData.toClassID ? getSelectedClass(formData.toClassID) : null;

  // Fetch student enrollments when popup opens or request type changes
  useEffect(() => {
    if (isOpen && userId && !enrollmentID && formData.requestTypeID) {
      // Only fetch if it's a request type that needs enrollment selection
      if (isSuspension() || isDropout() || isEnrollmentCancellation() || isResumeFromSuspension() || isClassTransfer()) {
        fetchStudentEnrollments();
      }
    }
    // Reset selected enrollment when request type changes
    if (formData.requestTypeID) {
      setSelectedEnrollmentId("");
    }
  }, [isOpen, userId, enrollmentID, formData.requestTypeID]);

  const fetchStudentEnrollments = async () => {
    try {
      setIsLoadingEnrollments(true);
      const enrollmentsData = await getStudentEnrollments(userId!);
      
      let filteredEnrollments = enrollmentsData;
      
      // For Resume from Suspension: Only show "Suspended" or "AwaitingReturn" status (check FIRST!)
      if (isResumeFromSuspension()) {
        filteredEnrollments = enrollmentsData.filter((e: any) => {
          const status = (e.enrollmentStatus || '').toLowerCase();
          return status === 'suspended' || status === 'awaiting return' || status === 'awaitingreturn';
        });
      }
      // For Suspension and Dropout: Only show "Enrolled" status
      else if (isSuspension() || isDropout()) {
        filteredEnrollments = enrollmentsData.filter((e: any) => {
          const status = (e.enrollmentStatus || '').toLowerCase();
          return status === 'enrolled';
        });
      }
      // For Enrollment Cancellation: Only show "Pending" status
      else if (isEnrollmentCancellation()) {
        filteredEnrollments = enrollmentsData.filter((e: any) => {
          const status = (e.enrollmentStatus || '').toLowerCase();
          return status === 'pending' || status === 'pending confirmation';
        });
      }
      // Default: Show all active enrollments (not dropped/suspended/completed)
      else {
        filteredEnrollments = enrollmentsData.filter((e: any) => 
          e.enrollmentStatus && 
          !['dropped', 'suspended', 'completed'].includes(e.enrollmentStatus.toLowerCase())
        );
      }
      
      setStudentEnrollments(filteredEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load your enrollments');
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  // Fetch request types, courses, classes, and time slots on mount
  useEffect(() => {
    if (isOpen) {
      fetchRequestTypes();
      fetchCourses();
      fetchClasses();
      fetchTimeSlots();

      // For teachers, pre-load their schedule for collision validation in meeting reschedule
      const role = (userRole || "").toLowerCase();
      if (role === "teacher") {
        const teacherId = getTeacherId();
        if (teacherId) {
          getTeacherSchedule(teacherId)
            .then((response) => {
              // API might return data directly or wrapped in .data
              const data = (response as any).data ?? response;
              setTeacherSchedule(data || []);
            })
            .catch((error) => {
              console.error("Error fetching teacher schedule for validation:", error);
              setTeacherSchedule([]);
            });
        }
      }
    } else {
      // Reset when popup closes
      setTeacherSchedule([]);
    }
  }, [isOpen, userRole]);

  // Auto-fill form when initialSessionData is provided
  useEffect(() => {
    if (isOpen && initialSessionData && requestTypes.length > 0 && allClasses.length > 0) {
      // Find "Meeting Reschedule" request type
      const meetingRescheduleType = requestTypes.find(type => {
        const typeName = (type.name || '').toLowerCase();
        const typeCode = (type.code || '').toLowerCase();
        return typeName.includes('meeting reschedule') || typeCode.includes('meetingreschedule');
      });

      if (meetingRescheduleType && initialSessionData.classMeetingID && initialSessionData.classId) {
        const typeId = meetingRescheduleType.lookUpId || (meetingRescheduleType as any).LookUpId || meetingRescheduleType.id;
        
        // Set request type to Meeting Reschedule and class ID first
        setFormData(prev => ({
          ...prev,
          requestTypeID: typeId,
          classID: initialSessionData.classId || "",
        }));

        // Fetch class meetings for the selected class, then set classMeetingID
        if (initialSessionData.classId) {
          const loadMeetingsAndSetData = async () => {
            await fetchClassMeetings(initialSessionData.classId!);
            // After meetings are loaded, set the classMeetingID
            // This will trigger the logic in handleInputChange to populate fromMeetingDate and fromSlotID
            setFormData(prev => ({
              ...prev,
              classMeetingID: initialSessionData.classMeetingID || "",
            }));
          };
          loadMeetingsAndSetData().catch(() => {
            // If fetch fails, still set the classMeetingID
            setFormData(prev => ({
              ...prev,
              classMeetingID: initialSessionData.classMeetingID || "",
            }));
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialSessionData, requestTypes, allClasses]);

  // Populate meeting details when classMeetings are loaded and we have initialSessionData
  useEffect(() => {
    if (isOpen && initialSessionData?.classMeetingID && classMeetings.length > 0 && formData.classMeetingID === initialSessionData.classMeetingID) {
      const selectedMeeting = classMeetings.find(meeting => meeting.id === initialSessionData.classMeetingID);
      
      if (selectedMeeting && !formData.fromMeetingDate) {
        // Try to get slot ID directly from meeting first, then from lookup
        let slotId = selectedMeeting.slotID || selectedMeeting.SlotID;
        
        if (!slotId) {
          // Fallback: Get slot ID from meeting slot code and lookup
          const slotCode = selectedMeeting.slot;
          
          // Try multiple lookup strategies
          let slotLookup = timeSlotLookups.find(s => (s.code || s.Code) === slotCode);
          
          if (!slotLookup) {
            // Try finding by name containing the time
            slotLookup = timeSlotLookups.find(s => {
              const name = s.name || s.Name || '';
              return name.includes(slotCode);
            });
          }
          
          if (!slotLookup) {
            // Try reverse lookup using the timeSlots map
            for (const [code, timeStr] of timeSlots.entries()) {
              if (timeStr === slotCode || timeStr.includes(slotCode)) {
                slotLookup = timeSlotLookups.find(s => (s.code || s.Code) === code);
                break;
              }
            }
          }
          
          slotId = slotLookup?.lookUpId || slotLookup?.LookUpId || slotLookup?.id;
        }
      
        setFormData(prev => ({
          ...prev,
          fromMeetingDate: selectedMeeting.date,
          fromSlotID: slotId || "",
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialSessionData, classMeetings, timeSlotLookups, timeSlots]);

  const fetchRequestTypes = async () => {
    setIsLoading(true);
    try {
      // Fetch academic request types
      const requestTypesResponse = await getAcademicRequestTypes();
      const requestTypesList = requestTypesResponse.data as any[];
      
      // Filter request types based on user role
      const userRole = getUserRole();
      const isTeacher = userRole?.toLowerCase() === 'teacher' || userRole?.toLowerCase() === 'staff';
      
      const filteredTypes = requestTypesList.filter(type => {
        const typeCode = (type.code || '').toLowerCase();
        
        // Hide refund type for both students and teachers (handled elsewhere)
        if (typeCode === 'refund') {
          return false;
        }
        
        // Request types only for teachers
        if (typeCode === 'reschedule') {
          return isTeacher;
        }
        
        // Request types only for students
        const studentOnlyTypes = ['transfer', 'suspension', 'cancel', 'dropout', 'resume'];
        if (studentOnlyTypes.includes(typeCode)) {
          return !isTeacher;
        }
        
        // "Other" and any remaining types are visible to both roles
        return true;
      });
      
      setRequestTypes(filteredTypes);
    } catch (error: any) {
      console.error('Error fetching request types:', error);
      toast.error(error.response?.data?.error || 'Failed to load request types');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await getCourses();
      setCourses(response.data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchTimeSlots = async () => {
    setIsLoadingTimeSlots(true);
    try {
      const response = await getTimeSlots();
      const slots = response.data || [];
      // Store the full lookup objects for ID access
      setTimeSlotLookups(slots);
      // Create a map from slot code to time (extract time from name field)
      const slotMap = new Map<string, string>();
      slots.forEach((slot: any) => {
        const code = slot.code || slot.Code || '';
        const name = slot.name || slot.Name || '';
        if (code) {
          // Extract time from name (format: "09:00" or "09:00 - 10:30")
          const timeMatch = name.match(/(\d{2}:\d{2})/);
          if (timeMatch) {
            // If there's a second time, show range; otherwise just the start time
            const times = name.match(/(\d{2}:\d{2})/g);
            if (times && times.length > 1) {
              slotMap.set(code, `${times[0]} - ${times[1]}`);
            } else {
              slotMap.set(code, timeMatch[1]);
            }
          } else {
            // Fallback to name if no time pattern found
            slotMap.set(code, name || code);
          }
        }
      });
      setTimeSlots(slotMap);
    } catch (error: any) {
      console.error('Error fetching time slots:', error);
      // Don't show error toast as this is not critical
      setTimeSlots(new Map());
      setTimeSlotLookups([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const fetchClassMeetings = async (classId: string) => {
    setIsLoadingMeetings(true);
    try {
      const meetings = await getClassMeetingsByClassId(classId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sort all non-deleted meetings by date (and slot if available) 
      // and assign a stable sessionNumber based on this chronological order
      const sortedMeetingsWithSession = meetings
        .filter((m: any) => !m.isDeleted)
        .sort((a: any, b: any) => {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          const slotA = (a.slot || '').toString();
          const slotB = (b.slot || '').toString();
          return slotA.localeCompare(slotB);
        })
        .map((m: any, idx: number) => ({
          ...m,
          sessionNumber: idx + 1,
        }));

      // Only show future meetings in the dropdown, but keep their original sessionNumber
      const futureMeetings = sortedMeetingsWithSession.filter(
        (m: any) => new Date(m.date) >= today
      );

      setClassMeetings(futureMeetings);
    } catch (error: any) {
      console.error('Error fetching class meetings:', error);
      toast.error('Failed to load class meetings');
      setClassMeetings([]);
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  const fetchClassMeetingsForClass = async (classId: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setIsLoadingFromMeetings(true);
    } else {
      setIsLoadingToMeetings(true);
    }
    try {
      const meetings = await getClassMeetingsByClassId(classId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Sort all non-deleted meetings chronologically and assign sessionNumber
      const sortedMeetingsWithSession = meetings
        .filter((m: any) => !m.isDeleted)
        .sort((a: any, b: any) => {
          const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          const slotA = (a.slot || '').toString();
          const slotB = (b.slot || '').toString();
          return slotA.localeCompare(slotB);
        })
        .map((m: any, idx: number) => ({
          ...m,
          sessionNumber: idx + 1,
        }));

      // Only keep future meetings for selection, but preserve sessionNumber
      const futureMeetings = sortedMeetingsWithSession.filter(
        (m: any) => new Date(m.date) >= today
      );

      if (type === 'from') {
        setFromClassMeetings(futureMeetings);
      } else {
        setToClassMeetings(futureMeetings);
      }
    } catch (error: any) {
      console.error(`Error fetching ${type} class meetings:`, error);
      if (type === 'from') {
        setFromClassMeetings([]);
      } else {
        setToClassMeetings([]);
      }
    } finally {
      if (type === 'from') {
        setIsLoadingFromMeetings(false);
      } else {
        setIsLoadingToMeetings(false);
      }
    }
  };

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      // TODO: Add API endpoint for fetching rooms
      // For now, we'll use a placeholder
      // const response = await getRooms();
      // setRooms(response.data || []);
      setRooms([]);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const response = await getAllClasses();
      // Map the response to match MyClass interface
      const classesData = response.data.map((classItem: any) => ({
        id: classItem.id || classItem.Id,
        classId: classItem.id || classItem.Id, // Keep for backward compatibility
        className: classItem.name || classItem.Name,
        classCode: classItem.classCode || classItem.ClassCode || classItem.code,
        courseName: classItem.courseName || classItem.CourseName,
        courseId: classItem.courseId || classItem.CourseId,
        schedule: classItem.schedule || classItem.Schedule || [],
        startDate: classItem.startDate || classItem.StartDate || '',
        endDate: classItem.endDate || classItem.EndDate || '',
        teacher: classItem.teacher || classItem.Teacher || '',
        room: classItem.room || classItem.Room || '',
        // Add required fields with defaults to match MyClass interface
        classNum: 0,
        classStatus: classItem.status || 'active',
        capacity: classItem.maxStudents || 0,
        enrolledCount: classItem.currentStudents || 0,
        isActive: true,
        status: 'active' as const,
      }));
      setAllClasses(classesData);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes. Please try again.');
      setAllClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // If request type changes, clear type-specific fields
    if (name === 'requestTypeID') {
      const newSelectedType = requestTypes.find(type => {
        const typeId = type.lookUpId || (type as any).LookUpId || type.id;
        return typeId === value;
      });
      
      const isNewTypeClassTransfer = newSelectedType && (
        (newSelectedType.name || '').toLowerCase().includes('class transfer') ||
        (newSelectedType.code || '').toLowerCase().includes('classtransfer') 
      );

      const isNewTypeMeetingReschedule = newSelectedType && (
        (newSelectedType.name || '').toLowerCase().includes('meeting reschedule') ||
        (newSelectedType.code || '').toLowerCase().includes('meetingreschedule') 
      );

      if (!isNewTypeClassTransfer && !isNewTypeMeetingReschedule) {
        // Clear all type-specific fields if switching to a different type
        setFormData(prev => ({
          ...prev,
          [name]: value,
          courseID: "",
          fromClassID: "",
          toClassID: "",
          fromMeetingDate: "",
          fromSlotID: "",
          toMeetingDate: "",
          toSlotID: "",
          classID: "",
          classMeetingID: "",
          newRoomID: "",
        }));
        setFromClassMeetings([]);
        setToClassMeetings([]);
      } else if (isNewTypeClassTransfer) {
        // Clear meeting reschedule fields
        setFormData(prev => ({
          ...prev,
          [name]: value,
          classID: "",
          classMeetingID: "",
          newRoomID: "",
        }));
      } else if (isNewTypeMeetingReschedule) {
        // Clear class transfer fields
        setFormData(prev => ({
          ...prev,
          [name]: value,
          courseID: "",
          fromClassID: "",
          toClassID: "",
          fromMeetingDate: "",
          fromSlotID: "",
          toMeetingDate: "",
          toSlotID: "",
        }));
        setFromClassMeetings([]);
        setToClassMeetings([]);
      } else {
    setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'courseID') {
      // When course changes, auto-populate fromClassID if student is enrolled in this course
      let autoFromClassID = "";
      
      if (isClassTransfer() && value && studentEnrollments.length > 0) {
        // Find the enrollment for this course with "Enrolled" status
        const enrollment = studentEnrollments.find((e: any) => {
          const courseId = e.courseId || e.CourseId;
          const status = (e.enrollmentStatus || '').toLowerCase();
          return courseId === value && status === 'enrolled' && e.classId;
        });
        
        if (enrollment && enrollment.classId) {
          autoFromClassID = enrollment.classId;
          // Fetch class meetings for the auto-populated from class
          fetchClassMeetingsForClass(autoFromClassID, 'from');
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        fromClassID: autoFromClassID,
        toClassID: "",
      }));
    } else if (name === 'fromClassID') {
      // When from class changes, clear related fields
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === 'toClassID') {
      // When to class changes, clear related fields
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name === 'classID' && isMeetingReschedule()) {
      // When class changes for meeting reschedule, fetch meetings and clear meeting selection
      setFormData(prev => ({
        ...prev,
        [name]: value,
        classMeetingID: "",
        newRoomID: "",
        fromMeetingDate: "",
        fromSlotID: "",
      }));
      if (value) {
        fetchClassMeetings(value);
      } else {
        setClassMeetings([]);
      }
    } else if (name === 'classMeetingID' && isMeetingReschedule()) {
      // When a meeting is selected for reschedule, populate the original meeting details
      const selectedMeeting = classMeetings.find(meeting => meeting.id === value);
      if (selectedMeeting) {
        // Try to get slot ID directly from meeting first, then from lookup
        let slotId = selectedMeeting.slotID || selectedMeeting.SlotID;
        
        if (!slotId) {
          // Fallback: Get slot ID from meeting slot code and lookup
          const slotCode = selectedMeeting.slot;
          // Try multiple lookup strategies
          let slotLookup = timeSlotLookups.find(s => (s.code || s.Code) === slotCode);
          
          if (!slotLookup) {
            // Try finding by name containing the time
            slotLookup = timeSlotLookups.find(s => {
              const name = s.name || s.Name || '';
              return name.includes(slotCode);
            });
          }
          
          if (!slotLookup) {
            // Try reverse lookup using the timeSlots map
            for (const [code, timeStr] of timeSlots.entries()) {
              if (timeStr === slotCode || timeStr.includes(slotCode)) {
                slotLookup = timeSlotLookups.find(s => (s.code || s.Code) === code);
                break;
              }
            }
          }
          
          slotId = slotLookup?.lookUpId || slotLookup?.LookUpId || slotLookup?.id;
        }
      
        setFormData(prev => ({
          ...prev,
          [name]: value,
          fromMeetingDate: selectedMeeting.date,
          fromSlotID: slotId || "",
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          fromMeetingDate: "",
          fromSlotID: "",
        }));
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

  // Check if the selected request type is "meeting reschedule"
  const isMeetingReschedule = (): boolean => {
    if (!formData.requestTypeID) return false;
    
    const selectedType = requestTypes.find(type => {
      const typeId = type.lookUpId || (type as any).LookUpId || type.id;
      return typeId === formData.requestTypeID;
    });

    if (!selectedType) return false;

    const typeCode = (selectedType.code || '').toLowerCase();
    
    return typeCode === 'reschedule';
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

  const isSuspension = (): boolean => {
    if (!formData.requestTypeID) return false;
    
    const selectedType = requestTypes.find(type => {
      const typeId = type.lookUpId || (type as any).LookUpId || type.id;
      return typeId === formData.requestTypeID;
    });

    if (!selectedType) return false;

    const typeCode = (selectedType.code || '').toLowerCase();
    
    return typeCode === 'suspension';
  };

  const isEnrollmentCancellation = (): boolean => {
    if (!formData.requestTypeID) return false;
    
    const selectedType = requestTypes.find(type => {
      const typeId = type.lookUpId || (type as any).LookUpId || type.id;
      return typeId === formData.requestTypeID;
    });

    if (!selectedType) return false;
    
    const typeCode = (selectedType.code || '').toLowerCase();
    return typeCode === 'cancel';
  };

  const isResumeFromSuspension = (): boolean => {
    if (!formData.requestTypeID) return false;
    
    const selectedType = requestTypes.find(type => {
      const typeId = type.lookUpId || (type as any).LookUpId || type.id;
      return typeId === formData.requestTypeID;
    });

    if (!selectedType) return false;
    
    const typeCode = (selectedType.code || '').toLowerCase();
    return typeCode === 'resume';
  };

  const isDropout = (): boolean => {
    if (!formData.requestTypeID) return false;
    
    const selectedType = requestTypes.find(type => {
      const typeId = type.lookUpId || (type as any).LookUpId || type.id;
      return typeId === formData.requestTypeID;
    });

    if (!selectedType) return false;

    const typeCode = (selectedType.code || '').toLowerCase();

    return typeCode === 'dropout';
  };

  // Check if all required fields are filled to enable/disable submit button
  const isFormComplete = (): boolean => {
    // Base requirements
    if (!formData.requestTypeID || !formData.reason?.trim()) {
      return false;
    }

    // Meeting Reschedule requirements
    if (isMeetingReschedule()) {
      if (!formData.classID?.trim() || !formData.classMeetingID?.trim() || 
          !formData.toMeetingDate?.trim() || !formData.toSlotID?.trim()) {
        return false;
      }
    }

    // Class Transfer requirements
    if (isClassTransfer()) {
      if (!formData.courseID?.trim() || !formData.fromClassID?.trim() || 
          !formData.toClassID?.trim()) {
        return false;
      }
    }

    // Suspension requirements
    if (isSuspension()) {
      if (!formData.suspensionStartDate?.trim() || !formData.suspensionEndDate?.trim()) {
        return false;
      }
      if (!enrollmentID && !selectedEnrollmentId) {
        return false;
      }
      if (!suspensionValidationResult || !suspensionValidationResult.isValid) {
        return false;
      }
      // Check document requirement
      if (suspensionValidationResult.requiresDocument && !selectedFile && !formData.attachmentUrl) {
        return false;
      }
    }

    // Dropout requirements
    if (isDropout()) {
      if (!dropoutCompletedExitSurvey || !dropoutExitSurveyUrl) {
        return false;
      }
      if (!enrollmentID && !selectedEnrollmentId) {
        return false;
      }
      if (!dropoutEffectiveDate?.trim()) {
        return false;
      }
      if (!dropoutValidationResult || !dropoutValidationResult.isValid) {
        return false;
      }
    }

    // Enrollment Cancellation requirements
    if (isEnrollmentCancellation()) {
      if (!enrollmentID && !selectedEnrollmentId) {
        return false;
      }
    }

    // Resume from Suspension requirements
    if (isResumeFromSuspension()) {
      if (!enrollmentID && !selectedEnrollmentId) {
        return false;
      }
    }

    return true;
  };

  const handleValidateSuspension = async () => {
    if (!formData.suspensionStartDate || !formData.suspensionEndDate || !formData.reasonCategory || !formData.reason) {
      toast.error("Please fill in all suspension fields before validating");
      return;
    }

    setIsValidatingSuspension(true);
    setShowSuspensionValidation(false);

    try {
      const validationData = {
        studentID: userId!,
        requestTypeID: formData.requestTypeID,
        startDate: formData.suspensionStartDate,
        endDate: formData.suspensionEndDate,
        reasonCategory: formData.reasonCategory,
        reasonDetail: formData.reason,
      };

      const response = await validateSuspensionRequest(validationData);
      setSuspensionValidationResult(response.data);
      setShowSuspensionValidation(true);

      if (response.data.isValid) {
        toast.success("✅ Request validation passed!");
      } else {
        toast.error("❌ Validation failed. Please review the errors.");
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error.response?.data?.message || "Validation failed");
    } finally {
      setIsValidatingSuspension(false);
    }
  };

  const calculateSuspensionDuration = () => {
    if (!formData.suspensionStartDate || !formData.suspensionEndDate) return null;
    const start = new Date(formData.suspensionStartDate);
    const end = new Date(formData.suspensionEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDropoutWarningContinue = () => {
    setShowDropoutWarning(false);
    setShowExitSurvey(true);
  };

  const handleExitSurveyComplete = (exitSurveyId: string, surveyData: any) => {
    setDropoutExitSurveyUrl(exitSurveyId); // Now storing MongoDB ID instead of URL
    setDropoutCompletedExitSurvey(true);
    setShowExitSurvey(false);
    
    // Pre-fill reason fields from exit survey to avoid duplication
    setFormData({
      ...formData,
      reasonCategory: surveyData.reasonCategory,
      reason: surveyData.reasonDetail,
    });
    
    toast.success("Exit survey completed. Reason details have been filled automatically.");
  };

  const handleValidateDropout = async () => {
    if (!dropoutEffectiveDate || !formData.reasonCategory || !formData.reason) {
      toast.error("Please fill in all dropout fields before validating");
      return;
    }

    if (!dropoutCompletedExitSurvey || !dropoutExitSurveyUrl) {
      toast.error("Please complete the exit survey before validating");
      return;
    }

    setIsValidatingDropout(true);
    setShowDropoutValidation(false);

    try {
      const validationData = {
        studentID: userId!,
        requestTypeID: formData.requestTypeID,
        effectiveDate: dropoutEffectiveDate,
        reasonCategory: formData.reasonCategory,
        reasonDetail: formData.reason,
        completedExitSurvey: dropoutCompletedExitSurvey,
        exitSurveyId: dropoutExitSurveyUrl, // Now contains MongoDB ID
      };

      const response = await validateDropoutRequest(validationData);
      setDropoutValidationResult(response.data);
      setShowDropoutValidation(true);

      if (response.data.isValid) {
        toast.success("✅ Dropout request validation passed!");
      } else {
        toast.error("❌ Validation failed. Please review the errors.");
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(error.response?.data?.message || "Validation failed");
    } finally {
      setIsValidatingDropout(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.requestTypeID) {
      toast.error('Please select a request type');
      return false;
    }

    // Skip reason validation for dropout (collected in exit survey)
    if (!isDropout()) {
    if (!formData.reasonCategory?.trim()) {
      toast.error('Please select a reason category');
      return false;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for your request');
      return false;
      }
    }

    // Validate meeting reschedule specific fields
    if (isMeetingReschedule()) {
      if (!formData.classID?.trim()) {
        toast.error('Class is required for meeting reschedule requests');
        return false;
      }

      if (!formData.classMeetingID?.trim()) {
        toast.error('Class Meeting is required for meeting reschedule requests');
        return false;
      }

      if (!formData.toMeetingDate?.trim()) {
        toast.error('New Meeting Date is required for meeting reschedule requests');
        return false;
      }

      if (!formData.toSlotID?.trim()) {
        toast.error('New Time Slot is required for meeting reschedule requests');
        return false;
      }

      // Validate that new date is not in the past
      const newDate = new Date(formData.toMeetingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        toast.error('New meeting date cannot be in the past');
        return false;
      }

      // Validate that the new date/slot does not collide with another session
      const newDateKey = normalizeDate(formData.toMeetingDate);
      const newSlotCode = getSlotCodeFromLookupId(formData.toSlotID);

      if (newDateKey && newSlotCode) {
        // 1) Check within this class's meetings (exclude the meeting being rescheduled)
        const hasClassConflict = classMeetings.some((meeting) => {
          if (meeting.id === formData.classMeetingID) return false;

          const meetingDate = normalizeDate(meeting.date || (meeting as any).Date);
          const meetingSlotCode = (meeting.slot || (meeting as any).Slot || "").toString();

          return meetingDate === newDateKey && meetingSlotCode === newSlotCode;
        });

        if (hasClassConflict) {
          toast.error('This class already has another session at the selected date and time slot.');
          return false;
        }

        // 2) If we have the teacher's overall schedule, also check for clashes with other classes
        if (teacherSchedule.length > 0 && formData.classID) {
          const hasTeacherConflict = teacherSchedule.some((item) => {
            const itemDateKey = (item.date || "").split("T")[0];
            const itemSlotCode = (item.slot || "").toString();

            // Ignore sessions from the same class – we're only blocking collisions with *other* classes
            if (item.classId === formData.classID) return false;

            return itemDateKey === newDateKey && itemSlotCode === newSlotCode;
          });

          if (hasTeacherConflict) {
            toast.error('You already have another class scheduled at this date and time. Please choose a different slot.');
            return false;
          }
        }
      }
    }

    // Validate class transfer specific fields
    if (isClassTransfer()) {
      if (!formData.courseID?.trim()) {
        toast.error('Course is required for class transfer requests');
        return false;
      }

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

    // Validate suspension specific fields
    if (isSuspension()) {
      if (!formData.suspensionStartDate?.trim()) {
        toast.error('Start Date is required for suspension requests');
        return false;
      }

      if (!formData.suspensionEndDate?.trim()) {
        toast.error('End Date is required for suspension requests');
        return false;
      }

      // Check if enrollmentID is provided (either via prop or selected)
      if (!enrollmentID && !selectedEnrollmentId) {
        toast.error('Please select a course/enrollment to suspend.');
        return false;
      }

      // Check if validation has been performed
      if (!suspensionValidationResult || !suspensionValidationResult.isValid) {
        toast.error('Please validate your suspension request first');
        return false;
      }

      // Check document requirement
      if (suspensionValidationResult.requiresDocument && !selectedFile && !formData.attachmentUrl) {
        toast.error('Supporting document is required for this suspension period');
        return false;
      }
    }

    // Validate dropout specific fields
    if (isDropout()) {
      // First check if exit survey is completed (most important step)
      if (!dropoutCompletedExitSurvey || !dropoutExitSurveyUrl) {
        toast.error('Please complete the exit survey first by clicking "Start Dropout Process"');
        return false;
      }

      // Check if enrollmentID is provided (either via prop or selected)
      if (!enrollmentID && !selectedEnrollmentId) {
        toast.error('Please select a course/enrollment to drop out from.');
        return false;
      }

      // Only validate effective date after survey is completed
      if (!dropoutEffectiveDate?.trim()) {
        toast.error('Effective Date is required for dropout requests');
        return false;
      }

      // Check if effective date is not in the past
      const effectiveDate = new Date(dropoutEffectiveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (effectiveDate < today) {
        toast.error('Effective date cannot be in the past');
        return false;
      }

      // Check if validation has been performed
      if (!dropoutValidationResult || !dropoutValidationResult.isValid) {
        toast.error('Please validate your dropout request first');
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
          toast.info('Uploading file...');
          
          // Get presigned upload URL from backend
          const uploadUrlResponse = await getAttachmentUploadUrl({
            fileName: selectedFile.name,
            contentType: selectedFile.type
          });
          
          // Upload file to presigned URL
          await uploadToPresignedUrl(uploadUrlResponse.data.uploadUrl, selectedFile, selectedFile.type);
          
          // Use the filePath returned from backend as the attachmentUrl
          attachmentUrl = uploadUrlResponse.data.filePath;
          
          toast.success('File uploaded successfully');
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
        reasonCategory: formData.reasonCategory || undefined,
        attachmentUrl: attachmentUrl || undefined,
        // Class transfer fields - only include if it's a class transfer request
        ...(isClassTransfer() && {
        fromClassID: formData.fromClassID || undefined,
        toClassID: formData.toClassID || undefined,
        }),
        // Meeting reschedule fields - only include if it's a meeting reschedule request
        // Uses fromMeetingDate/fromSlotID for original and toMeetingDate/toSlotID for new meeting details
        ...(isMeetingReschedule() && {
          classMeetingID: formData.classMeetingID || undefined,
          fromMeetingDate: formData.fromMeetingDate || undefined,
          fromSlotID: formData.fromSlotID || undefined,
          toMeetingDate: formData.toMeetingDate || undefined,
          toSlotID: formData.toSlotID || undefined,
          newRoomID: formData.newRoomID || undefined,
        }),
        // Suspension fields - only include if it's a suspension request
        ...(isSuspension() && {
          suspensionStartDate: formData.suspensionStartDate || undefined,
          suspensionEndDate: formData.suspensionEndDate || undefined,
          enrollmentID: enrollmentID || selectedEnrollmentId || undefined, // ✅ Use prop or selected
        }),
        // Dropout fields - only include if it's a dropout request
        ...(isDropout() && {
          effectiveDate: dropoutEffectiveDate || undefined,
          completedExitSurvey: dropoutCompletedExitSurvey,
          exitSurveyId: dropoutExitSurveyUrl || undefined, // Now contains MongoDB ID
          enrollmentID: enrollmentID || selectedEnrollmentId || undefined, // ✅ Use prop or selected
        }),
        // Enrollment cancellation fields - only include if it's a cancellation request
        ...(isEnrollmentCancellation() && {
          enrollmentID: enrollmentID || selectedEnrollmentId || undefined, // ✅ Use prop or selected
        }),
        // Resume from suspension fields - only include if it's a resume request
        ...(isResumeFromSuspension() && {
          enrollmentID: enrollmentID || selectedEnrollmentId || undefined, // ✅ Use prop or selected
          effectiveDate: formData.suspensionEndDate || undefined, // Optional: when they want to return
        }),
      };

      await submitAcademicRequest(requestData);

      toast.success('Academic request submitted successfully! It will be reviewed by staff within 3-5 business days.');
      
      // Reset form
      setFormData({
        requestTypeID: "",
        reason: "",
        courseID: "",
        fromClassID: "",
        toClassID: "",
        fromMeetingDate: "",
        fromSlotID: "",
        toMeetingDate: "",
        toSlotID: "",
        attachmentUrl: "",
        classID: "",
        classMeetingID: "",
        newRoomID: "",
        suspensionStartDate: "",
        suspensionEndDate: "",
        reasonCategory: "",
      });
      setSelectedFile(null);
      setClassMeetings([]);
      setFromClassMeetings([]);
      setToClassMeetings([]);
      setSuspensionValidationResult(null);
      setShowSuspensionValidation(false);
      setDropoutEffectiveDate("");
      setDropoutExitSurveyUrl("");
      setDropoutCompletedExitSurvey(false);
      setDropoutValidationResult(null);
      setShowDropoutValidation(false);
      setShowDropoutWarning(false);
      setShowExitSurvey(false);
      setSelectedEnrollmentId(""); // Reset selected enrollment
      setStudentEnrollments([]); // Clear enrollments list
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
        courseID: "",
        fromClassID: "",
        toClassID: "",
        fromMeetingDate: "",
        fromSlotID: "",
        toMeetingDate: "",
        toSlotID: "",
        attachmentUrl: "",
        classID: "",
        classMeetingID: "",
        newRoomID: "",
        suspensionStartDate: "",
        suspensionEndDate: "",
        reasonCategory: "",
      });
    setSelectedFile(null);
    setClassMeetings([]);
    setFromClassMeetings([]);
    setToClassMeetings([]);
    setSuspensionValidationResult(null);
    setShowSuspensionValidation(false);
    setDropoutEffectiveDate("");
    setDropoutExitSurveyUrl("");
    setDropoutCompletedExitSurvey(false);
    setDropoutValidationResult(null);
    setShowDropoutValidation(false);
    setShowDropoutWarning(false);
    setShowExitSurvey(false);
    setSelectedEnrollmentId(""); // Reset selected enrollment
    setStudentEnrollments([]); // Clear enrollments list
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && handleCancel()}>
      <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Submit Academic Request
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

          {/* Enrollment Selection Dropdown (For Suspension/Dropout/Cancellation/Resume when no enrollmentID provided) */}
          {(isSuspension() || isDropout() || isEnrollmentCancellation() || isResumeFromSuspension()) && !enrollmentID && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Course/Enrollment to {isSuspension() ? 'Suspend' : isDropout() ? 'Drop' : isResumeFromSuspension() ? 'Resume' : 'Cancel'} <span className="text-red-500">*</span>
              </label>
              {isLoadingEnrollments ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Loading your enrollments...
                </div>
              ) : (
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a course to {isSuspension() ? 'suspend' : isDropout() ? 'drop out from' : isResumeFromSuspension() ? 'resume' : 'cancel'}</option>
                  {studentEnrollments.map((enrollment: any) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {enrollment.courseName}
                      {enrollment.className ? ` - ${enrollment.className}` : ''}
                      {' '}({enrollment.enrollmentStatus || 'Status N/A'})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {isSuspension() && 'Only enrolled courses can be suspended'}
                {isDropout() && 'Only enrolled courses can be dropped'}
                {isEnrollmentCancellation() && 'Only pending enrollments can be cancelled'}
                {isResumeFromSuspension() && 'Only suspended or awaiting return enrollments can be resumed'}
              </p>
              
              {studentEnrollments.length === 0 && !isLoadingEnrollments && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-md mt-2">
                  <p className="text-xs text-red-800 font-medium mb-1">
                    {isSuspension() && '❌ No enrolled courses found'}
                    {isDropout() && '❌ No enrolled courses found'}
                    {isEnrollmentCancellation() && '❌ No pending enrollments found'}
                    {isResumeFromSuspension() && '❌ No suspended enrollments found'}
                  </p>
                  <p className="text-xs text-red-700">
                    {isSuspension() && 'You need an enrolled course to request suspension.'}
                    {isDropout() && 'You need an enrolled course to request dropout.'}
                    {isEnrollmentCancellation() && 'You need a pending enrollment to request cancellation.'}
                    {isResumeFromSuspension() && 'You need a suspended or awaiting return enrollment to resume. Please suspend a course first, or wait for your suspension period to end.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Enrollment Info Display (When enrollmentID or enrollmentInfo provided via prop) */}
          {(isSuspension() || isDropout() || isEnrollmentCancellation() || isResumeFromSuspension()) && (enrollmentInfo || enrollmentID || selectedEnrollmentId) && (
            <div className={`bg-gradient-to-r ${isResumeFromSuspension() ? 'from-green-50 to-emerald-50 border-green-200' : 'from-amber-50 to-orange-50 border-amber-200'} border p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                {isResumeFromSuspension() ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span className={`text-sm font-medium ${isResumeFromSuspension() ? 'text-green-900' : 'text-amber-900'}`}>
                  {isSuspension() ? 'Suspending Enrollment:' : isDropout() ? 'Dropping Out From:' : isResumeFromSuspension() ? 'Resuming Enrollment:' : 'Cancelling Enrollment:'}
                </span>
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-semibold ${isResumeFromSuspension() ? 'text-green-800' : 'text-amber-800'}`}>
                  {enrollmentInfo?.courseName || 
                   studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.courseName || 
                   'Course Name Not Available'}
                </p>
                {(enrollmentInfo?.courseCode || studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.courseCode) && (
                  <p className={`text-xs ${isResumeFromSuspension() ? 'text-green-700' : 'text-amber-700'}`}>
                    Course Code: {enrollmentInfo?.courseCode || studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.courseCode}
                  </p>
                )}
                {(enrollmentInfo?.className || studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.className) && (
                  <p className={`text-xs ${isResumeFromSuspension() ? 'text-green-700' : 'text-amber-700'}`}>
                    Class: {enrollmentInfo?.className || studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.className}
                  </p>
                )}
                {(enrollmentInfo?.enrollmentStatus || studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.enrollmentStatus) && (
                  <p className={`text-xs ${isResumeFromSuspension() ? 'text-green-700' : 'text-amber-700'}`}>
                    Current Status: {enrollmentInfo?.enrollmentStatus || studentEnrollments.find((e: any) => e.id === selectedEnrollmentId)?.enrollmentStatus}
                  </p>
                )}
              </div>
              <p className={`text-xs mt-2 italic ${isResumeFromSuspension() ? 'text-green-600' : 'text-amber-600'}`}>
                {isSuspension() && 'This enrollment will be suspended and you will not be able to attend classes during the suspension period.'}
                {isDropout() && 'This enrollment will be permanently terminated. This action cannot be undone.'}
                {isEnrollmentCancellation() && 'This pending enrollment will be cancelled. You can re-enroll later if you change your mind.'}
                {isResumeFromSuspension() && 'This enrollment will be reactivated and you can resume attending classes. Your suspension will be lifted.'}
              </p>
            </div>
          )}

          {/* Reason Category - Hidden for dropout (collected in exit survey) */}
          {!isDropout() && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason Category <span className="text-red-500">*</span>
            </label>
            <select
              name="reasonCategory"
              value={formData.reasonCategory}
              onChange={(e) => {
                handleInputChange(e);
                if (isSuspension()) {
                  setShowSuspensionValidation(false);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>Select a reason category</option>
              {Object.entries(
                isSuspension() 
                  ? SuspensionReasonCategoryLabels 
                  : AcademicRequestReasonCategoryLabels
              ).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the primary reason for your request
            </p>
          </div>
          )}

          {/* Reason - Hidden for dropout (collected in exit survey) */}
          {!isDropout() && (
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
          )}

          {/* Suspension-specific fields */}
          {isSuspension() && (
            <>
              {/* Suspension Period */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-900">Suspension Period</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label htmlFor="suspensionStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="suspensionStartDate"
                        name="suspensionStartDate"
                        value={formData.suspensionStartDate}
                        onChange={(e) => {
                          handleInputChange(e);
                          setShowSuspensionValidation(false);
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 7 days from today</p>
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="suspensionEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        id="suspensionEndDate"
                        name="suspensionEndDate"
                        value={formData.suspensionEndDate}
                        onChange={(e) => {
                          handleInputChange(e);
                          setShowSuspensionValidation(false);
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min={formData.suspensionStartDate || undefined}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be after start date</p>
                  </div>
                </div>

                {/* Duration Display */}
                {calculateSuspensionDuration() !== null && (
                  <div className={`p-3 rounded-lg ${
                    calculateSuspensionDuration()! >= 7 && calculateSuspensionDuration()! <= 90 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      calculateSuspensionDuration()! >= 7 && calculateSuspensionDuration()! <= 90 
                        ? 'text-green-800' 
                        : 'text-red-800'
                    }`}>
                      Duration: {calculateSuspensionDuration()} days
                      {calculateSuspensionDuration()! < 7 && " (Minimum 7 days required)"}
                      {calculateSuspensionDuration()! > 90 && " (Maximum 90 days allowed)"}
                    </p>
                  </div>
                )}

                {/* Validation Button */}
                <div>
                  <Button
                    type="button"
                    onClick={handleValidateSuspension}
                    disabled={isValidatingSuspension || !formData.suspensionStartDate || !formData.suspensionEndDate || !formData.reasonCategory || !formData.reason}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidatingSuspension ? "Validating..." : "Validate Suspension Request"}
                  </Button>
                </div>

                {/* Validation Results */}
                {showSuspensionValidation && suspensionValidationResult && (
                  <div className="space-y-3">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg border ${
                      suspensionValidationResult.isValid
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        {suspensionValidationResult.isValid ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold mb-1 ${
                            suspensionValidationResult.isValid ? "text-green-800" : "text-red-800"
                          }`}>
                            {suspensionValidationResult.isValid ? "✅ Validation Passed" : "❌ Validation Failed"}
                          </h4>
                          <p className={`text-sm ${
                            suspensionValidationResult.isValid ? "text-green-700" : "text-red-700"
                          }`}>
                            {suspensionValidationResult.isValid
                              ? "Your request meets all requirements and can be submitted."
                              : "Please resolve the errors below before submitting."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Errors */}
                    {suspensionValidationResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-red-800 mb-2">Errors:</h5>
                        <ul className="space-y-1">
                          {suspensionValidationResult.errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {suspensionValidationResult.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-yellow-800 mb-2">Warnings:</h5>
                        <ul className="space-y-1">
                          {suspensionValidationResult.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Duration:</span>
                          <span className="text-blue-800 ml-2">{suspensionValidationResult.durationDays} days</span>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Suspensions this year:</span>
                          <span className="text-blue-800 ml-2">{suspensionValidationResult.suspensionCountThisYear}/2</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-blue-600 font-medium">Document required:</span>
                          <span className="text-blue-800 ml-2">
                            {suspensionValidationResult.requiresDocument ? "Yes" : "No (but recommended)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Notice for Suspension */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-800 mb-1">
                        Suspension Request Notice
                      </h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Submit at least 7 days before your intended start date</li>
                        <li>• Duration must be between 7-90 days</li>
                        <li>• Maximum 2 suspensions per year allowed</li>
                        <li>• You must have no unpaid tuition</li>
                        <li>• Document required for suspensions over 30 days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Dropout Request Fields */}
          {isDropout() && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900">Dropout Request</h3>
              </div>

              <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Important:</strong> Dropping out is permanent and cannot be reversed.
                  You must complete an exit survey and receive validation before submitting.
                </p>
              </div>

              {!dropoutCompletedExitSurvey && (
                <div className="bg-white border border-red-200 rounded-md p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Before submitting a dropout request, you must:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 mb-4">
                    <li>Read and acknowledge the important warnings</li>
                    <li>Complete the exit survey</li>
                    <li>Provide all required information</li>
                    <li>Validate your request</li>
                  </ol>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setShowDropoutWarning(true)}
                    disabled={isSubmitting}
                  >
                    Start Dropout Process
                  </Button>
                </div>
              )}

              {dropoutCompletedExitSurvey && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      ✓ Exit survey completed successfully
                    </span>
                  </div>

                  {/* Effective Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dropoutEffectiveDate}
                      onChange={(e) => setDropoutEffectiveDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The date when you want the dropout to take effect (must be today or later)
                    </p>
                  </div>

                  {/* Validation Button */}
                  <div>
                    <Button
                      type="button"
                      onClick={handleValidateDropout}
                      disabled={isValidatingDropout || isSubmitting || !dropoutEffectiveDate || !formData.reasonCategory || !formData.reason}
                      loading={isValidatingDropout}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {isValidatingDropout ? "Validating..." : "Validate Dropout Request"}
                    </Button>
                  </div>

                  {/* Validation Results */}
                  {showDropoutValidation && dropoutValidationResult && (
                    <div className={`border rounded-lg p-4 ${
                      dropoutValidationResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-3">
                        {dropoutValidationResult.isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            dropoutValidationResult.isValid ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {dropoutValidationResult.isValid 
                              ? '✅ Validation Passed' 
                              : '❌ Validation Failed'}
                          </h4>
                        </div>
                      </div>

                      {dropoutValidationResult.errors.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {dropoutValidationResult.errors.map((error, index) => (
                              <li key={index} className="text-sm text-red-600">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dropoutValidationResult.warnings.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-yellow-700 mb-2">Warnings:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {dropoutValidationResult.warnings.map((warning, index) => (
                              <li key={index} className="text-sm text-yellow-600">{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dropoutValidationResult.hasUnpaidInvoices && (
                        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                          <p className="text-xs text-yellow-800">
                            ⚠️ You have unpaid invoices. Financial clearance is required before dropout can be processed.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Course - Only shown for class transfer, required when shown */}
          {isClassTransfer() && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
            </label>
              <select
                name="courseID"
                value={formData.courseID}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting || isLoadingEnrollments}
              >
                <option value="" disabled>Select a course</option>
                {studentEnrollments
                  .filter((e: any) => {
                    const status = (e.enrollmentStatus || '').toLowerCase();
                    return status === 'enrolled';
                  })
                  .map((enrollment: any) => {
                    const courseId = enrollment.courseId || enrollment.CourseId;
                    const courseCode = enrollment.courseCode || enrollment.CourseCode || '';
                    const courseName = enrollment.courseName || enrollment.CourseName;
                    return (
                      <option key={courseId} value={courseId}>
                        {courseCode ? `${courseCode} - ${courseName}` : courseName}
                      </option>
                    );
                  })}
              </select>
              {isLoadingEnrollments && (
                <p className="text-xs text-gray-500 mt-1">Loading courses...</p>
              )}
              {!isLoadingEnrollments && studentEnrollments.filter((e: any) => {
                const status = (e.enrollmentStatus || '').toLowerCase();
                return status === 'enrolled';
              }).length === 0 && (
                <p className="text-xs text-red-500 mt-1">No enrolled courses available</p>
              )}
            </div>
          )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                required
                disabled={true}
              >
                <option value="" disabled>Auto-selected from your enrollment</option>
                {formData.fromClassID && filteredClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.className}
                  </option>
                ))}
              </select>
              {!formData.courseID && (
                <p className="text-xs text-gray-500 mt-1">Select a course to auto-populate your current class</p>
              )}
              {formData.courseID && !formData.fromClassID && (
                <p className="text-xs text-yellow-600 mt-1">No class found for this course. Please contact support.</p>
              )}
              {formData.courseID && formData.fromClassID && (
                <p className="text-xs text-green-600 mt-1">✓ Your current class has been auto-selected</p>
              )}
          </div>
          )}

          {/* From Class Schedule Display */}
          {isClassTransfer() && fromClass && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">From Class Schedule</h4>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-gray-700">Class:</span>
                    <span className="text-gray-900">{fromClass.className}</span>
                  </div>
                  {(fromClass as any).teacher && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">Teacher:</span>
                      <span className="text-gray-900">{(fromClass as any).teacher}</span>
                    </div>
                  )}
                  {(fromClass as any).room && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">Room:</span>
                      <span className="text-gray-900">{(fromClass as any).room}</span>
                    </div>
                  )}
                  {fromClass.startDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="text-gray-900">
                        {fromClass.startDate} {fromClass.endDate && `- ${fromClass.endDate}`}
                      </span>
                    </div>
                  )}
                </div>
                {(fromClass as any).schedule && Array.isArray((fromClass as any).schedule) && (fromClass as any).schedule.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-700 block mb-2">Schedule:</span>
                    {(() => {
                      // Parse meeting dates
                      const meetingDates: Date[] = [];
                      const meetingTimes = new Map<string, string>();
                      
                      (fromClass as any).schedule.forEach((scheduleItem: any) => {
                        const dateStr = scheduleItem.date || scheduleItem.Date;
                        if (!dateStr) return;
                        
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return;
                        
                        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        meetingDates.push(normalizedDate);
                        const slotCode = scheduleItem.slot || scheduleItem.Slot || '';
                        const timeDisplay = getTimeFromSlot(slotCode);
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

                      // Initialize current month if not set
                      if (meetingDates.length > 0 && fromClassCurrentMonth.getTime() === new Date().setHours(0,0,0,0)) {
                        setFromClassCurrentMonth(new Date(meetingDates[0].getFullYear(), meetingDates[0].getMonth(), 1));
                      }

                      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                      const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

                      // Get current month key
                      const currentMonthKey = `${fromClassCurrentMonth.getFullYear()}-${String(fromClassCurrentMonth.getMonth() + 1).padStart(2, '0')}`;
                      const dates = meetingsByMonth.get(currentMonthKey) || [];
                      
                      const year = fromClassCurrentMonth.getFullYear();
                      const month = fromClassCurrentMonth.getMonth() + 1;
                      
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
                        setFromClassCurrentMonth(new Date(fromClassCurrentMonth.getFullYear(), fromClassCurrentMonth.getMonth() - 1, 1));
                      };

                      const handleNextMonth = () => {
                        setFromClassCurrentMonth(new Date(fromClassCurrentMonth.getFullYear(), fromClassCurrentMonth.getMonth() + 1, 1));
                      };

                      return (
                        <div className="mt-3 bg-white rounded-lg border border-blue-200">
                          {/* Navigation */}
                          <div className="flex items-center justify-between px-3 py-2.5 border-b border-blue-200">
                            <button
                              type="button"
                              onClick={handlePrevMonth}
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-blue-50 transition-colors"
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
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-blue-50 transition-colors"
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
                                        ? 'bg-blue-500 text-white font-semibold'
                                        : isToday
                                        ? 'bg-blue-100 text-blue-700 font-medium'
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
                            <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span>Class session</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                                <span>Today</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {(!(fromClass as any).schedule || !Array.isArray((fromClass as any).schedule) || (fromClass as any).schedule.length === 0) && (
                  <p className="text-xs text-gray-500 italic">No schedule information available</p>
                )}
              </div>
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
                disabled={isSubmitting || isLoadingClasses || !formData.courseID}
              >
                <option value="" disabled>Select a class</option>
                {filteredClasses
                  .filter(classItem => classItem.id !== formData.fromClassID) // Exclude the selected "From Class"
                  .map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.className}
                    </option>
                  ))}
              </select>
              {isLoadingClasses && (
                <p className="text-xs text-gray-500 mt-1">Loading classes...</p>
              )}
              {!isLoadingClasses && !formData.courseID && (
                <p className="text-xs text-gray-500 mt-1">Please select a course first</p>
              )}
              {!isLoadingClasses && formData.courseID && filteredClasses.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No classes available for this course</p>
              )}
          </div>
          )}

          {/* To Class Schedule Display */}
          {isClassTransfer() && toClass && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-green-900">To Class Schedule</h4>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-gray-700">Class:</span>
                    <span className="text-gray-900">{toClass.className}</span>
                  </div>
                  {(toClass as any).teacher && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">Teacher:</span>
                      <span className="text-gray-900">{(toClass as any).teacher}</span>
                    </div>
                  )}
                  {(toClass as any).room && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">Room:</span>
                      <span className="text-gray-900">{(toClass as any).room}</span>
                    </div>
                  )}
                  {toClass.startDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="text-gray-900">
                        {toClass.startDate} {toClass.endDate && `- ${toClass.endDate}`}
                      </span>
                    </div>
                  )}
                </div>
                {(toClass as any).schedule && Array.isArray((toClass as any).schedule) && (toClass as any).schedule.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-700 block mb-2">Schedule:</span>
                    {(() => {
                      // Parse meeting dates
                      const meetingDates: Date[] = [];
                      const meetingTimes = new Map<string, string>();
                      
                      (toClass as any).schedule.forEach((scheduleItem: any) => {
                        const dateStr = scheduleItem.date || scheduleItem.Date;
                        if (!dateStr) return;
                        
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return;
                        
                        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        meetingDates.push(normalizedDate);
                        const slotCode = scheduleItem.slot || scheduleItem.Slot || '';
                        const timeDisplay = getTimeFromSlot(slotCode);
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

                      // Initialize current month if not set
                      if (meetingDates.length > 0 && toClassCurrentMonth.getTime() === new Date().setHours(0,0,0,0)) {
                        setToClassCurrentMonth(new Date(meetingDates[0].getFullYear(), meetingDates[0].getMonth(), 1));
                      }

                      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                      const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

                      // Get current month key
                      const currentMonthKey = `${toClassCurrentMonth.getFullYear()}-${String(toClassCurrentMonth.getMonth() + 1).padStart(2, '0')}`;
                      const dates = meetingsByMonth.get(currentMonthKey) || [];
                      
                      const year = toClassCurrentMonth.getFullYear();
                      const month = toClassCurrentMonth.getMonth() + 1;
                      
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
                        setToClassCurrentMonth(new Date(toClassCurrentMonth.getFullYear(), toClassCurrentMonth.getMonth() - 1, 1));
                      };

                      const handleNextMonth = () => {
                        setToClassCurrentMonth(new Date(toClassCurrentMonth.getFullYear(), toClassCurrentMonth.getMonth() + 1, 1));
                      };

                      return (
                        <div className="mt-3 bg-white rounded-lg border border-green-200">
                          {/* Navigation */}
                          <div className="flex items-center justify-between px-3 py-2.5 border-b border-green-200">
                            <button
                              type="button"
                              onClick={handlePrevMonth}
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-green-50 transition-colors"
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
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-green-50 transition-colors"
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
                                        ? 'bg-green-500 text-white font-semibold'
                                        : isToday
                                        ? 'bg-green-100 text-green-700 font-medium'
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
                            <div className="mt-3 pt-3 border-t border-green-100 flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Class session</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-green-100 rounded"></div>
                                <span>Today</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {(!(toClass as any).schedule || !Array.isArray((toClass as any).schedule) || (toClass as any).schedule.length === 0) && (
                  <p className="text-xs text-gray-500 italic">No schedule information available</p>
                )}
              </div>
            </div>
          )}


          {/* Meeting Reschedule Fields */}
          {isMeetingReschedule() && (
            <>
              {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="classID"
                  value={formData.classID}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting || isLoadingClasses}
                >
                  <option value="" disabled>Select a class</option>
                  {allClasses.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.className}
                    </option>
                  ))}
                </select>
                {isLoadingClasses && (
                  <p className="text-xs text-gray-500 mt-1">Loading classes...</p>
                )}
              </div>

              {/* Class Meeting Selection */}
              {formData.classID && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Meeting to Reschedule <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classMeetingID"
                    value={formData.classMeetingID}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting || isLoadingMeetings || !formData.classID}
                  >
                    <option value="" disabled>Select a meeting</option>
                    {classMeetings.map((meeting, index) => {
                      const meetingDate = new Date(meeting.date);
                      const slotCode = meeting.slot || '';
                      const slotTime = getTimeFromSlot(slotCode);
                      // Prefer backend-derived sessionNumber if available; fallback to index
                      const sessionNumber = (meeting as any).sessionNumber ?? index + 1;
                      return (
                        <option key={meeting.id} value={meeting.id}>
                          Session {sessionNumber} -{" "}
                          {meetingDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })} - {slotTime}
                        </option>
                      );
                    })}
                  </select>
                  {isLoadingMeetings && (
                    <p className="text-xs text-gray-500 mt-1">Loading meetings...</p>
                  )}
                  {!isLoadingMeetings && formData.classID && classMeetings.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No upcoming meetings available for this class</p>
                  )}
                </div>
              )}

              {/* New Meeting Date */}
              {formData.classMeetingID && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Meeting Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
                      name="toMeetingDate"
                      value={formData.toMeetingDate}
              onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
              disabled={isSubmitting}
            />
                    <p className="text-xs text-gray-500 mt-1">Select the new date for this meeting</p>
          </div>

                  {/* New Time Slot */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="toSlotID"
                      value={formData.toSlotID}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting || isLoadingTimeSlots}
                    >
                      <option value="" disabled>Select new time slot</option>
                      {timeSlotLookups.map((slot: any) => {
                        const slotId = slot.lookUpId || slot.LookUpId || slot.id;
                        const slotCode = slot.code || slot.Code || '';
                        const timeDisplay = timeSlots.get(slotCode) || slotCode;
                        return (
                          <option key={slotId} value={slotId}>
                            {timeDisplay} ({slotCode})
                          </option>
                        );
                      })}
                    </select>
                    {isLoadingTimeSlots && (
                      <p className="text-xs text-gray-500 mt-1">Loading time slots...</p>
                    )}
                  </div>

                  {/* New Room (Optional - placeholder for now) */}
                  {rooms.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Room (Optional)
                      </label>
                      <select
                        name="newRoomID"
                        value={formData.newRoomID}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting || isLoadingRooms}
                      >
                        <option value="">Keep current room</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.roomCode || room.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </>
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
                  All academic requests are subject to approval by staff. 
                  Processing typically takes 3-5 business days. You will be notified once 
                  your request has been reviewed.
                </p>
                {isClassTransfer() && (
                  <p className="text-sm text-orange-700 mt-2">
                    <strong>Class Transfer:</strong> Your request will be valid for 7 days from submission. 
                    If not processed within this period, it will be expired.
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
              disabled={isSubmitting || isLoading || !isFormComplete()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
        </DialogBody>
      </DialogContent>

      {/* Dropout Warning Modal */}
      <DropoutWarningModal
        isOpen={showDropoutWarning}
        onClose={() => setShowDropoutWarning(false)}
        onContinue={handleDropoutWarningContinue}
      />

      {/* Exit Survey Modal */}
      <ExitSurveyModal
        isOpen={showExitSurvey}
        onClose={() => setShowExitSurvey(false)}
        studentID={userId!}
        onSurveyComplete={handleExitSurveyComplete}
      />
    </Dialog>
  );
};

export default AcademicChangeRequestPopup;
