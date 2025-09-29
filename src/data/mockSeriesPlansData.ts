// Mock data for SeriesID-based payment plans
// This file contains payment plans grouped by SeriesID with courses

import type { PaymentPlan, PaidItem } from "@/types/payment";

// Mock courses for different plans (SeriesID groups)
const webDevelopmentCourses: PaidItem[] = [
  {
    id: "D147E303-3AD4-437F-A43A-DBFE9B8C52AD",
    name: "HTML & CSS Fundamentals",
    description: "Learn the building blocks of web development with HTML and CSS",
    type: "course",
    price: 1200000,
    originalPrice: 1500000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
    category: "Web Development",
    seriesId: "WEB_DEV_2024",
    planName: "Complete Web Development",
    isAvailable: true,
    features: [
      "20+ hours of video content",
      "Hands-on projects",
      "Certificate of completion",
      "Lifetime access"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 450000,
        totalAmount: 1350000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "D147E303-3AD4-437F-A43A-DBFE9B8C52AD",
    name: "JavaScript Programming",
    description: "Master JavaScript from basics to advanced concepts",
    type: "course",
    price: 1800000,
    originalPrice: 2200000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400",
    category: "Web Development",
    seriesId: "WEB_DEV_2024",
    planName: "Complete Web Development",
    isAvailable: true,
    features: [
      "30+ hours of video content",
      "Real-world projects",
      "ES6+ features",
      "DOM manipulation"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 650000,
        totalAmount: 1950000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "D147E303-3AD4-437F-A43A-DBFE9B8C52AD",
    name: "React Development",
    description: "Build modern web applications with React and Redux",
    type: "course",
    price: 2500000,
    originalPrice: 3000000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    category: "Web Development",
    seriesId: "WEB_DEV_2024",
    planName: "Complete Web Development",
    isAvailable: true,
    features: [
      "40+ hours of content",
      "Modern React hooks",
      "State management",
      "Real projects"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 4,
        monthlyAmount: 700000,
        totalAmount: 2800000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-15T00:00:00Z"
  }
];

const dataAnalyticsCourses: PaidItem[] = [
  {
    id: "D147E303-3AD4-437F-A43A-DBFE9B8C52AD",
    name: "Python for Data Analysis",
    description: "Learn Python programming for data science and analytics",
    type: "course",
    price: 1500000,
    originalPrice: 1800000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
    category: "Data Analytics",
    seriesId: "DATA_ANALYTICS_2024",
    planName: "Data Analytics Mastery",
    isAvailable: true,
    features: [
      "25+ hours of content",
      "Pandas & NumPy",
      "Data visualization",
      "Real datasets"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 550000,
        totalAmount: 1650000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "D147E303-3AD4-437F-A43A-DBFE9B8C52AD",
    name: "SQL Database Management",
    description: "Master SQL for data querying and database management",
    type: "course",
    price: 1200000,
    originalPrice: 1500000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    category: "Data Analytics",
    seriesId: "DATA_ANALYTICS_2024",
    planName: "Data Analytics Mastery",
    isAvailable: true,
    features: [
      "20+ hours of content",
      "Advanced queries",
      "Database design",
      "Performance optimization"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 450000,
        totalAmount: 1350000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "D147E303-3AD4-437F-A43A-DBFE9B8C52AD",
    name: "Machine Learning Fundamentals",
    description: "Introduction to machine learning algorithms and applications",
    type: "course",
    price: 2200000,
    originalPrice: 2700000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    category: "Data Analytics",
    seriesId: "DATA_ANALYTICS_2024",
    planName: "Data Analytics Mastery",
    isAvailable: true,
    features: [
      "35+ hours of content",
      "Scikit-learn library",
      "Model evaluation",
      "Practical projects"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 4,
        monthlyAmount: 650000,
        totalAmount: 2600000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-20T00:00:00Z"
  }
];

const digitalMarketingCourses: PaidItem[] = [
  {
    id: "course-marketing-1",
    name: "Social Media Marketing",
    description: "Master social media platforms for business growth",
    type: "course",
    price: 900000,
    originalPrice: 1200000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400",
    category: "Digital Marketing",
    seriesId: "DIGITAL_MARKETING_2024",
    planName: "Digital Marketing Pro",
    isAvailable: true,
    features: [
      "15+ hours of content",
      "Platform strategies",
      "Content creation",
      "Analytics tracking"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 2,
        monthlyAmount: 500000,
        totalAmount: 1000000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-25T00:00:00Z"
  },
  {
    id: "course-marketing-2",
    name: "Google Ads & PPC",
    description: "Learn paid advertising with Google Ads and PPC campaigns",
    type: "course",
    price: 1100000,
    originalPrice: 1400000,
    currency: "VND",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    category: "Digital Marketing",
    seriesId: "DIGITAL_MARKETING_2024",
    planName: "Digital Marketing Pro",
    isAvailable: true,
    features: [
      "18+ hours of content",
      "Campaign optimization",
      "Keyword research",
      "ROI tracking"
    ],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 400000,
        totalAmount: 1200000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-25T00:00:00Z"
  }
];

// SeriesID-based payment plans
export const mockSeriesPlans: PaymentPlan[] = [
  {
    seriesId: "WEB_DEV_2024",
    name: "Complete Web Development",
    description: "Master full-stack web development from HTML to React. Perfect for beginners to advanced developers.",
    totalPrice: 5500000,
    originalTotalPrice: 6700000,
    currency: "VND",
    items: webDevelopmentCourses,
    features: [
      "3 comprehensive courses",
      "90+ hours of content",
      "Real-world projects",
      "Certificate of completion",
      "Lifetime access",
      "Community support"
    ],
    benefits: [
      "Save 1,200,000 VND compared to individual courses",
      "Structured learning path",
      "Career guidance included",
      "Job placement assistance"
    ],
    supportedPaymentMethods: ["credit_card", "debit_card", "bank_transfer", "digital_wallet"],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 6,
        monthlyAmount: 1000000,
        totalAmount: 6000000,
        interestRate: 5
      },
      {
        plan: "quarterly",
        installments: 2,
        monthlyAmount: 2900000,
        totalAmount: 5800000,
        interestRate: 3
      }
    ],
    createdAt: "2024-01-15T00:00:00Z",
    isPopular: true
  },
  {
    seriesId: "DATA_ANALYTICS_2024",
    name: "Data Analytics Mastery",
    description: "Complete data analytics program covering Python, SQL, and Machine Learning for data-driven decisions.",
    totalPrice: 4900000,
    originalTotalPrice: 6000000,
    currency: "VND",
    items: dataAnalyticsCourses,
    features: [
      "3 specialized courses",
      "80+ hours of content",
      "Real datasets practice",
      "Industry tools training",
      "Portfolio projects",
      "Expert mentorship"
    ],
    benefits: [
      "Save 1,100,000 VND vs individual courses",
      "Complete analytics workflow",
      "Industry-relevant skills",
      "Career transition support"
    ],
    supportedPaymentMethods: ["credit_card", "debit_card", "bank_transfer", "digital_wallet"],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 5,
        monthlyAmount: 1050000,
        totalAmount: 5250000,
        interestRate: 5
      },
      {
        plan: "semester",
        installments: 2,
        monthlyAmount: 2600000,
        totalAmount: 5200000,
        interestRate: 3
      }
    ],
    createdAt: "2024-01-20T00:00:00Z"
  },
  {
    seriesId: "DIGITAL_MARKETING_2024",
    name: "Digital Marketing Pro",
    description: "Comprehensive digital marketing training covering social media and paid advertising strategies.",
    totalPrice: 2000000,
    originalTotalPrice: 2600000,
    currency: "VND",
    items: digitalMarketingCourses,
    features: [
      "2 focused courses",
      "33+ hours of content",
      "Live campaign practice",
      "Marketing tools access",
      "Strategy templates",
      "Performance tracking"
    ],
    benefits: [
      "Save 600,000 VND vs individual courses",
      "Complete marketing funnel",
      "Proven strategies",
      "Quick ROI potential"
    ],
    supportedPaymentMethods: ["credit_card", "debit_card", "bank_transfer", "digital_wallet"],
    installmentOptions: [
      {
        plan: "monthly",
        installments: 3,
        monthlyAmount: 750000,
        totalAmount: 2250000,
        interestRate: 5
      }
    ],
    createdAt: "2024-01-25T00:00:00Z"
  }
];

// Helper function to get plan by SeriesID
export const getPlanBySeriesId = (seriesId: string): PaymentPlan | undefined => {
  return mockSeriesPlans.find(plan => plan.seriesId === seriesId);
};

// Helper function to get all courses by SeriesID
export const getCoursesBySeriesId = (seriesId: string): PaidItem[] => {
  const plan = getPlanBySeriesId(seriesId);
  return plan ? plan.items : [];
};
