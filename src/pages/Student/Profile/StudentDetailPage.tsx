import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import { Edit, UserX, User, Eye, Settings, Calendar, BookOpen, Award,Mail,Phone,MapPin,IdCard,Clock,MessageSquare,Plus,GraduationCap,Activity,ExternalLink,Copy, Save, X, Upload, Camera} from "lucide-react";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import Loader from "@/components/ui/Loader";
import { getStudentById, getTotalAssignmentByStudentId, getTotalAttendceByStudentId, updateStudent, uploadAvatar} from "@/api/student.api";
import type { Student, CourseEnrollment, AssignmentSubmited, TotalStudentAttendanceByCourse, UpdateStudent } from "@/types/student.type";
import { getUserInfo, setUserInfo } from "@/lib/utils";



export default function StudentDetailPage() {
  const userInfo = getUserInfo();
  const id = userInfo?.id || null;
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateStudent | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
 
  useEffect(() => {
    const preloaded = (location.state as any)?.preloadedStudent;
    const fromSuccess = (location.state as any)?.updateStatus === "success";

    if (preloaded) {
      setStudent(preloaded);
      setLoading(false);
    }

    if (fromSuccess) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      // Clear state to avoid re-showing toast, but after we've consumed preloaded
      navigate(location.pathname, { replace: true, state: {} });
      // Background refresh to ensure data is in sync
      if (id) {
        void (async () => {
          try {
            const fresh = await getStudentById(id);
            setStudent(fresh);
          } catch (err) {
            console.error("Background refresh student failed:", err);
          }
        })();
      }
      return () => clearTimeout(timer);
    }

    const fetchStudent = async () => {
      if (!id) {
        setError("Student ID is required");
        setLoading(false);
        return;
      }

      try {
        if (!preloaded) setLoading(true);
        setError(null);
        const studentData = await getStudentById(id);
        setStudent(studentData);
      } catch (err) {
        console.error("Error fetching student:", err);
        setError(`Failed to load student data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        if (!preloaded) setLoading(false);
      }
    };

    // If not coming from success preloaded, proceed normal fetch
    if (!fromSuccess) {
      fetchStudent();
    }
  }, [id]);

 


  const handleEdit = () => {
    if (!student || !id) return;
    
    // Initialize edit data with current student data
    const initialEditData: UpdateStudent = {
      accountID: id,
      fullName: student.fullName || null,
      email: student.email || "",
      phoneNumber: student.phoneNumber || null,
      cid: student.cid || null,
      address: student.address || null,
      dateOfBirth: student.dateOfBirth || null,
      avatarUrl: student.avatarUrl || null,
      guardianName: student.studentInfo?.guardianName || null,
      guardianPhone: student.studentInfo?.guardianPhone || null,
      school: student.studentInfo?.school || null,
      academicNote: student.studentInfo?.academicNote || null,
    };
    
    setEditData(initialEditData);
    
    // Validate initial data
    const initialErrors: Record<string, string> = {};
    const fullNameError = validateFullName(initialEditData.fullName);
    if (fullNameError) initialErrors.fullName = fullNameError;
    
    const emailError = validateEmail(initialEditData.email || "");
    if (emailError) initialErrors.email = emailError;
    
    const phoneError = validatePhone(initialEditData.phoneNumber);
    if (phoneError) initialErrors.phoneNumber = phoneError;
    
    const dobError = validateDateOfBirth(initialEditData.dateOfBirth);
    if (dobError) initialErrors.dateOfBirth = dobError;
    
    const cidError = validateCID(initialEditData.cid);
    if (cidError) initialErrors.cid = cidError;
    
    setErrors(initialErrors);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setErrors({});
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage("Please select an image file");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return;
    }

    // Save file for upload later
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email || email.trim() === "") {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone: string | null): string => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required";
    }
    const phoneRegex = /^0\d{9,10}$/; // Starts with 0, followed by 9 or 10 digits (total 10 or 11)
    if (!phoneRegex.test(phone)) {
      return "Phone number must start with 0 and have 10 or 11 digits";
    }
    return "";
  };

  const validateDateOfBirth = (dateOfBirth: string | null): string => {
    if (!dateOfBirth || dateOfBirth.trim() === "") {
      return "Date of birth is required";
    }
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 18) {
        return "You must be at least 18 years old";
      }
    } else if (age < 18) {
      return "You must be at least 18 years old";
    }
    
    if (birthDate > today) {
      return "Date of birth cannot be in the future";
    }
    
    return "";
  };

  const validateCID = (cid: string | null): string => {
    if (!cid || cid.trim() === "") {
      return "CID is required";
    }
    const cidRegex = /^\d{12}$/; // Exactly 12 digits
    if (!cidRegex.test(cid)) {
      return "CID must be exactly 12 digits";
    }
    return "";
  };

  const validateFullName = (fullName: string | null): string => {
    if (!fullName || fullName.trim() === "") {
      return "Full name is required";
    }
    
    const trimmedName = fullName.trim();
    
    if (trimmedName.length < 2) {
      return "Full name must be at least 2 characters";
    }
    
    // Only allow letters (including Vietnamese characters), spaces, hyphens, and apostrophes
    // Regex: allows Unicode letters, spaces, hyphens (-), and apostrophes (')
    const nameRegex = /^[\p{L}\s'-]+$/u;
    
    if (!nameRegex.test(trimmedName)) {
      return "Full name can only contain letters, spaces, hyphens, and apostrophes";
    }
    
    // Must contain at least one letter (not just spaces, hyphens, or apostrophes)
    const hasLetter = /[\p{L}]/u.test(trimmedName);
    
    if (!hasLetter) {
      return "Full name must contain at least one letter";
    }
    
    // Check for consecutive spaces
    if (/\s{2,}/.test(trimmedName)) {
      return "Full name cannot contain consecutive spaces";
    }
    
    // Check that it doesn't start or end with special characters
    if (/^[-']|[-']$/.test(trimmedName)) {
      return "Full name cannot start or end with hyphens or apostrophes";
    }
    
    return "";
  };

  const handleSave = async () => {
    if (!id || !editData) return;

    // Validate all fields before saving
    if (!validateAllFields()) {
      return;
    }

    setSaving(true);
    try {
      // Upload avatar first if a new file is selected
      if (avatarFile) {
        const avartaUrlPublic = await uploadAvatar(avatarFile);
        // Update editData with the new avatarUrl
        editData.avatarUrl = avartaUrlPublic || null;
        //setStudent(updatedStudent);
      }

      // Update student information
      await updateStudent(id, editData);
      
      // Refresh student data
      const updatedStudent = await getStudentById(id);
      setStudent(updatedStudent);
      setIsEditing(false);
      setEditData(null);
      setErrors({});
      setAvatarPreview(null);
      setAvatarFile(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);

      // Persist latest user info (avatar/name/email) to localStorage and notify header
      setUserInfo({
        avatarUrl: updatedStudent.avatarUrl
          ? `${updatedStudent.avatarUrl}${updatedStudent.avatarUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
          : undefined,
        fullName: updatedStudent.fullName,
        email: updatedStudent.email,
      } as any);
    } catch (error) {
      console.error("Error updating student:", error);
      setErrorMessage("Failed to update student information. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof UpdateStudent, value: string | null) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
    
    // Validate on change
    let error = "";
    switch (field) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "email":
        error = validateEmail(value || "");
        break;
      case "phoneNumber":
        error = validatePhone(value);
        break;
      case "dateOfBirth":
        error = validateDateOfBirth(value);
        break;
      case "cid":
        error = validateCID(value);
        break;
      default:
        break;
    }
    
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        // Remove error if validation passes
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const validateAllFields = (): boolean => {
    if (!editData) return false;
    
    const newErrors: Record<string, string> = {};
    
    const fullNameError = validateFullName(editData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    
    const emailError = validateEmail(editData.email || "");
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(editData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;
    
    const dobError = validateDateOfBirth(editData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;
    
    const cidError = validateCID(editData.cid);
    if (cidError) newErrors.cid = cidError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
 
  

 

  // Loading state
  if (loading) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Student</h3>
          <p className="text-gray-500 mb-4">{error || "Student not found"}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  

  return (
    <div className=" sm:p-6  ">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Update Successful</p>
              <p className="text-sm">Student profile updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 text-green-700 hover:text-green-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage || "An error occurred. Please try again."}</p>
            </div>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-2 text-red-700 hover:text-red-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-4">
       
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-bold text-gray-900"></h1>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  variant="secondary" 
                  size="sm" 
                  disabled={saving || Object.values(errors).some(err => err !== "")}
                >
                  <div className="flex items-center ">
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? "Saving..." : "Save"}
                  </div>
                  
                </Button>
                <Button onClick={handleCancel} variant="danger" size="sm" disabled={saving}>
                  <div className="flex items-center ">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </div>
                  
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} variant="secondary" size="sm">
                <div className="flex items-center ">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Profile
                </div>
                
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center py-4">
              <div className="relative w-50 h-50 mx-auto mb-3 group">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md hover:shadow-lg transition-all duration-300">
                  {avatarPreview || student.avatarUrl ? (
                    <img 
                      src={avatarPreview || student.avatarUrl || ""} 
                      alt={student.fullName}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  ) : (
                    <User className="w-10 h-10 text-indigo-600 transition-colors" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                      disabled={saving}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md border-2 border-white"
                      title="Change avatar"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </label>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{student.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(student.accountStatusID ?? "")}`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {getStatusDisplay(student.accountStatusID ?? "")}
                </span>
              </div>
              {student.studentInfo?.studentCode && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 mx-auto max-w-fit hover:bg-gray-100 transition-colors cursor-pointer group" 
                     onClick={() => navigator.clipboard.writeText(student.studentInfo?.studentCode || '')}>
                  <IdCard className="w-3.5 h-3.5" />
                  <span className="font-mono">{student.studentInfo.studentCode}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Student Information */}
        <div className="lg:col-span-2">
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Full Name {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="text"
                        value={editData?.fullName || ""}
                        onChange={(e) => handleFieldChange("fullName", e.target.value || null)}
                        className={`text-sm ${errors.fullName ? "border-red-500" : ""}`}
                        placeholder="Enter full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{student.fullName || "N/A"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="email"
                        value={editData?.email || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className={`text-sm ${errors.email ? "border-red-500" : ""}`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium truncate hover:text-blue-600 transition-colors cursor-pointer" 
                       onClick={() => window.open(`mailto:${student.email}`)}
                       title={student.email || undefined}>
                      {student.email || "N/A"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Phone {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="tel"
                        value={editData?.phoneNumber || ""}
                        onChange={(e) => handleFieldChange("phoneNumber", e.target.value || null)}
                        className={`text-sm ${errors.phoneNumber ? "border-red-500" : ""}`}
                        placeholder="Enter phone number (e.g., 0123456789)"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium hover:text-green-600 transition-colors cursor-pointer" 
                       onClick={() => student.phoneNumber && window.open(`tel:${student.phoneNumber}`)}>
                      {student.phoneNumber || "N/A"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Date of Birth {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="date"
                        value={editData?.dateOfBirth ? editData.dateOfBirth.split('T')[0] : ""}
                        onChange={(e) => handleFieldChange("dateOfBirth", e.target.value || null)}
                        className={`text-sm ${errors.dateOfBirth ? "border-red-500" : ""}`}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{formatDate(student.dateOfBirth) || "N/A"}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Account Created</label>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(student.createdAt) || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData?.address || ""}
                      onChange={(e) => handleFieldChange("address", e.target.value || null)}
                      className="text-sm"
                      placeholder="Enter address (optional)"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{student.address || "N/A"}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    CID {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="text"
                        value={editData?.cid || ""}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '');
                          handleFieldChange("cid", value || null);
                        }}
                        className={`text-sm font-mono ${errors.cid ? "border-red-500" : ""}`}
                        placeholder="Enter 12-digit CID"
                        maxLength={12}
                      />
                      {errors.cid && (
                        <p className="mt-1 text-xs text-red-600">{errors.cid}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium font-mono">{student.cid || "N/A"}</p>
                  )}
                </div>
              </div>
              
            </div>
            {isEditing && (
              <p className="text-xs text-gray-500 mt-2" style={{color: "#ff0000"}}>
                <span className="text-red-700">*</span> is required fields
              </p>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}
