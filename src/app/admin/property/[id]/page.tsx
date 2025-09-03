'use client';

import React from 'react';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminPropertyDetail } from '@/components/admin/properties/AdminPropertyDetail';

interface AdminPropertyPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function AdminPropertyPage({ params }: AdminPropertyPageProps) {
    const resolvedParams = React.use(params);
    
    return (
        <AdminRoute>
            <AdminPropertyDetail propertyId={parseInt(resolvedParams.id)} />
        </AdminRoute>
    );
}