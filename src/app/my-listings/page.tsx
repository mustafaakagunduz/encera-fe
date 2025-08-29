'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MyListings } from '@/components/user/MyListings';

export default function MyListingsPage() {
    return (
        <ProtectedRoute>
            <MyListings />
        </ProtectedRoute>
    );
}