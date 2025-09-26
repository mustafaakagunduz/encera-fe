// src/components/user/MyListingsRow.tsx
'use client';

import React from 'react';
import { PropertyResponse, ListingType, PropertyType, useDeletePropertyMutation } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useRouter } from 'next/navigation';
import {
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

interface MyListingsRowProps {
    property: PropertyResponse;
}

export const MyListingsRow: React.FC<MyListingsRowProps> = ({ property }) => {
    const { t, isReady } = useAppTranslation();
    const [deleteProperty] = useDeletePropertyMutation();
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/property/${property.id}`);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(isReady ? t('my-listings.actions.delete-confirm') : 'Bu ilanı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProperty(property.id).unwrap();
                console.log('İlan başarıyla silindi');
            } catch (error: any) {
                console.error('Silme hatası:', error);
                const errorMessage = error?.data?.message || 'İlan silinirken bir hata oluştu';
                alert(errorMessage);
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

    // Desktop Row
    const DesktopRow = () => (
        <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleRowClick}>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {property.title}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-blue-600 font-medium">
                        {getListingTypeText(property.listingType)}
                    </span>
                    <span className="text-xs text-gray-500">
                        {getPropertyTypeText(property.propertyType)}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                    {property.city}, {property.district}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                    {formatPrice(property.price)}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {property.viewCount}
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
                {formatDate(property.createdAt)}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 relative z-10">
                    <Link
                        href={`/property/${property.id}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        title={isReady ? t('my-listings.actions.view') : 'Görüntüle'}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                        href={`/create-listing?edit=${property.id}`}
                        className="text-gray-400 hover:text-green-600 transition-colors p-1"
                        title={isReady ? t('my-listings.actions.edit') : 'Düzenle'}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title={isReady ? t('my-listings.actions.delete') : 'Sil'}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );


    return <DesktopRow />;
};
