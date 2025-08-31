// src/components/preview/ListingPreview.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectListingPreviewData, clearListingPreviewData } from '@/store/slices/listingPreviewSlice';
import { useCreatePropertyMutation, ListingType, PropertyType } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import {
    Home,
    MapPin,
    DollarSign,
    Edit3,
    Check,
    ArrowLeft,
    Car,
    ArrowUp,
    Shield,
    Sofa,
    Crown,
    Loader2,
    Building,
    Maximize,
    Bed,
    Bath
} from 'lucide-react';

export const ListingPreview: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const previewData = useAppSelector(selectListingPreviewData);
    const [createProperty, { isLoading }] = useCreatePropertyMutation();

    // Toast state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Eğer preview data yoksa create-listing'e yönlendir
    React.useEffect(() => {
        if (!previewData) {
            router.push('/create-listing');
        }
    }, [previewData, router]);

    if (!previewData) {
        return null;
    }

    // Helper functions
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

    const getRoomText = () => {
        if (previewData.roomConfiguration) {
            return `${previewData.roomConfiguration.roomCount}+${previewData.roomConfiguration.livingRoomCount}`;
        }
        return '-';
    };

    // Düzenle butonuna tıklayınca
    const handleEdit = () => {
        router.push('/create-listing');
    };

    // İlanı onayla ve yayınla
    const handleConfirm = async () => {
        if (!previewData) return;

        try {
            await createProperty(previewData).unwrap();

            showToast(
                isReady ? t('listing.create.success') : 'İlan başarıyla oluşturuldu!',
                'success'
            );

            dispatch(clearListingPreviewData());

            setTimeout(() => {
                router.push('/my-listings');
            }, 1500);

        } catch (error) {
            console.error('Listing creation error:', error);

            showToast(
                isReady ? t('listing.create.error') : 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
                'error'
            );
        }
    };

    // Tüm özellikleri listele
    const allFeatures = [
        { key: 'elevator', label: 'Asansör', icon: ArrowUp, active: previewData.elevator },
        { key: 'parking', label: 'Otopark', icon: Car, active: previewData.parking },
        { key: 'balcony', label: 'Balkon', icon: Building, active: previewData.balcony },
        { key: 'security', label: 'Güvenlik', icon: Shield, active: previewData.security },
        { key: 'furnished', label: 'Eşyalı', icon: Sofa, active: previewData.furnished },
        { key: 'pappSellable', label: 'Papp Satış', icon: Crown, active: previewData.pappSellable },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-medium">{isReady ? t('common.back') : 'Geri Dön'}</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {isReady ? t('listing.preview.title') : 'İlan Önizlemesi'}
                            </h1>
                            <p className="text-slate-600">
                                {isReady ? t('listing.preview.review-before-publish') : 'İlanınızı yayınlamadan önce son kez kontrol edin'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden mb-8">

                    {/* Hero Image Area */}
                    <div className="relative">
                        <div className="h-80 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                            {/* Decorative Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
                            </div>

                            <div className="text-center text-slate-500 z-10">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                                    <Building className="w-10 h-10 text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-700 mb-1">
                                    {isReady ? t('listing.preview.no-image') : 'Görsel Henüz Eklenmedi'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {isReady ? t('listing.preview.add-images-later') : 'İlan yayınlandıktan sonra fotoğrafları ekleyebilirsiniz'}
                                </p>
                            </div>
                        </div>


                    </div>

                    {/* Content */}
                    <div className="p-8">

                        {/* Title and Location */}
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                                {previewData.title}
                            </h2>

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center text-slate-600">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-base">
                                        {previewData.neighborhood}, {previewData.district}, {previewData.city}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">
                                        {getPropertyTypeText(previewData.propertyType)}
                                    </span>
                                    <span className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white">
                                        {getListingTypeText(previewData.listingType)}
                                    </span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex items-baseline justify-between flex-wrap gap-2">
                                    <div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-bold text-blue-700">
                                                {formatPrice(previewData.price)}
                                            </span>
                                            {previewData.negotiable && (
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                                                    {isReady ? t('listing.negotiable') : 'Pazarlık Edilebilir'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Additional Costs */}
                                        {(previewData.monthlyFee || previewData.deposit) && (
                                            <div className="flex gap-6 mt-3">
                                                {previewData.monthlyFee && (
                                                    <div className="text-slate-600">
                                                        <span className="text-sm">{isReady ? t('listing.monthly-fee') : 'Aidat'}: </span>
                                                        <span className="font-semibold">{formatPrice(previewData.monthlyFee)}</span>
                                                    </div>
                                                )}
                                                {previewData.deposit && (
                                                    <div className="text-slate-600">
                                                        <span className="text-sm">{isReady ? t('listing.deposit') : 'Depozito'}: </span>
                                                        <span className="font-semibold">{formatPrice(previewData.deposit)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Property Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    {isReady ? t('listing.basic-info') : 'Temel Bilgiler'}
                                </h3>

                                {/* Area Info */}
                                {(previewData.grossArea || previewData.netArea) && (
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-3">
                                                <Maximize className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="text-slate-700 font-medium">{isReady ? t('listing.area') : 'Alan'}</span>
                                        </div>
                                        <span className="text-slate-900 font-bold text-lg">
                                            {previewData.grossArea || previewData.netArea}m²
                                        </span>
                                    </div>
                                )}

                                {/* Room Config */}
                                {getRoomText() !== '-' && (
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-3">
                                                <Home className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="text-slate-700 font-medium">{isReady ? t('listing.room-count') : 'Oda Sayısı'}</span>
                                        </div>
                                        <span className="text-slate-900 font-bold text-lg">
                                            {getRoomText()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    {isReady ? t('listing.features') : 'Özellikler'}
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {allFeatures.map((feature) => {
                                        const IconComponent = feature.icon;
                                        return (
                                            <div
                                                key={feature.key}
                                                className={`flex items-center p-3 rounded-xl border ${
                                                    feature.active
                                                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-green-100'
                                                        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                                                    feature.active ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                    <IconComponent className={`w-4 h-4 ${
                                                        feature.active ? 'text-green-600' : 'text-red-600'
                                                    }`} />
                                                </div>
                                                <span className={`font-medium text-sm ${
                                                    feature.active ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                    {feature.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {previewData.description && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    {isReady ? t('listing.description') : 'Açıklama'}
                                </h3>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {previewData.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex gap-4">
                            <Button
                                onClick={handleEdit}
                                variant="outline"
                                size="lg"
                                className="flex-1 h-14 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                            >
                                <Edit3 className="w-5 h-5 mr-2" />
                                {isReady ? t('common.edit') : 'Düzenle'}
                            </Button>

                            <Button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                size="lg"
                                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {isReady ? t('listing.publishing') : 'Yayınlanıyor...'}
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        {isReady ? t('listing.confirm-publish') : 'Onayla ve Yayınla'}
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Info Text */}
                        <p className="text-center text-slate-500 text-sm mt-4">
                            {isReady ? t('listing.preview.edit-info') : 'İlanınız yayınlandıktan sonra düzenlenebilir ve silinebilir'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};