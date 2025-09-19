import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CommentRequest {
    propertyId: number;
    rating: number;
    comment: string;
}

export interface CommentResponse {
    id: number;
    propertyId: number;
    userId: number;
    userName: string;
    userFirstName: string;
    userLastName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface CommentListResponse {
    content: CommentResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const commentApi = createApi({
    reducerPath: 'commentApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8081/api/comments',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Comment'],
    endpoints: (builder) => ({
        addComment: builder.mutation<CommentResponse, CommentRequest>({
            query: (comment) => ({
                url: '',
                method: 'POST',
                body: comment,
            }),
            invalidatesTags: [{ type: 'Comment', id: 'LIST' }],
        }),
        getCommentsByProperty: builder.query<CommentListResponse, { propertyId: number; page?: number; size?: number }>({
            query: ({ propertyId, page = 0, size = 10 }) =>
                `/property/${propertyId}?page=${page}&size=${size}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.content.map(({ id }) => ({ type: 'Comment' as const, id })),
                        { type: 'Comment', id: 'LIST' },
                    ]
                    : [{ type: 'Comment', id: 'LIST' }],
        }),
        updateComment: builder.mutation<CommentResponse, { id: number; rating: number; comment: string }>({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Comment', id }],
        }),
        deleteComment: builder.mutation<void, number>({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Comment', id }],
        }),
        getPropertyRating: builder.query<{ averageRating: number; totalComments: number }, number>({
            query: (propertyId) => `/property/${propertyId}/rating`,
            providesTags: (result, error, propertyId) => [{ type: 'Comment', id: `RATING_${propertyId}` }],
        }),
    }),
});

export const {
    useAddCommentMutation,
    useGetCommentsByPropertyQuery,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useGetPropertyRatingQuery,
} = commentApi;