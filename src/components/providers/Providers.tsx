// src/components/providers/Providers.tsx - Bu değişiklikleri ekleyin

'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';
import { I18nProvider } from './I18nProvider'; // Bu import'u ekleyin

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize auth state from localStorage
        store.dispatch(initializeAuth());
    }, []);

    return (
        <Provider store={store}>
            <I18nProvider>
                {children}
            </I18nProvider>
        </Provider>
    );
}