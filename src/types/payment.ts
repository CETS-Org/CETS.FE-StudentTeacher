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

// Class reservation response interface (from backend)
export interface ClassReservationResponse {
  id: string;
  studentID: string;
  coursePackageID?: string;
  packageCode?: string;
  packageName?: string;
  packageImageUrl?: string;
  totalPrice: number;
  description?: string;
  reservationStatus?: string;
  expiresAt: string;
  createdAt: string;
}

// Reservation item props for list display
export interface ReservationItemProps {
  reservation: ClassReservationResponse;
  onSelect: (reservation: ClassReservationResponse) => void;
  className?: string;
}

// Class Reservation Payment Dialog Props
export interface ClassReservationPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ClassReservationResponse;
  reservationItems: ReservationItem[];
  onPaymentSubmit: (paymentData: ReservationPaymentRequest) => void;
}

// Reservation Payment Request
export interface ReservationPaymentRequest {
  reservationId: string;
  packageName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentScope: {
    type: 'full_package' | 'selected_items';
    selectedItemIds?: string[];
  };
  installmentPlan: {
    type: 'full' | 'two_payments';
    installmentAmount: number;
    numberOfInstallments: number;
    installmentSchedule?: InstallmentScheduleItem[];
  };
  studentInfo: {
    studentId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  notes?: string;
}

// Installment Schedule Item
export interface InstallmentScheduleItem {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

// Installment Info Helper
export interface InstallmentInfo {
  numberOfInstallments: number;
  installmentAmount: number;
  description: string;
}

// Second Payment Information (for 1stPaid status)
export interface SecondPaymentInfo {
  invoiceId?: string;
  invoiceStatus?: string;
  invoiceStatusCode?: string;
  amount: number;
  dueDate?: string;
}

// Reservation Item (for details page)
export interface ReservationItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  courseImageUrl?: string;
  description?: string;
  price: number;
  category: string;
  invoiceId?: string;
  invoiceStatus?: string;
  invoiceStatusCode?: string;
  planType: string;
  classReservationId: string;
  secondPayment?: SecondPaymentInfo;
}

// Payment History Record (from backend API)
export interface PaymentHistoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  invoiceId: string;
  invoiceStatus: string;
  name: string;
  paymentMethod: string;
  amount: number;
  createdAt: string;
  installmentInfo?: {
    currentInstallment: number;
    nextDueDate?: string;
  };
}