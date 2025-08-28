'use client';

// src/components/admin/dashboard/RecentActivities.tsx
import React from 'react';
import { Clock, User, Building, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { useGetAllUsersQuery, useGetPendingApprovalPropertiesQuery, useGetReportedPropertiesQuery } from '@/store/api/adminApi';
import Link from 'next/link';

interface ActivityItemProps {
    type: 'user_registered' | 'property_submitted' | 'property_reported' | 'property_approved';
    title: string;
    description: string;
    time: string;
    actionLink?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, title, description, time, actionLink }) => {
    const getIcon = () => {
        switch (type) {
            case 'user_registered':
                return <UserPlus className="h-5 w-5 text-green-600" />;
            case 'property_submitted':
                return <Building className="h-5 w-5 text-blue-600" />;
            case 'property_reported':
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            case 'property_approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'user_registered':
                return 'bg-green-50 border-green-200';
            case 'property_submitted':
                return 'bg-blue-50 border-blue-200';
            case 'property_reported':
                return 'bg-red-50 border-red-200';
            case 'property_approved':
                return 'bg-green-50 border-green-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const content = (
        <div className={`flex items-start p-4 border rounded-lg ${getBgColor()} hover:shadow-sm transition-shadow`}>
            <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
                <div className="flex items-center mt-2">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{time}</span>
                </div>
            </div>
        </div>
    );

    if (actionLink) {
        return (
            <Link href={actionLink} className="block hover:opacity-80 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
};

export const RecentActivities: React.FC = () => {
    const { data: users, isLoading: isUsersLoading } = useGetAllUsersQuery();
    const { data: pendingProperties, isLoading: isPendingLoading } = useGetPendingApprovalPropertiesQuery({ page: 0, size: 5 });
    const { data: reportedProperties, isLoading: isReportedLoading } = useGetReportedPropertiesQuery({ page: 0, size: 5 });

    const isLoading = isUsersLoading || isPendingLoading || isReportedLoading;

    // Mock activities - gerçek aktivite sistemi olana kadar
    const activities: ActivityItemProps[] = [
        {
            type: 'property_submitted',
            title: 'Yeni İlan Onay Bekliyor',
            description: 'Ankara Çankaya\'da 3+1 daire ilanı onay için bekliyor',
            time: '5 dakika önce',
            actionLink: '/admin/properties'
        },
        {
            type: 'user_registered',
            title: 'Yeni Kullanıcı Kaydı',
            description: 'Mehmet Yılmaz adlı kullanıcı sisteme kaydoldu',
            time: '15 dakika önce',
            actionLink: '/admin/users'
        },
        {
            type: 'property_reported',
            title: 'İlan Şikayet Edildi',
            description: 'İstanbul Kadıköy\'deki ilan için şikayet alındı',
            time: '30 dakika önce',
            actionLink: '/admin/reports'
        },
        {
            type: 'property_approved',
            title: 'İlan Onaylandı',
            description: 'Bursa Nilüfer\'deki villa ilanı onaylandı',
            time: '1 saat önce'
        },
        {
            type: 'user_registered',
            title: 'Yeni Kullanıcı Kaydı',
            description: 'Ayşe Demir adlı kullanıcı sisteme kaydoldu',
            time: '2 saat önce',
            actionLink: '/admin/users'
        },
        {
            type: 'property_submitted',
            title: 'Yeni İlan Onay Bekliyor',
            description: 'İzmir Bornova\'da ofis ilanı onay için bekliyor',
            time: '3 saat önce',
            actionLink: '/admin/properties'
        }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                <Link
                    href="/admin/activities"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Tümünü Gör
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start p-4 border rounded-lg animate-pulse">
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="ml-3 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <ActivityItem
                            key={index}
                            type={activity.type}
                            title={activity.title}
                            description={activity.description}
                            time={activity.time}
                            actionLink={activity.actionLink}
                        />
                    ))}
                </div>
            )}

            {activities.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
                </div>
            )}
        </div>
    );
};