// src/components/property/PropertyErrorState.tsx
'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const PropertyErrorState: React.FC = () => {
    const { t, isReady } = useAppTranslation();

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center px-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {isReady ? 'Bir hata oluştu' : 'An error occurred'}
                </h2>

                <p className="text-gray-600 mb-4 max-w-md">
                    {isReady
                        ? 'İlanları yüklerken bir sorun yaşandı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'
                        : 'There was a problem loading the listings. Please refresh the page or try again later.'
                    }
                </p>

                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {isReady ? 'Sayfayı Yenile' : 'Refresh Page'}
                </button>
            </div>
        </div>
    );
};