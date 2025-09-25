'use client';

import React from 'react';
import { PropertyDetail } from '@/components/property/PropertyDetail';

interface PropertyDetailClientProps {
    propertyId: number;
}

export function PropertyDetailClient({ propertyId }: PropertyDetailClientProps) {
    return <PropertyDetail propertyId={propertyId} />;
}