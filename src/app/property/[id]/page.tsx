import React from 'react';
import { PropertyDetailClient } from './PropertyDetailClient';
import { generateSEOMetadata } from '@/components/seo/SEOHead';

interface PropertyPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Dynamic metadata generation - Server Component
export async function generateMetadata({ params }: PropertyPageProps) {
    const resolvedParams = await params;
    const propertyId = resolvedParams.id;

    // TODO: Property detaylarını API'den çek
    // const property = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`)
    //   .then(res => res.json())

    return generateSEOMetadata({
        title: `Emlak İlanı #${propertyId}`,
        description: `Detaylı emlak ilanı bilgileri. İlan ID: ${propertyId}`,
        url: `https://encera.com.tr/property/${propertyId}`,
        type: 'article',
        // image: property?.images?.[0] || '/images/property-default.jpg'
    });
}

// Server Component - metadata için
export default async function PropertyPage({ params }: PropertyPageProps) {
    const resolvedParams = await params;
    return <PropertyDetailClient propertyId={parseInt(resolvedParams.id)} />;
}