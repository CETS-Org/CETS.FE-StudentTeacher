// Mock data for paid items
// This file contains all mock data for the Choose Paid Item page

import type { PaidItem } from "@/types/payment";

export const mockPaidItems: PaidItem[] = [
  // Books
  {
    id: "1",
    name: "Advanced Business English Textbook",
    description: "Comprehensive textbook covering business communication, presentations, and professional writing skills.",
    type: "book",
    price: 450000,
    originalPrice: 500000,
    currency: "VND",
    category: "Textbooks",
    isAvailable: true,
    stock: 25,
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "2",
    name: "IELTS Academic Writing Guide",
    description: "Complete guide for IELTS Academic Writing with sample essays and scoring criteria.",
    type: "book",
    price: 320000,
    originalPrice: 380000,
    currency: "VND",
    category: "Textbooks",
    isAvailable: true,
    stock: 18,
    createdAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "3",
    name: "TOEIC Vocabulary Builder",
    description: "Essential vocabulary for TOEIC test preparation with audio pronunciation.",
    type: "book",
    price: 280000,
    currency: "VND",
    category: "Textbooks",
    isAvailable: true,
    stock: 32,
    createdAt: "2024-01-18T00:00:00Z"
  },
  {
    id: "4",
    name: "Grammar in Use Advanced",
    description: "Advanced grammar reference and practice book for English learners.",
    type: "book",
    price: 380000,
    originalPrice: 420000,
    currency: "VND",
    category: "Textbooks",
    isAvailable: false,
    stock: 0,
    createdAt: "2024-01-10T00:00:00Z"
  },

  // Courses
  {
    id: "5",
    name: "IELTS Preparation Course",
    description: "Complete IELTS preparation course with mock tests and personalized feedback.",
    type: "course",
    price: 2500000,
    currency: "VND",
    category: "Courses",
    isAvailable: true,
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 850000,
        totalAmount: 2550000,
        interestRate: 2
      },
      {
        plan: "quarterly",
        installments: 2,
        monthlyAmount: 1275000,
        totalAmount: 2550000,
        interestRate: 1
      }
    ],
    createdAt: "2024-01-10T00:00:00Z"
  },
  {
    id: "6",
    name: "Business English Mastery",
    description: "Professional business English course for corporate communication and presentations.",
    type: "course",
    price: 3200000,
    originalPrice: 3500000,
    currency: "VND",
    category: "Courses",
    isAvailable: true,
    installmentOptions: [
      {
        plan: "monthly",
        installments: 4,
        monthlyAmount: 800000,
        totalAmount: 3200000,
        interestRate: 0
      }
    ],
    createdAt: "2024-01-12T00:00:00Z"
  },

  // Certificates
  {
    id: "12",
    name: "Professional Certificate",
    description: "Official certificate for course completion with digital verification.",
    type: "certificate",
    price: 200000,
    currency: "VND",
    category: "Certificates",
    isAvailable: true,
    createdAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "13",
    name: "Course Completion Certificate",
    description: "Digital certificate for course completion with verification code.",
    type: "certificate",
    price: 150000,
    currency: "VND",
    category: "Certificates",
    isAvailable: true,
    createdAt: "2024-01-22T00:00:00Z"
  }

  
];