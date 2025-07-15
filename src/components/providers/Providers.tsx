// src/components/providers/Providers.tsx
'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize auth state from localStorage
        store.dispatch(initializeAuth());
    }, []);

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}