// Payment-related types
// This file contains all payment-related interfaces used across the application

// Payment item types
export type PaymentItemType = "book" | "course" | "installment" | "certificate" | "material" | "exam" | "other";

// Payment status types
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled" | "refunded";

// Payment method types
export type PaymentMethod = "credit_card" | "debit_card" | "bank_transfer" | "digital_wallet" | "cash";

// Installment plan types
export type InstallmentPlan = "monthly" | "quarterly" | "semester" | "custom";

// Paid item interface
export interface PaidItem {
  id: string;
  name: string;
  description: string;
  type: PaymentItemType;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category: string;
  
  // Plan information
  seriesId?: string; // Groups items into plans
  planName?: string; // Name of the plan this item belongs to
  
  // Availability
  isAvailable: boolean;
  availableUntil?: string;
  stock?: number;
  
  // Installment options
  installmentOptions?: {
    plan: InstallmentPlan;
    installments: number;
    monthlyAmount: number;
    totalAmount: number;
    interestRate?: number;
  }[];
  
  // Additional properties
  features?: string[];

  // Metadata
  createdAt: string;
  updatedAt?: string;
}

// Payment request interface
export interface PaymentRequest {
  itemId: string;
  itemName: string;
  amount: number;

  paymentMethod: PaymentMethod;
  installmentPlan?: {
    plan: InstallmentPlan;
    installments: number;
    monthlyAmount: number;
    totalAmount: number;
  };
  studentInfo: {
    studentId: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  notes?: string;
}

// Payment history interface
export interface PaymentHistory {
  id: string;
  itemId: string;
  itemName: string;
  amount: number;

  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  installmentInfo?: {
    currentInstallment: number;
    totalInstallments: number;
    nextDueDate?: string;
  };
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  notes?: string;
}

// Payment dialog props
export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PaidItem;
  onPaymentSubmit: (paymentData: PaymentRequest) => void;
}

// Payment plan interface (for SeriesID-based plans)
export interface PaymentPlan {
  seriesId: string;
  name: string;
  description: string;
  totalPrice: number;
  originalTotalPrice?: number;

  items: PaidItem[];
  
  // Plan features
  features?: string[];
  benefits?: string[];
  
  // Payment options
  supportedPaymentMethods: PaymentMethod[];
  installmentOptions?: {
    plan: InstallmentPlan;
    installments: number;
    monthlyAmount: number;
    totalAmount: number;
    interestRate?: number;
  }[];
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  isPopular?: boolean;
}

// Plan payment request interface
export interface PlanPaymentRequest {
  seriesId: string;
  planName: string;
  totalAmount: number;

  paymentMethod: PaymentMethod;
  installmentPlan?: {
    plan: InstallmentPlan;
    installments: number;
    monthlyAmount: number;
    totalAmount: number;
  };
  studentInfo: {
    studentId: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  notes?: string;
}

// Payment item card props
export interface PaymentItemCardProps {
  item: PaidItem;
  onSelect: (item: PaidItem) => void;
  className?: string;
}

// Payment plan card props
export interface PaymentPlanCardProps {
  plan: PaymentPlan;
  onSelect: (plan: PaymentPlan) => void;
  onPayDirectly?: (plan: PaymentPlan) => void; // For direct plan payment
  className?: string;
}
