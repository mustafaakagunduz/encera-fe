'use client';

// src/components/user/PappSellableRequestsTable.tsx
import React, { useState } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    Building,
    MapPin,
    Calendar,
    Phone,
    Mail,
    AlertCircle
} from 'lucide-react';
import { useGetCurrentUserPappRequestsQuery } from '@/store/api/pappSellableRequestApi';

export const PappSellableRequestsTable: React.FC = () => {
    const { data: requestsData, isLoading, error } = useGetCurrentUserPappRequestsQuery({ page: 0, size: 20 });
    const [searchTerm, setSearchTerm] = useState('');

    const requests = requestsData?.content || [];
    const filteredRequests = requests.filter(request =>
        request.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.propertyCity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <Clock className="h-3 w-3" />,
                    text: 'Beklemede'
                };
            case 'APPROVED':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="h-3 w-3" />,
                    text: 'Onaylandı'
                };
            case 'REJECTED':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="h-3 w-3" />,
                    text: 'Reddedildi'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <AlertCircle className="h-3 w-3" />,
                    text: 'Bilinmiyor'
                };
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Papp Sellable istekleri yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Papp Sellable istekleri yüklenirken bir hata oluştu.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Papp Sellable İsteklerim
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Encera ile satılması için gönderdiğiniz istekler ({filteredRequests.length})
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Papp Sellable Sistemi</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            İlanınızı "Encera ile satılsın" olarak işaretlediğinizde, isteğiniz admin onayına gönderilir.
                            Onaylandıktan sonra ilanınız Encera tarafından yönetilir ve satışa çıkarılır.
                        </p>
                    </div>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Henüz Papp Sellable isteğiniz yok
                    </h3>
                    <p className="text-gray-600">
                        İlan oluştururken "Encera ile satılsın" seçeneğini işaretleyerek Papp Sellable isteği gönderebilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        return (
                            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {request.propertyTitle}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{request.propertyCity}, {request.propertyDistrict}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Building className="h-4 w-4" />
                                                <span>{request.propertyType} • {request.listingType}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>İstek tarihi: {new Date(request.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                            {request.approvedAt && (
                                                <div className="flex items-center space-x-1">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Onay tarihi: {new Date(request.approvedAt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* İletişim Bilgileri */}
                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Kayıtlı İletişim Bilgileri</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{request.userPhoneNumber}</span>
                                        </div>
                                        {request.userEmail && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                <span>{request.userEmail}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reddetme Sebebi */}
                                {request.status === 'REJECTED' && request.rejectionReason && (
                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="text-sm font-medium text-red-900 mb-2">Reddetme Sebebi</h4>
                                        <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
                                            {request.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {/* Admin Notları */}
                                {request.notes && (
                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notları</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                            {request.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};