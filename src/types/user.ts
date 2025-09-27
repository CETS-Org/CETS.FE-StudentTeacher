// User-related types and interfaces

export interface UserInfo {
  id: string;
  email: string;
  fullName?: string;
  roleNames: string[];
  isVerified?: boolean;
  avatarUrl?: string;
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  account: UserInfo;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface GoogleAuthData {
  email: string;
  fullName: string;
  picture: string;
  googleId: string;
}
