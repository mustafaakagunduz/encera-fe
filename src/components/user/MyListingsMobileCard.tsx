// src/components/user/MyListingsMobileCard.tsx
'use client';

import React from 'react';
import { PropertyResponse, ListingType, PropertyType, useDeletePropertyMutation } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {
    Eye,
    Edit,
    Calendar,
    MapPin,
    Tag,
    TrendingUp,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

interface MyListingsMobileCardProps {
    property: PropertyResponse;
}

export const MyListingsMobileCard: React.FC<MyListingsMobileCardProps> = ({ property }) => {
    const { t, isReady } = useAppTranslation();
    const [deleteProperty] = useDeletePropertyMutation();

    const handleDelete = async () => {
        if (window.confirm(isReady ? t('my-listings.actions.delete-confirm') : 'Bu ilanı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProperty(property.id).unwrap();
            } catch (error) {
                console.error('Silme hatası:', error);
            }
        }
    };

    const getStatusText = () => {
        if (!property.active) {
            return isReady ? t('my-listings.status.inactive') : 'Pasif';
        }
        if (!property.approved) {
            return isReady ? t('my-listings.status.pending') : 'Onay Bekliyor';
        }
        return isReady ? t('my-listings.status.approved') : 'Onaylandı';
    };

    const getStatusColor = () => {
        if (!property.active) return 'bg-gray-100 text-gray-800';
        if (!property.approved) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getListingTypeText = (type: ListingType) => {
        switch (type) {
            case ListingType.SALE:
                return isReady ? t('my-listings.listing-types.SALE') : 'Satılık';
            case ListingType.RENT:
                return isReady ? t('my-listings.listing-types.RENT') : 'Kiralık';
            default:
                return type;
        }
    };

    const getPropertyTypeText = (type: PropertyType) => {
        switch (type) {
            case PropertyType.RESIDENTIAL:
                return isReady ? t('my-listings.property-types.RESIDENTIAL') : 'Konut';
            case PropertyType.COMMERCIAL:
                return isReady ? t('my-listings.property-types.COMMERCIAL') : 'İş Yeri';
            case PropertyType.LAND:
                return isReady ? t('my-listings.property-types.LAND') : 'Arsa';
            case PropertyType.DAILY_RENTAL:
                return isReady ? t('my-listings.property-types.DAILY_RENTAL') : 'Günlük Kiralık';
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
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Tag className="w-3 h-3" />
                        <span className="text-blue-600 font-medium">
                            {getListingTypeText(property.listingType)}
                        </span>
                        <span>•</span>
                        <span>{getPropertyTypeText(property.propertyType)}</span>
                    </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{property.city}, {property.district}</span>
                </div>
                <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{formatPrice(property.price)}</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <Eye className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{property.viewCount} {isReady ? t('my-listings.table.views-count') : 'görüntülenme'}</span>
                </div>
                <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(property.createdAt)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/property/${property.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                        <Eye className="w-3 h-3 mr-1" />
                        {isReady ? t('my-listings.actions.view') : 'Görüntüle'}
                    </Link>
                    <Link
                        href={`/create-listing?edit=${property.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                        <Edit className="w-3 h-3 mr-1" />
                        {isReady ? t('my-listings.actions.edit') : 'Düzenle'}
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        title={isReady ? t('my-listings.actions.delete') : 'Sil'}
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {isReady ? t('my-listings.actions.delete') : 'Sil'}
                    </button>
                </div>
                {property.negotiable && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {isReady ? t('my-listings.negotiable') : 'Pazarlık'}
                    </span>
                )}
            </div>
        </div>
    );
};
