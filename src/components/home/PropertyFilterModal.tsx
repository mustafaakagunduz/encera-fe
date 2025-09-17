'use client';

import React, { useState } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface PropertyFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: FilterState) => void;
    currentFilters: FilterState;
}

const PropertyFilterModal: React.FC<PropertyFilterModalProps> = ({
    isOpen,
    onClose,
    onApplyFilters,
    currentFilters
}) => {
    const { t } = useAppTranslation();
    const [filters, setFilters] = useState<FilterState>(currentFilters);

    const propertyTypes = [
        { value: '', label: t('common.all') },
        { value: 'RESIDENTIAL', label: t('common.residential') },
        { value: 'COMMERCIAL', label: t('common.commercial') },
        { value: 'LAND', label: t('common.land') }
    ];

    const listingTypes = [
        { value: '', label: t('common.all') },
        { value: 'SALE', label: t('common.sale') },
        { value: 'RENT', label: t('common.rent') },
        { value: 'DAILY_RENTAL', label: t('common.daily-rental') }
    ];

    const roomCounts = [
        { value: '', label: t('common.all') },
        { value: '1+0', label: '1+0' },
        { value: '1+1', label: '1+1' },
        { value: '2+1', label: '2+1' },
        { value: '3+1', label: '3+1' },
        { value: '4+1', label: '4+1' },
        { value: '5+1', label: '5+1' }
    ];

    const sortOptions = [
        { value: 'newest', label: t('home.filters.sort-newest') },
        { value: 'oldest', label: t('home.filters.sort-oldest') },
        { value: 'price-low', label: t('home.filters.sort-price-low') },
        { value: 'price-high', label: t('home.filters.sort-price-high') },
        { value: 'area-large', label: t('home.filters.sort-area-large') },
        { value: 'area-small', label: t('home.filters.sort-area-small') }
    ];

    const features = [
        'elevator', 'parking', 'balcony', 'security', 'furnished'
    ];

    const handleInputChange = (field: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleFeatureToggle = (feature: string) => {
        setFilters(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleClearFilters = () => {
        setFilters({
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
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                {t('home.filters.title')}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('home.filters.sort-by')}
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Property Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('home.filters.property-type')}
                            </label>
                            <select
                                value={filters.propertyType}
                                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {propertyTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Listing Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('home.filters.listing-type')}
                            </label>
                            <select
                                value={filters.listingType}
                                onChange={(e) => handleInputChange('listingType', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {listingTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('home.filters.price-range')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder={t('home.filters.min-price')}
                                    value={filters.minPrice}
                                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder={t('home.filters.max-price')}
                                    value={filters.maxPrice}
                                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Room Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('home.filters.room-count')}
                            </label>
                            <select
                                value={filters.roomCount}
                                onChange={(e) => handleInputChange('roomCount', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {roomCounts.map(room => (
                                    <option key={room.value} value={room.value}>
                                        {room.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Area Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('home.filters.area')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder={t('home.filters.min-area')}
                                    value={filters.minArea}
                                    onChange={(e) => handleInputChange('minArea', e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder={t('home.filters.max-area')}
                                    value={filters.maxArea}
                                    onChange={(e) => handleInputChange('maxArea', e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t('home.filters.features')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {features.map(feature => (
                                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.features.includes(feature)}
                                            onChange={() => handleFeatureToggle(feature)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {t(`listing.create.${feature}`)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="flex-1"
                            >
                                {t('home.filters.clear')}
                            </Button>
                            <Button
                                onClick={handleApply}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {t('home.filters.apply')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyFilterModal;