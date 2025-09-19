// src/components/property/PropertyListContainer.tsx
'use client';

import React, { useState } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { PropertyType, PropertySearchFilters, useSearchPropertiesWithFiltersQuery } from '@/store/api/propertyApi';
import { PropertyListRow } from './PropertyListRow';
import { FilterSidebar } from './FilterSidebar';
import { EmptyState } from '../ui/EmptyState';
import { Search, AlertTriangle } from 'lucide-react';

interface PropertyListContainerProps {
    filters: PropertySearchFilters;
    currentPage: number;
    sortBy: string;
    viewType: 'list';
    properties: any[]; // Property tipini kullanabilirsiniz
    isLoading: boolean;
    error?: any;
    totalPages: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    linkPrefix: string;
    onFiltersChange: (filters: PropertySearchFilters) => void;
    onClearFilters: () => void;
    onApplyFilters: (filters?: PropertySearchFilters) => void;
    propertyType: PropertyType;
    emptyTitle: string;
    emptyDescription: string;
    pagesize?: number;
    showMobileFilters: boolean;
    onCloseMobileFilters: () => void;
}

export const PropertyListContainer: React.FC<PropertyListContainerProps> = ({
                                                                                properties,
                                                                                isLoading,
                                                                                error,
                                                                                viewType,
                                                                                totalPages,
                                                                                currentPage,
                                                                                sortBy,
                                                                                totalElements,
                                                                                onPageChange,
                                                                                linkPrefix,
                                                                                filters,
                                                                                onFiltersChange,
                                                                                onClearFilters,
                                                                                onApplyFilters,
                                                                                propertyType,
                                                                                emptyTitle,
                                                                                emptyDescription,
                                                                                pagesize = 20,
                                                                                showMobileFilters,
                                                                                onCloseMobileFilters
                                                                            }) => {
    const { t, isReady } = useAppTranslation();

    if (isLoading) {
        return (
            <div className="flex">
                <div className="flex w-full">
                    <div className="hidden lg:block w-80 flex-shrink-0 bg-white border-r fixed left-0 top-16 bottom-0 z-10">
                        <div className="h-full overflow-y-auto px-6 py-6">
                            <div className="bg-white rounded-lg border p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 lg:ml-80">
                        <div className="w-full">
                            <div className="w-full bg-white">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-b border-gray-200">
                                <div className="animate-pulse flex">
                                    <div className="bg-gray-300 border-r border-gray-200 h-32 w-48 flex-shrink-0"></div>
                                    <div className="p-4 sm:p-6 flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/4 mt-4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state - layout'u koru
    if (error) {
        return (
            <div className="flex">
                <div className="flex w-full">
                    {/* Filter Sidebar - Desktop */}
                    <div className="hidden lg:block w-80 flex-shrink-0 bg-white border-r fixed left-0 top-16 bottom-0 z-10">
                        <div className="h-full overflow-y-auto px-6 py-6">
                            <FilterSidebar
                                filters={filters}
                                onFiltersChange={onFiltersChange}
                                onClearFilters={onClearFilters}
                                onApplyFilters={onApplyFilters}
                                propertyType={propertyType}
                            />
                        </div>
                    </div>

                    {/* Main Content - Error State */}
                    <div className="flex-1 lg:ml-80">
                        <div className="w-full bg-white">
                            <div className="flex items-center justify-center py-12">
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
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        {isReady ? 'Sayfayı Yenile' : 'Refresh Page'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter - Error state */}
                    {showMobileFilters && (
                        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
                            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCloseMobileFilters}></div>
                            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform">
                                <div className="h-full overflow-y-auto p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {isReady ? 'Filtreler' : 'Filters'}
                                        </h3>
                                        <button
                                            onClick={onCloseMobileFilters}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <FilterSidebar
                                        filters={filters}
                                        onFiltersChange={onFiltersChange}
                                        onClearFilters={onClearFilters}
                                        onApplyFilters={(filters) => {
                                            onApplyFilters(filters);
                                            onCloseMobileFilters();
                                        }}
                                        propertyType={propertyType}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <div className="flex w-full">
                {/* Filter Sidebar - Desktop */}
                <div className="hidden lg:block w-80 flex-shrink-0 bg-white border-r fixed left-0 top-16 bottom-0 z-10">
                    <div className="h-full overflow-y-auto px-6 py-6">
                        <FilterSidebar
                            filters={filters}
                            onFiltersChange={onFiltersChange}
                            onClearFilters={onClearFilters}
                            onApplyFilters={onApplyFilters}
                            propertyType={propertyType}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 lg:ml-80">
                    <div className="w-full">
                    {/* Mobile Sort */}
                    <div className="lg:hidden mb-4 px-4 sm:px-6">
                        <select className="w-full appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="createdAt-desc">
                                {isReady ? 'En Yeni' : 'Newest'}
                            </option>
                            <option value="price-asc">
                                {isReady ? 'En Düşük Fiyat' : 'Lowest Price'}
                            </option>
                            <option value="price-desc">
                                {isReady ? 'En Yüksek Fiyat' : 'Highest Price'}
                            </option>
                        </select>
                    </div>

                    {/* Results */}
                    {properties.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title={emptyTitle}
                            description={emptyDescription}
                            action={{
                                label: isReady ? 'Filtreleri Temizle' : 'Clear Filters',
                                onClick: onClearFilters
                            }}
                        />
                    ) : (
                        <>
                            {/* Property List */}
                            <div className="w-full bg-white">
                                {/* Column Headers */}
                                <div className="hidden sm:block bg-gray-50 border-b border-gray-200">
                                    <div className="flex flex-row w-full py-2 items-center">
                                        {/* Image Space (No Header) */}
                                        <div className="flex-shrink-0 w-32 sm:w-48"></div>

                                        {/* Title Space (No Header) */}
                                        <div className="flex-1 min-w-0 px-2 sm:px-4"></div>

                                        {/* Data Column Headers */}
                                        <div className="flex-1 min-w-0 px-2 sm:px-4">
                                            <div className="grid grid-cols-5 gap-4 text-xs sm:text-sm font-medium text-gray-700">
                                                <div>{isReady ? t('filters.status') : 'Status'}</div>
                                                <div>{isReady ? t('filters.location') : 'Location'}</div>
                                                <div>{isReady ? t('filters.room-hall-count') : 'Rooms'}</div>
                                                <div>{isReady ? t('filters.area') : 'Area'}</div>
                                                <div>{isReady ? t('filters.date') : 'Date'}</div>
                                            </div>
                                        </div>

                                        {/* Price Column Header */}
                                        <div className="flex-shrink-0 w-24 sm:w-32 px-2 sm:px-4">
                                            <div className="text-xs sm:text-sm font-medium text-gray-700 text-right">
                                                {isReady ? t('filters.price') : 'Price'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Rows */}
                                <div>
                                    {properties.map((property, index) => (
                                        <div key={property.id} className={index === properties.length - 1 ? '[&>a>div>div]:border-b-0' : ''}>
                                            <PropertyListRow
                                                property={property}
                                                linkHref={`${linkPrefix}/${property.id}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 mx-4 sm:mx-6 lg:mx-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <button
                                            onClick={() => onPageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isReady ? 'Önceki' : 'Previous'}
                                        </button>
                                        <button
                                            onClick={() => onPageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isReady ? 'Sonraki' : 'Next'}
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">{currentPage * 20 + 1}</span>
                                                {' - '}
                                                <span className="font-medium">
                                                    {Math.min((currentPage + 1) * 20, totalElements)}
                                                </span>
                                                {' '}{isReady ? 'arası, toplam' : 'of'}{' '}
                                                <span className="font-medium">{totalElements}</span>
                                                {' '}{isReady ? 'sonuç' : 'results'}
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={() => onPageChange(currentPage - 1)}
                                                    disabled={currentPage === 0}
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">{isReady ? 'Önceki' : 'Previous'}</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                {/* Page Numbers */}
                                                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                                    const pageIndex = Math.max(0, Math.min(currentPage - 2 + index, totalPages - 5 + index));
                                                    if (pageIndex >= totalPages) return null;

                                                    return (
                                                        <button
                                                            key={pageIndex}
                                                            onClick={() => onPageChange(pageIndex)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                pageIndex === currentPage
                                                                    ? '-z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                            }`}
                                                        >
                                                            {pageIndex + 1}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => onPageChange(currentPage + 1)}
                                                    disabled={currentPage >= totalPages - 1}
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">{isReady ? 'Sonraki' : 'Next'}</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="lg:hidden">
                    <div className="fixed inset-0 z-50 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                                onClick={onCloseMobileFilters}
                            />

                            {/* Panel - Tüm ekranı kaplayan */}
                            <div className="fixed inset-0 flex">
                                <div className="relative w-full">
                                    <div className="h-full flex flex-col bg-white shadow-xl">
                                        {/* Header */}
                                        <div className="px-4 py-6 bg-gray-50 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    {isReady ? 'Filtreler' : 'Filters'}
                                                </h2>
                                                <button
                                                    type="button"
                                                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    onClick={onCloseMobileFilters}
                                                >
                                                    <span className="sr-only">Close</span>
                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto">
                                            <FilterSidebar
                                                filters={filters}
                                                onFiltersChange={onFiltersChange}
                                                onClearFilters={onClearFilters}
                                                onApplyFilters={onApplyFilters}
                                                propertyType={propertyType}
                                                isMobile={true}
                                                onClose={onCloseMobileFilters}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};