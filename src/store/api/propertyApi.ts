// src/store/api/propertyApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQuery';
import { buildApiUrl } from './config';

// Backend'e tam uyumlu types - mevcut types ile uyumlu
export interface RoomConfiguration {
    roomCount: number;
    hallCount: number;
    bathroomCount?: number;
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
    bathroomCount?: number;
    monthlyFee?: number;
    deposit?: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
    imageUrls?: string[];
    primaryImageUrl?: string;
}

export interface PropertyUpdateRequest {
    title?: string;
    listingType?: ListingType;
    propertyType?: PropertyType;
    city?: string;
    district?: string;
    neighborhood?: string;
    price?: number;
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
    bathroomCount?: number;
    monthlyFee?: number;
    deposit?: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
    imageUrls?: string[];
    primaryImageUrl?: string;
    approved?: boolean; // YENİ EKLENEN - İlan editlendiğinde pending durumuna geçmesi için
    active?: boolean; // YENİ EKLENEN - Pasif ilanların editlendiğinde aktif hale gelmesi için
}

export interface PropertySearchFilters {
    listingType?: ListingType;
    propertyType?: PropertyType;
    city?: string;
    district?: string;
    neighborhood?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    furnished?: boolean;
    elevator?: boolean;
    parking?: boolean;
    balcony?: boolean;
    security?: boolean;
    featured?: boolean;
    pappSellable?: boolean;
    roomCount?: number;
    maxRoomCount?: number;
    hallCount?: number;
    sort?: string;
    keyword?: string;
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
    negotiable?: boolean;
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
    bathroomCount?: number;
    monthlyFee?: number;
    deposit?: number;
    active: boolean;
    approved: boolean;
    approvedAt?: string;
    viewCount: number;
    reported: boolean;
    reportCount: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
    imageUrls?: string[];
    primaryImageUrl?: string;
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
    primaryImageUrl?: string;
}

export interface CreatePropertyResponse {
    success: boolean;
    message: string;
    propertyId?: number;
}

export interface PropertyStatsResponse {
    totalProperties: number;
    approvedProperties: number;
    pendingProperties: number;
    activeProperties: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
}

export interface PropertySearchRequest {
    filters: PropertySearchFilters;
    page?: number;
    size?: number;
}

