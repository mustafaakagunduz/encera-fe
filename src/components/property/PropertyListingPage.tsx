// src/components/property/PropertyListingPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { PropertyType, PropertySearchFilters, useSearchPropertiesWithFiltersQuery, useGetPropertiesByPropertyTypeQuery } from '@/store/api/propertyApi';
import { PropertyListContainer } from './PropertyListContainer';
import { PropertyListHeader } from './PropertyListHeader';
import { PropertyErrorState } from './PropertyErrorState';

interface PropertyListingPageProps {
    propertyType: PropertyType;
    pageTitle: string;
    fallbackTitle: string;
    linkPrefix: string;
}

export const PropertyListingPage: React.FC<PropertyListingPageProps> = ({
                                                                            propertyType,
                                                                            pageTitle,
                                                                            fallbackTitle,
                                                                            linkPrefix
                                                                        }) => {
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL'den filtreleri al
    const [filters, setFilters] = useState<PropertySearchFilters>(() => {
        const urlFilters: PropertySearchFilters = { propertyType };

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
        if (searchParams.get('elevator') === 'true') {
            urlFilters.elevator = true;
        }
        if (searchParams.get('parking') === 'true') {
            urlFilters.parking = true;
        }
        if (searchParams.get('balcony') === 'true') {
            urlFilters.balcony = true;
        }
        if (searchParams.get('security') === 'true') {
            urlFilters.security = true;
        }
        if (searchParams.get('furnished') === 'true') {
            urlFilters.furnished = true;
        }

        return urlFilters;
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [viewType, setViewType] = useState<'list'>('list');
    const [sortBy, setSortBy] = useState(() =>
        searchParams.get('sort') || 'createdAt-desc'
    );

    // URL'i güncellemek için
    const updateURL = (newFilters: PropertySearchFilters, newSort?: string, newPage?: number) => {
        const params = new URLSearchParams();

        // Filtreleri URL'e ekle
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && key !== 'propertyType') {
                params.set(key, value.toString());
            }
        });

        // Sıralama
        const currentSort = newSort || sortBy;
        if (currentSort !== 'createdAt-desc') {
            params.set('sort', currentSort);
        }

        // Sayfa
        const currentPageNum = newPage !== undefined ? newPage : currentPage;
        if (currentPageNum > 0) {
            params.set('page', currentPageNum.toString());
        }

        // URL'i güncelle
        const newURL = params.toString() ? `?${params.toString()}` : '';
        router.replace(`${linkPrefix}${newURL}`, { scroll: false });
    };

    const handleFiltersChange = (newFilters: PropertySearchFilters) => {
        setFilters(newFilters);
        setCurrentPage(0);
        updateURL(newFilters, sortBy, 0);
    };

    const clearFilters = () => {
        const clearedFilters: PropertySearchFilters = { propertyType };
        setFilters(clearedFilters);
        setCurrentPage(0);
        updateURL(clearedFilters, 'createdAt-desc', 0);
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(0);
        updateURL(filters, newSort, 0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateURL(filters, sortBy, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filters var mı kontrolü
    const hasActiveFilters = Object.keys(filters).some(key => 
        key !== 'propertyType' && filters[key as keyof PropertySearchFilters] !== undefined
    );

    // API query - filtre varsa search kullan, yoksa propertyType query kullan
    const { data: searchResult, isLoading, error } = hasActiveFilters 
        ? useSearchPropertiesWithFiltersQuery({
            ...filters,
            page: currentPage,
            size: pageSize,
            sort: sortBy
        })
        : useGetPropertiesByPropertyTypeQuery({
            propertyType,
            page: currentPage,
            size: pageSize
        });

    // URL parametrelerinin değişmesini dinle
    useEffect(() => {
        const pageFromURL = searchParams.get('page');
        if (pageFromURL && parseInt(pageFromURL) !== currentPage) {
            setCurrentPage(parseInt(pageFromURL));
        }
    }, [searchParams]);

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <PropertyListHeader
                    title={isReady ? t(pageTitle) : fallbackTitle}
                    viewType={viewType}
                    onViewTypeChange={setViewType}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                    propertyType={propertyType}
                />
                <PropertyErrorState />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <PropertyListHeader
                title={isReady ? t(pageTitle) : fallbackTitle}
                viewType={viewType}
                onViewTypeChange={setViewType}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                propertyType={propertyType}
            />

            {/* Container */}
            <PropertyListContainer
                filters={filters}
                currentPage={currentPage}
                pagesize={pageSize}
                sortBy={sortBy}
                viewType={viewType}
                properties={searchResult?.content || []}
                isLoading={isLoading}
                totalPages={searchResult?.totalPages || 0}
                totalElements={searchResult?.totalElements || 0}
                onPageChange={handlePageChange}
                linkPrefix={linkPrefix}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
                propertyType={propertyType}
                emptyTitle={isReady ? 'İlan bulunamadı' : 'No listings found'}
                emptyDescription={isReady
                    ? 'Aradığınız kriterlere uygun ilan bulunmuyor.'
                    : 'No listings match your criteria.'
                }
            />
        </div>
    );
};