#!/usr/bin/env node

/**
 * Base files setup script for the new frontend project
 * This script creates all base files and structures
 */

const fs = require('fs');
const path = require('path');

console.log('📁 Setting up base files and structure...');

// Design tokens
function createDesignTokens() {
    const designTokens = `/**
 * Design Tokens for Frontend App
 * Based on the design document specifications
 */

// Color Palette - Using OKLCH color space for better perceptual uniformity
export const colors = {
    // Primary Colors
    primary: {
        50: 'oklch(0.95 0.05 241.966)',
        100: 'oklch(0.9 0.08 241.966)',
        200: 'oklch(0.8 0.12 241.966)',
        300: 'oklch(0.7 0.14 241.966)',
        400: 'oklch(0.6 0.16 241.966)',
        500: 'oklch(0.588 0.158 241.966)', // Primary Blue #2563eb
        600: 'oklch(0.5 0.134 242.749)',   // Primary Blue Dark #1d4ed8
        700: 'oklch(0.45 0.12 242.749)',
        800: 'oklch(0.4 0.1 242.749)',
        900: 'oklch(0.35 0.08 242.749)',
    },

    // Secondary Colors
    success: {
        50: 'oklch(0.95 0.05 149.214)',
        100: 'oklch(0.9 0.08 149.214)',
        200: 'oklch(0.8 0.12 149.214)',
        300: 'oklch(0.7 0.15 149.214)',
        400: 'oklch(0.65 0.17 149.214)',
        500: 'oklch(0.627 0.194 149.214)', // Success Green #16a34a
        600: 'oklch(0.55 0.18 149.214)',
        700: 'oklch(0.5 0.16 149.214)',
        800: 'oklch(0.45 0.14 149.214)',
        900: 'oklch(0.4 0.12 149.214)',
    },

    warning: {
        50: 'oklch(0.95 0.05 81.533)',
        100: 'oklch(0.9 0.08 81.533)',
        200: 'oklch(0.85 0.12 81.533)',
        300: 'oklch(0.8 0.16 81.533)',
        400: 'oklch(0.75 0.2 81.533)',
        500: 'oklch(0.698 0.244 81.533)', // Warning Orange #ea580c
        600: 'oklch(0.65 0.22 81.533)',
        700: 'oklch(0.6 0.2 81.533)',
        800: 'oklch(0.55 0.18 81.533)',
        900: 'oklch(0.5 0.16 81.533)',
    },

    error: {
        50: 'oklch(0.95 0.05 25.331)',
        100: 'oklch(0.9 0.08 25.331)',
        200: 'oklch(0.85 0.12 25.331)',
        300: 'oklch(0.8 0.15 25.331)',
        400: 'oklch(0.7 0.18 25.331)',
        500: 'oklch(0.628 0.207 25.331)', // Error Red #dc2626
        600: 'oklch(0.55 0.18 25.331)',
        700: 'oklch(0.5 0.16 25.331)',
        800: 'oklch(0.45 0.14 25.331)',
        900: 'oklch(0.4 0.12 25.331)',
    },

    info: {
        50: 'oklch(0.95 0.05 241.966)',
        100: 'oklch(0.9 0.08 241.966)',
        200: 'oklch(0.85 0.12 241.966)',
        300: 'oklch(0.8 0.15 241.966)',
        400: 'oklch(0.7 0.18 241.966)',
        500: 'oklch(0.628 0.207 241.966)', // Info Blue #0ea5e9
        600: 'oklch(0.55 0.18 241.966)',
        700: 'oklch(0.5 0.16 241.966)',
        800: 'oklch(0.45 0.14 241.966)',
        900: 'oklch(0.4 0.12 241.966)',
    },

    // Neutral Colors
    gray: {
        50: 'oklch(0.975 0.003 286.052)',
        100: 'oklch(0.95 0.005 286.052)',
        200: 'oklch(0.9 0.01 286.052)',
        300: 'oklch(0.85 0.015 286.052)',
        400: 'oklch(0.7 0.02 286.052)',
        500: 'oklch(0.55 0.025 286.052)',
        600: 'oklch(0.45 0.02 286.052)',
        700: 'oklch(0.35 0.015 286.052)',
        800: 'oklch(0.25 0.01 286.052)',
        900: 'oklch(0.15 0.005 286.052)',
    },
};

// Semantic Colors (Light Theme)
export const semanticColors = {
    light: {
        background: {
            primary: colors.gray[50],
            secondary: 'white',
            tertiary: colors.gray[100],
        },
        text: {
            primary: colors.gray[900],
            secondary: colors.gray[700],
            tertiary: colors.gray[500],
            inverse: 'white',
        },
        border: {
            primary: colors.gray[200],
            secondary: colors.gray[300],
        },
    },
    dark: {
        background: {
            primary: colors.gray[900],
            secondary: colors.gray[800],
            tertiary: colors.gray[700],
        },
        text: {
            primary: 'white',
            secondary: colors.gray[300],
            tertiary: colors.gray[400],
            inverse: colors.gray[900],
        },
        border: {
            primary: colors.gray[700],
            secondary: colors.gray[600],
        },
    },
};

// Typography
export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    },
    fontSize: {
        display: '3rem',    // 48px
        h1: '2.25rem',      // 36px
        h2: '1.875rem',     // 30px
        h3: '1.5rem',       // 24px
        h4: '1.25rem',      // 20px
        h5: '1.125rem',     // 18px
        h6: '1rem',         // 16px
        'body-large': '1.125rem', // 18px
        body: '1rem',       // 16px
        'body-small': '0.875rem', // 14px
        caption: '0.75rem', // 12px
    },
    lineHeight: {
        display: '1.1',
        h1: '1.2',
        h2: '1.3',
        h3: '1.4',
        h4: '1.4',
        h5: '1.5',
        h6: '1.5',
        'body-large': '1.6',
        body: '1.6',
        'body-small': '1.5',
        caption: '1.4',
    },
    fontWeight: {
        display: '700',
        h1: '700',
        h2: '600',
        h3: '600',
        h4: '600',
        h5: '600',
        h6: '600',
        'body-large': '400',
        body: '400',
        'body-small': '400',
        caption: '400',
    },
};

// Spacing
export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
};

// Border Radius
export const borderRadius = {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
};

// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Z-Index
export const zIndex = {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    'skip-link': '1600',
    toast: '1700',
    tooltip: '1800',
};

// Animation
export const animation = {
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    easing: {
        linear: 'linear',
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
};

// Breakpoints
export const breakpoints = {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
};`;
    
    fs.writeFileSync('src/lib/design-tokens.ts', designTokens);
    console.log('✅ Created design-tokens.ts');
}

