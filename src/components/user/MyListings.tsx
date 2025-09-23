
// src/components/user/MyListings.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGetUserPropertiesQuery } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { MyListingsTable } from './MyListingsTable';
import { MyListingsStats } from './MyListingsStats';
import { MyListingsEmpty } from './MyListingsEmpty';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from '@/components/ui/toast';

export const MyListings: React.FC = () => {
    // TÜM HOOK'LARI EN BAŞTA ÇAĞIR
    const { t, isReady } = useAppTranslation();
    const { isAuthenticated } = useAuth();
    const { isHydrated } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'inactive'>('all');

    // Toast state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success'
    });

    // Toast state değişim log'u
    useEffect(() => {
        console.log('🎯 Toast state changed:', toast);
    }, [toast]);

    const { data, isLoading, error } = useGetUserPropertiesQuery({
        page: currentPage,
        size: pageSize
    }, {
        // Authentication ve hydration durumu hazır olmadan query çalıştırma
        skip: !isAuthenticated || !isHydrated
    });

    // Success toast functions
    const showToast = (message: string, type: 'success' | 'error') => {
        console.log('🔔 showToast called:', { message, type });
        setToast({ show: true, message, type });
        console.log('📊 Toast state updated:', { show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Success URL parameter kontrolü
    useEffect(() => {
        const success = searchParams.get('success');
        console.log('🔍 MyListings useEffect triggered:', { success, isReady });

        if (success === 'true') {
            console.log('✅ Success parameter found, showing toast');
            const message = isReady ? t('listing.create.success') : 'İlanınız başarıyla oluşturuldu!';
            console.log('📝 Toast message:', message);

            showToast(message, 'success');

            // URL'i temizle
            router.replace('/my-listings');
        }
    }, [searchParams, router, isReady, t]);

    // DATA PROCESSING - Hook'lardan sonra
    const properties = data?.content || [];
    const totalElements = data?.totalElements || 0;
    const totalPages = data?.totalPages || 0;

    // Filtreleme - useMemo ile optimize et
    const filteredProperties = useMemo(() => {
        return properties.filter(property => {
            const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.district.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'approved' && property.approved) ||
                (statusFilter === 'pending' && !property.approved) ||
                (statusFilter === 'inactive' && !property.active);

            return matchesSearch && matchesStatus;
        });
    }, [properties, searchTerm, statusFilter]);

    // Loading state - authentication hazır olmadan veya data yüklenirken
    if (!isHydrated || !isAuthenticated || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
                        <div className="h-4 bg-gray-300 rounded mb-8 w-96"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-300 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-red-600">
                        {isReady ? t('common.error-occurred') : 'Bir hata oluştu. Lütfen sayfayı yenileyin.'}
                    </div>
                </div>
            </div>
        );
    }

    if (totalElements === 0) {
        return <MyListingsEmpty />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <div className="container mx-auto px-4 py-6 sm:py-8">

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                                {isReady ? t('my-listings.title') : 'İlanlarım'}
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base">
                                {isReady ? t('my-listings.subtitle') : 'Oluşturduğunuz tüm ilanları buradan görüntüleyebilir ve yönetebilirsiniz'}
                            </p>
                        </div>
                        <Link
                            href="/create-listing"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isReady ? t('my-listings.empty-state.create-button') : 'İlan Oluştur'}
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <MyListingsStats properties={properties} />

                {/* Filters & Search */}
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={isReady ? t('my-listings.search.placeholder') : 'İlan ara...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">{isReady ? t('my-listings.filters.all') : 'Tümü'}</option>
                                <option value="approved">{isReady ? t('my-listings.filters.approved') : 'Onaylanmış'}</option>
                                <option value="pending">{isReady ? t('my-listings.filters.pending') : 'Onay Bekleyen'}</option>
                                <option value="inactive">{isReady ? t('my-listings.filters.inactive') : 'Pasif'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-600">
                        {filteredProperties.length} / {totalElements} {isReady ? t('my-listings.table.results-showing') : 'ilan gösteriliyor'}
                    </div>
                </div>

                {/* Table */}
                <MyListingsTable
                    properties={filteredProperties}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        show={toast.show}
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                </div>
            )}
        </div>
    );
};