'use client';

// src/components/auth/AdminRoute.tsx
import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '@/utils/roleUtils';

interface AdminRouteProps {
    children: React.ReactNode;
    fallbackPath?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
                                                          children,
                                                          fallbackPath = '/authentication',
                                                      }) => {
    return (
        <ProtectedRoute
            requireAuth={true}
            requiredRoles={[Role.ADMIN]}
            fallbackPath={fallbackPath}
        >
            {children}
        </ProtectedRoute>
    );
};