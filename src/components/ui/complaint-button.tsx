'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import { Flag, AlertTriangle } from 'lucide-react';
import { useCreateComplaintMutation } from '@/store/api/complaintApi';

interface ComplaintButtonProps {
    type: 'PROPERTY' | 'PROFILE';
    targetId: number;
    targetTitle: string;
    buttonText?: string;
    className?: string;
}

const COMPLAINT_REASONS = {
    PROPERTY: [
        { value: 'FAKE_LISTING', label: 'Sahte İlan' },
        { value: 'INAPPROPRIATE_CONTENT', label: 'Uygunsuz İçerik' },
        { value: 'WRONG_INFO', label: 'Yanlış Bilgi' },
        { value: 'SPAM', label: 'Spam' },
        { value: 'DUPLICATE', label: 'Tekrar İlan' },
        { value: 'OTHER', label: 'Diğer' }
    ],
    PROFILE: [
        { value: 'FAKE_PROFILE', label: 'Sahte Profil' },
        { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Uygunsuz Davranış' },
        { value: 'SCAM', label: 'Dolandırıcılık' },
        { value: 'HARASSMENT', label: 'Taciz' },
        { value: 'OTHER', label: 'Diğer' }
    ]
};

export function ComplaintButton({ type, targetId, targetTitle, buttonText, className }: ComplaintButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');

    // RTK Query hook
    const [createComplaint, { isLoading: isSubmitting }] = useCreateComplaintMutation();

    // Toast state
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });

    const reasons = COMPLAINT_REASONS[type];

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const handleComplaintSubmit = async () => {
        if (!selectedReason) return;

        try {
            const complaintData = {
                type,
                reason: selectedReason,
                description: description.trim() || undefined,
                ...(type === 'PROPERTY' ? { targetPropertyId: targetId } : { targetUserId: targetId })
            };

            await createComplaint(complaintData).unwrap();

            showToast('Şikayetiniz başarıyla iletildi. Admin ekibi en kısa sürede değerlendirecektir.', 'success');

            setDialogOpen(false);
            setConfirmDialogOpen(false);
            setSelectedReason('');
            setDescription('');
        } catch (error: any) {
            console.error('Complaint submission error:', error);

            let errorMessage = 'Şikayet gönderilirken hata oluştu';
            if (error?.data?.message) {
                errorMessage = error.data.message;
            }

            showToast(errorMessage, 'error');
        }
    };

    const handleInitialSubmit = () => {
        if (!selectedReason) return;
        setDialogOpen(false);
        setConfirmDialogOpen(true);
    };

    const resetAndClose = () => {
        setDialogOpen(false);
        setConfirmDialogOpen(false);
        setSelectedReason('');
        setDescription('');
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className={`text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 ${className}`}
            >
                <Flag className="w-4 h-4 mr-1" />
                {buttonText || 'Şikayet Et'}
            </Button>

            {/* Complaint Form Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Flag className="w-5 h-5 text-red-600" />
                            {type === 'PROPERTY' ? 'İlanı Şikayet Et' : 'Profili Şikayet Et'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Şikayet edilecek:</strong> {targetTitle}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Şikayet Sebebi *
                            </label>
                            <Select value={selectedReason} onValueChange={setSelectedReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Bir sebep seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasons.map((reason) => (
                                        <SelectItem key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Açıklama (Opsiyonel)
                            </label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Şikayetiniz hakkında detay ekleyebilirsiniz..."
                                rows={3}
                                maxLength={1000}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {description.length}/1000 karakter
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-yellow-700">
                                    <p className="font-medium mb-1">Önemli Uyarı:</p>
                                    <p>Yanlış veya kötü niyetli şikayetler hesabınızın askıya alınmasına neden olabilir.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleInitialSubmit}
                            disabled={!selectedReason}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Devam Et
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Şikayeti Onayla
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <p className="text-gray-700 mb-2">
                                Bu {type === 'PROPERTY' ? 'ilanı' : 'profili'} şikayet etmek istediğinizden emin misiniz?
                            </p>
                            <p className="text-sm text-gray-500">
                                Şikayetiniz admin ekibi tarafından incelenecektir.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <p><strong>Hedef:</strong> {targetTitle}</p>
                            <p><strong>Sebep:</strong> {reasons.find(r => r.value === selectedReason)?.label}</p>
                            {description && (
                                <p><strong>Açıklama:</strong> {description}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={resetAndClose}
                            disabled={isSubmitting}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleComplaintSubmit}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmitting ? 'Gönderiliyor...' : 'Şikayet Et'}
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
        </>
    );
}