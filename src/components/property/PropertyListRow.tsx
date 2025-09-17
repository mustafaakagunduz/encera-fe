// src/components/property/PropertyListRow.tsx
'use client';

import React from 'react';
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
                <div className="flex flex-col sm:flex-row w-full border-b border-gray-200">
                    {/* Property Image */}
                    <div className="flex-shrink-0 w-full sm:w-48">
                        <div className="w-full h-48 sm:h-full bg-gray-300 border-r border-gray-200 flex items-center justify-center relative overflow-hidden">
                            {property.coverImageUrl ? (
                                <img
                                    src={property.coverImageUrl}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
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
                                <div className="absolute top-2 left-2">
                                    <div className="flex items-center bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                                        <Star className="w-3 h-3 mr-1" />
                                        VIP
                                    </div>
                                </div>
                            )}

                            {/* PAPP Sellable Badge */}
                            {property.pappSellable && (
                                <div className="absolute top-2 right-2">
                                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ENCERA
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0 p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {getListingTypeText(property.listingType)}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {getPropertyTypeText(property.propertyType)}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatPrice(property.price)}
                                </div>
                                {property.negotiable && (
                                    <div className="text-xs text-orange-600 font-medium">
                                        {isReady ? 'Pazarlık' : 'Negotiable'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {property.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-sm">
                                {property.district}, {property.city}
                            </span>
                        </div>

                        {/* Property Features */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            {/* Room Count */}
                            {getRoomText() && (
                                <div className="flex items-center">
                                    <Home className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>{getRoomText()}</span>
                                </div>
                            )}

                            {/* Area */}
                            {property.grossArea && (
                                <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>{property.grossArea} m²</span>
                                </div>
                            )}

                            {/* Features */}
                            {property.elevator && (
                                <span className="text-green-600 text-xs">
                                    {isReady ? 'Asansör' : 'Elevator'}
                                </span>
                            )}

                            {property.parking && (
                                <div className="flex items-center text-green-600">
                                    <Car className="w-3 h-3 mr-1" />
                                    <span className="text-xs">
                                        {isReady ? 'Otopark' : 'Parking'}
                                    </span>
                                </div>
                            )}

                            {property.furnished && (
                                <span className="text-green-600 text-xs">
                                    {isReady ? 'Eşyalı' : 'Furnished'}
                                </span>
                            )}
                        </div>

                        {/* Bottom Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(property.createdAt)}</span>
                            </div>
                            <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>{property.viewCount} {isReady ? 'görüntülenme' : 'views'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};