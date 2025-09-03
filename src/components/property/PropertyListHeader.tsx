// src/components/property/PropertyListHeader.tsx
'use client';

import React, { useState } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { PropertyType, PropertySearchFilters } from '@/store/api/propertyApi';
import { Home, Filter, SlidersHorizontal } from 'lucide-react';

interface PropertyListHeaderProps {
    title: string;
    viewType: 'list';
    onViewTypeChange: (type: 'list') => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    filters: PropertySearchFilters;
    onFiltersChange: (filters: PropertySearchFilters) => void;
    onClearFilters: () => void;
    propertyType: PropertyType;
    totalElements?: number; // Optional yapalım
}

export const PropertyListHeader: React.FC<PropertyListHeaderProps> = ({
                                                                          title,
                                                                          viewType,
                                                                          onViewTypeChange,
                                                                          sortBy,
                                                                          onSortChange,
                                                                          filters,
                                                                          onFiltersChange,
                                                                          onClearFilters,
                                                                          propertyType,
                                                                          totalElements = 0 // Default değer
                                                                      }) => {
    const { t, isReady } = useAppTranslation();
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const getIcon = () => {
        switch (propertyType) {
            case PropertyType.RESIDENTIAL:
                return <Home className="h-8 w-8 text-blue-600 mr-3" />;
            default:
                return <Home className="h-8 w-8 text-blue-600 mr-3" />;
        }
    };

    const getResultText = () => {
        if (totalElements === 0) return isReady ? 'Sonuç bulunamadı' : 'No results found';
        return isReady
            ? `${totalElements} ilan bulundu`
            : `${totalElements} listings found`;
    };

    // Aktif filtre sayısını hesapla
    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => {
            const value = filters[key as keyof PropertySearchFilters];
            return value !== undefined && value !== null && value !== '' && key !== 'propertyType';
        }).length;
    };

    return (
        <>
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getIcon()}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {title}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {getResultText()}
                                </p>
                            </div>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {/* Sort Selector */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => onSortChange(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="createdAt-desc">
                                        {isReady ? 'En Yeni' : 'Newest'}
                                    </option>
                                    <option value="createdAt-asc">
                                        {isReady ? 'En Eski' : 'Oldest'}
                                    </option>
                                    <option value="price-asc">
                                        {isReady ? 'En Düşük Fiyat' : 'Lowest Price'}
                                    </option>
                                    <option value="price-desc">
                                        {isReady ? 'En Yüksek Fiyat' : 'Highest Price'}
                                    </option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Clear Filters Button - Eğer aktif filtre varsa */}
                            {getActiveFiltersCount() > 0 && (
                                <button
                                    onClick={onClearFilters}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {isReady ? 'Filtreleri Temizle' : 'Clear Filters'}
                                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                                        {getActiveFiltersCount()}
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                {isReady ? 'Filtreler' : 'Filters'}
                                {getActiveFiltersCount() > 0 && (
                                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};