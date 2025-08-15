'use client';

import { useEffect } from 'react';
import '@/lib/i18n';

interface I18nProviderProps {
    children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    useEffect(() => {
        // i18n initialization happens in the imported file
    }, []);

    return <>{children}</>;
}