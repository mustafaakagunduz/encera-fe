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

export enum PropertyStatus {
    ACTIVE = 'ACTIVE',
    SOLD = 'SOLD',
    REMOVED = 'REMOVED',
    INACTIVE = 'INACTIVE'
}

export interface PropertyCreateRequest {
    title: string;
    listingType: ListingType;
    propertyType: PropertyType;
    city: string;
    district: string;
    neighborhood: string;
    street?: string;
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
    delegatedToEncera?: boolean;
    roomConfiguration?: RoomConfiguration;
    bathroomCount?: number;
    monthlyFee?: number;
    deposit?: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
    facades?: string[];
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
    street?: string;
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
    delegatedToEncera?: boolean;
    roomConfiguration?: RoomConfiguration;
    bathroomCount?: number;
    monthlyFee?: number;
    deposit?: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
    facades?: string[];
    imageUrls?: string[];
    primaryImageUrl?: string;
    approved?: boolean; // YENİ EKLENEN - İlan editlendiğinde pending durumuna geçmesi için
    active?: boolean; // YENİ EKLENEN - Pasif ilanların editlendiğinde aktif hale gelmesi için
    status?: PropertyStatus; // YENİ EKLENEN - İlan durumu güncelleme için
}

export interface PropertySearchFilters {
    listingType?: ListingType;
    propertyType?: PropertyType;
    city?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
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
    street?: string;
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
    delegatedToEncera: boolean;
    roomConfiguration?: RoomConfiguration;
    bathroomCount?: number;
    monthlyFee?: number;
    deposit?: number;
    active: boolean;
    approved: boolean;
    status?: PropertyStatus;
    approvedAt?: string;
    viewCount: number;
    reported: boolean;
    reportCount: number;
    buildingAge?: number;
    totalFloors?: number;
    currentFloor?: number;
    heatingTypes?: string[];
    facades?: string[];
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
    status?: PropertyStatus;
}

export interface CreatePropertyResponse {
    success: boolean;
    message: string;
    propertyId?: number;
}

export interface PropertyStatsResponse {
    totalProperties: number;
    activeProperties: number;
    approvedProperties: number;
    pendingApprovalProperties: number;
    inactiveProperties: number;
    totalViews: number;
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

                        if (key === 'roomCount') {
                            const roomValue = value.toString();

                            // Backend için minimum oda sayısını ayarla
                            params.append('minRoomCount', roomValue);

                            // Kullanıcı net değer girdiğinde üst sınırı da aynı değere sabitle
                            if (filters.maxRoomCount === undefined || filters.maxRoomCount === null) {
                                params.append('maxRoomCount', roomValue);
                            }
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
            size?: number;
            sort?: string;
        }>({
            query: ({ propertyType, page = 0, size = 20, sort = 'createdAt-desc' }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('size', size.toString());

                // Add sorting parameter - convert frontend format to backend format
                if (sort) {
                    const [field, direction] = sort.split('-');
                    params.append('sort', `${field},${direction}`);
                }

                return `/public/property-type/${propertyType}?${params.toString()}`;
            },
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

        // Mark property as sold (preserving all existing data, only updating status)
        markPropertyAsSold: builder.mutation<PropertyResponse, { propertyId: number; propertyData: PropertyResponse }>({
            query: ({ propertyId, propertyData }) => ({
                url: `/user/${propertyId}`,
                method: 'PUT',
                body: {
                    // Preserve all existing data
                    title: propertyData.title,
                    listingType: propertyData.listingType,
                    propertyType: propertyData.propertyType,
                    city: propertyData.city,
                    district: propertyData.district,
                    neighborhood: propertyData.neighborhood,
                    street: propertyData.street,
                    price: propertyData.price,
                    negotiable: propertyData.negotiable,
                    grossArea: propertyData.grossArea,
                    netArea: propertyData.netArea,
                    elevator: propertyData.elevator,
                    parking: propertyData.parking,
                    balcony: propertyData.balcony,
                    security: propertyData.security,
                    description: propertyData.description,
                    furnished: propertyData.furnished,
                    pappSellable: propertyData.pappSellable,
                    delegatedToEncera: propertyData.delegatedToEncera,
                    roomConfiguration: propertyData.roomConfiguration,
                    bathroomCount: propertyData.bathroomCount,
                    monthlyFee: propertyData.monthlyFee,
                    deposit: propertyData.deposit,
                    buildingAge: propertyData.buildingAge,
                    totalFloors: propertyData.totalFloors,
                    currentFloor: propertyData.currentFloor,
                    heatingTypes: propertyData.heatingTypes,
                    facades: propertyData.facades,
                    imageUrls: propertyData.imageUrls,
                    primaryImageUrl: propertyData.primaryImageUrl,
                    // Only update status and active
                    status: PropertyStatus.SOLD,
                    active: false
                }
            }),
            invalidatesTags: (result, error, { propertyId }) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id: propertyId }
            ],
        }),

