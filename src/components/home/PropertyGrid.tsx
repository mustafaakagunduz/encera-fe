'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { MapPin, Bed, Square, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

interface PropertyGridProps {
    properties: Property[];
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    const { t } = useAppTranslation();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR').format(price);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Property Type Badge */}
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                        {t(`my-listings.listing-types.${property.listingType}`)}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Price */}
                <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.price)} ₺
                    </span>
                </div>

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
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{property.viewCount}</span>
                    </div>
                </div>

                {/* Property Type */}
                <div className="text-xs text-gray-500 mb-4">
                    {t(`my-listings.property-types.${property.propertyType}`)}
                </div>

                {/* Action Button */}
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.location.href = `/house/${property.id}`}
                >
                    {t('property-grid.view-details')}
                </Button>
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

    if (loading && properties.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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

    if (properties.length === 0) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
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
        </div>
    );
};

export default PropertyGrid;