'use client';

// src/components/admin/properties/PropertyTabs.tsx
import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Building } from 'lucide-react';
import {
    useGetPendingApprovalPropertiesQuery,
    useGetAllAdminPropertiesQuery,
    useGetReportedPropertiesQuery,
    useGetApprovedPropertiesQuery
} from '@/store/api/adminApi';
import { PendingPropertiesTable } from './PendingPropertiesTable';
import { ApprovedPropertiesTable } from './ApprovedPropertiesTable';
import { ReportedPropertiesTable } from './ReportedPropertiesTable';
import { AllPropertiesTable } from './AllPropertiesTable';

type TabType = 'pending' | 'approved' | 'reported' | 'all';

interface Tab {
    id: TabType;
    name: string;
    icon: React.ReactNode;
    count?: number;
}

export const PropertyTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    // API calls to get real counts
    const { data: pendingData } = useGetPendingApprovalPropertiesQuery({ page: 0, size: 1 });
    const { data: allPropertiesData } = useGetAllAdminPropertiesQuery({ page: 0, size: 1 });
    const { data: reportedData } = useGetReportedPropertiesQuery({ page: 0, size: 1 });
    const { data: approvedData } = useGetApprovedPropertiesQuery({ page: 0, size: 1 });

    const tabs: Tab[] = [
        {
            id: 'pending',
            name: 'Onay Bekleyen',
            icon: <Clock className="h-5 w-5" />,
            count: pendingData?.totalElements
        },
        {
            id: 'approved',
            name: 'Onaylanmış',
            icon: <CheckCircle className="h-5 w-5" />,
            count: approvedData?.totalElements
        },
        {
            id: 'reported',
            name: 'Şikayetli',
            icon: <AlertTriangle className="h-5 w-5" />,
            count: reportedData?.totalElements
        },
        {
            id: 'all',
            name: 'Tüm İlanlar',
            icon: <Building className="h-5 w-5" />,
            count: allPropertiesData?.totalElements
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending':
                return <PendingPropertiesTable />;
            case 'approved':
                return <ApprovedPropertiesTable />;
            case 'reported':
                return <ReportedPropertiesTable />;
            case 'all':
                return <AllPropertiesTable />;
            default:
                return <PendingPropertiesTable />;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                        >
                            {tab.icon}
                            {tab.name}
                            {tab.count !== undefined && (
                                <span
                                    className={`${
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                    } ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};