// src/store/api/complaintApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface ComplaintCreateRequest {
    type: 'PROPERTY' | 'PROFILE';
    reason: string;
    description?: string;
    targetPropertyId?: number;
    targetUserId?: number;
}

export interface ComplaintResponse {
    id: number;
    type: 'PROPERTY' | 'PROFILE';
    reason: string;
    description?: string;
    targetPropertyId?: number;
    targetUserId?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW';
    adminNotes?: string;
    handledAt?: string;
    createdAt: string;
    updatedAt: string;
    reporter: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    target: {
        id: number;
        type: 'property' | 'user';
        title: string;
        url: string;
    };
    handledByAdmin?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export interface ComplaintsPageResponse {
    content: ComplaintResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ComplaintHandleRequest {
    complaintId: number;
    status: 'APPROVED' | 'REJECTED' | 'IN_REVIEW';
    adminNotes?: string;
}

export const complaintApi = createApi({
    reducerPath: 'complaintApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8081/api/complaints',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Complaint'],
    endpoints: (builder) => ({
        createComplaint: builder.mutation<ComplaintResponse, ComplaintCreateRequest>({
            query: (data) => ({
                url: '',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Complaint'],
        }),
        getAllComplaints: builder.query<ComplaintsPageResponse, {
            page?: number;
            size?: number;
            status?: string;
            type?: string;
        }>({
            query: ({ page = 0, size = 20, status, type }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    size: size.toString(),
                });

                if (status && status !== 'all') {
                    params.append('status', status);
                }
                if (type && type !== 'all') {
                    params.append('type', type);
                }

                return `?${params.toString()}`;
            },
            providesTags: ['Complaint'],
        }),
        handleComplaint: builder.mutation<ComplaintResponse, {
            complaintId: number;
            status: string;
            adminNotes?: string;
        }>({
            query: ({ complaintId, status, adminNotes }) => {
                const params = new URLSearchParams({
                    status: status,
                });

                if (adminNotes) {
                    params.append('adminNotes', adminNotes);
                }

                return {
                    url: `/${complaintId}/handle?${params.toString()}`,
                    method: 'PUT',
                };
            },
            invalidatesTags: ['Complaint'],
        }),
    }),
});

// Export hooks
export const {
    useCreateComplaintMutation,
    useGetAllComplaintsQuery,
    useHandleComplaintMutation,
} = complaintApi;