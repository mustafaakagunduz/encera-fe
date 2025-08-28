'use client';

// src/components/admin/properties/PropertyStats.tsx
import React from 'react';
import {Building, CheckCircle, Clock, AlertTriangle, Star, TrendingUp} from 'lucide-react';
import { useGetPropertyStatisticsQuery } from '@/store/api/adminApi';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {value.toLocaleString('tr-TR')}
                        </p>
                    </div>
                </div>
                {trend && (
                    <div className="flex items-center">
                        <TrendingUp
                            className={`w-4 h-4 mr-1 ${
                                trend.isPositive ? 'text-green-500' : 'text-red-500 rotate-180'
                            }`}
                        />
                        <span
                            className={`text-sm font-medium ${
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {trend.value}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PropertyStats: React.FC = () => {
    const { data: stats, isLoading, error } = useGetPropertyStatisticsQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">İlan istatistikleri yüklenirken hata oluştu</p>
            </div>
        );
    }

    const propertyStats = [
        {
            title: 'Toplam İlan',
            value: stats?.totalSystemProperties || 0,
            icon: <Building className="h-6 w-6" />,
            color: 'blue' as const,
        },
        {
            title: 'Onaylanmış İlan',
            value: stats?.totalApprovedSystemProperties || 0,
            icon: <CheckCircle className="h-6 w-6" />,
            color: 'green' as const,
        },
        {
            title: 'Onay Bekleyen',
            value: stats?.pendingApprovalSystemProperties || 0,
            icon: <Clock className="h-6 w-6" />,
            color: 'yellow' as const,
        },
        {
            title: 'Şikayetli İlan',
            value: stats?.reportedSystemProperties || 0,
            icon: <AlertTriangle className="h-6 w-6" />,
            color: 'red' as const,
        },
        {
            title: 'Öne Çıkan',
            value: stats?.featuredSystemProperties || 0,
            icon: <Star className="h-6 w-6" />,
            color: 'purple' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {propertyStats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}

                />
            ))}
        </div>
    );
};