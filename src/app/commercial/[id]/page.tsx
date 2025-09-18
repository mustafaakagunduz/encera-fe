// src/app/commercial/[id]/page.tsx
'use client';

import React from 'react';
import { PropertyDetail } from '@/components/property/PropertyDetail';

interface CommercialDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function CommercialDetailPage({ params }: CommercialDetailPageProps) {
    const resolvedParams = React.use(params);
    return <PropertyDetail propertyId={parseInt(resolvedParams.id)} />;
}