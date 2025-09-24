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
    monthlyFee?: number;
    deposit?: number;
    roomConfiguration?: {
        roomCount: number;
        hallCount?: number;
        bathroomCount?: number;
    };
    owner: {
        id: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email?: string;
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sol Kolon - Temel İlan Bilgileri */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Başlık ve Etiketler */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{property.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                        {getListingTypeText(property.listingType)}
                                    </span>
                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                                        {getPropertyTypeText(property.propertyType)}
                                    </span>
                                    {property.featured && (
                                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            Öne Çıkan
                                        </span>
                                    )}
                                    {property.pappSellable && (
                                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800">
                                            PAPP Satılabilir
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Konum ve Fiyat */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                        <MapPin className="h-4 w-4 text-blue-600 mr-1" />
                                        Konum
                                    </h4>
                                    <p className="text-sm text-gray-700">{property.city}</p>
                                    <p className="text-sm text-gray-600">{property.district}</p>
                                    <p className="text-sm text-gray-600">{property.neighborhood}</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                        Fiyat
                                    </h4>
                                    <p className="text-lg font-bold text-green-600">{formatPrice(property.price)}</p>
                                    {(property.monthlyFee || property.deposit) && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            {property.monthlyFee && <p>Aidat: {formatPrice(property.monthlyFee)}</p>}
                                            {property.deposit && <p>Depozito: {formatPrice(property.deposit)}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Oda ve Alan Bilgileri */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {property.roomConfiguration && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Oda Bilgisi</h4>
                                        <p className="text-lg font-semibold text-gray-800">
                                            {property.roomConfiguration.roomCount || 0} + {(property.roomConfiguration.hallCount || property.roomConfiguration.hallCount) || 0}
                                        </p>
                                        {property.roomConfiguration.bathroomCount && (
                                            <p className="text-sm text-gray-600 mt-1">Banyo: {property.roomConfiguration.bathroomCount}</p>
                                        )}
                                    </div>
                                )}
                                {property.grossArea && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Brüt Alan</h4>
                                        <p className="text-lg font-semibold text-gray-800">{property.grossArea} m²</p>
                                    </div>
                                )}
                                {property.netArea && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Net Alan</h4>
                                        <p className="text-lg font-semibold text-gray-800">{property.netArea} m²</p>
                                    </div>
                                )}
                            </div>

                            {/* Özellikler */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Emlak Özellikleri</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div className={`flex items-center px-3 py-2 rounded-md text-sm ${property.elevator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        Asansör
                                    </div>
                                    <div className={`flex items-center px-3 py-2 rounded-md text-sm ${property.parking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                        <Car className="h-4 w-4 mr-1" />
                                        Otopark
                                    </div>
                                    <div className={`flex items-center px-3 py-2 rounded-md text-sm ${property.balcony ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                        <Building className="h-4 w-4 mr-1" />
                                        Balkon
                                    </div>
                                    <div className={`flex items-center px-3 py-2 rounded-md text-sm ${property.security ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                        <Shield className="h-4 w-4 mr-1" />
                                        Güvenlik
                                    </div>
                                    <div className={`flex items-center px-3 py-2 rounded-md text-sm ${property.furnished ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                        <Star className="h-4 w-4 mr-1" />
                                        Eşyalı
                                    </div>
                                </div>
                            </div>

                            {/* Açıklama */}
                            {property.description && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Açıklama</h4>
                                    <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {property.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Sağ Kolon - Sahip ve Durum Bilgileri */}
                        <div className="space-y-4">
                            {/* İlan Sahibi */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <User className="h-4 w-4 text-blue-600 mr-1" />
                                    İlan Sahibi
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Ad Soyad:</span>
                                        <span className="text-sm font-medium text-gray-900">{property.owner.firstName} {property.owner.lastName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">ID:</span>
                                        <span className="text-sm font-medium text-gray-900">#{property.owner.id}</span>
                                    </div>
                                    {property.owner.phoneNumber && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Telefon:</span>
                                            <span className="text-sm font-medium text-gray-900">{property.owner.phoneNumber}</span>
                                        </div>
                                    )}
                                    {property.owner.email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">E-posta:</span>
                                            <span className="text-sm font-medium text-gray-900 truncate">{property.owner.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Durum Bilgileri */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Durum</h4>
                                <div className="space-y-2">
                                    <div className={`flex items-center justify-between px-3 py-2 rounded-md ${property.active ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <span className="text-sm text-gray-600">Aktif Durum:</span>
                                        <span className={`text-sm font-medium flex items-center ${property.active ? 'text-green-800' : 'text-red-800'}`}>
                                            {property.active ? (
                                                <><CheckCircle className="h-3 w-3 mr-1" />Aktif</>
                                            ) : (
                                                <><XCircle className="h-3 w-3 mr-1" />Pasif</>
                                            )}
                                        </span>
                                    </div>
                                    <div className={`flex items-center justify-between px-3 py-2 rounded-md ${property.approved ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                        <span className="text-sm text-gray-600">Onay Durumu:</span>
                                        <span className={`text-sm font-medium flex items-center ${property.approved ? 'text-green-800' : 'text-yellow-800'}`}>
                                            {property.approved ? (
                                                <><CheckCircle className="h-3 w-3 mr-1" />Onaylandı</>
                                            ) : (
                                                <><AlertTriangle className="h-3 w-3 mr-1" />Bekliyor</>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* İstatistikler */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <Eye className="h-4 w-4 text-purple-600 mr-1" />
                                    İstatistikler
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Görüntüleme:</span>
                                        <span className="text-sm font-medium text-gray-900">{property.viewCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Şikayet:</span>
                                        <span className={`text-sm font-medium ${property.reportCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {property.reportCount || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tarih Bilgileri */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <Calendar className="h-4 w-4 text-green-600 mr-1" />
                                    Tarih Bilgileri
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Oluşturulma:</span>
                                        <span className="text-sm font-medium text-gray-900 text-right">
                                            {formatDate(property.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Güncelleme:</span>
                                        <span className="text-sm font-medium text-gray-900 text-right">
                                            {formatDate(property.updatedAt)}
                                        </span>
                                    </div>
                                    {property.approvedAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Onaylanma:</span>
                                            <span className="text-sm font-medium text-green-600 text-right">
                                                {formatDate(property.approvedAt)}
                                            </span>
                                        </div>
                                    )}
                                    {property.lastPublished && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Son Yayın:</span>
                                            <span className="text-sm font-medium text-gray-900 text-right">
                                                {formatDate(property.lastPublished)}
                                            </span>
                                        </div>
                                    )}
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