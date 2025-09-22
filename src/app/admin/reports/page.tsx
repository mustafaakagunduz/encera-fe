'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ComplaintManagement } from '@/components/admin/complaints/ComplaintManagement';

export default function ReportsPage() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Şikayet Yönetimi</h1>
                    <p className="text-gray-600 mt-1">
                        Gelen şikayetleri inceleyin ve gerekli aksiyonları alın
                    </p>
                </div>

                <ComplaintManagement />
            </div>
        </AdminLayout>
    );
}