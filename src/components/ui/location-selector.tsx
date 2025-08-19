// src/components/ui/location-selector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { locationService, City, District, Neighborhood } from '@/services/locationService';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface LocationSelectorProps {
    selectedCity?: string;
    selectedDistrict?: string;
    selectedNeighborhood?: string;
    onLocationChange: (location: {
        city: string;
        district: string;
        neighborhood: string;
    }) => void;
    errors?: {
        city?: string;
        district?: string;
        neighborhood?: string;
    };
    disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
                                                                      selectedCity,
                                                                      selectedDistrict,
                                                                      selectedNeighborhood,
                                                                      onLocationChange,
                                                                      errors,
                                                                      disabled = false
                                                                  }) => {
    const { t, isReady } = useAppTranslation();

    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);

    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    const [citySearch, setCitySearch] = useState('');
    const [districtSearch, setDistrictSearch] = useState('');
    const [neighborhoodSearch, setNeighborhoodSearch] = useState('');

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

    // İl seçildiğinde ilçeleri yükle
    const handleCitySelect = async (city: City) => {
        console.log('[CityChange]', { cityId: city.id, cityName: city.name });

        // Önce state'i temizle
        setDistricts([]);
        setNeighborhoods([]);
        setShowCityDropdown(false);

        console.log('[Reset district & neighborhood]');

        // Location callback'i ile parent'ı güncelle (ilçe ve mahalle boş)
        onLocationChange({
            city: city.name,
            district: '',
            neighborhood: ''
        });

        // Sonra ilçeleri yükle
        setLoadingDistricts(true);
        try {
            const districtsData = await locationService.getDistricts(city.id);
            setDistricts(districtsData);
        } catch (error) {
            console.error('Districts loading error:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    // İlçe seçildiğinde mahalleleri yükle
    const handleDistrictSelect = async (district: District) => {
        console.log('[DistrictChange]', {
            districtId: district.id,
            typeofDistrictId: typeof district.id,
            districtName: district.name,
            selectedCity
        });

        // Önce mahalle state'ini temizle
        setNeighborhoods([]);
        setShowDistrictDropdown(false);

        // Location callback'i ile parent'ı güncelle (mahalle boş)
        onLocationChange({
            city: selectedCity || '',
            district: district.name,
            neighborhood: ''
        });

        // Sonra mahalleleri yükle
        setLoadingNeighborhoods(true);
        try {
            const neighborhoodsData = await locationService.getNeighborhoods(district.id);
            setNeighborhoods(neighborhoodsData);
        } catch (error) {
            console.error('Neighborhoods loading error:', error);
        } finally {
            setLoadingNeighborhoods(false);
        }
    };

    // Mahalle seçimi
    const handleNeighborhoodSelect = (neighborhood: Neighborhood) => {
        onLocationChange({
            city: selectedCity || '',
            district: selectedDistrict || '',
            neighborhood: neighborhood.name
        });
        setShowNeighborhoodDropdown(false);
    };

    // Filtrelenmiş listeler
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(citySearch.toLowerCase())
    );

    const filteredDistricts = districts.filter(district =>
        district.name.toLowerCase().includes(districtSearch.toLowerCase())
    );

    const filteredNeighborhoods = neighborhoods.filter(neighborhood =>
        neighborhood.name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* İl Seçimi */}
            <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    {isReady ? t('listing.location-fields.city') : 'İl'}
                </label>
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                        disabled={disabled || loadingCities}
                        className={`w-full justify-between h-11 text-left ${
                            errors?.city
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } ${selectedCity ? 'text-gray-900' : 'text-gray-500'}`}
                    >
            <span className="truncate">
              {selectedCity || (isReady ? t('listing.location-fields.select-city') : 'İl seçiniz')}
            </span>
                        {loadingCities ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                    </Button>

                    {showCityDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-3 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder={isReady ? t('listing.location-fields.search-city') : 'İl ara...'}
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filteredCities.map((city) => (
                                    <button
                                        key={city.id}
                                        type="button"
                                        onClick={() => handleCitySelect(city)}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                                    >
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {errors?.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <span className="ml-1">{errors.city}</span>
                    </p>
                )}
            </div>

            {/* İlçe Seçimi */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    {isReady ? t('listing.location-fields.district') : 'İlçe'}
                </label>
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                        disabled={disabled || !selectedCity || loadingDistricts}
                        className={`w-full justify-between h-11 text-left ${
                            errors?.district
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } ${selectedDistrict ? 'text-gray-900' : 'text-gray-500'}`}
                    >
            <span className="truncate">
              {selectedDistrict || (isReady ? t('listing.location-fields.select-district') : 'İlçe seçiniz')}
            </span>
                        {loadingDistricts ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                    </Button>

                    {showDistrictDropdown && districts.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-3 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder={isReady ? t('listing.location-fields.search-district') : 'İlçe ara...'}
                                    value={districtSearch}
                                    onChange={(e) => setDistrictSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filteredDistricts.map((district) => (
                                    <button
                                        key={district.id}
                                        type="button"
                                        onClick={() => handleDistrictSelect(district)}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                                    >
                                        {district.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {errors?.district && (
                    <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
            </div>

            {/* Mahalle Seçimi */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    {isReady ? t('listing.location-fields.neighborhood') : 'Mahalle'}
                </label>
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
                        disabled={disabled || !selectedDistrict || loadingNeighborhoods || districts.length === 0}
                        className={`w-full justify-between h-11 text-left ${
                            errors?.neighborhood
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } ${selectedNeighborhood ? 'text-gray-900' : 'text-gray-500'}`}
                    >
            <span className="truncate">
              {selectedNeighborhood || (isReady ? t('listing.location-fields.select-neighborhood') : 'Mahalle seçiniz')}
            </span>
                        {loadingNeighborhoods ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                    </Button>

                    {showNeighborhoodDropdown && neighborhoods.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-3 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder={isReady ? t('listing.location-fields.search-neighborhood') : 'Mahalle ara...'}
                                    value={neighborhoodSearch}
                                    onChange={(e) => setNeighborhoodSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filteredNeighborhoods.map((neighborhood) => (
                                    <button
                                        key={neighborhood.id}
                                        type="button"
                                        onClick={() => handleNeighborhoodSelect(neighborhood)}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                                    >
                                        {neighborhood.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {errors?.neighborhood && (
                    <p className="mt-1 text-sm text-red-600">{errors.neighborhood}</p>
                )}
            </div>
        </div>
    );
};