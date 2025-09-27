// src/store/api/pappSellableRequestApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQuery';

export interface PappSellableRequestResponse {
    id: number;
    propertyId: number;
    propertyTitle: string;
    propertyCity: string;
    propertyDistrict: string;
    propertyType: string;
    listingType: string;
    userId: number;
    userFirstName: string;
    userLastName: string;
    userPhoneNumber: string;
    userEmail?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedAt?: string;
    approvedBy?: number;
    rejectionReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PappSellableRequestUpdateRequest {
    notes?: string;
    rejectionReason?: string;
}

export interface PappSellableRequestStatsResponse {
    pendingRequests: number;
}

interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export const pappSellableRequestApi = createApi({
    reducerPath: 'pappSellableRequestApi',
    baseQuery: createBaseQueryWithAuth(),
    tagTypes: ['PappSellableRequest', 'PappSellableRequestStats'],
    endpoints: (builder) => ({
        // ========== USER ENDPOINTS ==========

        // Kullanıcının papp sellable istekleri
        getCurrentUserPappRequests: builder.query<PaginatedResponse<PappSellableRequestResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/papp-sellable-requests/user/my-requests?page=${page}&size=${size}`,
            providesTags: [
                'PappSellableRequest',
                { type: 'PappSellableRequest', id: 'USER_LIST' }
            ],
        }),

        // ========== ADMIN ENDPOINTS ==========

        // Bekleyen istekler
        getPendingPappRequests: builder.query<PaginatedResponse<PappSellableRequestResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/papp-sellable-requests/admin/pending?page=${page}&size=${size}`,
            providesTags: [
                'PappSellableRequest',
                { type: 'PappSellableRequest', id: 'ADMIN_PENDING' }
            ],
        }),

        // Tüm istekler
        getAllPappRequests: builder.query<PaginatedResponse<PappSellableRequestResponse>, { page?: number; size?: number }>({
            query: ({ page = 0, size = 20 }) => `/papp-sellable-requests/admin/all?page=${page}&size=${size}`,
            providesTags: [
                'PappSellableRequest',
                { type: 'PappSellableRequest', id: 'ADMIN_ALL' }
            ],
        }),

        // İsteği onayla
        approvePappRequest: builder.mutation<PappSellableRequestResponse, number>({
            query: (id) => ({
                url: `/papp-sellable-requests/admin/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                'PappSellableRequest',
                'PappSellableRequestStats',
                { type: 'PappSellableRequest', id },
                { type: 'PappSellableRequest', id: 'ADMIN_PENDING' },
                { type: 'PappSellableRequest', id: 'ADMIN_ALL' },
                { type: 'PappSellableRequest', id: 'USER_LIST' }
            ],
        }),

        // İsteği reddet
        rejectPappRequest: builder.mutation<PappSellableRequestResponse, { id: number; request: PappSellableRequestUpdateRequest }>({
            query: ({ id, request }) => ({
                url: `/papp-sellable-requests/admin/${id}/reject`,
                method: 'POST',
                body: request,
            }),
            invalidatesTags: (result, error, { id }) => [
                'PappSellableRequest',
                'PappSellableRequestStats',
                { type: 'PappSellableRequest', id },
                { type: 'PappSellableRequest', id: 'ADMIN_PENDING' },
                { type: 'PappSellableRequest', id: 'ADMIN_ALL' },
                { type: 'PappSellableRequest', id: 'USER_LIST' }
            ],
        }),

        // İstatistikler
        getPappRequestStats: builder.query<PappSellableRequestStatsResponse, void>({
            query: () => '/papp-sellable-requests/admin/stats',
            providesTags: ['PappSellableRequestStats'],
        }),
    }),
});

// Export hooks
export const {
    // User hooks
    useGetCurrentUserPappRequestsQuery,

    // Admin hooks
    useGetPendingPappRequestsQuery,
    useGetAllPappRequestsQuery,
    useApprovePappRequestMutation,
    useRejectPappRequestMutation,
    useGetPappRequestStatsQuery,
} = pappSellableRequestApi;