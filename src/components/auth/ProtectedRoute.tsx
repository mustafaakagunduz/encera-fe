'use client';

// src/components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Role, roleUtils } from '@/utils/roleUtils';
import { RootState } from '@/store/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requiredRoles?: Role[];
    fallbackPath?: string;
    loadingComponent?: React.ReactNode;
}

const DefaultLoadingComponent = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Yükleniyor...</p>
        </div>
    </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  children,
                                                                  requireAuth = true,
                                                                  requiredRoles = [],
                                                                  fallbackPath = '/authentication',
                                                                  loadingComponent = <DefaultLoadingComponent />,
                                                              }) => {
    const { user, isAuthenticated } = useAuth();
    const { isHydrated } = useSelector((state: RootState) => state.auth);
    const { tokenStatus } = useTokenRefresh();
    const router = useRouter();

    useEffect(() => {
        // Don't redirect until auth state is hydrated
        if (!isHydrated) {
            return;
        }

        // Authentication check
        if (requireAuth && !isAuthenticated) {
            router.push(fallbackPath);
            return;
        }

        // Token validity check - if authenticated but token is invalid, logout
        if (isAuthenticated && !tokenStatus.isValid) {
            console.log('Token is invalid, redirecting to authentication');
            router.push(fallbackPath);
            return;
        }

        // Role check
        if (isAuthenticated && requiredRoles.length > 0) {
            const hasRequiredRole = roleUtils.hasAnyRole(user, requiredRoles);

            if (!hasRequiredRole) {
                // Redirect to appropriate page based on user role
                if (roleUtils.isAdmin(user)) {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/'); // Ana sayfaya yönlendir
                }
                return;
            }
        }

        // Check if user is disabled
        if (isAuthenticated && !roleUtils.isActiveUser(user)) {
            router.push('/account-disabled');
            return;
        }
    }, [isHydrated, isAuthenticated, user, requireAuth, requiredRoles, router, fallbackPath, tokenStatus.isValid]);

    // Show loading while hydrating or checking authentication
    if (!isHydrated || (requireAuth && !isAuthenticated)) {
        return loadingComponent as React.ReactElement;
    }

    // Show loading while checking roles
    if (isAuthenticated && requiredRoles.length > 0) {
        const hasRequiredRole = roleUtils.hasAnyRole(user, requiredRoles);
        if (!hasRequiredRole) {
            return loadingComponent as React.ReactElement;
        }
    }

    // Show loading if user is disabled
    if (isAuthenticated && !roleUtils.isActiveUser(user)) {
        return loadingComponent as React.ReactElement;
    }

    return <>{children}</>;
};