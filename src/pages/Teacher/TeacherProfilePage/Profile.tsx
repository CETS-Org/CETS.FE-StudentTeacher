import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/Select";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Loader from "@/components/ui/Loader";
import { getUserInfo, setUserInfo } from "@/lib/utils";
import { getTeacherById, getListCredentialType, getListCredentialByTeacherId, updateTeacher } from "@/api/teacher.api";
import { api, endpoint } from "@/api/api";
import { config } from "@/lib/config";
import type { Teacher, CredentialTypeResponse, TeacherCredentialResponse, UpdateTeacherProfile } from "@/types/teacher.type";
import { formatDate } from "@/helper/helper.service";
import { checkEmailExist, checkCIDExist } from "@/api/account.api";
import {
  User as UserIcon,
  User2,
  Camera,
  Trash2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  IdCard,
  BookOpenCheck,
  FileText,
  Award,
  Edit3,
  Copy,
  GraduationCap,
  Plus,
  Upload,
  Eye,
  X,
} from "lucide-react";

const crumbs: Crumb[] = [{ label: "Profile" }];

interface CredentialFormData {
  id: string;
  credentialTypeId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
  imageFile?: File; // Store file object for later upload
  credentialId?: string; // For existing credentials
}

export default function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userInfo = getUserInfo();
  const id = userInfo?.id || null;
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeResponse[]>([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailCheckTimer, setEmailCheckTimer] = useState<number | null>(null);
  const [cidCheckTimer, setCidCheckTimer] = useState<number | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>(""); // Store original email to skip check if unchanged
  const [originalCID, setOriginalCID] = useState<string>(""); // Store original CID to skip check if unchanged
  const [uploadingImages, setUploadingImages] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ url: string; name: string } | null>(null);

  // edit model aligned with UpdateTeacherProfile
  const [profile, setProfile] = useState<UpdateTeacherProfile>({
    teacherCode: null,
    email: "",
    phoneNumber: "",
    yearsExperience: 0,
    fullName: "",
    dateOfBirth: "",
    cid: "",
    address: "",
    avatarUrl: null,
    bio: "",
    credentials: [],
  });

  // Local credentials state for editing (with imageFile support)
  const [credentials, setCredentials] = useState<CredentialFormData[]>([]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Store file object for later upload

  const onChange =
    (key: keyof UpdateTeacherProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      if (key === "cid") {
        const vv = v.replace(/\D/g, "").slice(0, 12);
        setProfile((p) => ({ ...p, cid: vv }));
        // Clear error if CID is back to original (unchanged)
        if (vv === originalCID) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.cid === "CID already exists") {
              delete newErrors.cid;
            }
            return newErrors;
          });
        }
        // Real-time validation for CID format
        validateField("cid", vv);
      } else if (key === "yearsExperience") {
        setProfile((p) => ({ ...p, yearsExperience: Number(v || 0) }));
      } else if (key === "phoneNumber") {
        setProfile((p) => ({ ...p, phoneNumber: v }));
        // Real-time validation for phone format
        validateField("phoneNumber", v);
      } else if (key === "dateOfBirth") {
        setProfile((p) => ({ ...p, dateOfBirth: v }));
        // Real-time validation for date of birth
        validateField("dateOfBirth", v);
      } else if (key === "email") {
        setProfile((p) => ({ ...p, email: v }));
        // Clear error if email is back to original (unchanged)
        if (v === originalEmail) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.email === "Email already exists") {
              delete newErrors.email;
            }
            return newErrors;
          });
        }
        // Real-time validation for email format
        validateField("email", v);
      } else if (key === "bio") {
        setProfile((p) => ({ ...p, bio: v }));
      } else if (key === "address") {
        setProfile((p) => ({ ...p, address: v }));
      } else if (key === "fullName") {
        setProfile((p) => ({ ...p, fullName: v }));
        // Real-time validation for full name
        validateField("fullName", v);
      }
    };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: "Please select an image file" }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: "File size must be less than 5MB" }));
      return;
    }

    // Store file object for later upload
    setAvatarFile(file);
    
    // Show preview from local file
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result && result.startsWith('data:image')) {
        setAvatarUrl(result);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.avatar;
          return newErrors;
        });
      }
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, avatar: "Failed to read image file" }));
    };
    reader.readAsDataURL(file);
  };

  const onRemoveAvatar = () => {
    setAvatarUrl(null);
    setAvatarFile(null);
    setProfile((p) => ({ ...p, avatarUrl: null }));
  };

  // Helper function to get full image URL from storage
  const getCredentialImageUrl = (pictureUrl: string | null): string => {
    if (!pictureUrl) return '';
    // If already a full URL (starts with http), return as is
    if (pictureUrl.startsWith('http://') || pictureUrl.startsWith('https://')) {
      return pictureUrl;
    }
    // If it's a base64 data URL, return as is
    if (pictureUrl.startsWith('data:')) {
      return pictureUrl;
    }
    // Otherwise, prepend storage public URL
    const cleanUrl = pictureUrl.startsWith('/') ? pictureUrl : `/${pictureUrl}`;
    return `${config.storagePublicUrl}${cleanUrl}`;
  };

  // Helper function to get full avatar URL from storage (similar to credential)
  const getAvatarUrl = (url: string | null): string => {
    if (!url) return '';
    // If already a full URL (starts with http), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a base64 data URL (preview), return as is
    if (url.startsWith('data:')) {
      return url;
    }
    // Otherwise, prepend storage public URL
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${config.storagePublicUrl}${cleanUrl}`;
  };

  const onToggleEdit = () => {
    if (!isEditing) {
      // Clear any "already exists" errors for email if it's unchanged
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.email === "Email already exists" && profile.email === originalEmail) {
          delete newErrors.email;
        }
        return newErrors;
      });
    }
    setIsEditing((s) => !s);
  };

  // Image upload functions (similar to AddTeacherPage)
  const handleImageUpload = async (file: File, prefix: string = 'image'): Promise<string> => {
    try {
      const response = await api.get(`${endpoint.teacher}/avatar/upload-url`, {
        params: { fileName: prefix, contentType: file.type },
      });
      
      const uploadResponse = await fetch(response.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      return response.data.filePath;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  };

  const handleCredentialImageUpload = async (credentialId: string, file: File): Promise<string> => {
    return handleImageUpload(file, 'credential');
  };

  // Credential management functions
  const addCredential = () => {
    const certificateType = credentialTypes.find(type => type.name === 'Certificate');
    const defaultCredentialTypeId = certificateType?.id || "";
    
    const newCredential: CredentialFormData = {
      id: Date.now().toString(),
      credentialTypeId: defaultCredentialTypeId,
      pictureUrl: null,
      name: "",
      level: "A1"
    };
    setCredentials(prev => [...prev, newCredential]);
  };

  const updateCredential = (id: string, field: keyof CredentialFormData, value: string) => {
    setCredentials(prev => {
      const updatedCredentials = prev.map(cred => {
        if (cred.id === id) {
          return { ...cred, [field]: value };
        }
        return cred;
      });
      
      // Clear error for this credential field when user starts typing
      const credentialIndex = prev.findIndex(cred => cred.id === id);
      if (credentialIndex !== -1) {
        const errorKey = `credential_${credentialIndex}_${field}`;
        if (errors[errorKey]) {
          setErrors(prevErrors => ({ ...prevErrors, [errorKey]: "" }));
        }
        
        // Real-time validation for credential fields
        const newErrors: Record<string, string> = {};
        const updatedCred = updatedCredentials[credentialIndex];
        
        if (field === 'credentialTypeId') {
          if (!value) {
            newErrors[`credential_${credentialIndex}_type`] = "Credential type is required";
          }
        }
        
        if (field === 'name') {
          if (!value.trim()) {
            newErrors[`credential_${credentialIndex}_name`] = "Credential name is required";
          } else if (value.trim().length < 2) {
            newErrors[`credential_${credentialIndex}_name`] = "Credential name must be at least 2 characters";
          }
        }
        
        if (field === 'level') {
          if (!value.trim()) {
            newErrors[`credential_${credentialIndex}_level`] = "Credential level is required";
          }
        }
        
        // Update errors
        if (Object.keys(newErrors).length > 0) {
          setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
        }
      }
      
      return updatedCredentials;
    });
  };

  const removeCredential = (id: string) => {
    setCredentials(prev => {
      const credentialIndex = prev.findIndex(cred => cred.id === id);
      const updatedCredentials = prev.filter(cred => cred.id !== id);
      
      // Clear errors for the removed credential
      if (credentialIndex !== -1) {
        const errorsToRemove: Record<string, string> = {};
        ['type', 'name', 'level', 'pictureUrl'].forEach(field => {
          const errorKey = `credential_${credentialIndex}_${field}`;
          if (errors[errorKey]) {
            errorsToRemove[errorKey] = "";
          }
        });
        
        if (Object.keys(errorsToRemove).length > 0) {
          setErrors(prevErrors => ({ ...prevErrors, ...errorsToRemove }));
        }
      }
      
      return updatedCredentials;
    });
  };

  const uploadCredentialImages = async (): Promise<CredentialFormData[]> => {
    const credentialsWithFiles = credentials.filter(cred => cred.imageFile);
    
    if (credentialsWithFiles.length === 0) {
      return credentials;
    }

    setUploadingImages(true);
    
    try {
      const updatedCredentials = await Promise.all(
        credentials.map(async (cred) => {
          if (cred.imageFile) {
            const publicUrl = await handleCredentialImageUpload(cred.id, cred.imageFile);
            return {
              ...cred,
              pictureUrl: publicUrl,
              imageFile: undefined
            };
          }
          return cred;
        })
      );
      
      setCredentials(updatedCredentials);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return updatedCredentials;
    } catch (error) {
      console.error('❌ Error uploading credential images:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const onSave = async () => {
    if (!id) return;
    // validate all fields
    const newErrors: Record<string, string> = {};
    const e1 = validateFullName(profile.fullName); if (e1) newErrors.fullName = e1;
    const e2 = validateEmail(profile.email || ""); if (e2) newErrors.email = e2;
    const e3 = validatePhone(profile.phoneNumber || null); if (e3) newErrors.phone = e3;
    const e4 = validateDateOfBirth(profile.dateOfBirth || null); if (e4) newErrors.dob = e4;
    const e5 = validateCID(profile.cid || null); if (e5) newErrors.cid = e5;
    
    // Validate credentials
    credentials.forEach((cred, index) => {
      if (!cred.credentialTypeId) {
        newErrors[`credential_${index}_type`] = "Credential type is required";
      }
      if (!cred.name || !cred.name.trim()) {
        newErrors[`credential_${index}_name`] = "Credential name is required";
      } else if (cred.name.trim().length < 2) {
        newErrors[`credential_${index}_name`] = "Credential name must be at least 2 characters";
      }
      if (!cred.level || !cred.level.trim()) {
        newErrors[`credential_${index}_level`] = "Credential level is required";
      }
    });
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      
      // Step 1: Upload avatar to cloud if there's a new file
      let finalAvatarUrl = profile.avatarUrl; // Keep existing URL if no new file
      if (avatarFile) {
        finalAvatarUrl = await handleImageUpload(avatarFile, 'avatar');
      }
      
      // Step 2: Upload credential images if any
      const credentialsWithCloudUrls = await uploadCredentialImages();
      
      // Step 3: Update profile with credentials and avatar
      const updatedProfile: UpdateTeacherProfile = {
        ...profile,
        avatarUrl: finalAvatarUrl, // Use uploaded cloud URL
        credentials: credentialsWithCloudUrls
          .filter(cred => cred.credentialTypeId)
          .map(cred => ({
            credentialId: cred.credentialId,
            credentialTypeId: cred.credentialTypeId,
            pictureUrl: cred.pictureUrl,
            name: cred.name,
            level: cred.level
          }))
      };
      
      await updateTeacher(id, updatedProfile);
      const fresh = await getTeacherById(id);
      
      // Update avatar from fresh data (cloud URL)
      const freshAvatarUrl = fresh.avatarUrl || null;
      setAvatarUrl(freshAvatarUrl);
      setAvatarFile(null); // Clear file object after successful upload
      
      // Update userInfo in localStorage with new avatarUrl (for navbar and other components)
      if (freshAvatarUrl) {
        // Add cache buster to force reload avatar in navbar
        const avatarUrlWithCacheBuster = freshAvatarUrl.includes('?') 
          ? `${freshAvatarUrl}&v=${Date.now()}`
          : `${freshAvatarUrl}?v=${Date.now()}`;
        
        setUserInfo({
          avatarUrl: avatarUrlWithCacheBuster,
          fullName: fresh.fullName,
          email: fresh.email,
        } as any);
      } else {
        // If avatar was removed, update userInfo to remove avatarUrl
        setUserInfo({
          avatarUrl: undefined,
          fullName: fresh.fullName,
          email: fresh.email,
        } as any);
      }
      
      setOriginalEmail(fresh.email || ""); // Update original email after save
      setOriginalCID(fresh.cid || ""); // Update original CID after save
      setProfile((p) => ({
        ...p,
        fullName: fresh.fullName || "",
        dateOfBirth: fresh.dateOfBirth || "",
        email: fresh.email || "",
        phoneNumber: fresh.phoneNumber || "",
        address: fresh.address || "",
        cid: fresh.cid || "",
        teacherCode: fresh.teacherInfo?.teacherCode || null,
        yearsExperience: fresh.teacherInfo?.yearsExperience ?? 0,
        bio: fresh.teacherInfo?.bio || "",
        avatarUrl: fresh.avatarUrl || null,
        credentials: [],
      }));
      
      // Reload credentials
      try {
        setCredentialsLoading(true);
        const types: CredentialTypeResponse[] = await getListCredentialType();
        setCredentialTypes(types);
        const creds: TeacherCredentialResponse[] = await getListCredentialByTeacherId(id);
        
        // Convert to CredentialFormData format
        const loadedCredentials: CredentialFormData[] = creds.map(cred => ({
          id: cred.credentialId,
          credentialId: cred.credentialId,
          credentialTypeId: cred.credentialTypeId,
          pictureUrl: cred.pictureUrl,
          name: cred.name,
          level: cred.level || "A1"
        }));
        setCredentials(loadedCredentials);
      } finally {
        setCredentialsLoading(false);
      }
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update teacher profile");
    } finally {
      setLoading(false);
    }
  };

  // Removed Input component wrapper to prevent focus loss on re-render
  
  // Validation helpers (mirroring Student)
  const validateEmail = (email: string): string => {
    if (!email || email.trim() === "") return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string | null): string => {
    if (!phone || phone.trim() === "") return "Phone number is required";
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(phone)) return "Phone must start with 0 and have 10 or 11 digits";
    return "";
  };

  const validateDateOfBirth = (dateOfBirth: string | null): string => {
    if (!dateOfBirth || dateOfBirth.trim() === "") return "Date of birth is required";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    if (actualAge < 18) return "You must be at least 18 years old";
    if (birthDate > today) return "Date of birth cannot be in the future";
    return "";
  };

  const validateCID = (cid: string | null): string => {
    if (!cid || cid.trim() === "") return "CID is required";
    const cidRegex = /^\d{12}$/;
    if (!cidRegex.test(cid)) return "CID must be exactly 12 digits";
    return "";
  };

  const validateFullName = (fullName: string | null): string => {
    if (!fullName || fullName.trim() === "") return "Full name is required";
    const trimmed = fullName.trim();
    if (trimmed.length < 2) return "Full name must be at least 2 characters";
    const nameRegex = /^[\p{L}\s'-]+$/u;
    if (!nameRegex.test(trimmed)) return "Only letters, spaces, hyphens, apostrophes allowed";
    if (!/[\p{L}]/u.test(trimmed)) return "Full name must contain at least one letter";
    if (/\s{2,}/.test(trimmed)) return "Full name cannot contain consecutive spaces";
    if (/^[-']|[-']$/.test(trimmed)) return "Full name cannot start or end with - or '";
    return "";
  };

  // Validation function that doesn't update state
  const validateField = (field: keyof UpdateTeacherProfile, value: string | null) => {
    let err = "";
    switch (field) {
      case "fullName":
        err = validateFullName(value);
        break;
      case "email": {
        const v = value || "";
        err = validateEmail(v);
        // Always set format error immediately if format is invalid
        setErrors((prev) => {
          const n = { ...prev };
          if (err) {
            n.email = err; // Set format error immediately
          } else {
            // Only clear format errors, keep existence errors if any
            if (n.email && n.email !== "Email already exists") {
              delete n.email;
            }
          }
          return n;
        });
        // If format is invalid, don't check existence
        if (err) {
          break;
        }
        // Clear error if email is back to original (unchanged) - don't check exist
        if (v === originalEmail) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.email === "Email already exists") {
              delete newErrors.email;
            }
            return newErrors;
          });
          return; // Don't check exist for unchanged email
        }
        // Only check exist if email has changed and format is valid
        if (id && v) {
          if (emailCheckTimer) window.clearTimeout(emailCheckTimer);
          const t = window.setTimeout(async () => {
            try {
              const exists = await checkEmailExist(v);
              // exists=true means unique/available → no error
              // exists=false means already taken → show error
              setErrors((prev) => ({ ...prev, email: exists ? "" : "Email already exists" }));
            } catch {}
          }, 500);
          setEmailCheckTimer(t as unknown as number);
        }
        break;
      }
      case "phoneNumber":
        err = validatePhone(value);
        // Set error with key "phone" to match UI
        setErrors((prev) => {
          const n = { ...prev };
          if (err) n.phone = err; else delete n.phone;
          return n;
        });
        return; // Return early to avoid double setting
      case "dateOfBirth":
        err = validateDateOfBirth(value);
        // Set error with key "dob" to match UI
        setErrors((prev) => {
          const n = { ...prev };
          if (err) n.dob = err; else delete n.dob;
          return n;
        });
        return; // Return early to avoid double setting
      case "cid": {
        const v = (value || "").replace(/\D/g, "").slice(0, 12);
        err = validateCID(v);
        // Always set format error immediately if format is invalid
        setErrors((prev) => {
          const n = { ...prev };
          if (err) {
            n.cid = err; // Set format error immediately
          } else {
            // Only clear format errors, keep existence errors if any
            if (n.cid && n.cid !== "CID already exists") {
              delete n.cid;
            }
          }
          return n;
        });
        // If format is invalid, don't check existence
        if (err) {
          break;
        }
        // Clear error if CID is back to original (unchanged) - don't check exist
        if (v === originalCID) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.cid === "CID already exists") {
              delete newErrors.cid;
            }
            return newErrors;
          });
          return; // Don't check exist for unchanged CID
        }
        // Only check exist if CID has changed and format is valid
        if (id && v) {
          if (cidCheckTimer) window.clearTimeout(cidCheckTimer);
          const t = window.setTimeout(async () => {
            try {
              const exists = await checkCIDExist(v);
              // exists=true means unique/available → no error
              // exists=false means already taken → show error
              setErrors((prev) => ({ ...prev, cid: exists ? "" : "CID already exists" }));
            } catch {}
          }, 500);
          setCidCheckTimer(t as unknown as number);
        }
        break;
      }
      default:
        break;
    }
    setErrors((prev) => {
      const n = { ...prev };
      if (err) n[field] = err; else delete n[field];
      return n;
    });
  };

  const handleFieldChange = (field: keyof UpdateTeacherProfile, value: string | null) => {
    // Update state
    if (field === "cid") {
      const v = (value || "").replace(/\D/g, "").slice(0, 12);
      setProfile((p) => ({ ...p, cid: v }));
    } else if (field === "yearsExperience") {
      setProfile((p) => ({ ...p, yearsExperience: Number(value || 0) }));
    } else if (field === "phoneNumber") {
      setProfile((p) => ({ ...p, phoneNumber: value || "" }));
    } else if (field === "dateOfBirth") {
      setProfile((p) => ({ ...p, dateOfBirth: value || "" }));
    } else if (field === "email") {
      setProfile((p) => ({ ...p, email: value || "" }));
    } else if (field === "address") {
      setProfile((p) => ({ ...p, address: value || "" }));
    } else if (field === "bio") {
      setProfile((p) => ({ ...p, bio: value || "" }));
    } else if (field === "fullName") {
      setProfile((p) => ({ ...p, fullName: value || "" }));
    }
    // Validate the field
    validateField(field, value);
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Teacher ID is required");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const teacher: Teacher = await getTeacherById(id);
        setAvatarUrl(teacher.avatarUrl || null);
        setOriginalEmail(teacher.email || ""); // Store original email
        setOriginalCID(teacher.cid || ""); // Store original CID
        setProfile((p) => ({
          ...p,
          fullName: teacher.fullName || "",
          dateOfBirth: teacher.dateOfBirth || "",
          email: teacher.email || "",
          phoneNumber: teacher.phoneNumber || "",
          address: teacher.address || "",
          cid: teacher.cid || "",
          teacherCode: teacher.teacherInfo?.teacherCode || null,
          yearsExperience: teacher.teacherInfo?.yearsExperience ?? 0,
          bio: teacher.teacherInfo?.bio || "",
          avatarUrl: teacher.avatarUrl || null,
        }));

        // Load credential types and lists
        try {
          setCredentialsLoading(true);
          const types: CredentialTypeResponse[] = await getListCredentialType();
          setCredentialTypes(types);
          const creds: TeacherCredentialResponse[] = await getListCredentialByTeacherId(id);
          
          // Convert to CredentialFormData format
          const loadedCredentials: CredentialFormData[] = creds.map(cred => ({
            id: cred.credentialId,
            credentialId: cred.credentialId,
            credentialTypeId: cred.credentialTypeId,
            pictureUrl: cred.pictureUrl,
            name: cred.name,
            level: cred.level || "A1"
          }));
          setCredentials(loadedCredentials);
        } catch {
          setCredentials([]);
        } finally {
          setCredentialsLoading(false);
        }
      } catch (err) {
        setError(`Failed to load teacher data`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 mx-auto mt-16">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mx-auto mt-16">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teacher</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="secondary" size="sm">Try Again</Button>
        </div>
      </div>
    );
  }

  // Memoized textarea component to prevent re-creation on each render
  const Textarea = React.memo(({
    value,
    onChange,
    ...props
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      value={value}
      onChange={onChange}
      disabled={!isEditing}
      className={`w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[96px] ${
        props.className || ""
      } ${!isEditing ? "bg-gray-50" : ""}`}
      {...props}
    />
  ));

  return (
    <div className="sm:p-6">
      <Breadcrumbs items={crumbs} />

      {/* Header aligned with Student profile */}
      <div className="mb-4">
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-bold text-gray-900"></h1>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={onSave} variant="secondary" size="sm" disabled={Object.values(errors).some((e) => e && e !== "")}> 
                  <div className="flex items-center ">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Save
                  </div>
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="danger" size="sm">
                  <div className="flex items-center ">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Cancel
                  </div>
                </Button>
              </>
            ) : (
              <Button onClick={onToggleEdit} variant="secondary" size="sm">
                <div className="flex items-center ">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Profile
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main layout: Left avatar, Right info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center py-4">
              <div className="relative w-50 h-50 mx-auto mb-3 group">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md hover:shadow-lg transition-all duration-300">
                  {avatarUrl ? (
                    <img
                      src={getAvatarUrl(avatarUrl)}
                      alt={profile.fullName}
                      className="w-full h-full object-cover transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-indigo-600 transition-colors" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onUpload}
                      className="hidden"
                      id="teacher-avatar-upload"
                    />
                    <label
                      htmlFor="teacher-avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md border-2 border-white"
                      title="Change avatar"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </label>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{profile.fullName}</h2>
              {profile.teacherCode && (
                <div
                  className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 mx-auto max-w-fit hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => navigator.clipboard.writeText(profile.teacherCode || "")}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span className="font-mono">{profile.teacherCode}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              {isEditing && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Button onClick={onRemoveAvatar} disabled={!avatarUrl} size="sm" variant="secondary">
                    Remove Avatar
                  </Button>
                </div>
              )}
              {/* Editable block under avatar */}
              <div className="mt-5 text-left p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Years of Experience</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={String(profile.yearsExperience ?? 0)}
                        onChange={(e) => onChange("yearsExperience")(e as any)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 font-medium">{profile.yearsExperience ?? 0}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profile.bio || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProfile((p) => ({ ...p, bio: v }));
                        }}
                        className="w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[96px]"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap">{profile.bio || "N/A"}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Credentials section - only show in view mode */}
              {!isEditing && (
                <>
                  <div className="mt-5 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Certificates
                    </h3>
                    {credentialsLoading ? (
                      <div className="py-2 text-sm text-gray-500">Loading...</div>
                    ) : credentials.filter(c => {
                      const type = credentialTypes.find(t => t.id === c.credentialTypeId);
                      return type?.name === "Certificate";
                    }).length > 0 ? (
                      <div className="space-y-3">
                        {credentials.filter(c => {
                          const type = credentialTypes.find(t => t.id === c.credentialTypeId);
                          return type?.name === "Certificate";
                        }).map((c) => (
                          <div 
                            key={c.id} 
                            className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white"
                          >
                            {/* Info side - LEFT */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{c.name || "Certificate"}</p>
                              {c.level && (
                                <p className="text-xs text-emerald-600 mt-1">{c.level}</p>
                              )}
                            </div>
                            
                            {/* Image side - RIGHT */}
                            <div className="flex-shrink-0 relative group">
                              {c.pictureUrl ? (
                                <div className="relative">
                                  <img 
                                    src={getCredentialImageUrl(c.pictureUrl)} 
                                    alt={c.name || "Certificate"} 
                                    className="w-24 h-24 min-w-[96px] min-h-[96px] object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-emerald-400 transition-all shadow-md bg-white"
                                    style={{ 
                                      display: 'block',
                                      maxWidth: '96px',
                                      maxHeight: '96px',
                                      width: 'auto',
                                      height: 'auto',
                                      backgroundColor: 'white'
                                    }}
                                    onClick={() => {
                                      if (c.pictureUrl) {
                                        setViewingImage({ url: getCredentialImageUrl(c.pictureUrl), name: c.name || 'Certificate' });
                                      }
                                    }}
                                    onLoad={(e) => {
                                      // Ensure image is visible
                                      const img = e.currentTarget;
                                      img.style.opacity = '1';
                                      img.style.visibility = 'visible';
                                      img.style.backgroundColor = 'white';
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                  <div 
                                    className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center pointer-events-none rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                  <Award className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No certificates available</p>
                    )}
                  </div>
                  <div className="mt-4 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-green-700" />
                      Qualifications
                    </h3>
                    {credentialsLoading ? (
                      <div className="py-2 text-sm text-gray-500">Loading...</div>
                    ) : credentials.filter(c => {
                      const type = credentialTypes.find(t => t.id === c.credentialTypeId);
                      return type?.name === "Qualification";
                    }).length > 0 ? (
                      <div className="space-y-3">
                        {credentials.filter(c => {
                          const type = credentialTypes.find(t => t.id === c.credentialTypeId);
                          return type?.name === "Qualification";
                        }).map((q) => (
                          <div 
                            key={q.id} 
                            className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all bg-white"
                          >
                            {/* Info side - LEFT */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{q.name || "Qualification"}</p>
                              {q.level && (
                                <p className="text-xs text-green-600 mt-1">{q.level}</p>
                              )}
                            </div>
                            
                            {/* Image side - RIGHT */}
                            <div className="flex-shrink-0 relative group">
                              {q.pictureUrl ? (
                                <div className="relative">
                                  <img 
                                    src={getCredentialImageUrl(q.pictureUrl)} 
                                    alt={q.name || "Qualification"} 
                                    className="w-24 h-24 min-w-[96px] min-h-[96px] object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-400 transition-all shadow-md bg-white"
                                    style={{ 
                                      display: 'block',
                                      maxWidth: '96px',
                                      maxHeight: '96px',
                                      width: 'auto',
                                      height: 'auto',
                                      backgroundColor: 'white'
                                    }}
                                    onClick={() => {
                                      if (q.pictureUrl) {
                                        setViewingImage({ url: getCredentialImageUrl(q.pictureUrl), name: q.name || 'Qualification' });
                                      }
                                    }}
                                    onLoad={(e) => {
                                      // Ensure image is visible
                                      const img = e.currentTarget;
                                      img.style.opacity = '1';
                                      img.style.visibility = 'visible';
                                      img.style.backgroundColor = 'white';
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                  <div 
                                    className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center pointer-events-none rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                  <GraduationCap className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No qualifications available</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <>
                      <input
                        value={profile.fullName}
                        onChange={onChange("fullName")}
                        className={`w-full border rounded-md px-3 py-2 text-sm ${errors.fullName ? "border-red-500" : ""}`}
                        placeholder="Enter full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{profile.fullName || "N/A"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={profile.email || ""}
                        onChange={(e) => onChange("email")(e)}
                        onBlur={(e) => {
                          const v = e.target.value || "";
                          // Skip check if email hasn't changed (still original email)
                          if (v === originalEmail) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              if (newErrors.email === "Email already exists") {
                                delete newErrors.email;
                              }
                              return newErrors;
                            });
                            return; // Don't call API
                          }
                          // Only check exist if email format is valid and email has changed
                          if (!validateEmail(v)) {
                            void (async () => {
                              try {
                                const exists = await checkEmailExist(v);
                                // exists=true means unique/available → no error
                                // exists=false means already taken → show error
                                setErrors((prev) => ({ ...prev, email: exists ? "" : "Email already exists" }));
                              } catch {}
                            })();
                          }
                        }}
                        className={`w-full border rounded-md px-3 py-2 text-sm ${errors.email ? "border-red-500" : ""}`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </>
                  ) : (
                    <p
                      className="text-sm text-gray-900 font-medium truncate hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => window.open(`mailto:${profile.email || ""}`)}
                      title={profile.email || undefined}
                    >
                      {profile.email || "N/A"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  {isEditing ? (
                    <>
                      <input
                        value={profile.phoneNumber || ""}
                        onChange={(e) => onChange("phoneNumber")(e)}
                        className={`w-full border rounded-md px-3 py-2 text-sm ${errors.phone ? "border-red-500" : ""}`}
                        placeholder="Enter phone (e.g., 0123456789)"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                      )}
                    </>
                  ) : (
                    <p
                      className="text-sm text-gray-900 font-medium hover:text-green-600 transition-colors cursor-pointer"
                      onClick={() => (profile.phoneNumber || "") && window.open(`tel:${profile.phoneNumber}`)}
                    >
                      {profile.phoneNumber || "N/A"}
                    </p>
                  )}
                </div>
              </div>

              {/* CID */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">CID</label>
                  {isEditing ? (
                    <>
                      <input
                        value={profile.cid || ""}
                        onChange={(e) => onChange("cid")(e)}
                        onBlur={(e) => {
                          const v = (e.target.value || "").replace(/\D/g, "");
                          // Skip check if CID hasn't changed (still original CID)
                          if (v === originalCID) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              if (newErrors.cid === "CID already exists") {
                                delete newErrors.cid;
                              }
                              return newErrors;
                            });
                            return; // Don't call API
                          }
                          // Only check exist if CID format is valid and CID has changed
                          if (!validateCID(v)) {
                            void (async () => {
                              try {
                                const exists = await checkCIDExist(v);
                                // exists=true means unique/available → no error
                                // exists=false means already taken → show error
                                setErrors((prev) => ({ ...prev, cid: exists ? "" : "CID already exists" }));
                              } catch {}
                            })();
                          }
                        }}
                        className={`w-full border rounded-md px-3 py-2 text-sm font-mono ${errors.cid ? "border-red-500" : ""}`}
                        maxLength={12}
                        placeholder="Enter 12-digit CID"
                      />
                      {errors.cid && (
                        <p className="mt-1 text-xs text-red-600">{errors.cid}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium font-mono">{profile.cid || "N/A"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <>
                      <input
                        type="date"
                        value={profile.dateOfBirth || ""}
                        onChange={(e) => onChange("dateOfBirth")(e)}
                        className={`w-full border rounded-md px-3 py-2 text-sm ${errors.dob ? "border-red-500" : ""}`}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {errors.dob && (
                        <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{profile.dateOfBirth || "N/A"}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      value={profile.address || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setProfile((p) => ({ ...p, address: v }));
                      }}
                      className="w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[96px]"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap">{profile.address || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Teacher Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Teacher Code</label>
                  <p className="text-sm text-gray-900 font-medium font-mono">{profile.teacherCode || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Credentials & Qualifications - Edit Mode */}
          {isEditing && (
            <Card title="Credentials & Qualifications">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Credentials & Qualifications</h3>
                </div>
                <Button
                  onClick={addCredential}
                  variant="secondary"
                  iconLeft={<Plus className="w-4 h-4" />}
                >
                  Add Credential
                </Button>
              </div>
              
              <div className="space-y-4">
                {credentials.map((cred, index) => {
                  const credentialType = credentialTypes.find(type => type.id === cred.credentialTypeId);
                  const isCertificate = credentialType?.name === 'Certificate';
                  const bgColor = isCertificate ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
                  const iconBg = isCertificate ? 'bg-blue-100' : 'bg-green-100';
                  const iconColor = isCertificate ? 'text-blue-600' : 'text-green-600';
                  
                  return (
                    <div key={cred.id} className={`p-6 border rounded-lg space-y-4 ${bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                            <GraduationCap className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {credentialType?.name || 'Credential'} {index + 1}
                            </span>
                            <p className="text-sm text-gray-500">
                              {credentialType?.name || 'Professional credential'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeCredential(cred.id)}
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Select
                            label="Credential Type *"
                            value={cred.credentialTypeId}
                            onChange={(e) => updateCredential(cred.id, 'credentialTypeId', e.target.value)}
                            options={credentialTypes.map(type => ({ label: type.name, value: type.id }))}
                          />
                          {errors[`credential_${index}_type`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`credential_${index}_type`]}</p>
                          )}
                        </div>
                        <Input
                          label="Name *"
                          placeholder="e.g., IELTS Certificate"
                          value={cred.name || ""}
                          onChange={(e) => updateCredential(cred.id, 'name', e.target.value)}
                          error={errors[`credential_${index}_name`]}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Level *"
                          value={cred.level || 'A1'}
                          onChange={(e) => updateCredential(cred.id, 'level', e.target.value)}
                          options={[
                            { label: 'A1', value: 'A1' },
                            { label: 'A2', value: 'A2' },
                            { label: 'B1', value: 'B1' },
                            { label: 'B2', value: 'B2' },
                            { label: 'C1', value: 'C1' },
                            { label: 'C2', value: 'C2' }
                          ]}
                          error={errors[`credential_${index}_level`]}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credential Image
                          </label>
                          <div className="flex items-center gap-3">
                            {cred.pictureUrl ? (
                              <div className="flex items-center gap-3 flex-1">
                                <div className="relative flex-shrink-0">
                                  <img 
                                    key={`cred-img-${cred.id}-${cred.pictureUrl?.substring(0, 20)}`}
                                    src={getCredentialImageUrl(cred.pictureUrl)} 
                                    alt="Credential preview" 
                                    className="w-32 h-32 min-w-[128px] min-h-[128px] object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-primary-400 transition-all shadow-md bg-white"
                                    style={{ 
                                      display: 'block',
                                      maxWidth: '128px',
                                      maxHeight: '128px',
                                      width: 'auto',
                                      height: 'auto',
                                      backgroundColor: 'white'
                                    }}
                                    onClick={() => setViewingImage({ url: getCredentialImageUrl(cred.pictureUrl), name: cred.name || 'Credential' })}
                                    onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EFailed to load%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={() => setViewingImage({ url: getCredentialImageUrl(cred.pictureUrl), name: cred.name || 'Credential' })}
                                    variant="secondary"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    onClick={() => updateCredential(cred.id, 'pictureUrl', '')}
                                    variant="secondary"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (!file.type.startsWith('image/')) {
                                        setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "Please select an image file" }));
                                        return;
                                      }
                                      
                                      if (file.size > 5 * 1024 * 1024) {
                                        setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "File size must be less than 5MB" }));
                                        return;
                                      }
                                      
                                      setCredentials(prev => prev.map(c => 
                                        c.id === cred.id ? { ...c, imageFile: file } : c
                                      ));
                                      
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const localPreview = event.target?.result as string;
                                        if (localPreview && localPreview.startsWith('data:image')) {
                                          updateCredential(cred.id, 'pictureUrl', localPreview);
                                        } else {
                                          setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "Failed to read image file" }));
                                        }
                                      };
                                      reader.onerror = () => {
                                        setErrors(prev => ({ ...prev, [`credential_${index}_pictureUrl`]: "Failed to read image file" }));
                                      };
                                      reader.readAsDataURL(file);
                                      
                                      setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors[`credential_${index}_pictureUrl`];
                                        return newErrors;
                                      });
                                    }
                                  }}
                                  className="hidden"
                                  id={`credential-image-${cred.id}`}
                                />
                                <label
                                  htmlFor={`credential-image-${cred.id}`}
                                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span className="text-sm">Upload Image</span>
                                </label>
                              </div>
                            )}
                          </div>
                          {errors[`credential_${index}_pictureUrl`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`credential_${index}_pictureUrl`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {credentials.length === 0 && (
                  <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-200">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No credentials added yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Add professional certificates, degrees, and qualifications</p>
                    <Button
                      onClick={addCredential}
                      variant="secondary"
                      iconLeft={<Plus className="w-4 h-4" />}
                    >
                      Add First Credential
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
          
        </div>
      </div>

      {/* Image View Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">{viewingImage.name}</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <img 
                src={viewingImage.url} 
                alt={viewingImage.name}
                className="w-full h-auto rounded-lg shadow-lg bg-white object-contain max-h-[70vh] mx-auto"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
