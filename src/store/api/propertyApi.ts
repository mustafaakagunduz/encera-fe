// src/store/api/propertyApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Backend'e tam uyumlu types
export interface RoomConfiguration {
    roomCount: number;
    hallCount: number;
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
    pappSellable?: boolean;
    roomConfiguration?: RoomConfiguration;
    monthlyFee?: number;
    deposit?: number;
}

export interface PropertyResponse {
    id: number;
    title: string;
    listingType: ListingType;
    propertyType: PropertyType;
    city: string;
    district: string;
    neighborhood: string;
    price: number;
    negotiable: boolean;
    grossArea?: number;
    netArea?: number;
    elevator: boolean;
    parking: boolean;
    balcony: boolean;
    security: boolean;
    description?: string;
    featured: boolean;
    pappSellable: boolean;
    furnished: boolean;
    roomConfiguration?: RoomConfiguration;
    monthlyFee?: number;
    deposit?: number;
    active: boolean;
    approved: boolean;
    approvedAt?: string;
    viewCount: number;
    reported: boolean;
    reportCount: number;
    owner: {
        id: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
    };
    createdAt: string;
    updatedAt: string;
    lastPublished?: string;
}

export interface PropertySummaryResponse {
    id: number;
    title: string;
    listingType: ListingType;
    propertyType: PropertyType;
    city: string;
    district: string;
    price: number;
    negotiable: boolean;
    grossArea?: number;
    elevator: boolean;
    parking: boolean;
    balcony: boolean;
    furnished: boolean;
    roomConfiguration?: RoomConfiguration;
    featured: boolean;
    pappSellable: boolean;
    viewCount: number;
    createdAt: string;
    coverImageUrl?: string;
}

export interface CreatePropertyResponse {
    success: boolean;
    message: string;
    propertyId?: number;
}

export const propertyApi = createApi({
    reducerPath: 'propertyApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080/api/properties',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Property'],
    endpoints: (builder) => ({
        createProperty: builder.mutation<CreatePropertyResponse, PropertyCreateRequest>({
            query: (property) => ({
                url: '/user/create',
                method: 'POST',
                body: property,
            }),
            invalidatesTags: ['Property'],
        }),

        getPropertyById: builder.query<PropertyResponse, number>({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Property', id }],
        }),

        getAllProperties: builder.query<{
            content: PropertySummaryResponse[];
            totalElements: number;
            totalPages: number;
            number: number;
        }, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `?page=${page}&size=${size}`,
            providesTags: ['Property'],
        }),
    }),
});

export const {
    useCreatePropertyMutation,
    useGetPropertyByIdQuery,
    useGetAllPropertiesQuery,
} = propertyApi;