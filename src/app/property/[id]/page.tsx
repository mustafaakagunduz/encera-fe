'use client';

import React from 'react';
import { PropertyDetail } from '@/components/property/PropertyDetail';

interface PropertyPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PropertyPage({ params }: PropertyPageProps) {
    const resolvedParams = React.use(params);
    return <PropertyDetail propertyId={parseInt(resolvedParams.id)} />;
}