'use client';

// src/app/admin/dashboard/page.tsx
import React from 'react';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/dashboard/DashboardStats';
import { RecentActivities } from '@/components/admin/dashboard/RecentActivities';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';

export default function AdminDashboardPage() {
    return (
        <AdminRoute>
            <AdminLayout
                title="Dashboard"
                subtitle="Sistem genel durumu ve önemli metriklerin özeti"
            >
                <div className="space-y-8">
                    {/* İstatistik Kartları */}
                    <DashboardStats />

                    {/* Alt Bölüm - İki Sütun */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Son Aktiviteler */}
                        <div className="lg:col-span-2">
                            <RecentActivities />
                        </div>

                        {/* Hızlı İşlemler */}
                        <div className="lg:col-span-1">
                            <QuickActions />
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </AdminRoute>
    );
}