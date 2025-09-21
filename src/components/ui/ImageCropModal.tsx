'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, Upload, X, Check, AlertCircle, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Cropper from 'react-easy-crop';

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedFile: File, originalFile?: File) => Promise<void>;
  onUploadNew: (file: File) => Promise<void>;
  currentImageUrl?: string;
  title: string;
  description: string;
  aspectRatio?: number; // 1 for square, 16/9 for wide, etc.
  maxSizeMB?: number;
  acceptedTypes?: string[];
  isProcessing?: boolean;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onCrop,
  onUploadNew,
  currentImageUrl,
  title,
  description,
  aspectRatio = 1, // Default to square
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Easy Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (uploadButtonInputRef.current) {
      uploadButtonInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return t('upload.invalid-file-type');
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return t('upload.file-too-large', { maxSize: maxSizeMB });
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Reset crop settings for new file
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadButtonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Helper function to create image from URL
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  // Function to crop the image
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CroppedArea,
    rotation = 0
  ): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const rotRad = (rotation * Math.PI) / 180;

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    // Set canvas size to the rotated image
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to a central location on image to allow rotating around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw rotated image
    ctx.drawImage(image, 0, 0);

    // Extract the cropped area
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      throw new Error('Could not get cropped canvas context');
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Draw the cropped image
    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  // Helper function to calculate rotated size
  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (rotation * Math.PI) / 180;
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const handleCropAndSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const imageSrc = previewUrl || currentImageUrl;
      if (!imageSrc) return;

      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);

      // If selectedFile exists, this is first upload - pass both cropped and original
      if (selectedFile) {
        await onCrop(croppedImage, selectedFile);
      } else {
        // This is editing existing photo - only pass cropped
        await onCrop(croppedImage);
      }

      resetState();
      onClose();
    } catch (error) {
      console.error('Crop error:', error);
      setError(t('upload.upload-failed'));
    }
  };

  const handleUploadNew = async () => {
    if (!selectedFile) return;

    try {
      await onUploadNew(selectedFile);
      resetState();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError(t('upload.upload-failed'));
    }
  };

  const displayImage = previewUrl || currentImageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Hidden file input for upload button */}
        <input
          ref={uploadButtonInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleUploadButtonFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="space-y-4">
          {/* Current Image with Cropper or Upload Area */}
          {displayImage ? (
            <div className="space-y-4">
              {/* Cropper Container */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <Cropper
                  image={displayImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  showGrid={true}
                  objectFit="contain"
                  classes={{
                    containerClassName: 'cropper-container',
                    mediaClassName: 'cropper-media',
                  }}
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 min-w-0">
                    {t('crop.zoom')}:
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                    disabled={zoom <= 1}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-500 min-w-0">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 min-w-0">
                    {t('crop.rotation')}:
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(rotation - 90)}
                  >
                    <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
                  </Button>
                  <input
                    type="range"
                    value={rotation}
                    min={-180}
                    max={180}
                    step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(rotation + 90)}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-500 min-w-0">
                    {rotation}°
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-lg">
                <p>{t('crop.instructions-advanced')}</p>
              </div>
            </div>
          ) : (
            /* Upload Area */
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400",
                error && "border-red-300 bg-red-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />

              <div className="space-y-4">
                <Upload className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {t('upload.click-to-upload')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('upload.or-drag-and-drop')}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WEBP {t('upload.up-to')} {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-md">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            {t('common.cancel')}
          </Button>

          <div className="flex gap-2">
            {displayImage && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    uploadButtonInputRef.current?.click();
                  }}
                  disabled={isProcessing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('crop.upload-new')}
                </Button>

                <Button
                  type="button"
                  onClick={handleCropAndSave}
                  disabled={!croppedAreaPixels || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.uploading')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {t('crop.crop-and-save')}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;