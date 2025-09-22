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
  currency: string;
  imageUrl?: string;
  category: string;
  
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
  requirements?: string[];
  deliveryInfo?: string;
  refundPolicy?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

// Payment request interface
export interface PaymentRequest {
  itemId: string;
  itemName: string;
  amount: number;
  currency: string;
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
  currency: string;
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

// Payment item card props
export interface PaymentItemCardProps {
  item: PaidItem;
  onSelect: (item: PaidItem) => void;
  className?: string;
}
