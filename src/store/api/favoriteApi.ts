// src/store/api/favoriteApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQuery';
import { PropertyResponse } from './propertyApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export interface FavoriteToggleResponse {
    isFavorited: boolean;
    message: string;
}

export interface FavoriteStatusResponse {
    isFavorited: boolean;
}

export interface FavoriteIdsResponse {
    favoriteIds: number[];
}

export interface FavoriteCountResponse {
    count: number;
}

export interface PaginatedFavoritesResponse {
    content: PropertyResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export const favoriteApi = createApi({
    reducerPath: 'favoriteApi',
    baseQuery: createBaseQueryWithAuth(`${API_BASE_URL}/api/favorites`),
    tagTypes: ['Favorite'],
    endpoints: (builder) => ({
        toggleFavorite: builder.mutation<FavoriteToggleResponse, number>({
            query: (propertyId) => ({
                url: `/${propertyId}/toggle`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, propertyId) => [
                { type: 'Favorite', id: 'LIST' },
                { type: 'Favorite', id: propertyId },
            ],
        }),

        getFavoriteStatus: builder.query<FavoriteStatusResponse, number>({
            query: (propertyId) => `/${propertyId}/status`,
            providesTags: (result, error, propertyId) => [
                { type: 'Favorite', id: propertyId },
            ],
        }),

        getUserFavorites: builder.query<PaginatedFavoritesResponse, { page?: number; size?: number }>({
            query: ({ page = 0, size = 12 }) => ({
                url: '',
                params: { page, size },
            }),
            providesTags: ['Favorite'],
        }),

        getUserFavoriteIds: builder.query<FavoriteIdsResponse, void>({
            query: () => '/ids',
            providesTags: [{ type: 'Favorite', id: 'LIST' }],
        }),

        removeFavorite: builder.mutation<{ message: string }, number>({
            query: (propertyId) => ({
                url: `/${propertyId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, propertyId) => [
                { type: 'Favorite', id: 'LIST' },
                { type: 'Favorite', id: propertyId },
            ],
        }),

        getFavoriteCount: builder.query<FavoriteCountResponse, number>({
            query: (propertyId) => `/${propertyId}/count`,
        }),
    }),
});

export const {
    useToggleFavoriteMutation,
    useGetFavoriteStatusQuery,
    useGetUserFavoritesQuery,
    useGetUserFavoriteIdsQuery,
    useRemoveFavoriteMutation,
    useGetFavoriteCountQuery,
} = favoriteApi;

