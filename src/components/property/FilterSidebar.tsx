// src/components/property/FilterSidebar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { PropertyType, ListingType, PropertySearchFilters } from '@/store/api/propertyApi';
import { locationService, City, District, Neighborhood } from '@/services/locationService';
import { Button } from '@/components/ui/button';
import {
    Filter,
    X,
    MapPin,
    DollarSign,
    Home,
    Sliders,
    ChevronDown,
    Loader2,
    Search
} from 'lucide-react';

interface FilterSidebarProps {
    filters: PropertySearchFilters;
    onFiltersChange: (filters: PropertySearchFilters) => void;
    onClearFilters: () => void;
    onApplyFilters: (filters?: PropertySearchFilters) => void;
    propertyType: PropertyType;
    isMobile?: boolean;
    onClose?: () => void;
}

// Fiyat aralıkları (TL)
const PRICE_RANGES = [
    { label: '100K - 500K', min: 100000, max: 500000 },
    { label: '500K - 1M', min: 500000, max: 1000000 },
    { label: '1M - 2M', min: 1000000, max: 2000000 },
    { label: '2M - 5M', min: 2000000, max: 5000000 },
    { label: '5M+', min: 5000000, max: undefined },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
                                                                filters,
                                                                onFiltersChange,
                                                                onClearFilters,
                                                                onApplyFilters,
                                                                propertyType,
                                                                isMobile = false,
                                                                onClose
                                                            }) => {
    const { t, isReady } = useAppTranslation();
    const [localFilters, setLocalFilters] = useState<PropertySearchFilters>(filters);

    // Location API states
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

    // Loading states
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);

    // Search states
    const [citySearch, setCitySearch] = useState('');
    const [districtSearch, setDistrictSearch] = useState('');
    const [neighborhoodSearch, setNeighborhoodSearch] = useState('');

    // Refs for outside click detection
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const districtDropdownRef = useRef<HTMLDivElement>(null);
    const neighborhoodDropdownRef = useRef<HTMLDivElement>(null);

    // Outside click handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
            if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
                setShowDistrictDropdown(false);
            }
            if (neighborhoodDropdownRef.current && !neighborhoodDropdownRef.current.contains(event.target as Node)) {
                setShowNeighborhoodDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // İlleri yükle
    useEffect(() => {
        const loadCities = async () => {
            setLoadingCities(true);
            try {
                const citiesData = await locationService.getCities();
                setCities(citiesData);
            } catch (error) {
                console.error('Cities loading error:', error);
            } finally {
                setLoadingCities(false);
            }
        };
        loadCities();
    }, []);

    // İl değiştiğinde ilçeleri yükle
    useEffect(() => {
        if (localFilters.city) {
            const selectedCityData = cities.find(city => city.name === localFilters.city);
            if (selectedCityData) {
                const loadDistricts = async () => {
                    setLoadingDistricts(true);
                    try {
                        const districtsData = await locationService.getDistricts(selectedCityData.id);
                        setDistricts(districtsData);
                    } catch (error) {
                        console.error('Districts loading error:', error);
                    } finally {
                        setLoadingDistricts(false);
                    }
                };
                loadDistricts();
            } else {
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    }, [localFilters.city, cities]);

    // İlçe değiştiğinde mahalleleri yükle
    useEffect(() => {
        if (localFilters.district && districts.length > 0) {
            const selectedDistrictData = districts.find(district => district.name === localFilters.district);
            if (selectedDistrictData) {
                const loadNeighborhoods = async () => {
                    setLoadingNeighborhoods(true);
                    try {
                        const neighborhoodsData = await locationService.getNeighborhoods(selectedDistrictData.id);
                        setNeighborhoods(neighborhoodsData);
                    } catch (error) {
                        console.error('Neighborhoods loading error:', error);
                    } finally {
                        setLoadingNeighborhoods(false);
                    }
                };
                loadNeighborhoods();
            } else {
                setNeighborhoods([]);
            }
        } else {
            setNeighborhoods([]);
        }
    }, [localFilters.district, districts]);

    // Filters prop'u değiştiğinde local state'i güncelle
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
        const newFilters = { ...localFilters, [key]: value };

        // Eğer şehir değişiyorsa, ilçe ve mahalle sıfırla
        if (key === 'city') {
            newFilters.district = undefined;
            newFilters.neighborhood = undefined;
        }

        // Eğer ilçe değişiyorsa, mahalle sıfırla
        if (key === 'district') {
            newFilters.neighborhood = undefined;
        }

        setLocalFilters(newFilters);
    };

    const handlePriceRangeSelect = (range: { min: number; max?: number }) => {
        const newFilters = {
            ...localFilters,
            minPrice: range.min,
            maxPrice: range.max
        };
        setLocalFilters(newFilters);
    };

    const handleApplyFilters = () => {
        onFiltersChange(localFilters);
        onApplyFilters(localFilters);
        if (onClose) onClose();
    };

    const handleClearFilters = () => {
        const clearedFilters: PropertySearchFilters = { propertyType };
        setLocalFilters(clearedFilters);
        onClearFilters();
        if (onClose) onClose();
    };

    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => {
            const value = filters[key as keyof PropertySearchFilters];
            return value !== undefined && value !== null && value !== '' && key !== 'propertyType';
        }).length;
    };

    // Popüler şehirler
    const popularCities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

    // Filtrelenmiş listeler
    const filteredCities = cities
        .filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase()))
        .sort((a, b) => {
            const aIndex = popularCities.indexOf(a.name);
            const bIndex = popularCities.indexOf(b.name);

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            return a.name.localeCompare(b.name, 'tr-TR');
        });

    const filteredDistricts = districts.filter(district =>
        district.name.toLowerCase().includes(districtSearch.toLowerCase())
    );

    const filteredNeighborhoods = neighborhoods.filter(neighborhood =>
        neighborhood.name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        {isReady ? 'Filtreler' : 'Filters'}
                        {getActiveFiltersCount() > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </h3>
                    {isMobile && onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* İlan Türü */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {isReady ? 'İlan Türü' : 'Listing Type'}
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="listingType"
                                    checked={!localFilters.listingType}
                                    onChange={() => handleFilterChange('listingType', undefined)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Tümü' : 'All'}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="listingType"
                                    checked={localFilters.listingType === ListingType.SALE}
                                    onChange={() => handleFilterChange('listingType', ListingType.SALE)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Satılık' : 'For Sale'}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="listingType"
                                    checked={localFilters.listingType === ListingType.RENT}
                                    onChange={() => handleFilterChange('listingType', ListingType.RENT)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Kiralık' : 'For Rent'}</span>
                            </label>
                        </div>
                    </div>

                    {/* Fiyat Aralığı */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {isReady ? 'Fiyat Aralığı' : 'Price Range'}
                        </label>

                        {/* Hızlı Fiyat Butonları */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {PRICE_RANGES.map((range, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePriceRangeSelect(range)}
                                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                                        localFilters.minPrice === range.min && localFilters.maxPrice === range.max
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>

                        {/* Özel Fiyat Inputları */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    {isReady ? 'Min Fiyat' : 'Min Price'}
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={localFilters.minPrice || ''}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    {isReady ? 'Max Fiyat' : 'Max Price'}
                                </label>
                                <input
                                    type="number"
                                    placeholder="Sınırsız"
                                    value={localFilters.maxPrice || ''}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Alan Aralığı */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Sliders className="w-4 h-4 mr-1" />
                            {isReady ? 'Alan (m²)' : 'Area (m²)'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder={isReady ? 'Min m²' : 'Min m²'}
                                value={localFilters.minArea || ''}
                                onChange={(e) => handleFilterChange('minArea', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                placeholder={isReady ? 'Max m²' : 'Max m²'}
                                value={localFilters.maxArea || ''}
                                onChange={(e) => handleFilterChange('maxArea', e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Oda Sayısı - Sadece konut için */}
                    {propertyType === PropertyType.RESIDENTIAL && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <Home className="w-4 h-4 mr-1" />
                                {isReady ? 'Oda Sayısı' : 'Room Count'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => handleFilterChange('roomCount',
                                            localFilters.roomCount === count ? undefined : count
                                        )}
                                        className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                                            localFilters.roomCount === count
                                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {count}+
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Konum - Türkiye API */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {isReady ? 'Konum' : 'Location'}
                        </label>

                        <div className="space-y-3">
                            {/* İl Seçimi */}
                            <div className="relative" ref={cityDropdownRef}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                                    disabled={loadingCities}
                                    className={`w-full justify-between ${
                                        localFilters.city ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    <span className="truncate">
                                        {localFilters.city || (isReady ? t('listing.location-fields.select-city') : 'İl Seçin')}
                                    </span>
                                    {loadingCities ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>

                                {showCityDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <div className="p-3 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder={isReady ? t('listing.location-fields.search-city') : 'İl ara...'}
                                                    value={citySearch}
                                                    onChange={(e) => setCitySearch(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredCities.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500">İl bulunamadı</div>
                                            ) : (
                                                filteredCities.map((city) => (
                                                    <button
                                                        key={city.id}
                                                        onClick={() => {
                                                            handleFilterChange('city', city.name);
                                                            setShowCityDropdown(false);
                                                            setCitySearch('');
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100"
                                                    >
                                                        {city.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* İlçe Seçimi */}
                            <div className="relative" ref={districtDropdownRef}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                                    disabled={!localFilters.city || loadingDistricts}
                                    className={`w-full justify-between ${
                                        localFilters.district ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    <span className="truncate">
                                        {localFilters.district || (isReady ? t('listing.location-fields.select-district') : 'İlçe Seçin')}
                                    </span>
                                    {loadingDistricts ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>

                                {showDistrictDropdown && districts.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <div className="p-3 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder={isReady ? t('listing.location-fields.search-district') : 'İlçe ara...'}
                                                    value={districtSearch}
                                                    onChange={(e) => setDistrictSearch(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredDistricts.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500">İlçe bulunamadı</div>
                                            ) : (
                                                filteredDistricts.map((district) => (
                                                    <button
                                                        key={district.id}
                                                        onClick={() => {
                                                            handleFilterChange('district', district.name);
                                                            setShowDistrictDropdown(false);
                                                            setDistrictSearch('');
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100"
                                                    >
                                                        {district.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mahalle Seçimi */}
                            <div className="relative" ref={neighborhoodDropdownRef}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
                                    disabled={!localFilters.district || loadingNeighborhoods}
                                    className={`w-full justify-between ${
                                        localFilters.neighborhood ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    <span className="truncate">
                                        {localFilters.neighborhood || (isReady ? t('listing.location-fields.select-neighborhood') : 'Mahalle Seçin')}
                                    </span>
                                    {loadingNeighborhoods ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>

                                {showNeighborhoodDropdown && neighborhoods.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <div className="p-3 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder={isReady ? t('listing.location-fields.search-neighborhood') : 'Mahalle ara...'}
                                                    value={neighborhoodSearch}
                                                    onChange={(e) => setNeighborhoodSearch(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredNeighborhoods.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500">Mahalle bulunamadı</div>
                                            ) : (
                                                filteredNeighborhoods.map((neighborhood) => (
                                                    <button
                                                        key={neighborhood.id}
                                                        onClick={() => {
                                                            handleFilterChange('neighborhood', neighborhood.name);
                                                            setShowNeighborhoodDropdown(false);
                                                            setNeighborhoodSearch('');
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100"
                                                    >
                                                        {neighborhood.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Özellikler */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {isReady ? 'Özellikler' : 'Features'}
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localFilters.elevator || false}
                                    onChange={(e) => handleFilterChange('elevator', e.target.checked || undefined)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Asansör' : 'Elevator'}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localFilters.parking || false}
                                    onChange={(e) => handleFilterChange('parking', e.target.checked || undefined)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Otopark' : 'Parking'}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localFilters.balcony || false}
                                    onChange={(e) => handleFilterChange('balcony', e.target.checked || undefined)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Balkon' : 'Balcony'}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localFilters.security || false}
                                    onChange={(e) => handleFilterChange('security', e.target.checked || undefined)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Güvenlik' : 'Security'}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localFilters.furnished || false}
                                    onChange={(e) => handleFilterChange('furnished', e.target.checked || undefined)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{isReady ? 'Eşyalı' : 'Furnished'}</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Mobile Actions */}
                {isMobile && (
                    <div className="mt-6 flex gap-3">
                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                            className="flex-1"
                        >
                            {isReady ? 'Temizle' : 'Clear'}
                        </Button>
                        <Button
                            onClick={handleApplyFilters}
                            className="flex-1"
                        >
                            {isReady ? 'Uygula' : 'Apply'}
                        </Button>
                    </div>
                )}

                {/* Desktop Actions */}
                {!isMobile && (
                    <div className="mt-6 space-y-2">
                        <Button
                            onClick={handleApplyFilters}
                            className="w-full"
                        >
                            {isReady ? 'Filtreleri Uygula' : 'Apply Filters'}
                        </Button>
                        {getActiveFiltersCount() > 0 && (
                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="w-full"
                            >
                                {isReady ? 'Filtreleri Temizle' : 'Clear All Filters'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};