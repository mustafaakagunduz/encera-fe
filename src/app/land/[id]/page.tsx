// src/app/land/[id]/page.tsx
'use client';

import React from 'react';
import { PropertyDetail } from '@/components/property/PropertyDetail';

interface LandDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function LandDetailPage({ params }: LandDetailPageProps) {
    const resolvedParams = React.use(params);
    return <PropertyDetail propertyId={parseInt(resolvedParams.id)} />;
}