export const propertyApi = createApi({
    reducerPath: 'propertyApi',
    baseQuery: createBaseQueryWithAuth(buildApiUrl('properties')),
    tagTypes: ['Property', 'UserProperty', 'PropertyStats'],
    endpoints: (builder) => ({
        // ========== PUBLIC ENDPOINTS ==========

        // Get all public properties (özet format)
        getAllProperties: builder.query<PaginatedResponse<PropertySummaryResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/public?page=${page}&size=${size}`,
            providesTags: ['Property'],
        }),

        // Get property by ID (tam format) - public endpoint olarak düzeltildi
        getPropertyById: builder.query<PropertyResponse, number>({
            query: (id) => `/public/${id}`,
            providesTags: (result, error, id) => [{ type: 'Property', id }],
        }),

        // Get properties by listing type
        getPropertiesByListingType: builder.query<PaginatedResponse<PropertySummaryResponse>, {
            listingType: ListingType;
            page?: number;
            size?: number
        }>({
            query: ({ listingType, page = 0, size = 20 }) =>
                `/public/listing-type/${listingType}?page=${page}&size=${size}`,
            providesTags: ['Property'],
        }),

        searchPropertiesWithFilters: builder.query<
            PaginatedResponse<PropertySummaryResponse>,
            PropertySearchFilters & { page?: number; size?: number }
        >({
            query: ({ page = 0, size = 20, sort = 'createdAt-desc', ...filters }) => {
                const params = new URLSearchParams();

                // Pagination
                params.append('page', page.toString());
                params.append('size', size.toString());

                // Sorting - backend'e uygun format
                if (sort) {
                    const [field, direction] = sort.split('-');
                    params.append('sort', `${field},${direction}`);
                }

                // Filters - backend parametreleriyle uyumlu
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '' &&
                        key !== 'sort' && key !== 'page' && key !== 'size') {

                        // roomCount'u minRoomCount olarak gönder
                        if (key === 'roomCount') {
                            params.append('minRoomCount', value.toString());
                        } else if (key === 'maxRoomCount') {
                            params.append('maxRoomCount', value.toString());
                        } else {
                            params.append(key, value.toString());
                        }
                    }
                });


                const finalURL = `/public/search?${params.toString()}`;
                console.log('=== DEBUG: Frontend API Call ===');
                console.log('Filters Object:', filters);
                console.log('Final API URL:', finalURL);
                console.log('URL Params:', Object.fromEntries(params));
                return finalURL;
            },
            providesTags: ['Property'],
        }),

        // Get properties by property type
        getPropertiesByPropertyType: builder.query<PaginatedResponse<PropertySummaryResponse>, {
            propertyType: PropertyType;
            page?: number;
            size?: number
        }>({
            query: ({ propertyType, page = 0, size = 20 }) =>
                `/public/property-type/${propertyType}?page=${page}&size=${size}`,
            providesTags: ['Property'],
        }),

        // ========== USER ENDPOINTS ==========

        // Create new property
        createProperty: builder.mutation<PropertyResponse, PropertyCreateRequest>({
            query: (property) => ({
                url: '/user/create',
                method: 'POST',
                body: property,
            }),
            invalidatesTags: ['UserProperty', 'PropertyStats'],
        }),

        // Get user's own properties
        getUserProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/user/my-properties?page=${page}&size=${size}`,
            providesTags: [
                'UserProperty',
                { type: 'UserProperty', id: 'LIST' }
            ],
        }),

        // Get user properties by listing type
        getUserPropertiesByListingType: builder.query<PaginatedResponse<PropertyResponse>, {
            listingType: ListingType;
            page?: number;
            size?: number
        }>({
            query: ({ listingType, page = 0, size = 20 }) =>
                `/user/by-listing-type/${listingType}?page=${page}&size=${size}`,
            providesTags: ['UserProperty'],
        }),

        // Get user's approved properties
        getUserApprovedProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/user/approved?page=${page}&size=${size}`,
            providesTags: ['UserProperty'],
        }),

        // Get user's inactive properties
        getUserInactiveProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/user/inactive?page=${page}&size=${size}`,
            providesTags: ['UserProperty'],
        }),

        // Get user property count
        getUserPropertyCount: builder.query<number, void>({
            query: () => '/user/count',
            providesTags: ['PropertyStats'],
        }),

        // Get user property stats
        getUserStats: builder.query<PropertyStatsResponse, void>({
            query: () => '/user/stats',
            providesTags: ['PropertyStats'],
        }),

        // Update property
        updateProperty: builder.mutation<PropertyResponse, { id: number; data: PropertyUpdateRequest }>({
            query: ({ id, data }) => ({
                url: `/user/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id }
            ],
        }),

        // Delete property
        deleteProperty: builder.mutation<void, number>({
            query: (id) => ({
                url: `/properties/user/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id }
            ],
        }),

        // Toggle property status (active/inactive)
        togglePropertyStatus: builder.mutation<PropertyResponse, number>({
            query: (id) => ({
                url: `/user/${id}/toggle-status`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id }
            ],
        }),

        // Republish property
        republishProperty: builder.mutation<PropertyResponse, number>({
            query: (id) => ({
                url: `/user/${id}/republish`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id }
            ],
        }),

        // Report property
        reportProperty: builder.mutation<void, number>({
            query: (id) => ({
                url: `/user/${id}/report`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Property', id }
            ],
        }),

        // ========== DELEGASYON SİSTEMİ ==========

        // Encera ilanlarını getir (Admin için)
        getEnceraProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/encera?page=${page}&size=${size}`,
            providesTags: ['Property'],
        }),


    }),
});

// Export hooks
export const {
    // Public property queries
    useGetAllPropertiesQuery,
    useGetPropertyByIdQuery,
    useGetPropertiesByListingTypeQuery,
    useGetPropertiesByPropertyTypeQuery,

    // User property management
    useCreatePropertyMutation,
    useGetUserPropertiesQuery,
    useGetUserPropertiesByListingTypeQuery,
    useGetUserApprovedPropertiesQuery,
    useGetUserInactivePropertiesQuery,
    useGetUserPropertyCountQuery,
    useSearchPropertiesWithFiltersQuery,
    useGetUserStatsQuery,
    useUpdatePropertyMutation,
    useDeletePropertyMutation,
    useTogglePropertyStatusMutation,
    useRepublishPropertyMutation,
    useReportPropertyMutation,

    // Delegasyon sistemi
    useGetEnceraPropertiesQuery,
    useGetUserDelegatedPropertiesQuery,
    useToggleEnceraDelegationMutation,
} = propertyApi;
