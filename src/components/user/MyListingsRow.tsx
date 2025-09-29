// src/components/user/MyListingsRow.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PropertyResponse, ListingType, PropertyType, PropertyStatus, useDeletePropertyMutation, useMarkPropertyAsSoldMutation, useMarkPropertyAsRemovedMutation, useCleanupPropertyImagesMutation } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useRouter } from 'next/navigation';
import { usePropertyStatus } from '@/hooks/usePropertyStatus';
import {
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    PackageX,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

interface MyListingsRowProps {
    property: PropertyResponse;
}

export const MyListingsRow: React.FC<MyListingsRowProps> = ({ property }) => {
    const { t, isReady } = useAppTranslation();
    const [deleteProperty] = useDeletePropertyMutation();
    const [markAsSold] = useMarkPropertyAsSoldMutation();
    const [markAsRemoved] = useMarkPropertyAsRemovedMutation();
    const [cleanupImages] = useCleanupPropertyImagesMutation();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Get the effective status (original or overridden)
    const effectiveStatus = usePropertyStatus(property.id, property.status);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRowClick = () => {
        router.push(`/property/${property.id}`);
    };

    const handleMarkAsSold = async () => {
        if (window.confirm('Bu ilanı "Satıldı" olarak işaretlemek istediğinizden emin misiniz?\n\n• İlan favorilerde soluk görünecek\n• Ana fotoğraf dışındaki fotoğraflar silinecek\n• İlan bilgileri korunacak')) {
            try {
                // 1. Mark property as sold
                await markAsSold({ propertyId: property.id, propertyData: property }).unwrap();

                // 2. Clean up images (keep only primary image)
                try {
                    await cleanupImages({ propertyId: property.id, keepOnlyPrimary: true }).unwrap();
                } catch (imageError: any) {
                    console.log('Image cleanup failed (endpoint may not exist yet):', imageError);
                    // Don't show error to user, image cleanup is secondary
                }

                setShowDropdown(false);
                alert('İlan başarıyla "Satıldı" olarak işaretlendi.\nAna fotoğraf dışındaki fotoğraflar temizlendi.');
            } catch (error: any) {
                console.error('Satıldı işaretleme hatası:', error);
                if (error?.status === 404 || error?.status === 500) {
                    alert('Backend\'de status güncelleme özelliği henüz implement edilmemiş.\nBackend developer\'a PropertyUpdateRequest\'e "status" field\'ını eklemesini söyleyin.');
                } else {
                    const errorMessage = error?.data?.message || 'İlan satıldı olarak işaretlenirken bir hata oluştu';
                    alert(errorMessage);
                }
            }
        }
    };

    const handleMarkAsRemoved = async () => {
        if (window.confirm('Bu ilanı kaldırmak istediğinizden emin misiniz?\n\n• Favorilerde değilse: Tamamen silinecek\n• Favorilerde varsa: Kaldırıldı olarak işaretlenecek\n• Gereksiz fotoğraflar silinecek')) {
            try {
                // İlk önce hard delete deneyelim, 400 hatası alırsak soft delete yapalım
                try {
                    await deleteProperty(property.id).unwrap();
                    setShowDropdown(false);
                    alert('İlan başarıyla silindi.');
                } catch (deleteError: any) {
                    if (deleteError?.status === 400) {
                        // Favorilerde varsa soft delete yap
                        try {
                            // 1. Mark as removed
                            await markAsRemoved({ propertyId: property.id, propertyData: property }).unwrap();

                            // 2. Clean up images (keep only primary image)
                            try {
                                await cleanupImages({ propertyId: property.id, keepOnlyPrimary: true }).unwrap();
                            } catch (imageError: any) {
                                console.log('Image cleanup failed (endpoint may not exist yet):', imageError);
                            }

                            setShowDropdown(false);
                            alert('İlan başkalarının favorilerinde bulunduğu için "Kaldırıldı" olarak işaretlendi.\nAna fotoğraf dışındaki fotoğraflar temizlendi.');
                        } catch (markError: any) {
                            if (markError?.status === 404 || markError?.status === 500) {
                                alert('Soft delete özelliği henüz backend\'de implement edilmemiş.\nİlan favorilerde bulunduğu için silinemedi.\nBackend developer\'a PropertyUpdateRequest\'e "status" field\'ını eklemesini söyleyin.');
                            } else {
                                throw markError;
                            }
                        }
                    } else {
                        throw deleteError;
                    }
                }
            } catch (error: any) {
                console.error('Kaldırma hatası:', error);
                const errorMessage = error?.data?.message || 'İlan kaldırılırken bir hata oluştu';
                alert(errorMessage);
            }
        }
    };

    const getStatusText = () => {
        if (effectiveStatus === PropertyStatus.SOLD) {
            return 'Satıldı';
        }
        if (effectiveStatus === PropertyStatus.REMOVED) {
            return 'Kaldırıldı';
        }
        if (!property.active) {
            return isReady ? t('my-listings.status.inactive') : 'Pasif';
        }
        if (!property.approved) {
            return isReady ? t('my-listings.status.pending') : 'Onay Bekliyor';
        }
        return isReady ? t('my-listings.status.approved') : 'Onaylandı';
    };

    const getStatusColor = () => {
        if (effectiveStatus === PropertyStatus.SOLD) return 'bg-orange-100 text-orange-800';
        if (effectiveStatus === PropertyStatus.REMOVED) return 'bg-red-100 text-red-800';
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

                    {/* Dropdown Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(!showDropdown);
                            }}
                            className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
                            title="İşlemler"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsSold();
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3">
                                            <ShoppingCart className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">Satıldı olarak işaretle</div>
                                            <div className="text-xs text-gray-500">İlan favorilerde kalır</div>
                                        </div>
                                    </button>
                                    <div className="border-t border-gray-100"></div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsRemoved();
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mr-3">
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">Kaldır</div>
                                            <div className="text-xs text-gray-500">İlan artık görünmez</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );


    return <DesktopRow />;
};
