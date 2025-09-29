// src/hooks/usePropertyStatus.ts
import { PropertyStatus } from '@/store/api/propertyApi';

export const usePropertyStatus = (propertyId: number, originalStatus?: PropertyStatus) => {
    // Just return the original status from backend, no more localStorage overrides
    return originalStatus || PropertyStatus.ACTIVE;
};

export const usePropertyStatusOverrides = () => {
    // Return empty object since we're not using overrides anymore
    return {};
};