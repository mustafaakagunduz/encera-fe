// src/components/user/MyListingsTable.tsx
'use client';

import React, { useState } from 'react';
import { PropertyResponse } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { MyListingsRow } from './MyListingsRow';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {MyListingsMobileCard} from "@/components/user/MyListingsMobileCard";

interface MyListingsTableProps {
    properties: PropertyResponse[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const MyListingsTable: React.FC<MyListingsTableProps> = ({
                                                                    properties,
                                                                    currentPage,
                                                                    totalPages,
                                                                    onPageChange
                                                                }) => {
    const { t, isReady } = useAppTranslation();

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.title') : 'Başlık'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.type') : 'Tür'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.location') : 'Konum'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.price') : 'Fiyat'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.status') : 'Durum'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.views') : 'Görüntülenme'}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.created-date') : 'Oluşturma Tarihi'}
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {isReady ? t('my-listings.table.actions') : 'İşlemler'}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {properties.map((property) => (
                        <MyListingsRow key={property.id} property={property} />
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
                {properties.map((property) => (
                    <MyListingsMobileCard key={property.id} property={property} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                        {isReady ? t('common.page') : 'Sayfa'} {currentPage + 1} / {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};