'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Toast } from '@/components/ui/toast';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ExternalLink,
    Building,
    User,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { useGetAllComplaintsQuery, useHandleComplaintMutation, ComplaintResponse } from '@/store/api/complaintApi';

// Use the ComplaintResponse type from the API instead of defining a separate interface

interface ComplaintStats {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    IN_REVIEW: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
    PENDING: 'Beklemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    IN_REVIEW: 'İnceleniyor'
};

const reasonLabels = {
    FAKE_LISTING: 'Sahte İlan',
    INAPPROPRIATE_CONTENT: 'Uygunsuz İçerik',
    WRONG_INFO: 'Yanlış Bilgi',
    SPAM: 'Spam',
    DUPLICATE: 'Tekrar İlan',
    FAKE_PROFILE: 'Sahte Profil',
    INAPPROPRIATE_BEHAVIOR: 'Uygunsuz Davranış',
    SCAM: 'Dolandırıcılık',
    HARASSMENT: 'Taciz',
    OTHER: 'Diğer'
};

export function ComplaintManagement() {
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
    const [handleDialogOpen, setHandleDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [stats, setStats] = useState<ComplaintStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });

    // RTK Query hooks
    const { data: complaintsData, isLoading: loading } = useGetAllComplaintsQuery({
        page,
        size: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
    });
    const [handleComplaint, { isLoading: processing }] = useHandleComplaintMutation();

    // Toast state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });

    // Handle form
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [adminNotes, setAdminNotes] = useState('');

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Derive data from RTK Query response
    const complaints = complaintsData?.content || [];
    const totalPages = complaintsData?.totalPages || 0;

    // Update stats when complaints data changes
    useEffect(() => {
        if (complaints.length > 0) {
            setStats({
                pending: complaints.filter(c => c.status === 'PENDING').length,
                approved: complaints.filter(c => c.status === 'APPROVED').length,
                rejected: complaints.filter(c => c.status === 'REJECTED').length,
                total: complaints.length
            });
        }
    }, [complaints]);

    const handleComplaintAction = async () => {
        if (!selectedComplaint || !selectedStatus) return;

        try {
            await handleComplaint({
                complaintId: selectedComplaint.id,
                status: selectedStatus,
                adminNotes: adminNotes || undefined
            }).unwrap();

            showToast('Şikayet başarıyla işlendi', 'success');

            setHandleDialogOpen(false);
            setSelectedComplaint(null);
            setSelectedStatus('');
            setAdminNotes('');
        } catch (error) {
            console.error('Failed to handle complaint:', error);
            showToast('Şikayet işlenirken hata oluştu', 'error');
        }
    };

    const openHandleDialog = (complaint: ComplaintResponse) => {
        setSelectedComplaint(complaint);
        setSelectedStatus('');
        setAdminNotes('');
        setHandleDialogOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Toplam</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Beklemede</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Onaylanan</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Reddedilen</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Durum Filtresi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Durumlar</SelectItem>
                                <SelectItem value="PENDING">Beklemede</SelectItem>
                                <SelectItem value="IN_REVIEW">İnceleniyor</SelectItem>
                                <SelectItem value="APPROVED">Onaylandı</SelectItem>
                                <SelectItem value="REJECTED">Reddedildi</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Tür Filtresi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Türler</SelectItem>
                                <SelectItem value="PROPERTY">İlan Şikayetleri</SelectItem>
                                <SelectItem value="PROFILE">Profil Şikayetleri</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Complaints List */}
            <Card>
                <CardHeader>
                    <CardTitle>Şikayetler</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Yükleniyor...</div>
                    ) : complaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Şikayet bulunamadı</div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map((complaint) => (
                                <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            {complaint.type === 'PROPERTY' ? (
                                                <Building className="h-5 w-5 text-blue-500" />
                                            ) : (
                                                <User className="h-5 w-5 text-green-500" />
                                            )}
                                            <div>
                                                <h3 className="font-medium">
                                                    {reasonLabels[complaint.reason as keyof typeof reasonLabels]}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Hedef: {complaint.target.title}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={statusColors[complaint.status]}>
                                            {statusLabels[complaint.status]}
                                        </Badge>
                                    </div>

                                    {complaint.description && (
                                        <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                                            {complaint.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <div className="flex items-center gap-4">
                                            <span>
                                                Rapor eden: {complaint.reporter.firstName} {complaint.reporter.lastName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(complaint.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(complaint.target.url, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                Görüntüle
                                            </Button>
                                            {complaint.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => openHandleDialog(complaint)}
                                                >
                                                    İşle
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {complaint.adminNotes && (
                                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                            <strong>Admin Notu:</strong> {complaint.adminNotes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                            >
                                Önceki
                            </Button>
                            <span className="px-3 py-2 text-sm">
                                {page + 1} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page === totalPages - 1}
                            >
                                Sonraki
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Handle Complaint Dialog */}
            <Dialog open={handleDialogOpen} onOpenChange={setHandleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Şikayeti İşle</DialogTitle>
                    </DialogHeader>

                    {selectedComplaint && (
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded">
                                <p className="font-medium">
                                    {reasonLabels[selectedComplaint.reason as keyof typeof reasonLabels]}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Hedef: {selectedComplaint.target.title}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Karar
                                </label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Karar seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="APPROVED">Onayla</SelectItem>
                                        <SelectItem value="REJECTED">Reddet</SelectItem>
                                        <SelectItem value="IN_REVIEW">İncelemeye Al</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Admin Notu (Opsiyonel)
                                </label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Kararınız hakkında detay ekleyebilirsiniz..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setHandleDialogOpen(false)}
                            disabled={processing}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleComplaintAction}
                            disabled={!selectedStatus || processing}
                        >
                            {processing ? 'İşleniyor...' : 'Onayla'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Toast Notification */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
}