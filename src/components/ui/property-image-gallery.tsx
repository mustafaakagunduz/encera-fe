// src/components/ui/property-image-gallery.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface PropertyImageGalleryProps {
    images: string[];
    primaryImageUrl?: string;
    title: string;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
    images,
    primaryImageUrl,
    title
}) => {
    const { t, isReady } = useAppTranslation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Combine primary image with other images
    const allImages = React.useMemo(() => {
        if (!primaryImageUrl && (!images || images.length === 0)) {
            return [];
        }

        const imageList = [];

        // Add primary image first if it exists
        if (primaryImageUrl) {
            imageList.push(primaryImageUrl);
        }

        // Add other images (excluding primary if it's already included)
        if (images && images.length > 0) {
            images.forEach(img => {
                if (img && img !== primaryImageUrl) {
                    imageList.push(img);
                }
            });
        }

        return imageList;
    }, [images, primaryImageUrl]);

    // Reset states when images change
    React.useEffect(() => {
        setCurrentImageIndex(0);
        setImageLoaded(false);
        setImageError(false);
    }, [allImages]);

    // Reset image states when current image changes
    React.useEffect(() => {
        setImageLoaded(false);
        setImageError(false);
    }, [currentImageIndex]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };


    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsModalOpen(false);
        } else if (e.key === 'ArrowRight') {
            nextImage();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        }
    };

    React.useEffect(() => {
        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    if (!allImages || allImages.length === 0) {
        // No images placeholder
        return (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    <div className="text-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm">
                            {isReady ? t('property-detail.no-images') : 'Resim bulunamadı'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Main Image */}
                <div className="aspect-video bg-gray-100 relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        </div>
                    )}

                    {!imageError ? (
                        <img
                            src={allImages[currentImageIndex]}
                            alt={`${title} - ${currentImageIndex + 1}`}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageError(true);
                                setImageLoaded(false);
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm">Resim yüklenemedi</p>
                            </div>
                        </div>
                    )}

                    {/* Zoom Icon */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all">
                            <ZoomIn className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Navigation arrows for multiple images */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Image counter */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>

                {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
                    <div className="p-4 bg-gray-50">
                        <div className="flex gap-2 overflow-x-auto">
                            {allImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all ${
                                        index === currentImageIndex
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Modal image */}
                        <img
                            src={allImages[currentImageIndex]}
                            alt={`${title} - ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                        />

                        {/* Image counter */}
                        {allImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                                {currentImageIndex + 1} / {allImages.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PropertyImageGallery;