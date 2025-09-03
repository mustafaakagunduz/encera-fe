// src/components/property/PropertyDetail.tsx
'use client';

import React from 'react';
import { useGetPropertyByIdQuery, useDeletePropertyMutation, PropertyResponse, ListingType, PropertyType } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAuth } from '@/hooks/useAuth';
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
    Phone,
    User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

interface PropertyDetailProps {
    propertyId: number;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
    const { t, isReady } = useAppTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const { data: property, isLoading, error } = useGetPropertyByIdQuery(propertyId);
    const [deleteProperty] = useDeletePropertyMutation();

    // Kullanıcının bu ilanın sahibi olup olmadığını kontrol et
    const isOwner = user && property && user.id === property.owner.id;

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
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium mb-2">
                        {isReady ? 'İlan bulunamadı' : 'Property not found'}
                    </div>
                    <div className="text-gray-600">
                        {isReady ? 'Bu ilan mevcut değil veya kaldırılmış olabilir.' : 'This property may not exist or has been removed.'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header with back button and actions */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {isReady ? t('common.back') : 'Geri'}
                    </button>

                    {/* Action Buttons - Sadece ilan sahibi görür */}
                    {isOwner && (
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
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Image Gallery - Left Side */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                            <div className="text-center text-gray-500">
                                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">
                                    {isReady ? 'Görsel yüklenmedi' : 'No image uploaded'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Property Info - Right Side */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {/* Status Badge - Sadece ilan sahibi görür */}
                        {isOwner && (
                            <div className="mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property)}`}>
                                    {getStatusText(property)}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {property.title}
                        </h1>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {getListingTypeText(property.listingType)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {getPropertyTypeText(property.propertyType)}
                            </span>
                            {property.featured && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    ⭐ VIP
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="text-3xl font-bold text-gray-900">
                                {formatPrice(property.price)}
                            </div>
                            {property.negotiable && (
                                <div className="text-sm text-orange-600 font-medium mt-1">
                                    {isReady ? 'Pazarlık yapılabilir' : 'Negotiable'}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-6">
                            <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                            <span>
                                {property.neighborhood}, {property.district}, {property.city}
                            </span>
                        </div>

                        {/* Key Features */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {property.grossArea && (
                                <div className="flex items-center">
                                    <Square className="w-5 h-5 mr-3 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {property.grossArea} m²
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {isReady ? 'Brüt Alan' : 'Gross Area'}
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
                                            {isReady ? 'Oda Sayısı' : 'Room Count'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* View Count and Date */}
                        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                            <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>{property.viewCount} {isReady ? 'görüntülenme' : 'views'}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(property.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Property Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        {isReady ? 'Temel Bilgiler' : 'Basic Information'}
                                    </h3>

                                    {property.netArea && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Net Alan' : 'Net Area'}:</span>
                                            <span className="font-medium text-sm">{property.netArea} m²</span>
                                        </div>
                                    )}

                                    {property.roomConfiguration?.bathroomCount && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Banyo Sayısı' : 'Bathroom Count'}:</span>
                                            <span className="font-medium text-sm">{property.roomConfiguration.bathroomCount}</span>
                                        </div>
                                    )}

                                    {property.monthlyFee && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Aidat' : 'Monthly Fee'}:</span>
                                            <span className="font-medium text-sm">{formatPrice(property.monthlyFee)}</span>
                                        </div>
                                    )}

                                    {property.deposit && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{isReady ? 'Depozito' : 'Deposit'}:</span>
                                            <span className="font-medium text-sm">{formatPrice(property.deposit)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        {isReady ? 'Özellikler' : 'Features'}
                                    </h3>

                                    <div className="space-y-2">
                                        {property.elevator && (
                                            <div className="flex items-center text-green-600">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Asansör' : 'Elevator'}</span>
                                            </div>
                                        )}
                                        {property.parking && (
                                            <div className="flex items-center text-green-600">
                                                <Car className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Otopark' : 'Parking'}</span>
                                            </div>
                                        )}
                                        {property.balcony && (
                                            <div className="flex items-center text-green-600">
                                                <Home className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Balkon' : 'Balcony'}</span>
                                            </div>
                                        )}
                                        {property.security && (
                                            <div className="flex items-center text-green-600">
                                                <Shield className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Güvenlik' : 'Security'}</span>
                                            </div>
                                        )}
                                        {property.furnished && (
                                            <div className="flex items-center text-green-600">
                                                <Coffee className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{isReady ? 'Eşyalı' : 'Furnished'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        {isReady ? 'Açıklama' : 'Description'}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {property.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Info - Ilan sahibi değilse iletişim bilgilerini göster */}
                    {!isOwner && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-medium text-gray-900 mb-4">
                                    {isReady ? 'İletişim' : 'Contact'}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {property.owner.firstName} {property.owner.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {isReady ? 'İlan Sahibi' : 'Property Owner'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Phone className="w-5 h-5 mr-3 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {property.owner.phoneNumber}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {isReady ? 'Telefon' : 'Phone'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <a
                                        href={`tel:${property.owner.phoneNumber}`}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        {isReady ? 'Ara' : 'Call'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};