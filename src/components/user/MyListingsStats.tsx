
// src/components/user/MyListingsStats.tsx
'use client';

import React from 'react';
import { PropertyResponse, useGetUserStatsQuery } from '@/store/api/propertyApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {
    Building2,
    CheckCircle,
    Clock,
    Eye,
    TrendingUp,
    XCircle
} from 'lucide-react';

interface MyListingsStatsProps {
    activeTab?: 'my-properties' | 'delegated-properties';
    isAdmin?: boolean;
}

export const MyListingsStats: React.FC<MyListingsStatsProps> = ({ activeTab = 'my-properties', isAdmin = false }) => {
    const { t, isReady } = useAppTranslation();

    // Global user stats API'sini kullan
    const { data: userStats, isLoading } = useGetUserStatsQuery();

    // Loading durumunda varsayılan değerler
    const totalProperties = userStats?.totalProperties || 0;
    const approvedProperties = userStats?.approvedProperties || 0;
    const pendingProperties = userStats?.pendingApprovalProperties || 0;
    const inactiveProperties = userStats?.inactiveProperties || 0;
    const totalViews = userStats?.totalViews || 0;

    const stats = [
        {
            title: isReady ? t('my-listings.stats.total') : 'Toplam İlan',
            value: totalProperties,
            icon: Building2,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: isReady ? t('my-listings.stats.approved') : 'Onaylanmış',
            value: approvedProperties,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: isReady ? t('my-listings.stats.pending') : 'Beklemede',
            value: pendingProperties,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: isReady ? t('my-listings.stats.inactive') : 'Pasif',
            value: inactiveProperties,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: isReady ? t('my-listings.stats.views') : 'Toplam Görüntülenme',
            value: totalViews,
            icon: Eye,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className={`${stat.bgColor} ${stat.color} rounded-lg p-2 sm:p-3`}>
                            <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                {stat.title}
                            </p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};