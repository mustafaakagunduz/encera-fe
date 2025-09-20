// src/utils/previewStorage.ts
interface ImagePreviewData {
    url?: string;
    isPrimary: boolean;
    preview: string;
    fileName?: string;
}

interface PreviewStorageData {
    formData: any;
    imageData: ImagePreviewData[];
    files: File[];
}

const STORAGE_KEY = 'listing_preview_data';

export const previewStorage = {
    // Verileri kaydet (File objelerini ayrı tut)
    save: (formData: any, images: { file?: File; url?: string; isPrimary: boolean; preview: string }[]) => {
        const files: File[] = [];
        const imageData: ImagePreviewData[] = [];

        images.forEach((img, index) => {
            if (img.file) {
                files.push(img.file);
                imageData.push({
                    isPrimary: img.isPrimary,
                    preview: img.preview,
                    fileName: img.file.name
                });
            } else {
                imageData.push({
                    url: img.url,
                    isPrimary: img.isPrimary,
                    preview: img.preview
                });
            }
        });

        const storageData: PreviewStorageData = {
            formData,
            imageData,
            files
        };

        // File objelerini sessionStorage'da sakla (bu temporary)
        // FormData'yı localStorage'da sakla
        try {
            sessionStorage.setItem(`${STORAGE_KEY}_files`, JSON.stringify(files.map(f => f.name)));
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                formData: storageData.formData,
                imageData: storageData.imageData
            }));

            // File objelerini memory'de tut
            (window as any).__previewFiles = files;
        } catch (error) {
            console.error('Preview storage error:', error);
        }
    },

    // Verileri geri al
    load: (): { formData: any; images: { file?: File; url?: string; isPrimary: boolean; preview: string }[] } | null => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (!storedData) return null;

            const parsed = JSON.parse(storedData);
            const files: File[] = (window as any).__previewFiles || [];

            const images: { file?: File; url?: string; isPrimary: boolean; preview: string }[] = [];
            let fileIndex = 0;

            parsed.imageData.forEach((imgData: ImagePreviewData) => {
                if (imgData.fileName && fileIndex < files.length) {
                    images.push({
                        file: files[fileIndex],
                        isPrimary: imgData.isPrimary,
                        preview: imgData.preview
                    });
                    fileIndex++;
                } else {
                    images.push({
                        url: imgData.url,
                        isPrimary: imgData.isPrimary,
                        preview: imgData.preview
                    });
                }
            });

            return {
                formData: parsed.formData,
                images
            };
        } catch (error) {
            console.error('Preview load error:', error);
            return null;
        }
    },

    // Verileri temizle
    clear: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(`${STORAGE_KEY}_files`);
            delete (window as any).__previewFiles;
        } catch (error) {
            console.error('Preview clear error:', error);
        }
    }
};