'use client';

import React, { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Building2, Users, MapPin, Award, ArrowRight, CheckCircle } from 'lucide-react';
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

    const stats = [
        {
            icon: Award,
            value: t('home.company-intro.stats.experience'),
            label: t('home.company-intro.stats.experience-label')
        },
        {
            icon: Building2,
            value: t('home.company-intro.stats.properties'),
            label: t('home.company-intro.stats.properties-label')
        },
        {
            icon: MapPin,
            value: t('home.company-intro.stats.cities'),
            label: t('home.company-intro.stats.cities-label')
        },
        {
            icon: Users,
            value: t('home.company-intro.stats.customers'),
            label: t('home.company-intro.stats.customers-label')
        }
    ];

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
            <section className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images/company-intro-bg.webp)' }}>
                <div className="flex items-center justify-center w-full h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-800/20 border-t-blue-800"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: 'url(/images/company-intro-bg.webp)' }}>
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}
                ></div>
            </div>

            <div className="relative h-full flex flex-col">
                {/* Premium Badge */}
                <div className="relative z-10 pt-32 lg:pt-36 text-center">
                    <div className="inline-flex items-center gap-2 px-3 md:px-6 lg:px-8 py-1.5 md:py-3 lg:py-4 rounded-full bg-blue-100/50 border border-blue-200/50 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-blue-700" />
                        <span className="text-blue-800 font-semibold text-xs md:text-base">{t('home.company-intro.badge')}</span>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-center">

                        {/* Sol Taraf - İstatistikler */}
                        <div className={`text-center lg:text-left transition-all duration-800 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="group relative bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 rounded-xl p-4"
                                            style={{
                                                animationDelay: `${index * 150}ms`
                                            }}
                                        >
                                            <div className="text-center flex flex-col items-center justify-center h-full">
                                                <h3 className="font-bold text-blue-900 mb-1 text-xl lg:text-2xl">
                                                    {stat.value}
                                                </h3>
                                                <p className="text-blue-800 font-semibold leading-tight text-xs lg:text-sm">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Sağ Taraf - İlanlar */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-6 h-[500px] lg:h-[600px] overflow-hidden">
                            {error ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-600">{t('properties-section.error-loading')}</p>
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto custom-scrollbar">
                                    <PropertyGrid
                                        properties={filteredProperties}
                                        loading={loading}
                                        onLoadMore={() => {}}
                                        hasMore={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <PropertyFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApplyFilters={applyFilters}
                currentFilters={filters}
            />

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </section>
    );
};

export default HomeSection;