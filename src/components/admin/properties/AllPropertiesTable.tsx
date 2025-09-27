'use client';

// src/components/admin/properties/AllPropertiesTable.tsx
import React, { useState } from 'react';
import { Search, Building, CheckCircle, Clock, AlertTriangle, Eye, Users, User } from 'lucide-react';
import { useGetAllAdminPropertiesQuery } from '@/store/api/adminApi';
import { useRouter } from 'next/navigation';

export const AllPropertiesTable: React.FC = () => {
    const router = useRouter();
    const { data: propertiesData, isLoading } = useGetAllAdminPropertiesQuery({ page: 0, size: 50 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'reported'>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'encera' | 'papp'>('all');

    const properties = propertiesData?.content || [];
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

        let matchesOwnership = true;
        switch (ownershipFilter) {
            case 'encera':
                // Encera'nın kendi ilanları - admin kullanıcıları tarafından oluşturulan pappSellable ilanlar
                matchesOwnership = property.pappSellable === true && property.owner?.role === 'ADMIN';
                break;
            case 'papp':
                // Kullanıcıların pappSellable=true ilanları
                matchesOwnership = property.pappSellable === true && property.owner?.role === 'USER';
                break;
        }

        return matchesSearch && matchesStatus && matchesOwnership;
    });

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

                {/* Ownership Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setOwnershipFilter('all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            ownershipFilter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Building className="h-4 w-4" />
                        Tüm İlanlar
                    </button>

                    <button
                        onClick={() => setOwnershipFilter('encera')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            ownershipFilter === 'encera'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                    >
                        <User className="h-4 w-4" />
                        Encera'nın İlanları
                    </button>

                    <button
                        onClick={() => setOwnershipFilter('papp')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            ownershipFilter === 'papp'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        Papp Sellable İlanları
                    </button>
                </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property) => {
                    const statusInfo = getStatusInfo(property);
                    return (
                        <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/admin/property/${property.id}`)}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                                        {statusInfo.icon}
                                        {statusInfo.text}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/admin/property/${property.id}`);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded relative z-10"
                                    title="Detayları Görüntüle"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            </div>

                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                {property.title}
                            </h4>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center justify-between">
                                    <span>{property.city}, {property.district}</span>
                                    <span className="font-medium text-green-600">
                                        {new Intl.NumberFormat('tr-TR', {
                                            style: 'currency',
                                            currency: 'TRY',
                                            minimumFractionDigits: 0,
                                        }).format(property.price)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span>{property.viewCount} görüntüleme</span>
                                    <span>{new Date(property.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>

                                <div className="text-xs space-y-1">
                                    <div>
                                        <div>
                                            Sahibi: {property.owner.firstName} {property.owner.lastName}
                                            {property.owner.phoneNumber && (
                                                <div className="text-gray-500">Tel: {property.owner.phoneNumber}</div>
                                            )}
                                            {property.pappSellable && (
                                                <div className="text-blue-600 font-medium mt-1">
                                                    Papp Sellable
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {property.reportCount > 0 && (
                                    <div className="text-xs text-red-600">
                                        {property.reportCount} şikayet
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
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