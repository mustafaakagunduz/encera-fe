// src/components/user/MyListingsEmpty.tsx
'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Building2, Plus } from 'lucide-react';
import Link from 'next/link';

export const MyListingsEmpty: React.FC = () => {
    const { t, isReady } = useAppTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isReady ? t('my-listings.empty-state.title') : 'Henüz hiç ilanınız yok'}
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {isReady ? t('my-listings.empty-state.description') : 'İlk ilanınızı oluşturmaya başlayın'}
                    </p>

                    <Link
                        href="/create-listing"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {isReady ? t('my-listings.empty-state.create-button') : 'İlan Oluştur'}
                    </Link>
                </div>
            </div>
        </div>
    );
};