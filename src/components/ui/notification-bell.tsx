'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useGetUnreadNotificationCountQuery, useGetUnreadNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from '@/store/api/notificationApi';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import '../navbar/Navbar.css';

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

const typeColors = {
    COMPLAINT_APPROVED: 'bg-green-50 border-green-200',
    COMPLAINT_REJECTED: 'bg-red-50 border-red-200',
    COMPLAINT_IN_REVIEW: 'bg-blue-50 border-blue-200',
    PROPERTY_REPORTED_APPROVED: 'bg-orange-50 border-orange-200',
    PROFILE_REPORTED_APPROVED: 'bg-orange-50 border-orange-200',
    PROPERTY_APPROVED: 'bg-green-50 border-green-200',
    PROPERTY_REJECTED: 'bg-red-50 border-red-200',
    PROPERTY_FEATURED: 'bg-yellow-50 border-yellow-200',
    MESSAGE_RECEIVED: 'bg-blue-50 border-blue-200',
    SYSTEM_ANNOUNCEMENT: 'bg-purple-50 border-purple-200'
};

export function NotificationBell() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Kullanıcı yoksa render etme
    if (!user) return null;

    // RTK Query hooks
    const { data: countData } = useGetUnreadNotificationCountQuery(undefined, {
        pollingInterval: 30000, // 30 saniyede bir güncelle
        skip: !user
    });
    const { data: notifications = [] } = useGetUnreadNotificationsQuery(undefined, {
        skip: !user || !isOpen
    });
    const [markAsRead] = useMarkNotificationAsReadMutation();
    const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

    const unreadCount = countData?.count || 0;

    // Dışarı tıklayınca kapat
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notificationId: number, actionUrl?: string) => {
        try {
            await markAsRead(notificationId);
            setIsOpen(false);

            if (actionUrl) {
                window.location.href = actionUrl;
            }
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

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Az önce';
        if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} sa önce`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} gün önce`;

        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="navbar-language-button relative"
                aria-label="Bildirimler"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    title="Tümünü okundu işaretle"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Tümü
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Yeni bildiriminiz yok</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            typeColors[notification.type] || 'bg-gray-50 border-gray-200'
                                        }`}
                                        onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-lg flex-shrink-0">
                                                {typeIcons[notification.type] || '📝'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                {notification.actionUrl && (
                                                    <div className="mt-2">
                                                        <span className="text-xs text-blue-600 hover:text-blue-700">
                                                            Görüntüle →
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <Link
                                href="/notifications"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                                onClick={() => setIsOpen(false)}
                            >
                                Tüm bildirimleri görüntüle
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}