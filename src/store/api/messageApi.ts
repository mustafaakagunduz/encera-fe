import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQuery';
import { buildApiUrl } from './config';

export interface MessageRequest {
  receiverId: number;
  propertyId?: number;
  content: string;
}

export interface MessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  propertyId?: number;
  propertyTitle?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

export interface ConversationResponse {
  otherUserId: number;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  hasUnreadMessages: boolean;
  unreadCount: number;
  propertyId?: number;
  propertyTitle?: string;
}

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: createBaseQueryWithAuth(buildApiUrl('messages')),
  tagTypes: ['Message', 'Conversation'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation<MessageResponse, MessageRequest>({
      query: (messageData) => ({
        url: '',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),

    getUserConversations: builder.query<ConversationResponse[], void>({
      query: () => '/conversations',
      providesTags: ['Conversation'],
    }),

    getConversation: builder.query<MessageResponse[], number>({
      query: (otherUserId) => `/conversation/${otherUserId}`,
      providesTags: ['Message'],
    }),

    markAsRead: builder.mutation<void, number>({
      query: (messageId) => ({
        url: `/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),

    markConversationAsRead: builder.mutation<void, number>({
      query: (otherUserId) => ({
        url: `/conversation/${otherUserId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),

    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/unread-count',
      providesTags: ['Message'],
    }),

    getUserMessages: builder.query<{
      content: MessageResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: '',
        params: { page, size },
      }),
      providesTags: ['Message'],
    }),

    getPropertyMessages: builder.query<MessageResponse[], number>({
      query: (propertyId) => `/property/${propertyId}`,
      providesTags: ['Message'],
    }),

    deleteMessage: builder.mutation<void, number>({
      query: (messageId) => ({
        url: `/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),

    deleteConversation: builder.mutation<void, number>({
      query: (otherUserId) => ({
        url: `/conversation/${otherUserId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message', 'Conversation'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetUserConversationsQuery,
  useGetConversationQuery,
  useMarkAsReadMutation,
  useMarkConversationAsReadMutation,
  useGetUnreadCountQuery,
  useGetUserMessagesQuery,
  useGetPropertyMessagesQuery,
  useDeleteMessageMutation,
  useDeleteConversationMutation,
} = messageApi;
