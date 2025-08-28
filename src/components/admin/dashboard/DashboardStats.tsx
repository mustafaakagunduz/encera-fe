'use client';

// src/components/admin/dashboard/DashboardStats.tsx
import React from 'react';
import { Users, Building, AlertTriangle, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import { useGetAdminStatisticsQuery, useGetPropertyStatisticsQuery } from '@/store/api/adminApi';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                    </p>
                    {trend && (
                        <div className="flex items-center mt-1">
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
                                {trend.value}% {trend.label}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const DashboardStats: React.FC = () => {
    const { data: adminStats, isLoading: isAdminStatsLoading, error: adminStatsError } = useGetAdminStatisticsQuery();
    const { data: propertyStats, isLoading: isPropertyStatsLoading, error: propertyStatsError } = useGetPropertyStatisticsQuery();

    if (isAdminStatsLoading || isPropertyStatsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

    if (adminStatsError || propertyStatsError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            İstatistikler yüklenirken hata oluştu
                        </h3>
                        <p className="mt-1 text-sm text-red-700">
                            Lütfen sayfayı yenilemeyi deneyin.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Toplam Kullanıcı',
            value: adminStats?.totalUsers || 0,
            icon: <Users className="h-6 w-6" />,
            color: 'blue' as const,
            trend: {
                value: 12,
                label: 'bu hafta',
                isPositive: true,
            }
        },
        {
            title: 'Aktif İlanlar',
            value: propertyStats?.totalApprovedSystemProperties || 0,
            icon: <Building className="h-6 w-6" />,
            color: 'green' as const,
            trend: {
                value: 8,
                label: 'bu ay',
                isPositive: true,
            }
        },
        {
            title: 'Onay Bekleyen',
            value: propertyStats?.pendingApprovalSystemProperties || 0,
            icon: <CheckCircle className="h-6 w-6" />,
            color: 'yellow' as const,
        },
        {
            title: 'Şikayetli İlanlar',
            value: propertyStats?.reportedSystemProperties || 0,
            icon: <AlertTriangle className="h-6 w-6" />,
            color: 'red' as const,
        },
        {
            title: 'Öne Çıkan İlanlar',
            value: propertyStats?.featuredSystemProperties || 0,
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'purple' as const,
        },
        {
            title: 'Toplam İlan',
            value: propertyStats?.totalSystemProperties || 0,
            icon: <Eye className="h-6 w-6" />,
            color: 'indigo' as const,
            trend: {
                value: 5,
                label: 'bu ay',
                isPositive: true,
            }
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    trend={stat.trend}
                />
            ))}
        </div>
    );
};