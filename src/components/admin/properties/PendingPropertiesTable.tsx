'use client';

// src/components/admin/properties/PendingPropertiesTable.tsx
import React, { useState } from 'react';
import {
    Search,
    CheckCircle,
    X,
    Eye,
    MoreHorizontal,
    Calendar,
    MapPin,
    TrendingUp,
    User,
    Building,
    DollarSign, Clock
} from 'lucide-react';
import {
    useGetPendingApprovalPropertiesQuery,
    useApprovePropertyMutation,
    useRejectPropertyMutation
} from '@/store/api/adminApi';
import { useRouter } from 'next/navigation';

interface Property {
    id: number;
    title: string;
    listingType: string;
    propertyType: string;
    city: string;
    district: string;
    neighborhood: string;
    price: number;
    grossArea?: number;
    netArea?: number;
    elevator: boolean;
    parking: boolean;
    balcony: boolean;
    security: boolean;
    description?: string;
    featured: boolean;
    pappSellable: boolean;
    furnished: boolean;
    active: boolean;
    approved: boolean;
    approvedAt?: string;
    viewCount: number;
    reported: boolean;
    reportCount: number;
    lastReportedAt?: string;
    owner: {
        id: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
    };
    createdAt: string;
    updatedAt: string;
    lastPublished?: string;
}

export const PendingPropertiesTable: React.FC = () => {
    const router = useRouter();
    const { data: propertiesData, isLoading, error } = useGetPendingApprovalPropertiesQuery({ page: 0, size: 20 });
    const [approveProperty] = useApprovePropertyMutation();
    const [rejectProperty] = useRejectPropertyMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [actionDropdown, setActionDropdown] = useState<number | null>(null);
    const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

    const properties = propertiesData?.content || [];
    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApprove = async (propertyId: number) => {
        try {
            await approveProperty(propertyId).unwrap();
            setActionDropdown(null);
        } catch (error) {
            console.error('İlan onaylanırken hata:', error);
        }
    };

    const handleReject = async (propertyId: number) => {
        try {
            await rejectProperty(propertyId).unwrap();
            setActionDropdown(null);
        } catch (error) {
            console.error('İlan reddedilirken hata:', error);
        }
    };

    const handleBulkApprove = async () => {
        try {
            await Promise.all(selectedProperties.map(id => approveProperty(id).unwrap()));
            setSelectedProperties([]);
        } catch (error) {
            console.error('Toplu onay hatası:', error);
        }
    };

    const handleSelectProperty = (propertyId: number) => {
        setSelectedProperties(prev =>
            prev.includes(propertyId)
                ? prev.filter(id => id !== propertyId)
                : [...prev, propertyId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProperties.length === filteredProperties.length) {
            setSelectedProperties([]);
        } else {
            setSelectedProperties(filteredProperties.map(p => p.id));
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getListingTypeText = (type: string) => {
        switch (type) {
            case 'SALE': return 'Satılık';
            case 'RENT': return 'Kiralık';
            default: return type;
        }
    };

    const getPropertyTypeText = (type: string) => {
        switch (type) {
            case 'RESIDENTIAL': return 'Konut';
            case 'COMMERCIAL': return 'Ticari';
            case 'LAND': return 'Arsa';
            case 'DAILY_RENTAL': return 'Günlük Kiralık';
            default: return type;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Onay bekleyen ilanlar yüklenirken hata oluştu</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Onay Bekleyen İlanlar ({filteredProperties.length})
                        </h3>
                        {selectedProperties.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {selectedProperties.length} seçili
                                </span>
                                <button
                                    onClick={handleBulkApprove}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Toplu Onayla
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="İlan ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="w-12 px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İlan Bilgileri
                                </th>
                                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Konum & Fiyat
                                </th>
                                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sahibi
                                </th>
                                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProperties.map((property) => (
                                <tr key={property.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/property/${property.id}`)}>
                                    {/* Checkbox */}
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProperties.includes(property.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSelectProperty(property.id);
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                    </td>

                                    {/* İlan Bilgileri */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-start">
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-gray-900 break-words">
                                                    {property.title}
                                                </div>
                                                <div className="flex items-center mt-1 space-x-2">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {getListingTypeText(property.listingType)}
                                                        </span>
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            {getPropertyTypeText(property.propertyType)}
                                                        </span>
                                                </div>
                                                {property.grossArea && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {property.grossArea} m² • {property.viewCount} görüntüleme
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Konum & Fiyat */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                                {property.city}, {property.district}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {property.neighborhood}
                                            </div>
                                            <div className="flex items-center text-sm font-medium text-green-600">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {formatPrice(property.price)}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Sahibi */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-600" />
                                                </div>
                                            </div>
                                            <div className="ml-2">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {property.owner.firstName} {property.owner.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {property.owner.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Tarih */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            {formatDate(property.createdAt)}
                                        </div>
                                    </td>

                                    {/* İşlemler */}
                                    <td className="w-32 px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 relative z-10">
                                            {/* Hızlı Onay */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApprove(property.id);
                                                }}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                title="Onayla"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </button>

                                            {/* Hızlı Red */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReject(property.id);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Reddet"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>

                                            {/* Detay */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/admin/property/${property.id}`);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Detayları Görüntüle"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredProperties.length === 0 && (
                        <div className="text-center py-12">
                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {searchTerm
                                    ? 'Arama kriterlerinize uygun ilan bulunamadı'
                                    : 'Onay bekleyen ilan bulunmuyor'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
};