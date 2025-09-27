'use client';

// src/components/admin/papp-requests/PappSellableRequestsTable.tsx
import React, { useState } from 'react';
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Building,
    User,
    Phone,
    Mail,
    Calendar,
    MoreHorizontal,
    Check,
    X
} from 'lucide-react';
import {
    useGetPendingPappRequestsQuery,
    useGetAllPappRequestsQuery,
    useApprovePappRequestMutation,
    useRejectPappRequestMutation
} from '@/store/api/pappSellableRequestApi';

export const PappSellableRequestsTable: React.FC = () => {
    const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionDropdown, setActionDropdown] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

    const { data: pendingData, isLoading: pendingLoading } = useGetPendingPappRequestsQuery({ page: 0, size: 50 });
    const { data: allData, isLoading: allLoading } = useGetAllPappRequestsQuery({ page: 0, size: 50 });
    const [approveRequest] = useApprovePappRequestMutation();
    const [rejectRequest] = useRejectPappRequestMutation();

    const requests = viewMode === 'pending' ? (pendingData?.content || []) : (allData?.content || []);
    const isLoading = viewMode === 'pending' ? pendingLoading : allLoading;

    const filteredRequests = requests.filter(request =>
        request.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.propertyCity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApprove = async (requestId: number) => {
        try {
            await approveRequest(requestId).unwrap();
            setActionDropdown(null);
        } catch (error) {
            console.error('Onaylama hatası:', error);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await rejectRequest({
                id: requestId,
                request: { rejectionReason: rejectReason || 'Sebep belirtilmedi' }
            }).unwrap();
            setShowRejectModal(null);
            setRejectReason('');
            setActionDropdown(null);
        } catch (error) {
            console.error('Reddetme hatası:', error);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock className="h-3 w-3" />,
                    text: 'Beklemede'
                };
            case 'APPROVED':
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="h-3 w-3" />,
                    text: 'Onaylandı'
                };
            case 'REJECTED':
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="h-3 w-3" />,
                    text: 'Reddedildi'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: <Clock className="h-3 w-3" />,
                    text: 'Bilinmiyor'
                };
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Papp Sellable İstekleri ({filteredRequests.length})
                    </h3>

                    {/* View Mode Tabs */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        <button
                            onClick={() => setViewMode('pending')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'pending'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Clock className="h-4 w-4 inline mr-1" />
                            Bekleyenler
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                                viewMode === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Tümü
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="İstek ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-hidden border border-gray-200 rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İlan Bilgileri
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kullanıcı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((request) => {
                                const statusInfo = getStatusInfo(request.status);
                                return (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        {/* İlan Bilgileri */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <Building className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.propertyTitle}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.propertyCity}, {request.propertyDistrict}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        ID: {request.propertyId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kullanıcı */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.userFirstName} {request.userLastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {request.userPhoneNumber}
                                                    </div>
                                                    {request.userEmail && (
                                                        <div className="text-xs text-gray-400 flex items-center">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            {request.userEmail}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Durum */}
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${statusInfo.color}`}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </span>
                                            {request.rejectionReason && (
                                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                                    {request.rejectionReason}
                                                </div>
                                            )}
                                        </td>

                                        {/* Tarih */}
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                            {request.approvedAt && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Onaylandı: {new Date(request.approvedAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            )}
                                        </td>

                                        {/* İşlemler */}
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            {request.status === 'PENDING' && (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(request.id)}
                                                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRejectModal(request.id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Reddet
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredRequests.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {viewMode === 'pending' ? 'Bekleyen istek yok' : 'Henüz istek yok'}
                    </h3>
                    <p className="text-gray-600">
                        {viewMode === 'pending'
                            ? 'Şu anda onay bekleyen Papp Sellable isteği bulunmuyor.'
                            : 'Henüz hiç Papp Sellable isteği gönderilmemiş.'}
                    </p>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">İsteği Reddet</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reddetme sebebini yazın..."
                            className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Reddet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};