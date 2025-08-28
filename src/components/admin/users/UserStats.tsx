'use client';

// src/components/admin/users/UserStats.tsx
import React from 'react';
import { Users, UserCheck, UserX, TrendingUp, Calendar, Shield } from 'lucide-react';
import { useGetAllUsersQuery } from '@/store/api/adminApi';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
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

export const UserStats: React.FC = () => {
    const { data: users, isLoading, error } = useGetAllUsersQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
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
                <p className="text-red-800">Kullanıcı istatistikleri yüklenirken hata oluştu</p>
            </div>
        );
    }

    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(user => user.enabled)?.length || 0;
    const inactiveUsers = totalUsers - activeUsers;
    const adminUsers = users?.filter(user => user.role === 'ADMIN')?.length || 0;
    const regularUsers = users?.filter(user => user.role === 'USER')?.length || 0;

    // Son 30 gün içinde kayıt olan kullanıcılar (mock data - gerçek tarih karşılaştırması için)
    const recentUsers = users?.filter(user => {
        const userDate = new Date(user.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return userDate > thirtyDaysAgo;
    })?.length || 0;

    const stats = [
        {
            title: 'Toplam Kullanıcı',
            value: totalUsers,
            icon: <Users className="h-6 w-6" />,
            color: 'blue' as const,
            trend: { value: 12, isPositive: true }
        },
        {
            title: 'Aktif Kullanıcı',
            value: activeUsers,
            icon: <UserCheck className="h-6 w-6" />,
            color: 'green' as const,
            trend: { value: 8, isPositive: true }
        },
        {
            title: 'Pasif Kullanıcı',
            value: inactiveUsers,
            icon: <UserX className="h-6 w-6" />,
            color: 'red' as const,
            trend: { value: 3, isPositive: false }
        },
        {
            title: 'Yeni Kayıtlar',
            value: recentUsers,
            icon: <Calendar className="h-6 w-6" />,
            color: 'purple' as const,
            trend: { value: 15, isPositive: true }
        },
        {
            title: 'Admin Kullanıcı',
            value: adminUsers,
            icon: <Shield className="h-6 w-6" />,
            color: 'yellow' as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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