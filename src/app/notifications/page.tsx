'use client';

import React from 'react';
import { NotificationsList } from '@/components/notifications/NotificationsList';

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
                    <p className="text-gray-600 mt-2">
                        Şikayet durumları, ilan onayları ve diğer önemli bildirimleriniz
                    </p>
                </div>

                <NotificationsList />
            </div>
        </div>
    );
}