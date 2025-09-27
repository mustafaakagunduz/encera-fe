'use client';

import React, { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import PropertyGrid from './PropertyGrid';
import PropertyFilterModal from './PropertyFilterModal';
import { useGetAllPropertiesQuery } from '@/store/api/propertyApi';

interface FilterState {
    propertyType: string;
    listingType: string;
    minPrice: string;
    maxPrice: string;
    city: string;
    district: string;
    roomCount: string;
    minArea: string;
    maxArea: string;
    features: string[];
    sortBy: string;
}

const HomeSection: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

    // Backend'den sadece pappSellable=true olan ilanları çek
    const { data: propertiesData, isLoading: loading, error } = useGetAllPropertiesQuery({
        page: 0,
        size: 50
    });

    // Sadece Encera ilanlarını filtrele (pappSellable = true)
    const enceraProperties = React.useMemo(() => {
        if (!propertiesData?.content) {
            return [];
        }
        const filtered = propertiesData.content.filter(property => property.pappSellable === true);
        return filtered;
    }, [propertiesData]);

    const [filters, setFilters] = useState<FilterState>({
        propertyType: '',
        listingType: '',
        minPrice: '',
        maxPrice: '',
        city: '',
        district: '',
        roomCount: '',
        minArea: '',
        maxArea: '',
        features: [],
        sortBy: 'newest'
    });

    useEffect(() => {
        if (isReady) {
            setIsVisible(true);
        }
    }, [isReady]);


    const applyFilters = (newFilters: FilterState) => {
        setFilters(newFilters);

        let filtered = [...enceraProperties];

        // Apply filters
        if (newFilters.propertyType) {
            filtered = filtered.filter(p => p.propertyType === newFilters.propertyType);
        }
        if (newFilters.listingType) {
            filtered = filtered.filter(p => p.listingType === newFilters.listingType);
        }
        if (newFilters.minPrice) {
            filtered = filtered.filter(p => p.price >= parseInt(newFilters.minPrice));
        }
        if (newFilters.maxPrice) {
            filtered = filtered.filter(p => p.price <= parseInt(newFilters.maxPrice));
        }
        if (newFilters.roomCount) {
            filtered = filtered.filter(p => p.roomConfiguration?.roomCount === parseInt(newFilters.roomCount));
        }
        if (newFilters.minArea) {
            filtered = filtered.filter(p => p.grossArea && p.grossArea >= parseInt(newFilters.minArea));
        }
        if (newFilters.maxArea) {
            filtered = filtered.filter(p => p.grossArea && p.grossArea <= parseInt(newFilters.maxArea));
        }

        // Apply search - şu an için disabled
        // if (searchQuery) {
        //     filtered = filtered.filter(p =>
        //         p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //         p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //         p.district.toLowerCase().includes(searchQuery.toLowerCase())
        //     );
        // }

        // Apply sorting
        switch (newFilters.sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'area-large':
                filtered.sort((a, b) => (b.grossArea || 0) - (a.grossArea || 0));
                break;
            case 'area-small':
                filtered.sort((a, b) => (a.grossArea || 0) - (b.grossArea || 0));
                break;
        }

        setFilteredProperties(filtered);
    };

    useEffect(() => {
        // Encera ilanları yüklendiğinde filtrelenmiş listeyi güncelle
        if (enceraProperties.length > 0) {
            applyFilters(filters);
        }
    }, [enceraProperties]);

    // i18n yüklenene kadar loading göster
    if (!isReady) {
        return (
            <section className="relative min-h-screen bg-gray-50">
                <div className="flex items-center justify-center w-full h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-800/20 border-t-blue-800"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-screen bg-gray-50">

            <div className="relative h-full flex flex-col">
                {/* Main Content - Full Screen Layout */}
                <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-40 pb-8 max-w-7xl mx-auto w-full">
                    {error ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-600">{t('properties-section.error-loading')}</p>
                        </div>
                    ) : (
                        <PropertyGrid
                            properties={filteredProperties}
                            loading={loading}
                            onLoadMore={() => {}}
                            hasMore={false}
                        />
                    )}
                </div>
            </div>

            {/* Filter Modal */}
            <PropertyFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApplyFilters={applyFilters}
                currentFilters={filters}
            />

        </section>
    );
};

export default HomeSection;