import type { Account } from "./account.type";

// export interface TeacherCredential {
//   id: string;
//     credentialTypeId: string;
//     pictureUrl: string | null;
//     name: string | null;
//     level: string | null;
//     degree: string;
//     institution: string;
//     year: string;
//     field: string;
//     createdAt: string;
//     updatedAt: string | null;
//     isDeleted: boolean;
//   }

export interface TeacherCredentialResponse {
  credentialId: string;
  credentialTypeId: string;
  teacherId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
  createdAt: string;
  updatedAt: string | null;
}
  
  export interface TeacherInfo {
    teacherId: string;
    teacherCode: string;
    yearsExperience: number;
    bio: string;
    createdAt: string;
    updatedAt: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
    accountId: string;
    email: string;
    phoneNumber: string | null;
    fullName: string;
    dateOfBirth: string | null;
    cid: string | null;
    address: string | null;
    avatarUrl: string | null;
    accountStatusID: string;
    isVerified: boolean;
    verifiedCode: string | null;
    verifiedCodeExpiresAt: string | null;
    accountCreatedAt: string;
    accountUpdatedAt: string | null;
    accountUpdatedBy: string | null;
    accountIsDeleted: boolean;
    teacherCredentials: TeacherCredentialResponse[];
  }
  
export interface Teacher extends Account {
  teacherInfo: TeacherInfo | null;
}
export interface CourseTeaching {
  courseId: string;
  courseCode: string | null;
  courseName: string | null;
  description: string | null;
  courseImageUrl: string | null;
  categoryName: string | null;
  courseLevelName: string | null;
  courseFormatName: string | null;
  studentCount: number  ;
  assignedAt: string ;
}
    
export interface UpdateTeacherProfile {
  teacherCode: string | null;
  email: string | null;
  phoneNumber: string | null;
  yearsExperience: number;
  fullName: string ;
  dateOfBirth: string;
  cid: string | null;
  address: string | null;
  avatarUrl: string | null;
  bio: string | null;
  credentials: {
    credentialId?: string;
    credentialTypeId: string;
    pictureUrl: string | null;
    name: string | null;
    level: string | null;
  }[] | null;
}

export interface AddTeacherCredential {
  credentialTypeId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
}

export interface AddTeacherProfile {
  email: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  cid: string;
  address: string | null;
  avatarUrl: string | null;
  yearsExperience: number;
  bio: string | null;
  credentials: AddTeacherCredential[];
}

export interface CredentialTypeResponse {
  id: string;
  name: string;
  code: string;
}