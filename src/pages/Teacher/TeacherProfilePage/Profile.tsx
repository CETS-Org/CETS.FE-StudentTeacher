import React, { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Crumb } from "@/components/ui/Breadcrumbs";
import {
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
} from "lucide-react";

const crumbs: Crumb[] = [{ label: "Profile" }];

export default function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // mock state
  const [profile, setProfile] = useState({
    fullName: "Joe Johnson",
    dob: "1995-03-15",
    email: "joe.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Apt 4B\nNew York, NY 10001\nUnited States",
    teacherCode: "INT-2025-001234",
    years: "4",
    bio:
      "I have over 5 years of experience teaching English, specializing in IELTS and academic writing. I have helped more than 200 students achieve their target band scores, with a focus on practical strategies and confidence building. My teaching style is interactive and student-centered, encouraging learners to actively participate and apply their knowledge in real-life situations.",
    certs: ["TESOL Certificate", "IELTS Trainer Certification", "CELTA"],
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const onChange =
    (key: keyof typeof profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile((p) => ({ ...p, [key]: e.target.value }));
    };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  };

  const onRemoveAvatar = () => setAvatarUrl(null);
  const onToggleEdit = () => setIsEditing((s) => !s);

  const onSave = () => {
    // TODO: call API
    setIsEditing(false);
  };

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      disabled={!isEditing}
      className={`w-full border rounded-md px-3 py-2 text-sm ${
        props.className || ""
      } ${!isEditing ? "bg-gray-50" : ""}`}
    />
  );

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
    <div className="p-6 max-w-full space-y-8">
      <Breadcrumbs items={crumbs} />
    
      <div className="p-4 md:p-6 mx-6 md:mx-48">
        {/* Page Title */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <User2 className="w-6 h-6 text-neutral-700" />
              <h1 className="text-xl font-semibold">Teacher Profile</h1>
            </div>
          </div>

          {/* EDIT BUTTON — icon + text cùng hàng */}
          <Button
            onClick={onToggleEdit}
            iconLeft={<Edit3 className="w-4 h-4" />}
            size="md"
            variant="primary"
            className="px-4 py-2 font-medium bg-sky-500 hover:bg-sky-600 text-white"
            >
            {isEditing ? "Stop Editing" : "Edit Profile"}
          </Button>

        </div>

        {/* Profile Picture */}
        <Card className="mb-6 border border-gray-200 shadow-md ">
          <div className="p-4">
            
            <div className="flex items-center gap-4">
              <div className="relative ">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border "
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-neutral-200 grid place-content-center border ">
                    <User2 className="w-8 h-8 text-neutral-500" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-white border rounded-full p-1">
                  <Camera className="w-4 h-4" />
                </span>
              </div>

             {isEditing && (
                <div className="flex flex-wrap gap-2">
                    {/* UPLOAD BUTTON */}
                    <label
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-neutral-800 text-white hover:bg-neutral-900 cursor-pointer"
                    >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                    />
                    <Camera className="w-4 h-4" />
                    <span>Upload New</span>
                    </label>

                    {/* REMOVE BUTTON */}
                    <Button
                    onClick={onRemoveAvatar}
                    disabled={!avatarUrl}
                    iconLeft={<Trash2 className="w-4 h-4" />}
                    size="md"
                    variant="primary"
                    >
                    Remove
                    </Button>
                </div>
                )}
            </div>
          </div>
        

        {/* Personal Information */}
        
          <div className="p-4 ">
            <h3 className="font-medium mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <User2 className="w-3.5 h-3.5" />
                  Full Name
                </label>
                <Input value={profile.fullName} onChange={onChange("fullName")} className="border border-gray-200"/>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Date of Birth
                </label>
                <Input type="date" value={profile.dob} onChange={onChange("dob")} className="border border-gray-200" />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <Input type="email" value={profile.email} onChange={onChange("email")} className="border border-gray-200" />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </label>
                <Input value={profile.phone} onChange={onChange("phone")} className="border border-gray-200" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Address
                </label>
                <Textarea value={profile.address} onChange={onChange("address")} className="border border-gray-200" />
              </div>
            </div>
          </div>
       

        {/* Teacher Information */}
        
          <div className="p-4">
            <h3 className="font-medium mb-4">Teacher Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <IdCard className="w-3.5 h-3.5" />
                  Teacher Code
                </label>
                <Input value={profile.teacherCode} onChange={onChange("teacherCode")} readOnly  className="border border-gray-200" />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <BookOpenCheck className="w-3.5 h-3.5" />
                  Years of Experience
                </label>
                <Input type="number" min={0} value={profile.years} onChange={onChange("years")} className="border border-gray-200" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  Bio
                </label>
                <Textarea value={profile.bio} onChange={onChange("bio")} className="border border-gray-200" />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-neutral-500 flex items-center gap-1 mb-2">
                  <Award className="w-3.5 h-3.5" />
                  Certificates
                </label>

                <div className="space-y-2">
                  {profile.certs.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2 bg-neutral-50 border border-gray-200"
                    >
                      <span className="text-sm">{c}</span>
                      {isEditing && (
                        <button
                          onClick={() =>
                            setProfile((p) => ({
                              ...p,
                              certs: p.certs.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="inline-flex items-center gap-1 text-red-600 text-sm hover:underline"
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        placeholder="Add certificate..."
                        className="flex-1 border rounded-md px-3 py-2 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setProfile((p) => ({ ...p, certs: [...p.certs, val] }));
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      {/* ADD BUTTON */}
                      <Button className="inline-flex items-center gap-2 bg-neutral-800 text-white hover:bg-neutral-900 px-3 py-2 rounded-md">
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions */}
           <div className="mt-6 flex justify-end gap-2">
                {isEditing && (
                    <>
                    {/* CANCEL BUTTON */}
                    <Button
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center gap-2 bg-white border hover:bg-neutral-50 px-4 py-2 rounded-md"
                    >
                        Cancel
                    </Button>

                    {/* SAVE BUTTON */}
                    <Button
                        onClick={onSave}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-sky-500 hover:bg-sky-600 text-white"
                    >
                        Save Changes
                    </Button>
                    </>
                )}
            </div>
          </div>
        </Card>
      </div>
     
    </div>
  );
}