        // Mark property as removed (preserving all existing data, only updating status)
        markPropertyAsRemoved: builder.mutation<PropertyResponse, { propertyId: number; propertyData: PropertyResponse }>({
            query: ({ propertyId, propertyData }) => ({
                url: `/user/${propertyId}`,
                method: 'PUT',
                body: {
                    // Preserve all existing data
                    title: propertyData.title,
                    listingType: propertyData.listingType,
                    propertyType: propertyData.propertyType,
                    city: propertyData.city,
                    district: propertyData.district,
                    neighborhood: propertyData.neighborhood,
                    street: propertyData.street,
                    price: propertyData.price,
                    negotiable: propertyData.negotiable,
                    grossArea: propertyData.grossArea,
                    netArea: propertyData.netArea,
                    elevator: propertyData.elevator,
                    parking: propertyData.parking,
                    balcony: propertyData.balcony,
                    security: propertyData.security,
                    description: propertyData.description,
                    furnished: propertyData.furnished,
                    pappSellable: propertyData.pappSellable,
                    delegatedToEncera: propertyData.delegatedToEncera,
                    roomConfiguration: propertyData.roomConfiguration,
                    bathroomCount: propertyData.bathroomCount,
                    monthlyFee: propertyData.monthlyFee,
                    deposit: propertyData.deposit,
                    buildingAge: propertyData.buildingAge,
                    totalFloors: propertyData.totalFloors,
                    currentFloor: propertyData.currentFloor,
                    heatingTypes: propertyData.heatingTypes,
                    facades: propertyData.facades,
                    imageUrls: propertyData.imageUrls,
                    primaryImageUrl: propertyData.primaryImageUrl,
                    // Only update status and active
                    status: PropertyStatus.REMOVED,
                    active: false
                }
            }),
            invalidatesTags: (result, error, { propertyId }) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id: propertyId }
            ],
        }),

        // Clean up additional images (keep only primary image for sold/removed properties)
        cleanupPropertyImages: builder.mutation<void, { propertyId: number; keepOnlyPrimary: boolean }>({
            query: ({ propertyId, keepOnlyPrimary }) => ({
                url: `/user/${propertyId}/cleanup-images`,
                method: 'POST',
                body: { keepOnlyPrimary }
            }),
            invalidatesTags: (result, error, { propertyId }) => [
                { type: 'Property', id: propertyId }
            ],
        }),

        // Hard delete property (only for properties not in favorites)
        deleteProperty: builder.mutation<void, number>({
            query: (id) => ({
                url: `/user/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                'UserProperty',
                'PropertyStats',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id }
            ],
        }),

        // Mark property as sold
        markAsSold: builder.mutation<PropertyResponse, { propertyId: number; propertyData?: any }>({
            query: ({ propertyId }) => ({
                url: `/user/${propertyId}/mark-sold`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, { propertyId }) => [
                'UserProperty',
                'PropertyStats',
                'Property',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id: propertyId },
            ],
        }),

        // Mark property as removed
        markAsRemoved: builder.mutation<PropertyResponse, { propertyId: number; propertyData?: any }>({
            query: ({ propertyId }) => ({
                url: `/user/${propertyId}/mark-removed`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, { propertyId }) => [
                'UserProperty',
                'PropertyStats',
                'Property',
                { type: 'UserProperty', id: 'LIST' },
                { type: 'Property', id: propertyId },
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

        // Yetkilendirilmiş ilanları getir (Admin için)
        getDelegatedProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/admin/delegated-properties?page=${page}&size=${size}`,
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
    useMarkPropertyAsSoldMutation,
    useMarkPropertyAsRemovedMutation,
    useCleanupPropertyImagesMutation,
    useDeletePropertyMutation,
    useMarkAsSoldMutation,
    useMarkAsRemovedMutation,
    useTogglePropertyStatusMutation,
    useRepublishPropertyMutation,
    useReportPropertyMutation,

    // Delegasyon sistemi
    useGetEnceraPropertiesQuery,
    useGetDelegatedPropertiesQuery,
} = propertyApi;
