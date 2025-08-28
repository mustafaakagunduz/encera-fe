'use client';

// src/components/admin/properties/PropertyDetailModal.tsx
import React from 'react';
import {
    X,
    Building,
    MapPin,
    DollarSign,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Eye,
    Square,
    Car,
    TrendingUp,
    Shield,
    Star,
    AlertTriangle
} from 'lucide-react';

interface Property {
    id: number;
    title: string;
    listingType: string;
    propertyType: string;
    city: string;
    district: string;
    neighborhood: string;
    price: number;
    negotiable: boolean;
    grossArea?: number;
    netArea?: number;
    elevator: boolean;
    parking: boolean;
    balcony: boolean;
    security: boolean;
    description?: string;
    featured: boolean;
    pappSellable: boolean;
    furnished: boolean;
    active: boolean;
    approved: boolean;
    approvedAt?: string;
    viewCount: number;
    reported: boolean;
    reportCount: number;
    lastReportedAt?: string;
    owner: {
        id: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
    };
    createdAt: string;
    updatedAt: string;
    lastPublished?: string;
}

interface PropertyDetailModalProps {
    property: Property;
    onClose: () => void;
    onApprove?: () => void;
    onReject?: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
                                                                            property,
                                                                            onClose,
                                                                            onApprove,
                                                                            onReject,
                                                                        }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getListingTypeText = (type: string) => {
        switch (type) {
            case 'SALE': return 'Satılık';
            case 'RENT': return 'Kiralık';
            default: return type;
        }
    };

    const getPropertyTypeText = (type: string) => {
        switch (type) {
            case 'RESIDENTIAL': return 'Konut';
            case 'COMMERCIAL': return 'Ticari';
            case 'LAND': return 'Arsa';
            case 'DAILY_RENTAL': return 'Günlük Kiralık';
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">İlan Detayları</h2>
                            <p className="text-sm text-gray-500">ID: #{property.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sol Kolon - İlan Bilgileri */}
                        <div className="space-y-6">
                            {/* Başlık ve Temel Bilgiler */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{property.title}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {getListingTypeText(property.listingType)}
                                    </span>
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {getPropertyTypeText(property.propertyType)}
                                    </span>
                                    {property.featured && (
                                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            Öne Çıkan
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Konum */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Konum</h4>
                                <div className="flex items-center text-sm text-gray-700">
                                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                    {property.city}, {property.district}, {property.neighborhood}
                                </div>
                            </div>

                            {/* Fiyat */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Fiyat</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-2xl font-bold text-green-600">
                                        <DollarSign className="h-6 w-6 mr-1" />
                                        {formatPrice(property.price)}
                                    </div>
                                    {property.negotiable && (
                                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                                            Pazarlık Yapılabilir
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Alan Bilgileri */}
                            {(property.grossArea || property.netArea) && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Alan Bilgileri</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {property.grossArea && (
                                            <div className="flex items-center">
                                                <Square className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm text-gray-500">Brüt Alan</div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {property.grossArea} m²
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {property.netArea && (
                                            <div className="flex items-center">
                                                <Square className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm text-gray-500">Net Alan</div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {property.netArea} m²
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Özellikler */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Özellikler</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`flex items-center p-2 rounded ${property.elevator ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Asansör</span>
                                    </div>
                                    <div className={`flex items-center p-2 rounded ${property.parking ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                        <Car className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Otopark</span>
                                    </div>
                                    <div className={`flex items-center p-2 rounded ${property.balcony ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                        <Building className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Balkon</span>
                                    </div>
                                    <div className={`flex items-center p-2 rounded ${property.security ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                        <Shield className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Güvenlik</span>
                                    </div>
                                </div>
                                {property.furnished && (
                                    <div className="mt-3 flex items-center p-2 bg-blue-50 text-blue-700 rounded">
                                        <Star className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Eşyalı</span>
                                    </div>
                                )}
                            </div>

                            {/* Açıklama */}
                            {property.description && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Açıklama</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {property.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sağ Kolon - Sahibi ve İstatistikler */}
                        <div className="space-y-6">
                            {/* İlan Sahibi */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">İlan Sahibi</h4>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12">
                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-600" />
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            {property.owner.firstName} {property.owner.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ID: #{property.owner.id}
                                        </div>
                                        {property.owner.phoneNumber && (
                                            <div className="text-sm text-gray-500">
                                                Tel: {property.owner.phoneNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* İstatistikler */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">İstatistikler</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Görüntüleme
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {property.viewCount}
                                        </div>
                                    </div>
                                    {property.reportCount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-red-600">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Şikayet
                                            </div>
                                            <div className="text-sm font-medium text-red-900">
                                                {property.reportCount}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tarih Bilgileri */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Tarih Bilgileri</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <div>
                                            <div className="text-sm text-gray-500">Oluşturulma</div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(property.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <div>
                                            <div className="text-sm text-gray-500">Son Güncelleme</div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(property.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Durum */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Durum</h4>
                                <div className="space-y-2">
                                    <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                                        property.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {property.active ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Aktif
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Pasif
                                            </>
                                        )}
                                    </div>
                                    <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                                        property.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {property.approved ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Onaylanmış
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Onay Bekliyor
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Kapat
                    </button>

                    {!property.approved && (onApprove || onReject) && (
                        <div className="flex items-center gap-3">
                            {onReject && (
                                <button
                                    onClick={onReject}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reddet
                                </button>
                            )}
                            {onApprove && (
                                <button
                                    onClick={onApprove}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Onayla
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};