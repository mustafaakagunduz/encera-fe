'use client';

import React, { useState, useMemo } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { MapPin, Bed, Square, Heart } from 'lucide-react';
import { useToggleFavoriteMutation, useGetFavoriteStatusQuery } from '@/store/api/favoriteApi';
import { Toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { usePropertyStatus, usePropertyStatusOverrides } from '@/hooks/usePropertyStatus';

interface Property {
    id: number;
    title: string;
    price: number;
    city: string;
    district: string;
    neighborhood: string;
    propertyType: string;
    listingType: string;
    roomConfiguration: {
        roomCount: number;
        hallCount: number;
        displayFormat: string;
    };
    area: number;
    imageUrls?: string[];
    primaryImageUrl?: string;
    grossArea?: number;
    viewCount: number;
    createdAt: string;
    featured: boolean;
    status?: string; // 'SOLD', 'REMOVED', 'ACTIVE', etc.
}

interface PropertyGridProps {
    properties: Property[];
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const PropertyCard: React.FC<{
    property: Property;
    onShowToast: (message: string, type: 'success' | 'error') => void;
}> = ({ property, onShowToast }) => {
    const { t } = useAppTranslation();

    // Get the effective status (original or overridden)
    const effectiveStatus = usePropertyStatus(property.id, property.status);

    // Favorite functionality
    const { data: favoriteStatus } = useGetFavoriteStatusQuery(property.id, {
        skip: false
    });
    const [toggleFavorite, { isLoading: isToggling }] = useToggleFavoriteMutation();

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const result = await toggleFavorite(property.id).unwrap();

            // Show appropriate toast message based on the result
            if (result.isFavorited) {
                onShowToast(t('favorites.added-success'), 'success');
            } else {
                onShowToast(t('favorites.removed-success'), 'success');
            }
        } catch (error) {
            console.error('Favorilere ekleme/çıkarma hatası:', error);
            onShowToast(t('favorites.error'), 'error');
        }
    };

    const isPropertySoldOrRemoved = effectiveStatus === 'SOLD' || effectiveStatus === 'REMOVED';

    const handlePropertyClick = () => {
        if (!isPropertySoldOrRemoved) {
            window.location.href = `/house/${property.id}`;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR').format(price);
    };

    return (
        <div
            className={`rounded-xl shadow-sm overflow-hidden group transition-all duration-300 bg-white ${
                isPropertySoldOrRemoved
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg transform hover:-translate-y-1 cursor-pointer'
            }`}
            onClick={handlePropertyClick}
        >
            {/* Image */}
            <div className="relative">
                <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    {property.imageUrls && property.imageUrls.length > 0 ? (
                        <img
                            src={property.primaryImageUrl || property.imageUrls[0]}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="text-center text-gray-400">
                                <Square className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-sm">{t('property-grid.no-image')}</p>
                            </div>
                        </div>
                    )}

                    {/* Featured Badge */}
                    {property.featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ⭐ {t('property-grid.premium')}
                        </div>
                    )}

                    {/* Favorite Button */}
                    <button
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                        onClick={handleFavoriteToggle}
                        disabled={isToggling}
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${
                                favoriteStatus?.isFavorited
                                    ? 'text-red-500 fill-current'
                                    : 'text-gray-600'
                            }`}
                        />
                    </button>

                    {/* Status Badge */}
                    {isPropertySoldOrRemoved && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div className="bg-white px-4 py-2 rounded-lg text-center">
                                <div className={`text-sm font-bold ${effectiveStatus === 'SOLD' ? 'text-orange-600' : 'text-red-600'}`}>
                                    {effectiveStatus === 'SOLD' ? 'SATILDI' : 'KALDIRILDI'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Property Type Badge - Moved to top left */}
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                        {t(`my-listings.listing-types.${property.listingType}`)}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 bg-white">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                        {property.district}, {property.city}
                    </span>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.roomConfiguration?.displayFormat || `${property.roomConfiguration?.roomCount}+${property.roomConfiguration?.hallCount}`}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.grossArea || property.area} m²</span>
                    </div>
                </div>

                {/* Price */}
                <div className="mt-auto">
                    <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.price)} ₺
                    </span>
                </div>
            </div>
        </div>
    );
};

const PropertyGrid: React.FC<PropertyGridProps> = ({
    properties,
    loading = false,
    onLoadMore,
    hasMore = false
}) => {
    const { t } = useAppTranslation();
    const statusOverrides = usePropertyStatusOverrides();

    // Satılan/kaldırılan ilanları ana sayfadan filtrele
    const filteredProperties = useMemo(() => {
        return properties.filter(property => {
            const effectiveStatus = statusOverrides[property.id] || property.status;
            // Ana sayfa/liste sayfalarında satılan/kaldırılan ilanları gösterme
            return effectiveStatus !== 'SOLD' && effectiveStatus !== 'REMOVED';
        });
    }, [properties, statusOverrides]);

    // Toast state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    if (loading && filteredProperties.length === 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:!grid-cols-6 min-[1900px]:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                        <div className="p-5 space-y-3">
                            <div className="h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            <div className="h-10 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filteredProperties.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                    <Square className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('home.properties.no-properties')}
                    </h3>
                    <p className="text-gray-600">
                        {t('property-grid.no-properties-desc')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Property Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:!grid-cols-6 min-[1900px]:grid-cols-6 gap-6 mb-8">
                {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} onShowToast={showToast} />
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && onLoadMore && (
                <div className="text-center">
                    <Button
                        onClick={onLoadMore}
                        disabled={loading}
                        variant="outline"
                        className="px-8 py-2"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                {t('common.loading')}
                            </div>
                        ) : (
                            t('home.properties.load-more')
                        )}
                    </Button>
                </div>
            )}

            {/* Toast Notification */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};

export default PropertyGrid;
