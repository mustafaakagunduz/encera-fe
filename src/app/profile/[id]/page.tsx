// src/app/profile/[id]/page.tsx
'use client';

import React from 'react';
import { PublicProfilePage } from '@/components/profile/PublicProfilePage';

interface PublicProfilePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PublicProfile({ params }: PublicProfilePageProps) {
    const resolvedParams = React.use(params);
    return <PublicProfilePage userId={parseInt(resolvedParams.id)} />;
}