// Mock data for payment plans
// This file contains payment plans with grouped items

import type { PaidItem } from "@/types/payment";

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  type: "one_time" | "installment" | "flexible";
  icon: string;
  features: string[];
  items: PaidItem[];
  totalItems: number;
  priceRange: {
    min: number;
    max: number;
  };
  isPopular?: boolean;
}

// Individual items data
const allItems: PaidItem[] = [
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

  // Courses with installment options
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
  {
    id: "7",
    name: "TOEIC Intensive Training",
    description: "Intensive TOEIC preparation course with focus on listening and reading skills.",
    type: "course",
    price: 1800000,
    currency: "VND",
    category: "Courses",
    isAvailable: true,
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 600000,
        totalAmount: 1800000,
        interestRate: 0
      }
    ],
    createdAt: "2024-01-14T00:00:00Z"
  },

  // Exams
  {
    id: "8",
    name: "TOEIC Certificate Exam",
    description: "Official TOEIC exam registration and certification.",
    type: "exam",
    price: 1200000,
    currency: "VND",
    category: "Certifications",
    isAvailable: true,
    availableUntil: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "9",
    name: "IELTS Academic Exam",
    description: "Official IELTS Academic exam registration with speaking test.",
    type: "exam",
    price: 1500000,
    currency: "VND",
    category: "Certifications",
    isAvailable: true,
    availableUntil: "2024-11-30T23:59:59Z",
    createdAt: "2024-01-08T00:00:00Z"
  },

  // Materials
  {
    id: "10",
    name: "Course Materials Package",
    description: "Complete set of materials for Advanced Business English course including workbooks and digital resources.",
    type: "material",
    price: 350000,
    currency: "VND",
    category: "Materials",
    isAvailable: true,
    stock: 50,
    createdAt: "2024-01-12T00:00:00Z"
  },
  {
    id: "11",
    name: "IELTS Practice Test Pack",
    description: "Complete set of IELTS practice tests with answer keys and audio files.",
    type: "material",
    price: 250000,
    currency: "VND",
    category: "Materials",
    isAvailable: true,
    stock: 75,
    createdAt: "2024-01-16T00:00:00Z"
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
  },

  // Other items
  {
    id: "14",
    name: "Language Learning App Subscription",
    description: "Premium subscription to our language learning mobile application.",
    type: "other",
    price: 99000,
    currency: "VND",
    category: "Subscriptions",
    isAvailable: true,
    createdAt: "2024-01-17T00:00:00Z"
  },
  {
    id: "15",
    name: "Study Abroad Consultation",
    description: "One-on-one consultation for study abroad opportunities and applications.",
    type: "other",
    price: 500000,
    currency: "VND",
    category: "Services",
    isAvailable: true,
    createdAt: "2024-01-21T00:00:00Z"
  }
];

// Payment plans with grouped items
export const mockPaymentPlans: PaymentPlan[] = [
  {
    id: "one-time-payment",
    name: "One-Time Payment",
    description: "Pay the full amount upfront and get immediate access to all items",
    type: "one_time",
    icon: "💳",
    features: [
      "Immediate access",
      "No additional fees",
      "Full ownership",
      "Best value"
    ],
    items: allItems.filter(item => 
      !item.installmentOptions || item.installmentOptions.length === 0
    ),
    totalItems: 0,
    priceRange: {
      min: 99000,
      max: 1500000
    }
  },
  {
    id: "installment-payment",
    name: "Installment Payment",
    description: "Split your payments into manageable monthly installments",
    type: "installment",
    icon: "📅",
    features: [
      "Flexible monthly payments",
      "Low or no interest rates",
      "Immediate course access",
      "Budget-friendly"
    ],
    items: allItems.filter(item => 
      item.installmentOptions && item.installmentOptions.length > 0
    ),
    totalItems: 0,
    priceRange: {
      min: 600000,
      max: 850000
    },
    isPopular: true
  },
  {
    id: "flexible-payment",
    name: "Flexible Payment",
    description: "Mix and match payment methods based on your preferences",
    type: "flexible",
    icon: "🎯",
    features: [
      "Choose payment method per item",
      "Combine one-time and installments",
      "Customizable plans",
      "Maximum flexibility"
    ],
    items: allItems,
    totalItems: 0,
    priceRange: {
      min: 99000,
      max: 3500000
    }
  }
];

// Calculate total items for each plan
mockPaymentPlans.forEach(plan => {
  plan.totalItems = plan.items.length;
});

// Export individual items for backward compatibility
export { allItems as mockPaidItems };
