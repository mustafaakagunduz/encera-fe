'use client';

// src/components/admin/users/UserManagementTable.tsx
import React, { useState } from 'react';
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Shield,
    User,
    Calendar,
    Mail
} from 'lucide-react';
import { useGetAllUsersQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '@/store/api/adminApi';
import { UserDetailModal } from './UserDetailModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

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

export const UserManagementTable: React.FC = () => {
    const { data: users, isLoading, error } = useGetAllUsersQuery();
    const [updateUserStatus] = useUpdateUserStatusMutation();
    const [deleteUser] = useDeleteUserMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterRole, setFilterRole] = useState<'all' | 'USER' | 'ADMIN'>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [actionDropdown, setActionDropdown] = useState<number | null>(null);

    // Filtreleme ve arama
    const filteredUsers = users?.filter(user => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && user.enabled) ||
            (filterStatus === 'inactive' && !user.enabled);

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesStatus && matchesRole;
    }) || [];

    const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
        try {
            await updateUserStatus({ id: userId, enabled: !currentStatus }).unwrap();
        } catch (error) {
            console.error('Status güncellenirken hata:', error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUser(userId).unwrap();
            setUserToDelete(null);
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">Kullanıcılar yüklenirken hata oluştu</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Kullanıcı Yönetimi ({filteredUsers.length})
                        </h2>

                        {/* Arama ve Filtreler */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Arama */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Kullanıcı ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Status Filtresi */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tüm Durumlar</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>

                            {/* Role Filtresi */}
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tüm Roller</option>
                                <option value="USER">Kullanıcı</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kullanıcı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kayıt Tarihi
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                {/* Kullanıcı */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-white">
                                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                    </span>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {user.id}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </div>
                                </td>

                                {/* Rol */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {user.role === 'ADMIN' ? (
                                            <Shield className="h-4 w-4 text-yellow-500 mr-2" />
                                        ) : (
                                            <User className="h-4 w-4 text-gray-500 mr-2" />
                                        )}
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'ADMIN'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                                {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                                            </span>
                                    </div>
                                </td>

                                {/* Durum */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleStatusToggle(user.id, user.enabled)}
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                            user.enabled
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {user.enabled ? (
                                            <>
                                                <UserCheck className="h-3 w-3 mr-1" />
                                                Aktif
                                            </>
                                        ) : (
                                            <>
                                                <UserX className="h-3 w-3 mr-1" />
                                                Pasif
                                            </>
                                        )}
                                    </button>
                                </td>

                                {/* Kayıt Tarihi */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <div className="text-sm text-gray-900">
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </div>
                                </td>

                                {/* İşlemler */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="relative">
                                        <button
                                            onClick={() => setActionDropdown(actionDropdown === user.id ? null : user.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>

                                        {actionDropdown === user.id && (
                                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setActionDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Detayları Görüntüle
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleStatusToggle(user.id, user.enabled);
                                                            setActionDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                    >
                                                        {user.enabled ? (
                                                            <>
                                                                <UserX className="h-4 w-4 mr-2" />
                                                                Pasif Yap
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Aktif Yap
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setUserToDelete(user);
                                                            setActionDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Kullanıcıyı Sil
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {searchTerm || filterStatus !== 'all' || filterRole !== 'all'
                                    ? 'Arama kriterlerinize uygun kullanıcı bulunamadı'
                                    : 'Henüz kullanıcı bulunmuyor'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {userToDelete && (
                <DeleteConfirmDialog
                    user={userToDelete}
                    onConfirm={() => handleDeleteUser(userToDelete.id)}
                    onCancel={() => setUserToDelete(null)}
                />
            )}
        </>
    );
};