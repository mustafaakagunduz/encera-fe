'use client';

// src/components/admin/users/DeleteConfirmDialog.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DeleteConfirmDialogProps {
    user: User;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
                                                                            user,
                                                                            onConfirm,
                                                                            onCancel,
                                                                        }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="ml-3 text-lg font-semibold text-gray-900">
                            Kullanıcıyı Sil
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        <strong>{user.firstName} {user.lastName}</strong> adlı kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Dikkat!
                                </h3>
                                <div className="mt-1 text-sm text-red-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Bu işlem geri alınamaz</li>
                                        <li>Kullanıcının tüm verileri silinecek</li>
                                        <li>Kullanıcının ilanları da etkilenebilir</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm">
                            <div className="font-medium text-gray-900 mb-2">Silinecek Kullanıcı:</div>
                            <div className="space-y-1 text-gray-600">
                                <div>Ad Soyad: {user.firstName} {user.lastName}</div>
                                <div>Email: {user.email}</div>
                                <div>Rol: {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}</div>
                                <div>ID: #{user.id}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
                    >
                        Evet, Sil
                    </button>
                </div>
            </div>
        </div>
    );
};