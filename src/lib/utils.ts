import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
}