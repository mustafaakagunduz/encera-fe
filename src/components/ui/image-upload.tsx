// src/components/ui/image-upload.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Camera, Star, StarOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useUploadMultipleFilesMutation } from '@/store/api/fileUploadApi';

interface UploadedImage {
    file: File;
    preview: string;
    url?: string;
    isPrimary: boolean;
    isUploading: boolean;
    error?: string;
    isLocal: boolean; // Local preview mi yoksa S3'e yüklenmiş mi
}

interface ImageUploadProps {
    maxImages?: number;
    onImagesChange: (images: { file?: File; url?: string; isPrimary: boolean; preview: string }[]) => void;
    disabled?: boolean;
    initialImages?: { url: string; isPrimary: boolean }[];
    previewMode?: boolean; // Preview modunda mı (true = sadece local preview, false = S3'e upload)
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    maxImages = 15,
    onImagesChange,
    disabled = false,
    initialImages = [],
    previewMode = true // Default olarak preview mode
}) => {
    const { t, isReady } = useAppTranslation();
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadMultipleFiles, { isLoading: isUploading }] = useUploadMultipleFilesMutation();

    // Initialize with initial images
    React.useEffect(() => {
        if (initialImages.length > 0 && images.length === 0) {
            const initialUploadedImages: UploadedImage[] = initialImages.map((img, index) => ({
                file: new File([], 'existing-image', { type: 'image/jpeg' }),
                preview: img.url,
                url: img.url,
                isPrimary: img.isPrimary,
                isUploading: false,
                isLocal: false // Existing images are already uploaded
            }));
            setImages(initialUploadedImages);
        }
    }, [initialImages, images.length]);

    // Notify parent component when images change
    React.useEffect(() => {
        const validImages = images.map(img => ({
            file: img.isLocal ? img.file : undefined,
            url: img.url,
            isPrimary: img.isPrimary,
            preview: img.preview
        }));
        onImagesChange(validImages);
    }, [images, onImagesChange]);

    const validateFile = (file: File): string | null => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return isReady ? t('upload.error.invalid-type') : 'Geçersiz dosya türü. Sadece JPG, PNG ve WebP desteklenir.';
        }

        // Check file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return isReady ? t('upload.error.file-too-large') : 'Dosya boyutu 10MB\'dan büyük olamaz.';
        }

        return null;
    };

    const processFiles = useCallback(async (fileList: FileList) => {
        if (disabled) return;

        const files = Array.from(fileList);
        const remainingSlots = maxImages - images.length;

        if (files.length > remainingSlots) {
            alert(isReady ? t('upload.error.too-many-files', { max: maxImages }) : `Maksimum ${maxImages} resim yükleyebilirsiniz.`);
            return;
        }

        // Validate all files first
        const validationErrors: string[] = [];
        files.forEach((file, index) => {
            const error = validateFile(file);
            if (error) {
                validationErrors.push(`${file.name}: ${error}`);
            }
        });

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }

        // Add files to state with preview
        const newImages: UploadedImage[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            isPrimary: false,
            isUploading: previewMode ? false : true, // Preview modda upload işlemi yok
            isLocal: previewMode // Preview modda local olarak kalacak
        }));

        // If this is the first image, make it primary
        if (images.length === 0 && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }

        setImages(prev => [...prev, ...newImages]);

        // Preview modda S3'e upload yapma
        if (previewMode) {
            return;
        }

        // Upload files (sadece preview mode false ise)
        try {
            const response = await uploadMultipleFiles({
                files: files,
                subDirectory: 'properties'
            }).unwrap();

            // Update images with upload results
            setImages(prev => {
                const updated = [...prev];

                // Backend response yapısını kontrol et
                const uploadResults = response.uploadedFiles || [response]; // Single upload için fallback

                uploadResults.forEach((uploadResult: any, index: number) => {
                    const imageIndex = updated.findIndex(img =>
                        img.file === files[index] && img.isUploading
                    );
                    if (imageIndex !== -1) {
                        updated[imageIndex] = {
                            ...updated[imageIndex],
                            url: ('fileUrl' in uploadResult) ? uploadResult.fileUrl : (uploadResult as unknown as string), // Backend response'a göre ayarla
                            isUploading: false
                        };
                    }
                });
                return updated;
            });
        } catch (error) {
            // Handle upload error
            setImages(prev => {
                const updated = [...prev];
                files.forEach((file, index) => {
                    const imageIndex = updated.findIndex(img =>
                        img.file === file && img.isUploading
                    );
                    if (imageIndex !== -1) {
                        updated[imageIndex] = {
                            ...updated[imageIndex],
                            isUploading: false,
                            error: isReady ? t('upload.error.upload-failed') : 'Yükleme başarısız'
                        };
                    }
                });
                return updated;
            });
        }
    }, [images, maxImages, disabled, uploadMultipleFiles, isReady, t]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            // Reset input value
            e.target.value = '';
        }
    }, [processFiles]);

    const removeImage = useCallback((index: number) => {
        setImages(prev => {
            const updated = [...prev];
            const removedImage = updated[index];

            // Revoke object URL to prevent memory leaks
            if (removedImage.preview && removedImage.preview.startsWith('blob:')) {
                URL.revokeObjectURL(removedImage.preview);
            }

            updated.splice(index, 1);

            // If removed image was primary, make first image primary
            if (removedImage.isPrimary && updated.length > 0) {
                updated[0].isPrimary = true;
            }

            return updated;
        });
    }, []);

    const setPrimaryImage = useCallback((index: number) => {
        setImages(prev => {
            const updated = [...prev];
            // Remove primary from all images
            updated.forEach(img => img.isPrimary = false);
            // Set new primary
            updated[index].isPrimary = true;
            return updated;
        });
    }, []);

    const retryUpload = useCallback(async (index: number) => {
        const image = images[index];
        if (!image || !image.error) return;

        // Set uploading state
        setImages(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], isUploading: true, error: undefined };
            return updated;
        });

        try {
            const response = await uploadMultipleFiles({
                files: [image.file],
                subDirectory: 'properties'
            }).unwrap();

            // Update with success
            setImages(prev => {
                const updated = [...prev];
                const uploadResult = response.uploadedFiles ? response.uploadedFiles[0] : response;
                updated[index] = {
                    ...updated[index],
                    url: ('fileUrl' in uploadResult) ? uploadResult.fileUrl : (uploadResult as unknown as string),
                    isUploading: false,
                    error: undefined
                };
                return updated;
            });
        } catch (error) {
            // Update with error
            setImages(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    isUploading: false,
                    error: isReady ? t('upload.error.upload-failed') : 'Yükleme başarısız'
                };
                return updated;
            });
        }
    }, [images, uploadMultipleFiles, isReady, t]);

    return (
        <div className="space-y-4">
            {/* Info Text */}
            <div className="text-sm text-gray-600">
                {isReady ? t('upload.info.max-files', { max: maxImages }) : `Maksimum ${maxImages} fotoğraf yükleyebilirsiniz`}
            </div>

            {/* Upload Area */}
            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <div className="text-lg font-medium text-gray-900">
                        {isReady ? t('upload.drop-zone.title') : 'Fotoğrafları sürükleyip bırakın'}
                    </div>
                    <div className="text-sm text-gray-500">
                        {isReady ? t('upload.drop-zone.subtitle') : 'veya tıklayarak dosya seçin'}
                    </div>
                    <div className="text-xs text-gray-400">
                        JPG, PNG, WebP • Maks 10MB
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                    src={image.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Loading Overlay */}
                                {image.isUploading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    </div>
                                )}

                                {/* Error Overlay */}
                                {image.error && (
                                    <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex flex-col items-center justify-center text-white text-xs p-2">
                                        <AlertCircle className="w-4 h-4 mb-1" />
                                        <span className="text-center">{image.error}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                retryUpload(index);
                                            }}
                                            className="mt-1 px-2 py-1 bg-white text-red-500 rounded text-xs"
                                        >
                                            Tekrar Dene
                                        </button>
                                    </div>
                                )}

                                {/* Success Indicator */}
                                {image.url && !image.isUploading && !image.error && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="absolute top-2 left-2 flex space-x-1">
                                {/* Primary Image Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPrimaryImage(index);
                                    }}
                                    className={`
                                        p-1 rounded-full transition-colors
                                        ${image.isPrimary
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-white text-gray-600 hover:bg-yellow-100'
                                        }
                                    `}
                                    title={image.isPrimary ? "Birincil fotoğraf" : "Birincil fotoğraf yap"}
                                >
                                    {image.isPrimary ? (
                                        <Star className="w-3 h-3 fill-current" />
                                    ) : (
                                        <StarOff className="w-3 h-3" />
                                    )}
                                </button>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {/* Primary Image Label */}
                            {image.isPrimary && (
                                <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 text-center">
                                    {isReady ? t('upload.primary-image') : 'Birincil Fotoğraf'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
                <div className="text-center text-sm text-gray-600">
                    {isReady ? t('upload.uploading') : 'Fotoğraflar yükleniyor...'}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;