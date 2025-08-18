// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserResponse } from '../api/authApi';

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    pendingVerificationEmail: string | null;
    isHydrated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingVerificationEmail: null,
    isHydrated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: UserResponse; token: string; refreshToken?: string }>) => {
            const { user, token, refreshToken } = action.payload;
            state.user = user;
            state.token = token;
            state.refreshToken = refreshToken || null;
            state.isAuthenticated = true;
            state.error = null;

            // Store in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                localStorage.setItem('user', JSON.stringify(user));
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            state.pendingVerificationEmail = null;

            // Clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setPendingVerificationEmail: (state, action: PayloadAction<string | null>) => {
            state.pendingVerificationEmail = action.payload;
        },
        initializeAuth: (state) => {
            // Check if we're in browser environment
            if (typeof window !== 'undefined') {
                // Initialize from localStorage
                const token = localStorage.getItem('token');
                const refreshToken = localStorage.getItem('refreshToken');
                const user = localStorage.getItem('user');

                if (token && user) {
                    state.token = token;
                    state.refreshToken = refreshToken;
                    state.user = JSON.parse(user);
                    state.isAuthenticated = true;
                }
            }

            // Mark as hydrated
            state.isHydrated = true;
        },
    },
});

export const {
    setCredentials,
    logout,
    setError,
    clearError,
    setLoading,
    setPendingVerificationEmail,
    initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;