// src/types/property.ts
export interface RoomConfiguration {
    roomCount: number;
    hallCount: number;
    bathroomCount: number;
}

export enum ListingType {
    SALE = 'SALE',
    RENT = 'RENT'
}

export enum PropertyType {
    RESIDENTIAL = 'RESIDENTIAL',
    COMMERCIAL = 'COMMERCIAL',
    LAND = 'LAND',
    DAILY_RENTAL = 'DAILY_RENTAL'
}

export interface PropertyCreateRequest {
    title: string;
    listingType: ListingType;
    propertyType: PropertyType;
    city: string;
    district: string;
    neighborhood: string;
    price: number;
    negotiable?: boolean;
    grossArea?: number;
    netArea?: number;
    elevator?: boolean;
    parking?: boolean;
    balcony?: boolean;
    security?: boolean;
    description?: string;
    furnished?: boolean;
    roomConfiguration?: RoomConfiguration;
    monthlyFee?: number;
    deposit?: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
}

export interface PropertyResponse extends PropertyCreateRequest {
    id: number;
    active: boolean;
    approved: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

// Location types for Turkish API
export interface City {
    id: number;
    name: string;
}

export interface District {
    id: number;
    name: string;
    cityId: number;
}

export interface Neighborhood {
    id: number;
    name: string;
    districtId: number;
}