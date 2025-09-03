// src/app/house/[id]/page.tsx
'use client';

import React from 'react';
import { PropertyDetail } from '@/components/property/PropertyDetail';

interface HouseDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function HouseDetailPage({ params }: HouseDetailPageProps) {
    const resolvedParams = React.use(params);
    return <PropertyDetail propertyId={parseInt(resolvedParams.id)} />;
}