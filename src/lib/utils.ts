import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserInfo } from "@/types/user"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// JWT Token utilities
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function isTokenValid(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Basic JWT token validation (check if it's not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export function clearAuthData(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  // Dispatch event to notify components (e.g., navbar) to clear state
  window.dispatchEvent(new Event('auth:logout'));
}

// User information utilities
export function getUserInfo(): UserInfo | null {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
}

export function getTeacherId(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.id || null;
}

export function getUserEmail(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.email || null;
}

export function getUserRole(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.roleNames?.[0] || null; 
}

export function getUserPhone(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.phoneNumber || null;
}

export function getStudentId(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.id || null;
}

// Update user info in localStorage and notify listeners to refresh UI (e.g., header avatar)
export function setUserInfo(partial: Partial<UserInfo>): void {
  try {
    const current = getUserInfo() || ({} as UserInfo);
    const next = { ...current, ...partial } as UserInfo;
    localStorage.setItem('userInfo', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('userInfoUpdated'));
  } catch (error) {
    console.error('Failed to set user info:', error);
  }
}