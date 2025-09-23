// src/store/api/adminApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQuery';

// Types for Admin API
export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminStatisticsResponse {
    totalUsers: number;
}

export interface AdminErrorResponse {
    error: string;
    message: string;
}

export interface AdminSuccessResponse {
    message: string;
}

// Property types for admin property management
export interface PropertyResponse {
    id: number;
    title: string;
    listingType: string;
    propertyType: string;
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
    active: boolean;
    approved: boolean;
    approvedAt?: string;
    viewCount: number;
    reported: boolean;
    reportCount: number;
    lastReportedAt?: string;
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

export interface PropertyUpdateRequest {
    title?: string;
    listingType?: string;
    propertyType?: string;
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
    approved?: boolean;
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

export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: createBaseQueryWithAuth('http://localhost:8081/api'),
    tagTypes: ['AdminUsers', 'AdminProperties', 'AdminStats'],
    endpoints: (builder) => ({
        // ========== USER MANAGEMENT ==========

        // Get all users
        getAllUsers: builder.query<UserResponse[], void>({
            query: () => '/admin/users',
            providesTags: ['AdminUsers'],
        }),

        // Get user by ID
        getUserById: builder.query<UserResponse, number>({
            query: (id) => `/admin/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'AdminUsers', id }],
        }),

        // Update user status (enable/disable)
        updateUserStatus: builder.mutation<UserResponse, { id: number; enabled: boolean }>({
            query: ({ id, enabled }) => ({
                url: `/admin/users/${id}/status?enabled=${enabled}`,
                method: 'PUT',
            }),
            invalidatesTags: ['AdminUsers', 'AdminStats'],
        }),

        // Delete user
        deleteUser: builder.mutation<AdminSuccessResponse, number>({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminUsers', 'AdminStats'],
        }),

        // ========== STATISTICS ==========

        // Get admin statistics
        getAdminStatistics: builder.query<AdminStatisticsResponse, void>({
            query: () => '/admin/statistics',
            providesTags: ['AdminStats'],
        }),

        // ========== PROPERTY MANAGEMENT ==========

        // Get pending approval properties
        getPendingApprovalProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/properties/admin/pending-approval?page=${page}&size=${size}`,
            providesTags: [
                'AdminProperties',
                { type: 'AdminProperties', id: 'PENDING' }
            ],
        }),

        // Get all properties for admin
        getAllAdminProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/properties/admin/all?page=${page}&size=${size}`,
            providesTags: [
                'AdminProperties',
                { type: 'AdminProperties', id: 'ALL' }
            ],
        }),

        // Get approved properties for admin
        getApprovedProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/properties/admin/approved?page=${page}&size=${size}`,
            providesTags: [
                'AdminProperties',
                { type: 'AdminProperties', id: 'APPROVED' }
            ],
        }),

        // Get reported properties
        getReportedProperties: builder.query<PaginatedResponse<PropertyResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/properties/admin/reported?page=${page}&size=${size}`,
            providesTags: [
                'AdminProperties',
                { type: 'AdminProperties', id: 'REPORTED' }
            ],
        }),

        // Approve property
        approveProperty: builder.mutation<PropertyResponse, number>({
            query: (id) => ({
                url: `/properties/admin/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: [
                'AdminProperties',
                'AdminStats',
                { type: 'AdminProperties', id: 'PENDING' },
                { type: 'AdminProperties', id: 'APPROVED' },
                { type: 'AdminProperties', id: 'ALL' }
            ],
        }),

        // Reject property
        rejectProperty: builder.mutation<PropertyResponse, number>({
            query: (id) => ({
                url: `/properties/admin/${id}/reject`,
                method: 'POST',
            }),
            invalidatesTags: [
                'AdminProperties',
                'AdminStats',
                { type: 'AdminProperties', id: 'PENDING' },
                { type: 'AdminProperties', id: 'APPROVED' },
                { type: 'AdminProperties', id: 'ALL' }
            ],
        }),

        // Clear property reports
        clearPropertyReports: builder.mutation<PropertyResponse, number>({
            query: (id) => ({
                url: `/properties/admin/${id}/clear-reports`,
                method: 'POST',
            }),
            invalidatesTags: [
                'AdminProperties',
                { type: 'AdminProperties', id: 'REPORTED' },
                { type: 'AdminProperties', id: 'ALL' }
            ],
        }),

        // Admin update property
        adminUpdateProperty: builder.mutation<PropertyResponse, { id: number; data: PropertyUpdateRequest }>({
            query: ({ id, data }) => ({
                url: `/properties/admin/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: [
                'AdminProperties',
                { type: 'AdminProperties', id: 'ALL' }
            ],
        }),

        // Admin delete property
        adminDeleteProperty: builder.mutation<void, number>({
            query: (id) => ({
                url: `/properties/admin/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                'AdminProperties',
                'AdminStats',
                { type: 'AdminProperties', id: 'PENDING' },
                { type: 'AdminProperties', id: 'APPROVED' },
                { type: 'AdminProperties', id: 'REPORTED' },
                { type: 'AdminProperties', id: 'ALL' }
            ],
        }),

        // Get property statistics for admin
        getPropertyStatistics: builder.query<any, void>({
            query: () => '/properties/admin/stats',
            providesTags: ['AdminStats'],
        }),
    }),
});

// Export hooks
export const {
    // User Management
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserStatusMutation,
    useDeleteUserMutation,

    // Statistics
    useGetAdminStatisticsQuery,

    // Property Management
    useGetPendingApprovalPropertiesQuery,
    useGetAllAdminPropertiesQuery,
    useGetApprovedPropertiesQuery,
    useGetReportedPropertiesQuery,
    useApprovePropertyMutation,
    useRejectPropertyMutation,
    useClearPropertyReportsMutation,
    useAdminUpdatePropertyMutation,
    useAdminDeletePropertyMutation,
    useGetPropertyStatisticsQuery,
} = adminApi;