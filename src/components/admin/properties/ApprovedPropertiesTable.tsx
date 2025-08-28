'use client';

// src/components/admin/properties/ApprovedPropertiesTable.tsx
import React, { useState } from 'react';
import { Search, Eye, CheckCircle } from 'lucide-react';
import { useGetApprovedPropertiesQuery } from '@/store/api/adminApi';

export const ApprovedPropertiesTable: React.FC = () => {
    const { data: propertiesData, isLoading } = useGetApprovedPropertiesQuery({ page: 0, size: 20 });
    const [searchTerm, setSearchTerm] = useState('');

    const properties = propertiesData?.content || [];
    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="text-center py-8">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Onaylanmış İlanlar ({filteredProperties.length})
                </h3>
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

            {/* Simple List View */}
            <div className="space-y-3">
                {filteredProperties.map((property) => (
                    <div key={property.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <h4 className="font-medium text-gray-900">{property.title}</h4>
                                    <p className="text-sm text-gray-500">
                                        {property.city}, {property.district} • {property.viewCount} görüntüleme
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                    {new Intl.NumberFormat('tr-TR', {
                                        style: 'currency',
                                        currency: 'TRY',
                                        minimumFractionDigits: 0,
                                    }).format(property.price)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Onaylandı: {new Date(property.approvedAt || property.updatedAt).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchTerm
                            ? 'Arama kriterlerinize uygun onaylanmış ilan bulunamadı'
                            : 'Henüz onaylanmış ilan bulunmuyor'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};