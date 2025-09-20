// src/components/preview/ListingPreview.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectListingPreviewData, clearListingPreviewData } from '@/store/slices/listingPreviewSlice';
import { previewStorage } from '@/utils/previewStorage';
import { useCreatePropertyMutation, ListingType, PropertyType } from '@/store/api/propertyApi';
import { useUploadMultipleFilesMutation } from '@/store/api/fileUploadApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { compressMultipleImages, formatFileSize } from '@/utils/imageCompression';
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
    Bath,
    Calendar,
    Layers,
    Navigation,
    Thermometer,
    ChevronLeft,
    ChevronRight,
    X,
    ZoomIn,
    Camera
} from 'lucide-react';

export const ListingPreview: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const previewData = useAppSelector(selectListingPreviewData);
    const [createProperty, { isLoading }] = useCreatePropertyMutation();
    const [uploadMultipleFiles, { isLoading: isUploadingImages }] = useUploadMultipleFilesMutation();

    // File objelerini storage'dan al
    const [localImages, setLocalImages] = React.useState<{ file?: File; url?: string; isPrimary: boolean; preview: string }[]>([]);

    // Modal state
    const [modalImage, setModalImage] = React.useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

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

    // Publishing modal state
    const [showPublishingModal, setShowPublishingModal] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Storage'dan File objelerini yükle
    React.useEffect(() => {
        if (!previewData) {
            router.push('/create-listing');
            return;
        }

        const storageData = previewStorage.load();
        if (storageData) {
            setLocalImages(storageData.images);
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
            return `${previewData.roomConfiguration.roomCount}+${previewData.roomConfiguration.hallCount}`;
        }
        return '-';
    };

    // Modal functions
    const openImageModal = (imageSrc: string, index: number) => {
        setModalImage(imageSrc);
        setCurrentImageIndex(index);
    };

    const closeImageModal = () => {
        setModalImage(null);
    };

    const nextImage = () => {
        if (localImages.length > 0) {
            const nextIndex = (currentImageIndex + 1) % localImages.length;
            setCurrentImageIndex(nextIndex);
            setModalImage(localImages[nextIndex].preview);
        }
    };

    const prevImage = () => {
        if (localImages.length > 0) {
            const prevIndex = currentImageIndex === 0 ? localImages.length - 1 : currentImageIndex - 1;
            setCurrentImageIndex(prevIndex);
            setModalImage(localImages[prevIndex].preview);
        }
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (modalImage) {
                if (e.key === 'Escape') {
                    closeImageModal();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                } else if (e.key === 'ArrowLeft') {
                    prevImage();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [modalImage, currentImageIndex, localImages]);

    // Düzenle butonuna tıklayınca
    const handleEdit = () => {
        router.push('/create-listing');
    };

    // İlanı onayla ve yayınla
    const handleConfirm = async () => {
        if (!previewData) return;

        console.log('🚀 Starting listing creation process...');
        console.log('📋 Preview data:', previewData);
        console.log('🖼️ Local images:', localImages);

        // Modal'ı göster - kullanıcıyı kitle
        setShowPublishingModal(true);

        try {
            let finalPropertyData = { ...previewData };

            // Eğer local images varsa önce onları S3'e yükle
            if (localImages && localImages.length > 0) {
                const filesToUpload = localImages.filter(img => img.file);
                console.log('📁 Files to upload:', filesToUpload.length);

                if (filesToUpload.length > 0) {
                    // Önce resimleri sıkıştır (daha hızlı upload için)
                    const files = filesToUpload.map(img => img.file!);
                    console.log('🗜️ Compressing images...', files.length, 'files');
                    const compressedResults = await compressMultipleImages(files, {
                        maxWidth: 1920,
                        maxHeight: 1080,
                        quality: 0.8,
                        maxSizeKB: 500
                    });

                    const compressedFiles = compressedResults.map(result => result.file);
                    console.log('✅ Images compressed, uploading to S3...', compressedFiles.length, 'files');

                    // Sıkıştırılmış image'ları S3'e yükle
                    const uploadResponse = await uploadMultipleFiles({
                        files: compressedFiles,
                        subDirectory: 'properties'
                    }).unwrap();

                    console.log('📤 S3 Upload response:', uploadResponse);
                    console.log('📤 Upload response structure:', JSON.stringify(uploadResponse, null, 2));
                    console.log('📤 First uploaded file:', uploadResponse.uploadedFiles[0]);

                    // Upload edilen URL'leri al
                    const uploadedUrls = uploadResponse.uploadedFiles.map((file: any) => file.fileUrl);
                    console.log('🔗 Uploaded URLs:', uploadedUrls);


                    // Local image'ların yerini upload edilenlerle değiştir
                    const updatedImageUrls: string[] = [];
                    let uploadIndex = 0;
                    let primaryImageUrl = '';

                    localImages.forEach((img) => {
                        if (img.file) {
                            // Local image - upload edilmiş URL ile değiştir
                            const uploadedUrl = uploadedUrls[uploadIndex];
                            updatedImageUrls.push(uploadedUrl);
                            if (img.isPrimary) {
                                primaryImageUrl = uploadedUrl;
                            }
                            uploadIndex++;
                        } else if (img.url) {
                            // Zaten upload edilmiş image
                            updatedImageUrls.push(img.url);
                            if (img.isPrimary) {
                                primaryImageUrl = img.url;
                            }
                        }
                    });

                    finalPropertyData = {
                        ...finalPropertyData,
                        imageUrls: updatedImageUrls,
                        primaryImageUrl: primaryImageUrl
                    };

                    console.log('🎯 Final property data with images:', {
                        imageUrls: updatedImageUrls,
                        primaryImageUrl: primaryImageUrl,
                        totalImages: updatedImageUrls.length
                    });

                }
            } else {
                console.log('ℹ️ No local images to upload');
            }

            console.log('💾 Creating property in database...', finalPropertyData);
            const createdProperty = await createProperty(finalPropertyData).unwrap();
            console.log('✅ Property created successfully:', createdProperty);

            // Storage'ı ve Redux'ı hemen temizle
            previewStorage.clear();
            dispatch(clearListingPreviewData());

            // Başarılı - modal'ı daha uzun göster, sonra güvenli yönlendirme
            setTimeout(() => {
                // Önce window.location ile yönlendir (sayfa tamamen yenilensin)
                window.location.href = '/my-listings';
            }, 2000);

        } catch (error) {
            console.error('❌ Listing creation error:', error);

            // Hata olursa modal'ı kapat
            setShowPublishingModal(false);

            showToast(
                isReady ? t('listing.create.error') : 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
                'error'
            );
        }
    };

    // Tüm özellikleri listele
    const allFeatures = [
        { 
            key: 'elevator', 
            label: isReady ? t('listing.create.elevator') : 'Asansör', 
            icon: ArrowUp, 
            active: previewData.elevator 
        },
        { 
            key: 'parking', 
            label: isReady ? t('listing.create.parking') : 'Otopark', 
            icon: Car, 
            active: previewData.parking 
        },
        { 
            key: 'balcony', 
            label: isReady ? t('listing.create.balcony') : 'Balkon', 
            icon: Building, 
            active: previewData.balcony 
        },
        { 
            key: 'security', 
            label: isReady ? t('listing.create.security') : 'Güvenlik', 
            icon: Shield, 
            active: previewData.security 
        },
        { 
            key: 'furnished', 
            label: isReady ? t('listing.create.furnished') : 'Eşyalı', 
            icon: Sofa, 
            active: previewData.furnished 
        },
        { 
            key: 'pappSellable', 
            label: isReady ? t('listing.create.encera-sellable') : 'Ençera ile Satılsın', 
            icon: Crown, 
            active: previewData.pappSellable 
        },
    ];


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-none lg:max-w-7xl">

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

                    {/* Image Gallery Area */}
                    <div className="relative">
                        {localImages && localImages.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
                                {/* Ana resim - İlk resim veya primary resim */}
                                <div className="lg:col-span-2">
                                    {(() => {
                                        const primaryImage = localImages.find(img => img.isPrimary) || localImages[0];
                                        return (
                                            <div
                                                className="relative h-80 lg:h-96 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
                                                onClick={() => openImageModal(primaryImage.preview, localImages.indexOf(primaryImage))}
                                            >
                                                <img
                                                    src={primaryImage.preview}
                                                    alt="Ana resim"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                                <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <ZoomIn className="w-4 h-4 text-white" />
                                                </div>
                                                {primaryImage.isPrimary && (
                                                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                        Ana Resim
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Thumbnail'ler */}
                                <div className="space-y-4">
                                    {localImages.slice(1, 5).map((image, index) => {
                                        const actualIndex = index + 1; // Gerçek index (0. element ana resim olduğu için)
                                        return (
                                            <div
                                                key={actualIndex}
                                                className="relative h-16 lg:h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                                                onClick={() => openImageModal(image.preview, actualIndex)}
                                            >
                                                <img
                                                    src={image.preview}
                                                    alt={`Resim ${actualIndex + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                            </div>
                                        );
                                    })}

                                    {/* Daha fazla resim varsa */}
                                    {localImages.length > 5 && (
                                        <div
                                            className="relative h-16 lg:h-20 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer group"
                                            onClick={() => openImageModal(localImages[5].preview, 5)}
                                        >
                                            <div className="text-center">
                                                <Camera className="w-5 h-5 text-white mx-auto mb-1" />
                                                <span className="text-white text-xs font-medium">
                                                    +{localImages.length - 5}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-12">

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
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-baseline gap-3 mb-3">
                                    <span className="text-3xl font-bold text-blue-700">
                                        {formatPrice(previewData.price)}
                                    </span>
                                    {previewData.negotiable && (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium">
                                            {isReady ? t('listing.negotiable') : 'Pazarlık Edilebilir'}
                                        </span>
                                    )}
                                </div>

                                {/* Additional Costs */}
                                {(previewData.monthlyFee || previewData.deposit) && (
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        {previewData.monthlyFee && (
                                            <div className="text-slate-600">
                                                <span>{isReady ? t('listing.monthly-fee') : 'Aidat'}: </span>
                                                <span className="font-semibold">{formatPrice(previewData.monthlyFee)}</span>
                                            </div>
                                        )}
                                        {previewData.deposit && (
                                            <div className="text-slate-600">
                                                <span>{isReady ? t('listing.deposit') : 'Depozito'}: </span>
                                                <span className="font-semibold">{formatPrice(previewData.deposit)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Details Grid - Two Columns on Desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">

                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                        {isReady ? t('listing.basic-info') : 'Temel Bilgiler'}
                                    </h3>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                        {/* Area Info */}
                                        {(previewData.grossArea || previewData.netArea) && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">{isReady ? t('listing.area') : 'Alan'}</span>
                                                <span className="text-slate-900 font-semibold">
                                                    {previewData.grossArea || previewData.netArea}m²
                                                </span>
                                            </div>
                                        )}

                                        {/* Room Config */}
                                        {getRoomText() !== '-' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">{isReady ? t('listing.room-count') : 'Oda Sayısı'}</span>
                                                <span className="text-slate-900 font-semibold">{getRoomText()}</span>
                                            </div>
                                        )}

                                        {/* Building Age */}
                                        {previewData.buildingAge !== undefined && previewData.buildingAge !== null && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">{isReady ? t('listing.create.building-age') : 'Bina Yaşı'}</span>
                                                <span className="text-slate-900 font-semibold">
                                                    {previewData.buildingAge} {isReady ? t('listing.create.years') : 'yıl'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Floor Info */}
                                        {(previewData.currentFloor !== undefined || previewData.totalFloors !== undefined) && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">{isReady ? t('listing.create.current-floor') : 'Kat Bilgisi'}</span>
                                                <span className="text-slate-900 font-semibold">
                                                    {previewData.currentFloor !== undefined && previewData.totalFloors !== undefined 
                                                        ? `${previewData.currentFloor}/${previewData.totalFloors}`
                                                        : previewData.currentFloor !== undefined 
                                                            ? `${previewData.currentFloor}. ${isReady ? t('listing.create.floor') : 'kat'}`
                                                            : `${previewData.totalFloors} ${isReady ? t('listing.create.floors') : 'katlı'}`
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Heating Types */}
                                {previewData.heatingTypes && previewData.heatingTypes.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                            {isReady ? t('listing.create.heating-types') : 'Isıtma'}
                                        </h3>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {previewData.heatingTypes.map((heatingType, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                                                    >
                                                        {isReady ? t(`heating.options.${heatingType}`) : heatingType}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                        {isReady ? t('listing.features') : 'Özellikler'}
                                    </h3>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                        {allFeatures.map((feature) => {
                                            const IconComponent = feature.icon;
                                            return (
                                                <div
                                                    key={feature.key}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center">
                                                        <IconComponent className="w-4 h-4 text-slate-500 mr-2" />
                                                        <span className="text-slate-700">{feature.label}</span>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        feature.active ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {previewData.description && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    {isReady ? t('listing.description') : 'Açıklama'}
                                </h3>
                                <div className="bg-slate-50 rounded-lg p-4 w-full max-w-full overflow-hidden">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full">
                                        {previewData.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
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
                                disabled={isLoading || isUploadingImages}
                                size="lg"
                                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {(isLoading || isUploadingImages) ? (
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

            {/* Image Modal */}
            {modalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
                    onClick={closeImageModal}
                >
                    <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all duration-200 z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation Buttons */}
                        {localImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all duration-200 z-10"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all duration-200 z-10"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        {localImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm z-10">
                                {currentImageIndex + 1} / {localImages.length}
                            </div>
                        )}

                        {/* Main Image */}
                        <img
                            src={modalImage}
                            alt={`Resim ${currentImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Publishing Modal - Kullanıcıyı kitle */}
            {showPublishingModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="bg-white rounded-md shadow-2xl p-12 text-center max-w-2xl w-full mx-4 border border-gray-200">
                        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-8"></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            {isReady ? t('listing.publishing') : 'İlanınız Yayınlanıyor'}
                        </h2>
                        <p className="text-slate-600 text-lg">
                            {isReady ? t('listing.create.please-wait') : 'Lütfen bekleyin, ilanınız hazırlanıyor...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Toast Notification - En üstte görünsün */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        show={toast.show}
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                </div>
            )}
        </div>
    );
};