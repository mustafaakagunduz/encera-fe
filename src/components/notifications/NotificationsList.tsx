'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Check, CheckCheck, ExternalLink, Calendar, FilterX } from 'lucide-react';
import { useGetUserNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from '@/store/api/notificationApi';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const typeIcons = {
    COMPLAINT_APPROVED: '✅',
    COMPLAINT_REJECTED: '❌',
    COMPLAINT_IN_REVIEW: '🔍',
    PROPERTY_REPORTED_APPROVED: '🚨',
    PROFILE_REPORTED_APPROVED: '⚠️',
    PROPERTY_APPROVED: '🏠',
    PROPERTY_REJECTED: '🚫',
    PROPERTY_FEATURED: '⭐',
    MESSAGE_RECEIVED: '💬',
    SYSTEM_ANNOUNCEMENT: '📢'
};

const typeLabels = {
    COMPLAINT_APPROVED: 'Şikayet Onaylandı',
    COMPLAINT_REJECTED: 'Şikayet Reddedildi',
    COMPLAINT_IN_REVIEW: 'Şikayet İnceleniyor',
    PROPERTY_REPORTED_APPROVED: 'İlan Şikayet Edildi',
    PROFILE_REPORTED_APPROVED: 'Profil Şikayet Edildi',
    PROPERTY_APPROVED: 'İlan Onaylandı',
    PROPERTY_REJECTED: 'İlan Reddedildi',
    PROPERTY_FEATURED: 'İlan VIP Yapıldı',
    MESSAGE_RECEIVED: 'Yeni Mesaj',
    SYSTEM_ANNOUNCEMENT: 'Sistem Duyurusu'
};

const typeColors = {
    COMPLAINT_APPROVED: 'bg-green-100 text-green-800',
    COMPLAINT_REJECTED: 'bg-red-100 text-red-800',
    COMPLAINT_IN_REVIEW: 'bg-blue-100 text-blue-800',
    PROPERTY_REPORTED_APPROVED: 'bg-orange-100 text-orange-800',
    PROFILE_REPORTED_APPROVED: 'bg-orange-100 text-orange-800',
    PROPERTY_APPROVED: 'bg-green-100 text-green-800',
    PROPERTY_REJECTED: 'bg-red-100 text-red-800',
    PROPERTY_FEATURED: 'bg-yellow-100 text-yellow-800',
    MESSAGE_RECEIVED: 'bg-blue-100 text-blue-800',
    SYSTEM_ANNOUNCEMENT: 'bg-purple-100 text-purple-800'
};

export function NotificationsList() {
    const { user } = useAuth();
    const [page, setPage] = useState(0);
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const { data: notificationsData, isLoading } = useGetUserNotificationsQuery({
        page,
        size: 20
    }, {
        skip: !user
    });

    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

    const notifications = notificationsData?.content || [];
    const totalPages = notificationsData?.totalPages || 0;

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('Bildirim okundu olarak işaretlenirken hata:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Az önce';
        if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} sa önce`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} gün önce`;

        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="text-gray-500">
                        Bildirimleri görüntülemek için giriş yapmanız gerekiyor.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const filteredNotifications = typeFilter === 'all'
        ? notifications
        : notifications.filter(n => n.type === typeFilter);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Tüm Bildirimler
                            </CardTitle>
                            {unreadCount > 0 && (
                                <Badge variant="destructive">
                                    {unreadCount} okunmadı
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Tür filtresi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tüm Türler</SelectItem>
                                    <SelectItem value="COMPLAINT_APPROVED">Şikayet Onaylandı</SelectItem>
                                    <SelectItem value="COMPLAINT_REJECTED">Şikayet Reddedildi</SelectItem>
                                    <SelectItem value="COMPLAINT_IN_REVIEW">Şikayet İnceleniyor</SelectItem>
                                    <SelectItem value="PROPERTY_REPORTED_APPROVED">İlan Şikayet Edildi</SelectItem>
                                    <SelectItem value="PROFILE_REPORTED_APPROVED">Profil Şikayet Edildi</SelectItem>
                                    <SelectItem value="PROPERTY_APPROVED">İlan Onaylandı</SelectItem>
                                    <SelectItem value="PROPERTY_REJECTED">İlan Reddedildi</SelectItem>
                                </SelectContent>
                            </Select>

                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Tümünü Okundu İşaretle
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Notifications List */}
            <div className="space-y-4">
                {isLoading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Bildirimler yükleniyor...</p>
                        </CardContent>
                    </Card>
                ) : filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">
                                {typeFilter === 'all' ? 'Henüz bildiriminiz yok' : 'Bu türde bildirim bulunamadı'}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {typeFilter === 'all'
                                    ? 'Şikayetleriniz ve ilan durumlarınızla ilgili bildirimler burada görünecek.'
                                    : 'Farklı bir filtre seçerek daha fazla bildirim görüntüleyebilirsiniz.'
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`hover:shadow-md transition-shadow ${
                                !notification.isRead ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''
                            }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="text-2xl flex-shrink-0">
                                        {typeIcons[notification.type] || '📝'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    {notification.title}
                                                </h3>
                                                <Badge className={typeColors[notification.type]}>
                                                    {typeLabels[notification.type]}
                                                </Badge>
                                                {!notification.isRead && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Yeni
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(notification.createdAt)}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {notification.actionUrl && (
                                                    <Link
                                                        href={notification.actionUrl}
                                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Görüntüle
                                                    </Link>
                                                )}
                                            </div>

                                            {!notification.isRead && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Okundu İşaretle
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex justify-center gap-2">
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}