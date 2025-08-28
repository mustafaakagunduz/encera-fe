'use client';

// src/app/admin/properties/page.tsx
import React, { useState } from 'react';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PropertyStats } from '@/components/admin/properties/PropertyStats';
import { PropertyTabs } from '@/components/admin/properties/PropertyTabs';

export default function AdminPropertiesPage() {
    return (
        <AdminRoute>
            <AdminLayout
                title="İlan Yönetimi"
                subtitle="Tüm ilanları görüntüle, onayla ve yönet"
            >
                <div className="space-y-6">
                    {/* İlan İstatistikleri */}
                    <PropertyStats />

                    {/* İlan Yönetimi Sekmeleri */}
                    <PropertyTabs />
                </div>
            </AdminLayout>
        </AdminRoute>
    );
}