// Design system CSS
function createDesignSystemCSS() {
    const designSystemCSS = `/**
 * Design System CSS Variables
 * This file defines all CSS custom properties used throughout the application
 */

:root {
  /* Color Variables - Light Theme */
  --color-primary-50: oklch(0.95 0.05 241.966);
  --color-primary-100: oklch(0.9 0.08 241.966);
  --color-primary-200: oklch(0.8 0.12 241.966);
  --color-primary-300: oklch(0.7 0.14 241.966);
  --color-primary-400: oklch(0.6 0.16 241.966);
  --color-primary-500: oklch(0.588 0.158 241.966);
  --color-primary-600: oklch(0.5 0.134 242.749);
  --color-primary-700: oklch(0.45 0.12 242.749);
  --color-primary-800: oklch(0.4 0.1 242.749);
  --color-primary-900: oklch(0.35 0.08 242.749);

  --color-success-50: oklch(0.95 0.05 149.214);
  --color-success-100: oklch(0.9 0.08 149.214);
  --color-success-200: oklch(0.8 0.12 149.214);
  --color-success-300: oklch(0.7 0.15 149.214);
  --color-success-400: oklch(0.65 0.17 149.214);
  --color-success-500: oklch(0.627 0.194 149.214);
  --color-success-600: oklch(0.55 0.18 149.214);
  --color-success-700: oklch(0.5 0.16 149.214);
  --color-success-800: oklch(0.45 0.14 149.214);
  --color-success-900: oklch(0.4 0.12 149.214);

  --color-warning-50: oklch(0.95 0.05 81.533);
  --color-warning-100: oklch(0.9 0.08 81.533);
  --color-warning-200: oklch(0.85 0.12 81.533);
  --color-warning-300: oklch(0.8 0.16 81.533);
  --color-warning-400: oklch(0.75 0.2 81.533);
  --color-warning-500: oklch(0.698 0.244 81.533);
  --color-warning-600: oklch(0.65 0.22 81.533);
  --color-warning-700: oklch(0.6 0.2 81.533);
  --color-warning-800: oklch(0.55 0.18 81.533);
  --color-warning-900: oklch(0.5 0.16 81.533);

  --color-error-50: oklch(0.95 0.05 25.331);
  --color-error-100: oklch(0.9 0.08 25.331);
  --color-error-200: oklch(0.85 0.12 25.331);
  --color-error-300: oklch(0.8 0.15 25.331);
  --color-error-400: oklch(0.7 0.18 25.331);
  --color-error-500: oklch(0.628 0.207 25.331);
  --color-error-600: oklch(0.55 0.18 25.331);
  --color-error-700: oklch(0.5 0.16 25.331);
  --color-error-800: oklch(0.45 0.14 25.331);
  --color-error-900: oklch(0.4 0.12 25.331);

  --color-info-50: oklch(0.95 0.05 241.966);
  --color-info-100: oklch(0.9 0.08 241.966);
  --color-info-200: oklch(0.85 0.12 241.966);
  --color-info-300: oklch(0.8 0.15 241.966);
  --color-info-400: oklch(0.7 0.18 241.966);
  --color-info-500: oklch(0.628 0.207 241.966);
  --color-info-600: oklch(0.55 0.18 241.966);
  --color-info-700: oklch(0.5 0.16 241.966);
  --color-info-800: oklch(0.45 0.14 241.966);
  --color-info-900: oklch(0.4 0.12 241.966);

  --color-gray-50: oklch(0.975 0.003 286.052);
  --color-gray-100: oklch(0.95 0.005 286.052);
  --color-gray-200: oklch(0.9 0.01 286.052);
  --color-gray-300: oklch(0.85 0.015 286.052);
  --color-gray-400: oklch(0.7 0.02 286.052);
  --color-gray-500: oklch(0.55 0.025 286.052);
  --color-gray-600: oklch(0.45 0.02 286.052);
  --color-gray-700: oklch(0.35 0.015 286.052);
  --color-gray-800: oklch(0.25 0.01 286.052);
  --color-gray-900: oklch(0.15 0.005 286.052);

  /* Semantic Colors - Light Theme */
  --color-bg-primary: var(--color-gray-50);
  --color-bg-secondary: white;
  --color-bg-tertiary: var(--color-gray-100);

  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-text-tertiary: var(--color-gray-500);
  --color-text-inverse: white;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  --spacing-5xl: 8rem;

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* Typography */
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', Consolas, Monaco, monospace;

  --font-size-display: 3rem;
  --font-size-h1: 2.25rem;
  --font-size-h2: 1.875rem;
  --font-size-h3: 1.5rem;
  --font-size-h4: 1.25rem;
  --font-size-h5: 1.125rem;
  --font-size-h6: 1rem;
  --font-size-body-large: 1.125rem;
  --font-size-body: 1rem;
  --font-size-body-small: 0.875rem;
  --font-size-caption: 0.75rem;

  --line-height-display: 1.1;
  --line-height-h1: 1.2;
  --line-height-h2: 1.3;
  --line-height-h3: 1.4;
  --line-height-h4: 1.4;
  --line-height-h5: 1.5;
  --line-height-h6: 1.5;
  --line-height-body-large: 1.6;
  --line-height-body: 1.6;
  --line-height-body-small: 1.5;
  --line-height-caption: 1.4;

  --font-weight-display: 700;
  --font-weight-h1: 700;
  --font-weight-h2: 600;
  --font-weight-h3: 600;
  --font-weight-h4: 600;
  --font-weight-h5: 600;
  --font-weight-h6: 600;
  --font-weight-body-large: 400;
  --font-weight-body: 400;
  --font-weight-body-small: 400;
  --font-weight-caption: 400;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* Z-Index */
  --z-hide: -1;
  --z-auto: auto;
  --z-base: 0;
  --z-docked: 10;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-banner: 1200;
  --z-overlay: 1300;
  --z-modal: 1400;
  --z-popover: 1500;
  --z-skip-link: 1600;
  --z-toast: 1700;
  --z-tooltip: 1800;

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  --easing-linear: linear;
  --easing-ease: ease;
  --easing-ease-in: ease-in;
  --easing-ease-out: ease-out;
  --easing-ease-in-out: ease-in-out;
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Dark Theme */
.dark {
  --color-bg-primary: var(--color-gray-900);
  --color-bg-secondary: var(--color-gray-800);
  --color-bg-tertiary: var(--color-gray-700);

  --color-text-primary: white;
  --color-text-secondary: var(--color-gray-300);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-inverse: var(--color-gray-900);
}`;
    
    fs.writeFileSync('src/styles/design-system.css', designSystemCSS);
    console.log('✅ Created design-system.css');
}

