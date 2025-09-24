// src/store/api/baseQuery.ts
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { setCredentials, logout } from '../slices/authSlice';
import { API_BASE_URL } from './config';

// Base API URL shared across the app (defaults to /api/proxy for prod)
const baseApiUrl = `${API_BASE_URL}`;

// Base query with auth headers
const baseQuery = fetchBaseQuery({
    baseUrl: baseApiUrl,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('content-type', 'application/json');
        return headers;
    },
});

// Create base query with custom baseUrl
export const createBaseQueryWithAuth = (baseUrl: string, skipContentType = false) => {
    const customBaseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // Skip content-type for file uploads
            if (!skipContentType) {
                headers.set('content-type', 'application/json');
            }
            return headers;
        },
    });

    // Enhanced base query with automatic token refresh
    const baseQueryWithReauth: BaseQueryFn<
        string | FetchArgs,
        unknown,
        FetchBaseQueryError
    > = async (args, api, extraOptions) => {
        // İlk request'i yap
        let result = await customBaseQuery(args, api, extraOptions);

        // Eğer 401 Unauthorized hatası alırsak, token refresh dene
        if (result.error && result.error.status === 401) {
            const state = api.getState() as any;
            const refreshToken = state.auth.refreshToken;

            if (refreshToken) {
                console.log('Token expired, attempting refresh...');

                // Refresh token ile yeni access token al
                const authBaseQuery = fetchBaseQuery({
                    baseUrl: `${baseApiUrl}/auth`,
                    prepareHeaders: (headers) => {
                        headers.set('content-type', 'application/json');
                        return headers;
                    },
                });

                const refreshResult = await authBaseQuery(
                    {
                        url: '/refresh',
                        method: 'POST',
                        body: JSON.stringify({ refreshToken }),
                    },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    // Yeni token'ları store'a kaydet
                    const authResponse = refreshResult.data as any;
                    api.dispatch(setCredentials({
                        user: authResponse.user,
                        token: authResponse.token,
                        refreshToken: authResponse.refreshToken || refreshToken,
                    }));

                    console.log('Token refreshed successfully');

                    // Orijinal request'i yeni token ile tekrar dene
                    result = await customBaseQuery(args, api, extraOptions);
                } else {
                    // Refresh token da geçersizse logout yap
                    console.log('Refresh token invalid, logging out...');
                    api.dispatch(logout());
                }
            } else {
                // Refresh token yoksa logout yap
                console.log('No refresh token available, logging out...');
                api.dispatch(logout());
            }
        }

        return result;
    };

    return baseQueryWithReauth;
};

// Default baseQuery with auth for main API
export const baseQueryWithRetry = createBaseQueryWithAuth(baseApiUrl);

// Default API base for reuse
export const createApiWithAuth = (reducerPath: string, baseUrl?: string) =>
    createApi({
        reducerPath,
        baseQuery: retry(createBaseQueryWithAuth(baseUrl || baseApiUrl), {
            maxRetries: 2,
        }),
        endpoints: () => ({}),
    });
