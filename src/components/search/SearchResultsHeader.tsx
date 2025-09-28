// src/components/search/SearchResultsHeader.tsx
'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { SmartSearchResponse } from '@/services/smartSearchService';
import { Search, Clock, Target, MapPin, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { smartSearchService } from '@/services/smartSearchService';
import { PropertySearchFilters } from '@/store/api/propertyApi';

interface SearchResultsHeaderProps {
    searchResults: SmartSearchResponse;
    currentPage: number;
    onPageChange: (page: number) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    filters: PropertySearchFilters;
    onFiltersChange: (filters: PropertySearchFilters) => void;
    onClearFilters: () => void;
    onApplyFilters: (filters?: PropertySearchFilters) => void;
    onShowMobileFilters: () => void;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
    searchResults,
    currentPage,
    onPageChange,
    sortBy,
    onSortChange,
    filters,
    onFiltersChange,
    onClearFilters,
    onApplyFilters,
    onShowMobileFilters
}) => {
    const { t, isReady } = useAppTranslation();

    // Aktif filtre sayısını hesapla
    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => {
            const value = filters[key as keyof PropertySearchFilters];
            return value !== undefined && value !== null && value !== '' && key !== 'propertyType';
        }).length;
    };

    return (
        <div className="bg-white border-b">
            <div className="flex">
                <div className="lg:ml-80 flex-1">
                    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center">
                                <Search className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {isReady
                                            ? (t('search.results-for') === 'search results for'
                                                ? `search results for "${searchResults.originalQuery}"`
                                                : `"${searchResults.originalQuery}" ${t('search.results-for')}`)
                                            : `search results for "${searchResults.originalQuery}"`
                                        }
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        {searchResults.totalResults} {isReady ? t('search.results-found') : 'results found'}
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
                                        <option value="relevance">
                                            {isReady ? t('search.sort-relevance') : 'Relevance'}
                                        </option>
                                        <option value="price-asc">
                                            {isReady ? t('search.sort-price-low') : 'Lowest Price'}
                                        </option>
                                        <option value="price-desc">
                                            {isReady ? t('search.sort-price-high') : 'Highest Price'}
                                        </option>
                                        <option value="area-desc">
                                            {isReady ? t('search.sort-area-large') : 'Largest Area'}
                                        </option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                {getActiveFiltersCount() > 0 && (
                                    <button
                                        onClick={onClearFilters}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {isReady ? t('search.clear-filters') : 'Clear Filters'}
                                        <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                                            {getActiveFiltersCount()}
                                        </span>
                                    </button>
                                )}

                            </div>

                            {/* Mobile Filter Button */}
                            <div className="lg:hidden">
                                <button
                                    onClick={onShowMobileFilters}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                                    {isReady ? t('search.filters') : 'Filters'}
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
            </div>
        </div>
    );
};