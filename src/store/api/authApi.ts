// src/store/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRetry } from './baseQuery';
import { buildApiUrl } from './config';

// Types
export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface EmailVerificationRequest {
    email: string;
    verificationCode: string;
}

export interface ResendCodeRequest {
    email: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface AuthResponse {
    token?: string;
    refreshToken?: string;
    type?: string;
    user?: UserResponse;
    message?: string;
}

export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    profilePictureUrl?: string;
    originalProfilePictureUrl?: string;
    coverImageUrl?: string;
    originalCoverImageUrl?: string;
}

export interface VerificationResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: UserResponse;
}

export interface PasswordResetResponse {
    success: boolean;
    message: string;
}

export interface ErrorResponse {
    error: string;
    message: string;
}

// Auth-specific base query (auth endpoints don't need token refresh)
const authBaseQuery = fetchBaseQuery({
    baseUrl: buildApiUrl('auth'),
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('content-type', 'application/json');
        return headers;
    },
});

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: authBaseQuery,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (credentials) => ({
                url: '/register',
                method: 'POST',
                body: credentials,
            }),
        }),
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        verifyEmail: builder.mutation<VerificationResponse, EmailVerificationRequest>({
            query: (data) => ({
                url: '/verify-email',
                method: 'POST',
                body: data,
            }),
        }),
        resendVerificationCode: builder.mutation<VerificationResponse, ResendCodeRequest>({
            query: (data) => ({
                url: '/resend-verification-code',
                method: 'POST',
                body: data,
            }),
        }),
        forgotPassword: builder.mutation<PasswordResetResponse, ForgotPasswordRequest>({
            query: (data) => ({
                url: '/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation<PasswordResetResponse, ResetPasswordRequest>({
            query: (data) => ({
                url: '/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
        validateResetToken: builder.query<PasswordResetResponse, string>({
            query: (token) => ({
                url: `/validate-reset-token?token=${token}`,
                method: 'GET',
            }),
        }),
        refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
            query: (data) => ({
                url: '/refresh',
                method: 'POST',
                body: data,
            }),
        }),
        logout: builder.mutation<{ message: string }, { refreshToken?: string }>({
            query: (data) => ({
                url: '/logout',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

// Export hooks
export const {
    useRegisterMutation,
    useLoginMutation,
    useVerifyEmailMutation,
    useResendVerificationCodeMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useLazyValidateResetTokenQuery,
    useRefreshTokenMutation,
    useLogoutMutation,
} = authApi;
