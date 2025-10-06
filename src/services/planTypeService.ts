import { api } from '@/api';

// Plan Type interface based on the API response
export interface PlanType {
  lookUpId: string;
  lookUpTypeId: string;
  lookUpTypeCode: string;
  code: string;
  name: string;
  isActive: boolean;
}

// Cache for plan types to avoid repeated API calls
let planTypesCache: PlanType[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Service functions for plan types
export const planTypeService = {
  // Get all plan types with caching
  getPlanTypes: async (): Promise<PlanType[]> => {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (planTypesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return planTypesCache;
    }

    try {
      const response = await api.getPlanTypes();
      const planTypes: PlanType[] = response.data;
      
      // Update cache
      planTypesCache = planTypes;
      cacheTimestamp = now;
      
      return planTypes;
    } catch (error) {
      console.error('Error fetching plan types:', error);
      throw error;
    }
  },

  // Get plan type ID by code (e.g., "OneTime", "TwoTime")
  getPlanTypeIdByCode: async (code: string): Promise<string | null> => {
    try {
      const planTypes = await planTypeService.getPlanTypes();
      const planType = planTypes.find(pt => pt.code === code && pt.isActive);
      return planType?.lookUpId || null;
    } catch (error) {
      console.error('Error getting plan type ID by code:', error);
      return null;
    }
  },

  // Map payment plan strings to plan type codes
  getPlanTypeCode: (paymentPlan: string): string => {
    const planCodeMapping: Record<string, string> = {
      'one_time': 'OneTime',
      'two_time': 'TwoTime',
    };
    
    return planCodeMapping[paymentPlan] || 'OneTime'; // Default to OneTime
  },

  // Get plan type ID by payment plan string
  getPlanTypeId: async (paymentPlan: string): Promise<string> => {
    const planCode = planTypeService.getPlanTypeCode(paymentPlan);
    const planTypeId = await planTypeService.getPlanTypeIdByCode(planCode);
    
    if (!planTypeId) {
      throw new Error(`Plan type not found for code: ${planCode}. Please ensure plan types are configured in the system.`);
    }
    
    return planTypeId;
  },

  // Clear cache (useful for testing or when data might have changed)
  clearCache: (): void => {
    planTypesCache = null;
    cacheTimestamp = 0;
  }
};
