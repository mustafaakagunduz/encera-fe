'use client';

// src/components/admin/users/UserDetailModal.tsx
import React from 'react';
import {
    X,
    User,
    Mail,
    Calendar,
    Shield,
    UserCheck,
    UserX,
    Clock,
    Edit
} from 'lucide-react';

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

interface UserDetailModalProps {
    user: User;
    onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeSince = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Bugün';
        if (days === 1) return 'Dün';
        if (days < 7) return `${days} gün önce`;
        if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
        if (days < 365) return `${Math.floor(days / 30)} ay önce`;
        return `${Math.floor(days / 365)} yıl önce`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Kullanıcı Detayları</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* User Avatar & Basic Info */}
                    <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-16 w-16">
                            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex items-center mt-1">
                                {user.role === 'ADMIN' ? (
                                    <Shield className="h-4 w-4 text-yellow-500 mr-1" />
                                ) : (
                                    <User className="h-4 w-4 text-gray-500 mr-1" />
                                )}
                                <span className={`text-sm font-medium ${
                                    user.role === 'ADMIN' ? 'text-yellow-700' : 'text-gray-700'
                                }`}>
                                    {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                            user.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {user.enabled ? (
                                <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Aktif Kullanıcı
                                </>
                            ) : (
                                <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Pasif Kullanıcı
                                </>
                            )}
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Kişisel Bilgiler</h4>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm text-gray-500">Ad Soyad</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Shield className="h-4 w-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm text-gray-500">Kullanıcı ID</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            #{user.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Tarih Bilgileri</h4>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm text-gray-500">Kayıt Tarihi</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDate(user.createdAt)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ({getTimeSince(user.createdAt)})
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm text-gray-500">Son Güncelleme</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDate(user.updatedAt)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ({getTimeSince(user.updatedAt)})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* İstatistik Bilgileri (Mock) */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Aktivite Özeti</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">0</div>
                                    <div className="text-xs text-gray-600">Aktif İlan</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">0</div>
                                    <div className="text-xs text-gray-600">Toplam İlan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Kapat
                    </button>
                    <button
                        onClick={() => {
                            // TODO: Implement edit functionality
                            console.log('Edit user:', user.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Düzenle
                    </button>
                </div>
            </div>
        </div>
    );
};