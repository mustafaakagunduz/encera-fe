'use client';

import React from 'react';
import { useGetPropertyByIdQuery, useDeletePropertyMutation, PropertyResponse, ListingType, PropertyType } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Eye,
    Edit,
    Trash2,
    MapPin,
    Tag,
    TrendingUp,
    Calendar,
    Square,
    Car,
    Shield,
    Briefcase,
    Home,
    Coffee,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface PropertyDetailProps {
    propertyId: number;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const { data: property, isLoading, error } = useGetPropertyByIdQuery(propertyId);
    const [deleteProperty] = useDeletePropertyMutation();

    const handleDelete = async () => {
        if (window.confirm(isReady ? t('my-listings.actions.delete-confirm') : 'Bu ilanı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProperty(propertyId).unwrap();
                router.push('/my-listings');
            } catch (error) {
                console.error('Silme hatası:', error);
            }
        }
    };

    const getStatusText = (property: PropertyResponse) => {
        if (!property.active) {
            return isReady ? t('my-listings.status.inactive') : 'Pasif';
        }
        if (!property.approved) {
            return isReady ? t('my-listings.status.pending') : 'Onay Bekliyor';
        }
        return isReady ? t('my-listings.status.approved') : 'Onaylandı';
    };

    const getStatusColor = (property: PropertyResponse) => {
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
                        <div className="h-64 bg-gray-300 rounded mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-red-600">
                        {isReady ? t('common.error-occurred') : 'İlan bulunamadı.'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {isReady ? t('common.back') : 'Geri'}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/create-listing?edit=${property.id}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            {isReady ? t('my-listings.actions.edit') : 'Düzenle'}
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isReady ? t('my-listings.actions.delete') : 'Sil'}
                        </button>
                    </div>
                </div>

                {/* Main Content - Images and Property Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    
                    {/* Image Gallery - Left Side */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                            {/* Placeholder for now - will show images when implemented */}
                            <div className="text-center text-gray-500">
                                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">
                                    {isReady ? t('listing.preview.no-image') : 'Henüz görsel yüklenmedi'}
                                </p>
                                <p className="text-xs mt-1">
                                    {isReady ? t('listing.preview.add-images-later') : 'İlan yayınlandıktan sonra görsel ekleyebilirsiniz'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Image thumbnails placeholder */}
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((index) => (
                                    <div key={index} className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Property Data - Right Side */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-slate-50">
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                {property.title}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                    <Tag className="w-4 h-4 mr-1 text-blue-500" />
                                    <span className="font-medium text-blue-600">
                                        {getListingTypeText(property.listingType)}
                                    </span>
                                </div>
                                <span>•</span>
                                <span>{getPropertyTypeText(property.propertyType)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-4">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{property.city}, {property.district}, {property.neighborhood}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-green-600">
                                    {formatPrice(property.price)}
                                    {property.negotiable && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            ({isReady ? t('my-listings.negotiable') : 'Pazarlık'})
                                        </span>
                                    )}
                                </div>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(property)}`}>
                                    {getStatusText(property)}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-6 border-b bg-gray-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <Eye className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900">{property.viewCount}</div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? t('my-listings.table.views') : 'Görüntülenme'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">{formatDate(property.createdAt)}</div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? t('my-listings.table.created-date') : 'Oluşturma Tarihi'}
                                        </div>
                                    </div>
                                </div>
                                {property.grossArea && (
                                    <div className="flex items-center">
                                        <Square className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{property.grossArea} m²</div>
                                            <div className="text-xs text-gray-500">
                                                {isReady ? t('listing.create.gross-area') : 'Brüt Alan'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {property.roomConfiguration && (
                                    <div className="flex items-center">
                                        <Home className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {property.roomConfiguration.roomCount}+{property.roomConfiguration.livingRoomCount}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {isReady ? t('listing.room-count') : 'Oda Sayısı'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                
                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        {isReady ? t('listing.basic-info') : 'Temel Bilgiler'}
                                    </h3>
                                    
                                    {property.netArea && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? t('listing.create.net-area') : 'Net Alan'}:</span>
                                            <span className="font-medium text-sm">{property.netArea} m²</span>
                                        </div>
                                    )}
                                    
                                    {property.roomConfiguration && property.roomConfiguration.bathroomCount && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? t('listing.bathroom-count') : 'Banyo Sayısı'}:</span>
                                            <span className="font-medium text-sm">{property.roomConfiguration.bathroomCount}</span>
                                        </div>
                                    )}

                                    {property.monthlyFee && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? t('listing.monthly-fee') : 'Aidat'}:</span>
                                            <span className="font-medium text-sm">{formatPrice(property.monthlyFee)}</span>
                                        </div>
                                    )}

                                    {property.deposit && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? t('listing.deposit') : 'Depozito'}:</span>
                                            <span className="font-medium text-sm">{formatPrice(property.deposit)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        {isReady ? t('listing.features') : 'Özellikler'}
                                    </h3>
                                    
                                    <div className="space-y-2">
                                        {property.elevator && (
                                            <div className="flex items-center text-green-600">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? t('listing.create.elevator') : 'Asansör'}</span>
                                            </div>
                                        )}
                                        {property.parking && (
                                            <div className="flex items-center text-green-600">
                                                <Car className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? t('listing.create.parking') : 'Otopark'}</span>
                                            </div>
                                        )}
                                        {property.balcony && (
                                            <div className="flex items-center text-green-600">
                                                <Home className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? t('listing.create.balcony') : 'Balkon'}</span>
                                            </div>
                                        )}
                                        {property.security && (
                                            <div className="flex items-center text-green-600">
                                                <Shield className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? t('listing.create.security') : 'Güvenlik'}</span>
                                            </div>
                                        )}
                                        {property.furnished && (
                                            <div className="flex items-center text-green-600">
                                                <Coffee className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? t('listing.create.furnished') : 'Eşyalı'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-medium text-gray-900 mb-4">
                                    {isReady ? t('listing.contact') : 'İletişim'}
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <Home className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {property.owner.firstName} {property.owner.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {isReady ? t('listing.contact-owner') : 'İlan Sahibi'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <Coffee className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {property.owner.phoneNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {isReady ? t('common.phone') : 'Telefon'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* PAPP Sellable - Bottom */}
                            {property.pappSellable && (
                                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center text-yellow-700">
                                        <Coffee className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">
                                            {isReady ? t('listing.create.papp-sellable') : 'PAPP ile Satılabilir'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description - Full Width Bottom Card */}
                {property.description && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isReady ? t('listing.description') : 'Açıklama'}
                        </h3>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {property.description}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};