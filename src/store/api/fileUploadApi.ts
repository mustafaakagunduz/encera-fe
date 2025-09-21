// src/store/api/fileUploadApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface UploadResponse {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    contentType: string;
}

export interface MultipleUploadResponse {
    uploadedFiles: UploadResponse[];
    failedFiles: string[];
    totalFiles: number;
    successCount: number;
    failureCount: number;
}

export interface UploadError {
    error: string;
    message: string;
}

export const fileUploadApi = createApi({
    reducerPath: 'fileUploadApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8081/api/upload',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            // FormData için content-type header'ını set etmiyoruz
            // Browser otomatik olarak multipart/form-data; boundary=... ekleyecek
            return headers;
        },
    }),
    tagTypes: ['Upload'],
    endpoints: (builder) => ({
        // Single file upload
        uploadSingleFile: builder.mutation<UploadResponse, { file: File; subDirectory?: string }>({
            query: ({ file, subDirectory = 'properties' }) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('subDirectory', subDirectory);

                return {
                    url: '/single',
                    method: 'POST',
                    body: formData,
                };
            },
        }),

        // Multiple file upload
        uploadMultipleFiles: builder.mutation<MultipleUploadResponse, { files: File[]; subDirectory?: string }>({
            query: ({ files, subDirectory = 'properties' }) => {
                const formData = new FormData();
                files.forEach((file) => {
                    formData.append('files', file);
                });
                formData.append('subDirectory', subDirectory);

                return {
                    url: '/multiple',
                    method: 'POST',
                    body: formData,
                };
            },
        }),

        // Upload profile picture
        uploadProfilePicture: builder.mutation<UploadResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: '/profile',
                    method: 'POST',
                    body: formData,
                };
            },
        }),

        // Upload cover image
        uploadCoverImage: builder.mutation<UploadResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: '/cover',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
    }),
});

// Export hooks
export const {
    useUploadSingleFileMutation,
    useUploadMultipleFilesMutation,
    useUploadProfilePictureMutation,
    useUploadCoverImageMutation,
} = fileUploadApi;