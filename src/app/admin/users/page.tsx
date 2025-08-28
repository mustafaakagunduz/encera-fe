'use client';

// src/app/admin/users/page.tsx
import React from 'react';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagementTable } from '@/components/admin/users/UserManagementTable';
import { UserStats } from '@/components/admin/users/UserStats';

export default function AdminUsersPage() {
    return (
        <AdminRoute>
            <AdminLayout
                title="Kullanıcı Yönetimi"
                subtitle="Tüm kullanıcıları görüntüle, düzenle ve yönet"
            >
                <div className="space-y-6">
                    {/* Kullanıcı İstatistikleri */}
                    <UserStats />

                    {/* Kullanıcı Yönetimi Tablosu */}
                    <UserManagementTable />
                </div>
            </AdminLayout>
        </AdminRoute>
    );
}