// Global CSS
function createGlobalCSS() {
    const globalCSS = `/* Ensure proper font loading */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

@import "tailwindcss";
@import "tw-animate-css";
@import "../styles/design-system.css";

@custom-variant dark (&:is(.dark *));

/* Base styles */
@layer base {
  * {
    border-color: var(--color-gray-200);
    outline-color: var(--color-primary-500);
    outline-width: 2px;
    outline-offset: 2px;
  }

  html {
    font-family: var(--font-family-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-family-sans);
  }

  /* Form elements */
  input,
  textarea,
  select {
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
  }

  /* Focus styles for accessibility */
  input:focus,
  textarea:focus,
  select:focus,
  button:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  /* Touch-friendly minimum sizes */
  button,
  input[type="button"],
  input[type="submit"],
  input[type="reset"] {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Component styles */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary/90;
  }

  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }

  .btn-outline {
    @apply border border-input bg-background hover:bg-accent hover:text-accent-foreground;
  }

  .card {
    @apply rounded-lg border bg-card text-card-foreground shadow-sm;
  }
}

/* Utility styles */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}`;
    
    fs.writeFileSync('src/app/globals.css', globalCSS);
    console.log('✅ Created globals.css');
}

// Utils library
function createUtils() {
    const utils = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}`;
    
    fs.writeFileSync('src/lib/utils.ts', utils);
    console.log('✅ Created utils.ts');
}

// Base API utility
function createApi() {
    const api = `import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const API_TIMEOUT = 10000

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken')
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/auth/login'
    }
    
    return Promise.reject(error)
  }
)

