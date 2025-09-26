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

    // Publishing state - sadece button loading için
    const [isPublishing, setIsPublishing] = useState(false);

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState<{
        show: boolean;
    }>({
        show: false
    });

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };


    // Prevent page unload during upload
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isPublishing && uploadProgress.show) {
                e.preventDefault();
                e.returnValue = isReady ? t('listing.preview.progress.close-warning') : 'İlan yükleme işlemi devam ediyor. Sayfayı kapatmak istediğinizden emin misiniz?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isPublishing, uploadProgress.show]);

    // Storage'dan File objelerini yükle
    React.useEffect(() => {
        // Publishing işlemi sırasında yönlendirme yapma
        if (isPublishing) {
            return;
        }

        if (!previewData) {
            router.push('/create-listing');
            return;
        }

        const storageData = previewStorage.load();
        if (storageData) {
            setLocalImages(storageData.images);
        }
    }, [previewData, router, isPublishing]);

    // Keyboard navigation - Hook sırasını korumak için erken return'den önce
    React.useEffect(() => {
        // PreviewData yoksa keyboard navigation'ı aktif etme
        if (!previewData) {
            return;
        }

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
    }, [modalImage, currentImageIndex, localImages, previewData]);

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
        if (previewData.roomConfiguration &&
            previewData.roomConfiguration.roomCount !== undefined &&
            previewData.roomConfiguration.hallCount !== undefined) {
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


    // Düzenle butonuna tıklayınca
    const handleEdit = () => {
        router.push('/create-listing');
    };

    // İlanı onayla ve yayınla
    const handleConfirm = async () => {
        if (!previewData || isPublishing) return;

        console.log('🚀 Starting listing creation process...');
        console.log('📋 Preview data:', previewData);
        console.log('🖼️ Local images:', localImages);

        // Publishing state'i başlat
        setIsPublishing(true);

        try {
            let finalPropertyData = { ...previewData };

            // Eğer local images varsa önce onları S3'e yükle
            if (localImages && localImages.length > 0) {
                const filesToUpload = localImages.filter(img => img.file);
                console.log('📁 Files to upload:', filesToUpload.length);

                if (filesToUpload.length > 0) {
                    // Show upload progress
                    setUploadProgress({
                        show: true
                    });

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
                // Show progress even if no images to upload
                setUploadProgress({
                    show: true
                });
            }


            console.log('💾 Creating property in database...', finalPropertyData);
            const createdProperty = await createProperty(finalPropertyData).unwrap();
            console.log('✅ Property created successfully:', createdProperty);


            // Storage ve Redux'ı temizle
            previewStorage.clear();
            dispatch(clearListingPreviewData());

            // Success ile my-listings'e yönlendir
            router.push('/my-listings?success=true');

        } catch (error) {
            console.error('❌ Listing creation error:', error);

            // Hata olursa progress ve publishing state'i kapat
            setUploadProgress({ show: false });
            setIsPublishing(false);

            showToast(
                isReady ? t('listing.create.error') : 'İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
                'error'
            );
        }
    };

    // Özellikleri listele (Ençera hariç)
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
    ];


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-none lg:max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-medium">{isReady ? t('common.back') : 'Geri Dön'}</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {isReady ? t('listing.preview.title') : 'İlan Önizlemesi'}
                            </h1>
                            <p className="text-gray-600">
                                {isReady ? t('listing.preview.review-before-publish') : 'İlanınızı yayınlamadan önce son kez kontrol edin'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Image Gallery Area */}
                <div className="mb-8">
                    {localImages && localImages.length > 0 ? (
                        <div className="flex gap-4">
                            {/* Ana resim - İlk resim veya primary resim */}
                            <div className="flex-1">
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

                            {/* Thumbnail'ler - Diğer fotoğraflar */}
                            {localImages.length > 1 && (
                                <div className="w-32 lg:w-40">
                                    <div className="grid grid-cols-2 gap-2">
                                        {localImages.slice(1, 9).map((image, index) => {
                                            const actualIndex = index + 1; // Gerçek index (0. element ana resim olduğu için)
                                            return (
                                                <div
                                                    key={actualIndex}
                                                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
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
                                        {localImages.length > 9 && (
                                            <div
                                                className="relative aspect-square bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer group"
                                                onClick={() => openImageModal(localImages[9].preview, 9)}
                                            >
                                                <div className="text-center">
                                                    <Camera className="w-4 h-4 text-white mx-auto mb-1" />
                                                    <span className="text-white text-xs font-medium">
                                                        +{localImages.length - 9}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-80 bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 flex items-center justify-center relative overflow-hidden rounded-xl">
                            {/* Decorative Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
                            </div>

                            <div className="text-center text-gray-500 z-10">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                                    <Building className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium text-gray-700 mb-1">
                                    {isReady ? t('listing.preview.no-image') : 'Görsel Henüz Eklenmedi'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {isReady ? t('listing.preview.add-images-later') : 'İlan yayınlandıktan sonra fotoğrafları ekleyebilirsiniz'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mb-8">

                    {/* Title and Location */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                            {previewData.title}
                        </h2>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center text-gray-600">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-base">
                                    {previewData.neighborhood}, {previewData.district}, {previewData.city}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
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
                            </div>

                            {/* Additional Costs */}
                            {(previewData.monthlyFee || previewData.deposit) && (
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {previewData.monthlyFee && (
                                        <div className="text-gray-600">
                                            <span>{isReady ? t('listing.monthly-fee') : 'Aidat'}: </span>
                                            <span className="font-semibold">{formatPrice(previewData.monthlyFee)}</span>
                                        </div>
                                    )}
                                    {previewData.deposit && (
                                        <div className="text-gray-600">
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {isReady ? t('listing.basic-info') : 'Temel Bilgiler'}
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    {/* Brüt Alan */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.gross-area') : 'Brüt Alan'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.grossArea ? `${previewData.grossArea}m²` : '-'}
                                        </span>
                                    </div>

                                    {/* Net Alan */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.net-area') : 'Net Alan'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.netArea ? `${previewData.netArea}m²` : '-'}
                                        </span>
                                    </div>

                                    {/* Room Config */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.room-count') : 'Oda Sayısı'}</span>
                                        <span className="text-gray-900 font-semibold">{getRoomText()}</span>
                                    </div>

                                    {/* Building Age */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.building-age') : 'Bina Yaşı'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.buildingAge !== undefined && previewData.buildingAge !== null
                                                ? `${previewData.buildingAge} ${isReady ? t('listing.create.years') : 'yıl'}`
                                                : '-'
                                            }
                                        </span>
                                    </div>

                                    {/* Total Floors */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.total-floors') : 'Kat Sayısı'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.totalFloors !== undefined && previewData.totalFloors !== null
                                                ? `${previewData.totalFloors} ${isReady ? t('listing.create.floors') : 'katlı'}`
                                                : '-'
                                            }
                                        </span>
                                    </div>

                                    {/* Current Floor */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.current-floor') : 'Bulunduğu Kat'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.currentFloor !== undefined && previewData.currentFloor !== null
                                                ? `${previewData.currentFloor}. ${isReady ? t('listing.create.floor') : 'kat'}`
                                                : '-'
                                            }
                                        </span>
                                    </div>

                                    {/* Monthly Fee */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.monthly-fee') : 'Aidat'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.monthlyFee ? formatPrice(previewData.monthlyFee) : '-'}
                                        </span>
                                    </div>

                                    {/* Deposit */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{isReady ? t('listing.create.deposit') : 'Depozito'}</span>
                                        <span className="text-gray-900 font-semibold">
                                            {previewData.deposit ? formatPrice(previewData.deposit) : '-'}
                                        </span>
                                    </div>
                                    </div>
                                </div>

                            {/* Heating Types */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {isReady ? t('listing.create.heating-types') : 'Isıtma'}
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {previewData.heatingTypes && previewData.heatingTypes.length > 0 ? (
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
                                    ) : (
                                        <span className="text-gray-500 italic">Belirtilmedi</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Features */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {isReady ? t('listing.features') : 'Özellikler'}
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    {allFeatures.map((feature) => {
                                        const IconComponent = feature.icon;
                                        return (
                                            <div
                                                key={feature.key}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center">
                                                    <IconComponent className="w-4 h-4 text-gray-500 mr-2" />
                                                    <span className="text-gray-700">{feature.label}</span>
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
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isReady ? t('listing.description') : 'Açıklama'}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 w-full max-w-full overflow-hidden">
                            {previewData.description ? (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere w-full">
                                    {previewData.description}
                                </p>
                            ) : (
                                <p className="text-gray-500 italic">Açıklama belirtilmedi</p>
                            )}
                        </div>
                    </div>

                    {/* Ençera Premium Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {isReady ? t('listing.create.encera-premium') : 'Ençera Premium'}
                        </h3>
                        <div className={`rounded-lg p-6 border-2 ${
                            previewData.pappSellable
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Crown className={`w-6 h-6 mr-3 ${
                                        previewData.pappSellable ? 'text-yellow-600' : 'text-gray-400'
                                    }`} />
                                    <div>
                                        <h4 className={`font-semibold ${
                                            previewData.pappSellable ? 'text-gray-900' : 'text-gray-600'
                                        }`}>
                                            {isReady ? t('listing.create.encera-sellable') : 'Ençera ile Satılsın'}
                                        </h4>
                                        <p className={`text-sm ${
                                            previewData.pappSellable ? 'text-gray-600' : 'text-gray-500'
                                        }`}>
                                            {isReady ? t('listing.create.encera-sellable-description') : 'İlanınızı Ençera üzerinden satış sürecinde profesyonel destek alabilirsiniz.'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full ${
                                    previewData.pappSellable ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8">
                    <div className="flex gap-4">
                        <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="lg"
                            className="flex-1 h-14 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl cursor-pointer hover:bg-gray-50"
                        >
                            <Edit3 className="w-5 h-5 mr-2" />
                            {isReady ? t('common.edit') : 'Düzenle'}
                        </Button>

                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading || isUploadingImages || isPublishing}
                            size="lg"
                            className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700"
                        >
                            {(isLoading || isUploadingImages || isPublishing) ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {isPublishing
                                        ? (isReady ? t('listing.create.submitting') : 'İlan yayınlanıyor...')
                                        : (isReady ? t('listing.publishing') : 'Yayınlanıyor...')
                                    }
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
                    <p className="text-center text-gray-500 text-sm mt-4">
                        {isReady ? t('listing.preview.edit-info') : 'İlanınız yayınlandıktan sonra düzenlenebilir ve silinebilir'}
                    </p>
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

            {/* Upload Progress Modal */}
            {uploadProgress.show && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="relative max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {isReady ? t('listing.preview.progress.title') : 'İlanınız Yükleniyor'}
                            </h3>

                            <p className="text-gray-600">
                                {isReady ? t('listing.preview.progress.message') : 'İlanınız yüklenirken lütfen bekleyiniz, yükleme işlemi esnasında bu pencereyi kapatmayınız.'}
                            </p>
                        </div>
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