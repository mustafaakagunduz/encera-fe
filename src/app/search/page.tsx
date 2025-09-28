// src/app/search/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { smartSearchService, SmartSearchResponse, PropertySummary } from '@/services/smartSearchService';
import { Search, AlertCircle, Clock, Target, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { SearchResultsHeader } from '@/components/search/SearchResultsHeader';
import { SearchResultsContainer } from '@/components/search/SearchResultsContainer';
import { PropertyType, PropertySearchFilters } from '@/store/api/propertyApi';

const SearchResultsPage: React.FC = () => {
    const { t } = useAppTranslation();
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<SmartSearchResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    // Filter states
    const [filters, setFilters] = useState<PropertySearchFilters>(() => {
        const urlFilters: PropertySearchFilters = { propertyType: PropertyType.RESIDENTIAL };

        // URL parametrelerini okuyup filter objesine dönüştür
        if (searchParams.get('listingType')) {
            urlFilters.listingType = searchParams.get('listingType') as any;
        }
        if (searchParams.get('city')) {
            urlFilters.city = searchParams.get('city')!;
        }
        if (searchParams.get('district')) {
            urlFilters.district = searchParams.get('district')!;
        }
        if (searchParams.get('minPrice')) {
            urlFilters.minPrice = parseInt(searchParams.get('minPrice')!);
        }
        if (searchParams.get('maxPrice')) {
            urlFilters.maxPrice = parseInt(searchParams.get('maxPrice')!);
        }
        if (searchParams.get('minArea')) {
            urlFilters.minArea = parseInt(searchParams.get('minArea')!);
        }
        if (searchParams.get('maxArea')) {
            urlFilters.maxArea = parseInt(searchParams.get('maxArea')!);
        }
        if (searchParams.get('roomCount')) {
            urlFilters.roomCount = parseInt(searchParams.get('roomCount')!);
        }
        if (searchParams.get('hallCount')) {
            urlFilters.hallCount = parseInt(searchParams.get('hallCount')!);
        }

        return urlFilters;
    });

    const [tempFilters, setTempFilters] = useState<PropertySearchFilters>(filters);

    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query) {
            performSearch(query, currentPage, filters);
        }
    }, [query, currentPage, filters]);

    useEffect(() => {
        setTempFilters(filters);
    }, [filters]);

    const handleFiltersChange = (newFilters: PropertySearchFilters) => {
        setTempFilters(newFilters);
    };

    const applyFilters = (filtersToApply?: PropertySearchFilters) => {
        const finalFilters = filtersToApply || tempFilters;
        setFilters(finalFilters);
        setCurrentPage(0);
    };

    const clearFilters = () => {
        const clearedFilters: PropertySearchFilters = { propertyType: PropertyType.RESIDENTIAL };
        setFilters(clearedFilters);
        setTempFilters(clearedFilters);
        setCurrentPage(0);
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(0);
        if (query) {
            performSearch(query, 0, filters);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const performSearch = async (searchQuery: string, page: number = 0, appliedFilters?: PropertySearchFilters) => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Gelecekte smartSearchService'i filtreleri de alacak şekilde güncelleyebiliriz
            // Şimdilik sadece temel arama yapıyor, filtreleme client-side olabilir
            const result = await smartSearchService.smartSearch(searchQuery, page, 20);

            // Eğer filtre uygulanmışsa, sonuçları client-side filtrele
            if (appliedFilters && hasActiveFilters(appliedFilters)) {
                const filteredContent = result.results.content.filter((property: any) => {
                    return applyClientSideFilters(property, appliedFilters);
                });

                result.results.content = filteredContent;
                result.totalResults = filteredContent.length;
                result.results.totalElements = filteredContent.length;
                result.results.totalPages = Math.ceil(filteredContent.length / 20);
            }

            setSearchResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Arama sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const hasActiveFilters = (filterObj: PropertySearchFilters) => {
        return Object.keys(filterObj).some(key => {
            const value = filterObj[key as keyof PropertySearchFilters];
            return value !== undefined && value !== null && value !== '' && key !== 'propertyType';
        });
    };

    const applyClientSideFilters = (property: any, appliedFilters: PropertySearchFilters) => {
        // Fiyat filtresi
        if (appliedFilters.minPrice && property.price < appliedFilters.minPrice) return false;
        if (appliedFilters.maxPrice && property.price > appliedFilters.maxPrice) return false;

        // Alan filtresi
        if (appliedFilters.minArea && property.grossArea && property.grossArea < appliedFilters.minArea) return false;
        if (appliedFilters.maxArea && property.grossArea && property.grossArea > appliedFilters.maxArea) return false;

        // Oda sayısı filtresi
        if (appliedFilters.roomCount && property.roomCount && property.roomCount < appliedFilters.roomCount) return false;
        if (appliedFilters.hallCount && property.hallCount && property.hallCount < appliedFilters.hallCount) return false;

        // Konum filtresi
        if (appliedFilters.city && property.city !== appliedFilters.city) return false;
        if (appliedFilters.district && property.district !== appliedFilters.district) return false;

        return true;
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Aranıyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Arama Hatası</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    if (!searchResults) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Arama sonucu bulunamadı</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <SearchResultsHeader
                searchResults={searchResults}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                filters={tempFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                onApplyFilters={applyFilters}
                onShowMobileFilters={() => setShowMobileFilters(true)}
            />

            {/* Container */}
            <SearchResultsContainer
                searchResults={searchResults}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isLoading={false}
                error={null}
                filters={tempFilters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                onApplyFilters={applyFilters}
                showMobileFilters={showMobileFilters}
                onCloseMobileFilters={() => setShowMobileFilters(false)}
            />
        </div>
    );
};

export default SearchResultsPage;