// API Methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete(url, config),
}

export default apiClient`;
    
    fs.writeFileSync('src/lib/api.ts', api);
    console.log('✅ Created api.ts');
}

// Base types
function createBaseTypes() {
    const authTypes = `export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'helper' | 'admin'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}`;
    
    fs.writeFileSync('src/types/auth.ts', authTypes);
    console.log('✅ Created auth.ts types');
}

// Theme context
function createThemeContext() {
    const themeContext = `'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      root.classList.add(theme)
      setResolvedTheme(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}`;
    
    fs.writeFileSync('src/contexts/ThemeContext.tsx', themeContext);
    console.log('✅ Created ThemeContext.tsx');
}

// Root layout
function createRootLayout() {
    const layout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Frontend App',
  description: 'A modern frontend application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}`;
    
    fs.writeFileSync('src/app/layout.tsx', layout);
    console.log('✅ Created layout.tsx');
}

// Home page
function createHomePage() {
    const homePage = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to your new frontend project!
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <h1 className="text-4xl font-bold">
          Your Frontend App
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="/dashboard"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Dashboard{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            View your dashboard and manage your data.
          </p>
        </a>

        <a
          href="/profile"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Profile{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Manage your profile and settings.
          </p>
        </a>

        <a
          href="/auth/login"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Login{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Sign in to your account.
          </p>
        </a>

        <a
          href="/auth/register"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Register{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Create a new account.
          </p>
        </a>
      </div>
    </main>
  )
}`;
    
    fs.writeFileSync('src/app/page.tsx', homePage);
    console.log('✅ Created page.tsx');
}

// README
function createReadme() {
    const readme = `# Frontend Project

A modern frontend application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS with custom design system
- 🌙 Dark/Light theme support
- 📱 Responsive design
- 🧪 Testing with Jest and React Testing Library
- 🔧 ESLint and TypeScript configuration
- 📦 Component library with shadcn/ui
- 🎯 Custom design tokens and CSS variables

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context + hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- \`npm run dev\` - Start development server with Turbopack
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:coverage\` - Run tests with coverage

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── design-system/     # Design system components
│   └── layout/            # Layout components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions and API
├── styles/                # Global styles and design tokens
└── types/                 # TypeScript type definitions
\`\`\`

## Design System

This project includes a comprehensive design system with:

- Custom color palette using OKLCH color space
- Typography scale with Inter font
- Spacing, border radius, shadows, and z-index tokens
- CSS custom properties for theming
- Dark/light mode support

## Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.`;
    
    fs.writeFileSync('README.md', readme);
    console.log('✅ Created README.md');
}

// Environment template
function createEnvTemplate() {
    const envTemplate = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Firebase Configuration (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Other Environment Variables
NEXT_PUBLIC_APP_NAME="Frontend App"
NEXT_PUBLIC_APP_VERSION="1.0.0"`;
    
    fs.writeFileSync('.env.template', envTemplate);
    console.log('✅ Created .env.template');
}

// Run all functions
createDesignTokens();
createDesignSystemCSS();
createGlobalCSS();
createUtils();
createApi();
createBaseTypes();
createThemeContext();
createRootLayout();
createHomePage();
createReadme();
createEnvTemplate();

console.log('\n✅ All base files created successfully!');
console.log('\nYour project is now ready to use!');
console.log('\nNext steps:');
console.log('1. npm run dev - Start development server');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Start building your application!');
console.log('\n🎉 Happy coding!');
