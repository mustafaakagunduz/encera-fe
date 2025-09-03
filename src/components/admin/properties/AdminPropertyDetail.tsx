'use client';

import React, { useState } from 'react';
import { useGetPropertyByIdQuery } from '@/store/api/propertyApi';
import { useApprovePropertyMutation, useRejectPropertyMutation } from '@/store/api/adminApi';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {
    ArrowLeft,
    Building,
    MapPin,
    DollarSign,
    Eye,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Star,
    TrendingUp,
    Car,
    Shield,
    Home,
    Square,
    Crown,
    Loader2
} from 'lucide-react';

interface AdminPropertyDetailProps {
    propertyId: number;
}

export const AdminPropertyDetail: React.FC<AdminPropertyDetailProps> = ({ propertyId }) => {
    const router = useRouter();
    const { t, isReady } = useAppTranslation();
    const { data: property, isLoading, error } = useGetPropertyByIdQuery(propertyId);
    const [approveProperty, { isLoading: isApproving }] = useApprovePropertyMutation();
    const [rejectProperty, { isLoading: isRejecting }] = useRejectPropertyMutation();
    
    const [showConfirm, setShowConfirm] = useState<{show: boolean, type: 'approve' | 'reject'}>({
        show: false,
        type: 'approve'
    });

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
            case 'SALE': return isReady ? t('common.sale') : 'Satılık';
            case 'RENT': return isReady ? t('common.rent') : 'Kiralık';
            default: return type;
        }
    };

    const getPropertyTypeText = (type: string) => {
        switch (type) {
            case 'RESIDENTIAL': return isReady ? t('common.residential') : 'Konut';
            case 'COMMERCIAL': return isReady ? t('common.commercial') : 'Ticari';
            case 'LAND': return isReady ? t('common.land') : 'Arsa';
            case 'DAILY_RENTAL': return isReady ? t('common.daily-rental') : 'Günlük Kiralık';
            default: return type;
        }
    };

    const handleApprove = async () => {
        try {
            await approveProperty(propertyId).unwrap();
            setShowConfirm({show: false, type: 'approve'});
            // Optionally show success message or refresh data
        } catch (error) {
            console.error('Approval error:', error);
        }
    };

    const handleReject = async () => {
        try {
            await rejectProperty(propertyId).unwrap();
            setShowConfirm({show: false, type: 'reject'});
            // Optionally show success message or refresh data
        } catch (error) {
            console.error('Rejection error:', error);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout title={isReady ? t('admin.property-detail.title') : 'İlan Detayı'} subtitle={isReady ? t('admin.property-detail.loading') : 'İlan yükleniyor...'}>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </AdminLayout>
        );
    }

    if (error || !property) {
        return (
            <AdminLayout title={isReady ? t('admin.property-detail.title') : 'İlan Detayı'} subtitle={isReady ? t('admin.property-detail.not-found') : 'İlan bulunamadı'}>
                <div className="text-center py-12">
                    <p className="text-red-600">{isReady ? t('admin.property-detail.not-found') : 'İlan bulunamadı veya bir hata oluştu.'}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {isReady ? t('admin.property-detail.back') : 'Geri Dön'}
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            title={isReady ? t('admin.property-detail.title') : 'İlan Detayı'} 
            subtitle={`#${property.id} - ${property.title}`}
        >
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {isReady ? t('admin.property-detail.back') : 'Geri Dön'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ana İçerik */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Başlık ve Etiketler */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{property.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                {getListingTypeText(property.listingType)}
                            </span>
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                                {getPropertyTypeText(property.propertyType)}
                            </span>
                            {property.featured && (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1 inline" />
                                    {isReady ? t('admin.property-detail.featured') : 'Öne Çıkan'}
                                </span>
                            )}
                            {property.pappSellable && (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800">
                                    <Crown className="h-3 w-3 mr-1 inline" />
                                    {isReady ? t('admin.property-detail.papp-sellable') : 'PAPP Satılabilir'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Konum ve Fiyat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                                {isReady ? t('admin.property-detail.location') : 'Konum'}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-gray-700"><strong>{isReady ? t('admin.property-detail.city') : 'Şehir'}:</strong> {property.city}</p>
                                <p className="text-gray-700"><strong>{isReady ? t('admin.property-detail.district') : 'İlçe'}:</strong> {property.district}</p>
                                <p className="text-gray-700"><strong>{isReady ? t('admin.property-detail.neighborhood') : 'Mahalle'}:</strong> {property.neighborhood}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                {isReady ? t('admin.property-detail.price-info') : 'Fiyat Bilgileri'}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-green-600">{formatPrice(property.price)}</p>
                                {property.negotiable && (
                                    <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                                        {isReady ? t('admin.property-detail.negotiable') : 'Pazarlık Yapılabilir'}
                                    </span>
                                )}
                                {property.monthlyFee && (
                                    <p className="text-sm text-gray-600">{isReady ? t('admin.property-detail.monthly-fee') : 'Aidat'}: {formatPrice(property.monthlyFee)}</p>
                                )}
                                {property.deposit && (
                                    <p className="text-sm text-gray-600">{isReady ? t('admin.property-detail.deposit') : 'Depozito'}: {formatPrice(property.deposit)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Özellikler */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{isReady ? t('admin.property-detail.property-features') : 'Emlak Özellikleri'}</h3>
                        
                        {/* Oda ve Alan Bilgileri */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {property.roomConfiguration && (
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">{isReady ? t('admin.property-detail.room-info') : 'Oda + Salon'}</h4>
                                    <p className="text-xl font-bold text-gray-800">
                                        {property.roomConfiguration.roomCount || 0} + {(property.roomConfiguration as any)?.hallCount || property.roomConfiguration.livingRoomCount || 0}
                                    </p>
                                </div>
                            )}
                            {property.grossArea && (
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">{isReady ? t('admin.property-detail.gross-area') : 'Brüt Alan'}</h4>
                                    <p className="text-xl font-bold text-gray-800">{property.grossArea} m²</p>
                                </div>
                            )}
                            {property.netArea && (
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">{isReady ? t('admin.property-detail.net-area') : 'Net Alan'}</h4>
                                    <p className="text-xl font-bold text-gray-800">{property.netArea} m²</p>
                                </div>
                            )}
                        </div>

                        {/* Diğer Özellikler */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${property.elevator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {isReady ? t('admin.property-detail.elevator') : 'Asansör'}
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${property.parking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                <Car className="h-4 w-4 mr-2" />
                                {isReady ? t('admin.property-detail.parking') : 'Otopark'}
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${property.balcony ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                <Home className="h-4 w-4 mr-2" />
                                {isReady ? t('admin.property-detail.balcony') : 'Balkon'}
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${property.security ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                <Shield className="h-4 w-4 mr-2" />
                                {isReady ? t('admin.property-detail.security') : 'Güvenlik'}
                            </div>
                            <div className={`flex items-center px-3 py-2 rounded-lg text-sm ${property.furnished ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                <Star className="h-4 w-4 mr-2" />
                                {isReady ? t('admin.property-detail.furnished') : 'Eşyalı'}
                            </div>
                        </div>
                    </div>

                    {/* Açıklama */}
                    {property.description && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{isReady ? t('admin.property-detail.description') : 'İlan Açıklaması'}</h3>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {property.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Durum ve Eylemler */}
                <div className="space-y-6">
                    {/* İlan Sahibi */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="h-5 w-5 text-blue-600 mr-2" />
                            {isReady ? t('admin.property-detail.owner') : 'İlan Sahibi'}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.owner-name') : 'Ad Soyad'}:</span>
                                <span className="font-medium">{property.owner.firstName} {property.owner.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.owner-id') : 'ID'}:</span>
                                <span className="font-medium">#{property.owner.id}</span>
                            </div>
                            {property.owner.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{isReady ? t('admin.property-detail.owner-phone') : 'Telefon'}:</span>
                                    <span className="font-medium">{property.owner.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Durum Bilgileri */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{isReady ? t('admin.property-detail.status') : 'Durum'}</h3>
                        <div className="space-y-3">
                            <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${property.active ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.active-status') : 'Aktif Durum'}:</span>
                                <span className={`font-medium flex items-center ${property.active ? 'text-green-800' : 'text-red-800'}`}>
                                    {property.active ? (
                                        <><CheckCircle className="h-4 w-4 mr-1" />{isReady ? t('admin.property-detail.active') : 'Aktif'}</>
                                    ) : (
                                        <><XCircle className="h-4 w-4 mr-1" />{isReady ? t('admin.property-detail.inactive') : 'Pasif'}</>
                                    )}
                                </span>
                            </div>
                            <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${property.approved ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.approval-status') : 'Onay Durumu'}:</span>
                                <span className={`font-medium flex items-center ${property.approved ? 'text-green-800' : 'text-yellow-800'}`}>
                                    {property.approved ? (
                                        <><CheckCircle className="h-4 w-4 mr-1" />{isReady ? t('admin.property-detail.approved') : 'Onaylandı'}</>
                                    ) : (
                                        <><AlertTriangle className="h-4 w-4 mr-1" />{isReady ? t('admin.property-detail.pending') : 'Bekliyor'}</>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* İstatistikler */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Eye className="h-5 w-5 text-purple-600 mr-2" />
                            {isReady ? t('admin.property-detail.statistics') : 'İstatistikler'}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.views') : 'Görüntüleme'}:</span>
                                <span className="font-medium">{property.viewCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.reports') : 'Şikayet'}:</span>
                                <span className={`font-medium ${property.reportCount > 0 ? 'text-red-600' : ''}`}>
                                    {property.reportCount || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tarih Bilgileri */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 text-green-600 mr-2" />
                            {isReady ? t('admin.property-detail.dates') : 'Tarihler'}
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.created') : 'Oluşturulma'}:</span>
                                <p className="font-medium">{formatDate(property.createdAt)}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">{isReady ? t('admin.property-detail.updated') : 'Güncelleme'}:</span>
                                <p className="font-medium">{formatDate(property.updatedAt)}</p>
                            </div>
                            {property.approvedAt && (
                                <div>
                                    <span className="text-gray-600">{isReady ? t('admin.property-detail.approved-date') : 'Onaylanma'}:</span>
                                    <p className="font-medium text-green-600">{formatDate(property.approvedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Eylemler */}
                    {!property.approved && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{isReady ? t('admin.property-detail.admin-actions') : 'Admin Eylemleri'}</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowConfirm({show: true, type: 'approve'})}
                                    disabled={isApproving}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isApproving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    {isReady ? t('admin.property-detail.approve') : 'İlanı Onayla'}
                                </button>
                                <button
                                    onClick={() => setShowConfirm({show: true, type: 'reject'})}
                                    disabled={isRejecting}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRejecting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    {isReady ? t('admin.property-detail.reject') : 'İlanı Reddet'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {showConfirm.type === 'approve' 
                                ? (isReady ? t('admin.property-detail.approve') : 'İlanı Onayla')
                                : (isReady ? t('admin.property-detail.reject') : 'İlanı Reddet')
                            }
                        </h3>
                        <p className="text-gray-700 mb-6">
                            {showConfirm.type === 'approve' 
                                ? (isReady ? t('admin.property-detail.approve-confirm') : 'Bu ilanı onaylamak istediğinizden emin misiniz?')
                                : (isReady ? t('admin.property-detail.reject-confirm') : 'Bu ilanı reddetmek istediğinizden emin misiniz?')
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm({show: false, type: 'approve'})}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                {isReady ? t('admin.property-detail.cancel') : 'İptal'}
                            </button>
                            <button
                                onClick={showConfirm.type === 'approve' ? handleApprove : handleReject}
                                disabled={isApproving || isRejecting}
                                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                                    showConfirm.type === 'approve' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {(isApproving || isRejecting) ? (
                                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                    showConfirm.type === 'approve' 
                                        ? (isReady ? t('admin.property-detail.approve') : 'Onayla')
                                        : (isReady ? t('admin.property-detail.reject') : 'Reddet')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};