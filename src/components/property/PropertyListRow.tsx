// src/components/property/PropertyListRow.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { PropertySummaryResponse, ListingType, PropertyType } from '@/store/api/propertyApi';
import {
    MapPin,
    Home,
    Car,
    Briefcase,
    Calendar,
    Eye,
    Star
} from 'lucide-react';

interface PropertyListRowProps {
    property: PropertySummaryResponse;
    linkHref: string;
}

export const PropertyListRow: React.FC<PropertyListRowProps> = ({
                                                                    property,
                                                                    linkHref
                                                                }) => {
    const { t, isReady } = useAppTranslation();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Property değiştiğinde state'i sıfırla
    React.useEffect(() => {
        setImageLoaded(false);
        setImageError(false);
    }, [property.primaryImageUrl]);

    const getListingTypeText = (type: ListingType) => {
        switch (type) {
            case ListingType.SALE:
                return isReady ? t('common.sale') : 'Satılık';
            case ListingType.RENT:
                return isReady ? t('common.rent') : 'Kiralık';
            default:
                return type;
        }
    };

    const getPropertyTypeText = (type: PropertyType) => {
        switch (type) {
            case PropertyType.RESIDENTIAL:
                return isReady ? t('common.residential') : 'Konut';
            case PropertyType.COMMERCIAL:
                return isReady ? t('common.commercial') : 'İş Yeri';
            case PropertyType.LAND:
                return isReady ? t('common.land') : 'Arsa';
            case PropertyType.DAILY_RENTAL:
                return isReady ? t('common.daily-rental') : 'Günlük Kiralık';
            default:
                return type;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getRoomText = () => {
        if (property.roomConfiguration) {
            const { roomCount, hallCount } = property.roomConfiguration;
            return `${roomCount}+${hallCount}`;
        }
        return null;
    };

    return (
        <Link href={linkHref} className="block w-full">
            <div className="bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full">
                <div className="flex flex-row w-full border-b border-gray-200 min-h-[100px] items-center">
                    {/* Property Image */}
                    <div className="flex-shrink-0 w-32 sm:w-48 h-24 sm:h-32">
                        <div className="w-full h-full bg-gray-300 border-r border-gray-200 flex items-center justify-center relative overflow-hidden">
                            {property.primaryImageUrl && !imageError ? (
                                <>
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                        </div>
                                    )}
                                    <img
                                        src={property.primaryImageUrl}
                                        alt={property.title}
                                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                                            imageLoaded ? 'opacity-100' : 'opacity-0'
                                        }`}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={() => {
                                            setImageError(true);
                                            setImageLoaded(false);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Featured Badge */}
                            {property.featured && (
                                <div className="absolute top-2 right-2">
                                    <div className="flex items-center bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                                        <Star className="w-3 h-3 mr-1" />
                                        VIP
                                    </div>
                                </div>
                            )}

                            {/* PAPP Sellable Badge */}
                            {property.pappSellable && (
                                <div className="absolute top-2 left-2">
                                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ENCERA
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Title */}
                    <div className="flex-1 min-w-0 p-2 sm:p-4">
                        {/* Title and Status - Mobile */}
                        <div className="sm:hidden mb-2">
                            <div className="mb-1">
                                <span className="text-xs font-medium text-blue-600">
                                    {getListingTypeText(property.listingType)}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {property.title}
                            </h3>
                        </div>

                        {/* Desktop Title */}
                        <div className="hidden sm:block">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-3">
                                {property.title}
                            </h3>
                        </div>

                        {/* Mobile Simple Layout */}
                        <div className="sm:hidden space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                <span>{property.district}, {property.city}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                {getRoomText() && (
                                    <div className="flex items-center">
                                        <Home className="w-3 h-3 mr-1 text-gray-400" />
                                        <span>{getRoomText()}</span>
                                    </div>
                                )}
                                {property.grossArea && (
                                    <div className="flex items-center">
                                        <Briefcase className="w-3 h-3 mr-1 text-gray-400" />
                                        <span>{property.grossArea} m²</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Property Data Columns */}
                    <div className="hidden sm:block flex-1 min-w-0 p-2 sm:p-4">
                        <div className="grid grid-cols-5 gap-4 text-sm h-full items-center">
                            {/* Status */}
                            <div className="text-gray-600 flex items-center">
                                <span>{getListingTypeText(property.listingType)}</span>
                            </div>

                            {/* Location */}
                            <div className="text-gray-600 flex items-center">
                                <div className="leading-tight">
                                    <div className="truncate">{property.district}</div>
                                    <div className="truncate text-xs text-gray-500">{property.city}</div>
                                </div>
                            </div>

                            {/* Room Count */}
                            <div className="text-gray-600 flex items-center">
                                {getRoomText() ? (
                                    <span>{getRoomText()}</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </div>

                            {/* Area */}
                            <div className="text-gray-600 flex items-center">
                                {property.grossArea ? (
                                    <span>{property.grossArea} m²</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </div>

                            {/* Date */}
                            <div className="text-gray-600 flex items-center">
                                <span>{formatDate(property.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Column */}
                    <div className="flex-shrink-0 w-24 sm:w-32 p-2 sm:p-4 flex flex-col justify-center">
                        <div className="text-right">
                            <div className="text-lg sm:text-xl font-bold text-gray-900">
                                {formatPrice(property.price)}
                            </div>
                            {property.negotiable && (
                                <div className="text-xs text-orange-600 font-medium">
                                    {isReady ? t('listing.negotiable') : 'Negotiable'}
                                </div>
                            )}
                            <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{property.viewCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};