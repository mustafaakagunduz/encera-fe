'use client';

import React, { useEffect, useState } from 'react';
import '@/lib/i18n';

interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait a bit for i18n to initialize
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}