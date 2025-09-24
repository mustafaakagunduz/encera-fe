'use client';

import React, { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { SlidersHorizontal, Map, Grid3X3, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyGrid from './PropertyGrid';
import PropertyFilterModal from './PropertyFilterModal';
import { useGetAllPropertiesQuery } from '@/store/api/propertyApi';

// Mock data - replace with actual API call
const mockProperties = [
    {
        id: 1,
        title: "Merkezi konumda lüks 3+1 daire",
        price: 2500000,
        currency: "TL",
        location: {
            city: "İstanbul",
            district: "Beşiktaş",
            neighborhood: "Levent"
        },
        propertyType: "RESIDENTIAL",
        listingType: "SALE",
        roomCount: "3+1",
        area: 150,
        images: [],
        viewCount: 234,
        createdAt: "2024-01-15",
        isFeatured: true
    },
    {
        id: 2,
        title: "Deniz manzaralı kiralık villa",
        price: 15000,
        currency: "TL",
        location: {
            city: "Antalya",
            district: "Muratpaşa",
            neighborhood: "Lara"
        },
        propertyType: "RESIDENTIAL",
        listingType: "RENT",
        roomCount: "4+1",
        area: 250,
        images: [],
        viewCount: 156,
        createdAt: "2024-01-14",
        isFeatured: false
    },
    {
        id: 3,
        title: "İş merkezi kiralık ofis",
        price: 8000,
        currency: "TL",
        location: {
            city: "Ankara",
            district: "Çankaya",
            neighborhood: "Kızılay"
        },
        propertyType: "COMMERCIAL",
        listingType: "RENT",
        roomCount: "3+1",
        area: 120,
        images: [],
        viewCount: 89,
        createdAt: "2024-01-13",
        isFeatured: false
    },
    {
        id: 4,
        title: "Yatırımlık arsa imarlı",
        price: 1200000,
        currency: "TL",
        location: {
            city: "İzmir",
            district: "Bornova",
            neighborhood: "Erzene"
        },
        propertyType: "LAND",
        listingType: "SALE",
        roomCount: "-",
        area: 500,
        images: [],
        viewCount: 67,
        createdAt: "2024-01-12",
        isFeatured: true
    },
    {
        id: 5,
        title: "Günlük kiralık lüks apart",
        price: 350,
        currency: "TL",
        location: {
            city: "Muğla",
            district: "Bodrum",
            neighborhood: "Merkez"
        },
        propertyType: "RESIDENTIAL",
        listingType: "DAILY_RENTAL",
        roomCount: "2+1",
        area: 85,
        images: [],
        viewCount: 412,
        createdAt: "2024-01-11",
        isFeatured: false
    },
    {
        id: 6,
        title: "Şehir merkezinde satılık dükkan",
        price: 800000,
        currency: "TL",
        location: {
            city: "Bursa",
            district: "Osmangazi",
            neighborhood: "Heykel"
        },
        propertyType: "COMMERCIAL",
        listingType: "SALE",
        roomCount: "1+0",
        area: 45,
        images: [],
        viewCount: 123,
        createdAt: "2024-01-10",
        isFeatured: false
    }
];

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

const PropertiesSection: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

    // Backend'den ilanları çek - sadece ilk 50'sini al
    const { data: propertiesData, isLoading: loading, error } = useGetAllPropertiesQuery({
        page: 0,
        size: 50
    });

    // Sadece Encera ilanlarını filtrele
    const enceraProperties = React.useMemo(() => {
        if (!propertiesData?.content) return [];
        return propertiesData.content.filter(property => property.pappSellable === true);
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

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.district.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFilters(filters);
    };

    useEffect(() => {
        // Encera ilanları yüklendiğinde filtrelenmiş listeyi güncelle
        if (enceraProperties.length > 0) {
            applyFilters(filters);
        }
    }, [enceraProperties]);

    useEffect(() => {
        // Arama sorgusu değiştiğinde filtreyi yeniden uygula
        applyFilters(filters);
    }, [searchQuery]);

    // i18n yüklenene kadar loading göster
    if (!isReady) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </section>
        );
    }

    // Error durumu
    if (error) {
        return (
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-red-600">{t('properties-section.error-loading')}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('home.properties.title')}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('home.properties.subtitle')}
                    </p>
                </div>

                {/* Search and Controls */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('home.search-placeholder')}
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'map'
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Map className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Filter Button */}
                            <Button
                                onClick={() => setIsFilterModalOpen(true)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                {t('common.filter')}
                                {/* Filter count badge */}
                                {Object.values(filters).some(v => v !== '' && (Array.isArray(v) ? v.length > 0 : true)) && filters.sortBy !== 'newest' && (
                                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {Object.values(filters).filter(v => v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length - 1}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {loading ? t('common.loading') : t('properties-section.results-count', { count: filteredProperties.length })}
                        </span>
                        {searchQuery && (
                            <span>
                                {t('properties-section.search-results', { query: searchQuery })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'grid' ? (
                    <PropertyGrid
                        properties={filteredProperties}
                        loading={loading}
                        onLoadMore={() => {}} // Implement pagination
                        hasMore={false}
                    />
                ) : (
                    <div className="bg-gray-100 rounded-xl p-8 text-center">
                        <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {t('properties-section.map-view')}
                        </h3>
                        <p className="text-gray-600">
                            {t('properties-section.map-coming-soon')}
                        </p>
                    </div>
                )}

                {/* Filter Modal */}
                <PropertyFilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    onApplyFilters={applyFilters}
                    currentFilters={filters}
                />
            </div>
        </section>
    );
};

export default PropertiesSection;