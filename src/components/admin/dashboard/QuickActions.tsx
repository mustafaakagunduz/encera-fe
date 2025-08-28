'use client';

// src/components/admin/dashboard/QuickActions.tsx
import React from 'react';
import Link from 'next/link';
import { Users, Building, AlertTriangle, Plus, Settings, BarChart3, FileText, Shield } from 'lucide-react';
import { useGetAdminStatisticsQuery, useGetPendingApprovalPropertiesQuery, useGetReportedPropertiesQuery } from '@/store/api/adminApi';

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
    badge?: number;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
                                                         title,
                                                         description,
                                                         icon,
                                                         href,
                                                         color,
                                                         badge
                                                     }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
        green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
        red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
        yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700',
        purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
        indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700',
    };

    const iconColorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        purple: 'text-purple-600',
        indigo: 'text-indigo-600',
    };

    return (
        <Link href={href}>
            <div className={`relative p-4 border rounded-lg transition-all duration-200 cursor-pointer ${colorClasses[color]}`}>
                {badge !== undefined && badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                        {badge > 99 ? '99+' : badge}
                    </div>
                )}

                <div className="flex items-start">
                    <div className={`p-2 rounded-md ${iconColorClasses[color]}`}>
                        {icon}
                    </div>
                    <div className="ml-3 flex-1">
                        <h4 className="font-medium text-gray-900">{title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export const QuickActions: React.FC = () => {
    const { data: adminStats } = useGetAdminStatisticsQuery();
    const { data: pendingProperties } = useGetPendingApprovalPropertiesQuery({ page: 0, size: 1 });
    const { data: reportedProperties } = useGetReportedPropertiesQuery({ page: 0, size: 1 });

    const quickActions: QuickActionProps[] = [
        {
            title: 'Kullanıcı Yönetimi',
            description: 'Kullanıcıları görüntüle ve yönet',
            icon: <Users className="h-5 w-5" />,
            href: '/admin/users',
            color: 'blue',
        },
        {
            title: 'İlan Onayları',
            description: 'Bekleyen ilanları onayla',
            icon: <Building className="h-5 w-5" />,
            href: '/admin/properties',
            color: 'green',
            badge: pendingProperties?.totalElements || 0,
        },
        {
            title: 'Şikayetler',
            description: 'Şikayet edilen ilanları incele',
            icon: <AlertTriangle className="h-5 w-5" />,
            href: '/admin/reports',
            color: 'red',
            badge: reportedProperties?.totalElements || 0,
        },
        {
            title: 'İstatistikler',
            description: 'Detaylı sistem raporları',
            icon: <BarChart3 className="h-5 w-5" />,
            href: '/admin/statistics',
            color: 'purple',
        },
        {
            title: 'Yeni İlan Oluştur',
            description: 'Admin olarak ilan ekle',
            icon: <Plus className="h-5 w-5" />,
            href: '/create-listing',
            color: 'indigo',
        },
        {
            title: 'Sistem Ayarları',
            description: 'Uygulama ayarlarını düzenle',
            icon: <Settings className="h-5 w-5" />,
            href: '/admin/settings',
            color: 'yellow',
        },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
                <Shield className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-3">
                {quickActions.map((action, index) => (
                    <QuickActionCard
                        key={index}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        href={action.href}
                        color={action.color}
                        badge={action.badge}
                    />
                ))}
            </div>

            {/* Alt Bilgi */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Admin yetkileriniz ile tüm sistem işlemlerini yönetebilirsiniz
                    </p>
                </div>
            </div>
        </div>
    );
};