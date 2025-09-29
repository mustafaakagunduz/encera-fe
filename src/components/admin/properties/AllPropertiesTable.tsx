'use client';

// src/components/admin/properties/AllPropertiesTable.tsx
import React, { useState, useMemo } from 'react';
import { Search, Building, CheckCircle, Clock, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import {
    useGetAllAdminPropertiesQuery,
    useAdminDeletePropertyMutation,
    useGetPendingApprovalPropertiesQuery,
    useGetReportedPropertiesQuery
} from '@/store/api/adminApi';
import { useRouter } from 'next/navigation';

export const AllPropertiesTable: React.FC = () => {
    const router = useRouter();
    // Fetch from multiple endpoints to get all properties
    const { data: approvedData, isLoading: approvedLoading } = useGetAllAdminPropertiesQuery({ page: 0, size: 1000 });
    const { data: pendingData, isLoading: pendingLoading } = useGetPendingApprovalPropertiesQuery({ page: 0, size: 1000 });
    const { data: reportedData, isLoading: reportedLoading } = useGetReportedPropertiesQuery({ page: 0, size: 1000 });

    const [deleteProperty] = useAdminDeletePropertyMutation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'reported'>('all');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const isLoading = approvedLoading || pendingLoading || reportedLoading;

    // Combine all properties from different endpoints
    const allProperties = useMemo(() => {
        const approved = approvedData?.content || [];
        const pending = pendingData?.content || [];
        const reported = reportedData?.content || [];

        // Create a Map to avoid duplicates (some properties might be both reported and approved)
        const propertyMap = new Map();

        [...approved, ...pending, ...reported].forEach(property => {
            if (!propertyMap.has(property.id)) {
                propertyMap.set(property.id, property);
            }
        });

        return Array.from(propertyMap.values());
    }, [approvedData, pendingData, reportedData]);

    const properties = allProperties;
    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.city.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        switch (statusFilter) {
            case 'approved':
                matchesStatus = property.approved;
                break;
            case 'pending':
                matchesStatus = !property.approved;
                break;
            case 'reported':
                matchesStatus = property.reported;
                break;
        }

        return matchesSearch && matchesStatus;
    });

    const handleDeleteProperty = async (propertyId: number, propertyTitle: string) => {
        if (confirm(`"${propertyTitle}" ilanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
            try {
                setDeletingId(propertyId);
                await deleteProperty(propertyId).unwrap();
                // Success feedback could be added here if needed
            } catch (error) {
                console.error('İlan silme hatası:', error);
                alert('İlan silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const getStatusInfo = (property: any) => {
        if (property.reported) {
            return {
                icon: <AlertTriangle className="h-4 w-4" />,
                text: 'Şikayetli',
                color: 'text-red-600 bg-red-50'
            };
        }
        if (property.approved) {
            return {
                icon: <CheckCircle className="h-4 w-4" />,
                text: 'Onaylanmış',
                color: 'text-green-600 bg-green-50'
            };
        }
        return {
            icon: <Clock className="h-4 w-4" />,
            text: 'Onay Bekliyor',
            color: 'text-yellow-600 bg-yellow-50'
        };
    };

    if (isLoading) {
        return <div className="text-center py-8">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header & Filters */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Tüm İlanlar ({filteredProperties.length})
                    </h3>

                    <div className="flex gap-3">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="approved">Onaylanmış</option>
                            <option value="pending">Onay Bekleyen</option>
                            <option value="reported">Şikayetli</option>
                        </select>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="İlan ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Properties Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İlan Başlığı
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Konum
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fiyat
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sahip
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tarih
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProperties.map((property) => {
                            const statusInfo = getStatusInfo(property);
                            return (
                                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                            {statusInfo.icon}
                                            {statusInfo.text}
                                        </span>
                                        {property.pappSellable && (
                                            <div className="text-xs text-blue-600 font-medium mt-1">
                                                Encera
                                            </div>
                                        )}
                                        {property.reportCount > 0 && (
                                            <div className="text-xs text-red-600 mt-1">
                                                {property.reportCount} şikayet
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-gray-900 max-w-xs">
                                            {property.title}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {property.city}, {property.district}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-green-600">
                                            {new Intl.NumberFormat('tr-TR', {
                                                style: 'currency',
                                                currency: 'TRY',
                                                minimumFractionDigits: 0,
                                            }).format(property.price)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {property.owner ? (
                                                <>
                                                    <div>{property.owner.firstName} {property.owner.lastName}</div>
                                                    {property.owner.phoneNumber && (
                                                        <div className="text-xs text-gray-500">{property.owner.phoneNumber}</div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-gray-400">Sahip bilgisi yok</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {new Date(property.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => router.push(`/admin/property/${property.id}`)}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                title="Detayları Görüntüle"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProperty(property.id, property.title)}
                                                disabled={deletingId === property.id}
                                                className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="İlanı Sil"
                                            >
                                                {deletingId === property.id ? (
                                                    <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Arama kriterlerinize uygun ilan bulunamadı'
                            : 'Henüz ilan bulunmuyor'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};