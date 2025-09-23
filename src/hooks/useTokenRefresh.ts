// src/hooks/useTokenRefresh.ts
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useRefreshTokenMutation } from '../store/api/authApi';
import { setCredentials, logout } from '../store/slices/authSlice';

interface TokenPayload {
    exp: number;
    email: string;
    role: string;
    userId: number;
}

export const useTokenRefresh = () => {
    const dispatch = useDispatch();
    const { token, refreshToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [refreshTokenMutation] = useRefreshTokenMutation();

    // JWT token'ını decode et
    const decodeToken = useCallback((token: string): TokenPayload | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }, []);

    // Token süresini kontrol et
    const isTokenExpired = useCallback((token: string): boolean => {
        const decoded = decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    }, [decodeToken]);

    // Token'ın yakında süresi dolacak mı kontrol et (5 dakika önce)
    const isTokenExpiringSoon = useCallback((token: string): boolean => {
        const decoded = decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        const fiveMinutes = 5 * 60;
        return (decoded.exp - currentTime) < fiveMinutes;
    }, [decodeToken]);

    // Token yenileme fonksiyonu
    const refreshAccessToken = useCallback(async () => {
        if (!refreshToken) {
            console.log('No refresh token available');
            dispatch(logout());
            return false;
        }

        // Refresh token'ın da süresi dolmuş mu kontrol et
        if (isTokenExpired(refreshToken)) {
            console.log('Refresh token expired, logging out');
            dispatch(logout());
            return false;
        }

        try {
            console.log('Refreshing access token...');
            const result = await refreshTokenMutation({ refreshToken }).unwrap();

            dispatch(setCredentials({
                user: result.user!,
                token: result.token!,
                refreshToken: result.refreshToken || refreshToken,
            }));

            console.log('Token refreshed successfully');
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            dispatch(logout());
            return false;
        }
    }, [refreshToken, refreshTokenMutation, dispatch, isTokenExpired]);

    // Periyodik token kontrolü
    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const checkToken = async () => {
            // Token süresi dolmuşsa hemen yenile
            if (isTokenExpired(token)) {
                console.log('Token expired, refreshing...');
                await refreshAccessToken();
                return;
            }

            // Token yakında süresi dolacaksa yenile
            if (isTokenExpiringSoon(token)) {
                console.log('Token expiring soon, refreshing...');
                await refreshAccessToken();
                return;
            }
        };

        // İlk kontrol
        checkToken();

        // Her 2 dakikada bir kontrol et
        const interval = setInterval(checkToken, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, [token, isAuthenticated, isTokenExpired, isTokenExpiringSoon, refreshAccessToken]);

    // Manuel token yenileme fonksiyonu
    const manualRefresh = useCallback(async () => {
        if (!isAuthenticated) return false;
        return await refreshAccessToken();
    }, [isAuthenticated, refreshAccessToken]);

    // Token durumu
    const tokenStatus = {
        isValid: token ? !isTokenExpired(token) : false,
        isExpiringSoon: token ? isTokenExpiringSoon(token) : false,
        timeUntilExpiry: token ? (() => {
            const decoded = decodeToken(token);
            if (!decoded) return 0;
            return Math.max(0, decoded.exp - (Date.now() / 1000));
        })() : 0,
    };

    return {
        tokenStatus,
        manualRefresh,
        refreshAccessToken,
    };
};