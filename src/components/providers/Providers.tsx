'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { I18nProvider } from './I18nProvider';
import { TokenRefreshProvider } from './TokenRefreshProvider';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Initialize auth state from localStorage on client side only
        store.dispatch(initializeAuth());
    }, []);

    // Server-side rendering için loading göster
    if (!isClient) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Provider store={store}>
            <I18nProvider>
                <TokenRefreshProvider>
                    {children}
                </TokenRefreshProvider>
            </I18nProvider>
        </Provider>
    );
}