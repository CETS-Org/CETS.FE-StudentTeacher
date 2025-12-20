import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/card";
import Button from "@/components/ui/Button";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import Loader from "@/components/ui/Loader";
import { getUserInfo } from "@/lib/utils";
import { getTeacherById, getListCredentialType, getListCredentialByTeacherId, updateTeacher } from "@/api/teacher.api";
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
} from "lucide-react";

const crumbs: Crumb[] = [{ label: "Profile" }];

export default function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userInfo = getUserInfo();
  const id = userInfo?.id || null;
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeResponse[]>([]);
  const [certificates, setCertificates] = useState<TeacherCredentialResponse[]>([]);
  const [qualifications, setQualifications] = useState<TeacherCredentialResponse[]>([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailCheckTimer, setEmailCheckTimer] = useState<number | null>(null);
  const [cidCheckTimer, setCidCheckTimer] = useState<number | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>(""); // Store original email to skip check if unchanged
  const [originalCID, setOriginalCID] = useState<string>(""); // Store original CID to skip check if unchanged
  const [newCertName, setNewCertName] = useState("");
  const [newCertLevel, setNewCertLevel] = useState("");

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
    credentials: null,
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
      } else if (key === "address") {
        setProfile((p) => ({ ...p, address: v }));
      } else if (key === "bio") {
        setProfile((p) => ({ ...p, bio: v }));
      } else if (key === "fullName") {
        setProfile((p) => ({ ...p, fullName: v }));
        // Real-time validation for full name
        validateField("fullName", v);
      }
    };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  };

  const onRemoveAvatar = () => setAvatarUrl(null);
  const onToggleEdit = () => {
    if (!isEditing) {
      // starting edit: clear temp certificate inputs
      setNewCertName("");
      setNewCertLevel("");
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

  const onSave = async () => {
    if (!id) return;
    // validate all fields
    const newErrors: Record<string, string> = {};
    const e1 = validateFullName(profile.fullName); if (e1) newErrors.fullName = e1;
    const e2 = validateEmail(profile.email || ""); if (e2) newErrors.email = e2;
    const e3 = validatePhone(profile.phoneNumber || null); if (e3) newErrors.phone = e3;
    const e4 = validateDateOfBirth(profile.dateOfBirth || null); if (e4) newErrors.dob = e4;
    const e5 = validateCID(profile.cid || null); if (e5) newErrors.cid = e5;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updateTeacher(id, profile);
      const fresh = await getTeacherById(id);
      setAvatarUrl(fresh.avatarUrl || null);
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
        credentials: null,
      }));
      // reload credentials lists
      try {
        setCredentialsLoading(true);
        const types: CredentialTypeResponse[] = await getListCredentialType();
        setCredentialTypes(types);
        const creds: TeacherCredentialResponse[] = await getListCredentialByTeacherId(id);
        const certificateType = types.find((t) => t.name === "Certificate");
        const qualificationType = types.find((t) => t.name === "Qualification");
        const certList = creds.filter((c) => certificateType && c.credentialTypeId === certificateType.id);
        const qualList = creds.filter((c) => qualificationType && c.credentialTypeId === qualificationType.id);
        setCertificates(certList);
        setQualifications(qualList);
      } finally {
        setCredentialsLoading(false);
      }
      setIsEditing(false);
      setNewCertName("");
      setNewCertLevel("");
    } catch (err) {
      setError("Failed to update teacher profile");
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
          const certificateType = types.find((t) => t.name === "Certificate");
          const qualificationType = types.find((t) => t.name === "Qualification");
          const certList = creds.filter((c) => certificateType && c.credentialTypeId === certificateType.id);
          const qualList = creds.filter((c) => qualificationType && c.credentialTypeId === qualificationType.id);
          setCertificates(certList);
          setQualifications(qualList);
        } catch {
          setCertificates([]);
          setQualifications([]);
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

  const Textarea = (
    props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
  ) => (
    <textarea
      {...props}
      disabled={!isEditing}
      className={`w-full border rounded-md px-3 py-2 text-sm resize-y min-h-[96px] ${
        props.className || ""
      } ${!isEditing ? "bg-gray-50" : ""}`}
    />
  );

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
                      src={avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover transition-transform duration-300"
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
                      <Textarea value={profile.bio || ""} onChange={onChange("bio") as any} />
                    ) : (
                      <p className="text-sm text-gray-900 font-medium whitespace-pre-wrap">{profile.bio || "N/A"}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Certificates under avatar */}
              <div className="mt-5 text-left">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Certificates
                </h3>
                {credentialsLoading ? (
                  <div className="py-2 text-sm text-gray-500">Loading...</div>
                ) : certificates.length > 0 ? (
                  <ul className="space-y-2">
                    {certificates.map((c) => (
                      <li key={c.credentialId} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800 truncate">{c.name || `Certificate - ${formatDate(c.createdAt)}`}</p>
                          {c.level && (
                            <p className="text-xs text-emerald-700">{c.level}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No certificates available</p>
                )}
                {isEditing && (
                  <div className="mt-3">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        placeholder="Certificate name"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      <input
                        value={newCertLevel}
                        onChange={(e) => setNewCertLevel(e.target.value)}
                        placeholder="Level (optional)"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={() => {
                            const certType = credentialTypes.find((t) => t.name === "Certificate");
                            if (!certType) return;
                            const name = newCertName.trim();
                            const level = newCertLevel.trim();
                            if (!name) return;
                            // add to payload credentials
                            setProfile((p) => ({
                              ...p,
                              credentials: [
                                ...(p.credentials || []),
                                { credentialTypeId: certType.id, pictureUrl: null, name, level: level || null },
                              ],
                            }));
                            // optimistic add to UI list
                            setCertificates((prev) => [
                              ...prev,
                              {
                                credentialId: `new-${Date.now()}`,
                                credentialTypeId: certType.id,
                                teacherId: id || "",
                                pictureUrl: null,
                                name,
                                level: level || null,
                                createdAt: new Date().toISOString(),
                                updatedAt: null,
                              },
                            ]);
                            setNewCertName("");
                            setNewCertLevel("");
                          }}
                          className="px-3 py-2"
                        >
                          Add Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Qualifications under avatar */}
              <div className="mt-4 text-left">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-700" />
                  Qualifications
                </h3>
                {credentialsLoading ? (
                  <div className="py-2 text-sm text-gray-500">Loading...</div>
                ) : qualifications.length > 0 ? (
                  <ul className="space-y-2">
                    {qualifications.map((q) => (
                      <li key={q.credentialId} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800 truncate">{q.name || `Qualification - ${formatDate(q.createdAt)}`}</p>
                          {q.level && (
                            <p className="text-xs text-green-700">{q.level}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No qualifications available</p>
                )}
              </div>
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
                    <Textarea value={profile.address || ""} onChange={(e) => onChange("address")(e as any)} />
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
          
        </div>
      </div>
    </div>
  );
}
