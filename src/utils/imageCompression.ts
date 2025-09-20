// src/utils/imageCompression.ts

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Resim sıkıştırma fonksiyonu
 * @param file - Sıkıştırılacak dosya
 * @param options - Sıkıştırma seçenekleri
 * @returns Promise<CompressedImageResult>
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Orijinal boyutları al
      let { width, height } = img;

      // Aspect ratio'yu koruyarak yeniden boyutlandır
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Canvas boyutlarını ayarla
      canvas.width = width;
      canvas.height = height;

      // Resmi canvas'a çiz
      ctx.drawImage(img, 0, 0, width, height);

      // Sıkıştırılmış blob'u al
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }

          // Dosya boyutunu kontrol et
          const compressedSizeKB = blob.size / 1024;

          // Eğer hala çok büyükse quality'yi azalt
          if (compressedSizeKB > maxSizeKB && quality > 0.1) {
            const newQuality = Math.max(0.1, quality - 0.1);
            compressImage(file, { ...options, quality: newQuality })
              .then(resolve)
              .catch(reject);
            return;
          }

          // Yeni dosya oluştur
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          const originalSize = file.size;
          const compressedSize = compressedFile.size;
          const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            compressionRatio
          });
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Birden fazla resmi sıkıştır
 * @param files - Sıkıştırılacak dosyalar
 * @param options - Sıkıştırma seçenekleri
 * @returns Promise<CompressedImageResult[]>
 */
export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressedImageResult[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Dosya boyutunu human-readable formatta döndür
 * @param bytes - Byte cinsinden boyut
 * @returns string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};