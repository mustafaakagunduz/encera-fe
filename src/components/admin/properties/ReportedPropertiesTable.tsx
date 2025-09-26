'use client';

// src/components/admin/properties/ReportedPropertiesTable.tsx
import React, { useState } from 'react';
import { Search, AlertTriangle, Eye, Shield } from 'lucide-react';
import { useGetReportedPropertiesQuery, useClearPropertyReportsMutation } from '@/store/api/adminApi';

export const ReportedPropertiesTable: React.FC = () => {
    const { data: propertiesData, isLoading } = useGetReportedPropertiesQuery({ page: 0, size: 20 });
    const [clearReports] = useClearPropertyReportsMutation();
    const [searchTerm, setSearchTerm] = useState('');

    const properties = propertiesData?.content || [];
    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.owner.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClearReports = async (propertyId: number) => {
        try {
            await clearReports(propertyId).unwrap();
        } catch (error) {
            console.error('Şikayetler temizlenirken hata:', error);
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Şikayetli İlanlar ({filteredProperties.length})
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

            {/* List View */}
            <div className="space-y-3">
                {filteredProperties.map((property) => (
                    <div key={property.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <div>
                                    <h4 className="font-medium text-gray-900">{property.title}</h4>
                                    <p className="text-sm text-gray-500">
                                        {property.city}, {property.district}
                                    </p>
                                    <div className="text-xs text-gray-600 mb-1">
                                        {property.delegatedToEncera ? (
                                            <div className="space-y-1">
                                                <div className="text-blue-600 font-medium">
                                                    Yönetici: Encera
                                                </div>
                                                {property.originalOwner && (
                                                    <div>
                                                        Asıl Sahip: {property.originalOwner.firstName} {property.originalOwner.lastName}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                Sahibi: {property.owner.firstName} {property.owner.lastName}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-red-600 font-medium">
                                        {property.reportCount} şikayet • Son şikayet: {property.lastReportedAt ? new Date(property.lastReportedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleClearReports(property.id)}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                    <Shield className="h-3 w-3" />
                                    Şikayetleri Temizle
                                </button>
                                <button
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Detayları Görüntüle"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchTerm
                            ? 'Arama kriterlerinize uygun şikayetli ilan bulunamadı'
                            : 'Şikayetli ilan bulunmuyor'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};