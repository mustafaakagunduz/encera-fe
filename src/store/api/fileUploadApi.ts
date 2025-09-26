// src/store/api/fileUploadApi.ts
import { createBaseQueryWithAuth } from './baseQuery';
import { buildApiUrl } from './config';
import { createApi } from '@reduxjs/toolkit/query/react';

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
    baseQuery: createBaseQueryWithAuth(buildApiUrl('upload'), true),
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
            queryFn: async ({ files, subDirectory = 'properties' }, { getState }) => {
                try {
                    // If 8 or fewer files, use regular upload
                    if (files.length <= 8) {
                        const formData = new FormData();
                        files.forEach((file) => {
                            formData.append('files', file);
                        });
                        formData.append('subDirectory', subDirectory);

                        const response = await fetch('/api/proxy/upload/multiple', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${(getState() as any).auth.token}`,
                            },
                            body: formData,
                        });

                        if (!response.ok) {
                            return { error: { status: response.status, data: await response.json() } };
                        }

                        return { data: await response.json() };
                    }

                    // Frontend batching for more than 8 files
                    const batchSize = 8;
                    const batches: File[][] = [];
                    for (let i = 0; i < files.length; i += batchSize) {
                        batches.push(files.slice(i, i + batchSize));
                    }

                    const allUploadedFiles: any[] = [];
                    const allFailedFiles: string[] = [];

                    for (let i = 0; i < batches.length; i++) {
                        const batch = batches[i];
                        console.log(`🚀 Uploading batch ${i + 1}/${batches.length}: ${batch.length} files`);

                        const formData = new FormData();
                        batch.forEach((file) => {
                            formData.append('files', file);
                        });
                        formData.append('subDirectory', subDirectory);

                        const response = await fetch('/api/proxy/upload/multiple', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${(getState() as any).auth.token}`,
                            },
                            body: formData,
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error(`❌ Batch ${i + 1} failed:`, errorData);
                            // Add all files from failed batch to failed list
                            batch.forEach(file => {
                                allFailedFiles.push(`${file.name} - Batch ${i + 1} failed`);
                            });
                            continue;
                        }

                        const batchResult = await response.json();
                        allUploadedFiles.push(...batchResult.uploadedFiles);
                        allFailedFiles.push(...batchResult.failedFiles);

                        console.log(`✅ Batch ${i + 1} completed: ${batchResult.successCount} files`);
                    }

                    const finalResponse: MultipleUploadResponse = {
                        uploadedFiles: allUploadedFiles,
                        failedFiles: allFailedFiles,
                        totalFiles: files.length,
                        successCount: allUploadedFiles.length,
                        failureCount: allFailedFiles.length
                    };

                    console.log(`🎯 Final result: ${finalResponse.successCount}/${finalResponse.totalFiles} files uploaded`);

                    return { data: finalResponse };
                } catch (error) {
                    console.error('Upload error:', error);
                    return {
                        error: {
                            status: 500,
                            data: { message: 'Upload failed', error: String(error) }
                        }
                    };
                }
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

        // Delete file
        deleteFile: builder.mutation<{ message: string }, string>({
            query: (fileUrl) => ({
                url: `/delete?fileUrl=${encodeURIComponent(fileUrl)}`,
                method: 'DELETE',
            }),
        }),
    }),
});

// Export hooks
export const {
    useUploadSingleFileMutation,
    useUploadMultipleFilesMutation,
    useUploadProfilePictureMutation,
    useUploadCoverImageMutation,
    useDeleteFileMutation,
} = fileUploadApi;
