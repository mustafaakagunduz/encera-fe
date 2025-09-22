// src/store/api/notificationApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface NotificationResponse {
    id: number;
    type: 'COMPLAINT_APPROVED' | 'COMPLAINT_REJECTED' | 'COMPLAINT_IN_REVIEW' | 'PROPERTY_REPORTED_APPROVED' | 'PROFILE_REPORTED_APPROVED' | 'PROPERTY_APPROVED' | 'PROPERTY_REJECTED' | 'PROPERTY_FEATURED' | 'MESSAGE_RECEIVED' | 'SYSTEM_ANNOUNCEMENT';
    title: string;
    message: string;
    relatedEntityId?: number;
    relatedEntityType?: string;
    actionUrl?: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

export interface NotificationsPageResponse {
    content: NotificationResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface NotificationCountResponse {
    count: number;
}

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8081/api/notifications',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        getUserNotifications: builder.query<NotificationsPageResponse, {
            page?: number;
            size?: number;
        }>({
            query: ({ page = 0, size = 20 }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    size: size.toString(),
                });
                return `?${params.toString()}`;
            },
            providesTags: ['Notification'],
        }),
        getUnreadNotifications: builder.query<NotificationResponse[], void>({
            query: () => '/unread',
            providesTags: ['Notification'],
        }),
        getUnreadNotificationCount: builder.query<NotificationCountResponse, void>({
            query: () => '/unread/count',
            providesTags: ['Notification'],
        }),
        markNotificationAsRead: builder.mutation<{ message: string }, number>({
            query: (notificationId) => ({
                url: `/${notificationId}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/read-all',
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

// Export hooks
export const {
    useGetUserNotificationsQuery,
    useGetUnreadNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
} = notificationApi;