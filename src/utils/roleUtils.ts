// src/utils/roleUtils.ts

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export const roleUtils = {
    /**
     * Check if user has specific role
     */
    hasRole: (user: User | null, role: Role): boolean => {
        return user?.role === role;
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (user: User | null, roles: Role[]): boolean => {
        if (!user) return false;
        return roles.some(role => user.role === role);
    },

    /**
     * Check if user is admin
     */
    isAdmin: (user: User | null): boolean => {
        return user?.role === Role.ADMIN;
    },

    /**
     * Check if user is regular user
     */
    isUser: (user: User | null): boolean => {
        return user?.role === Role.USER;
    },

    /**
     * Check if user is authenticated and enabled
     */
    isActiveUser: (user: User | null): boolean => {
        return !!(user && user.enabled);
    },

    /**
     * Get user display name
     */
    getUserDisplayName: (user: User | null): string => {
        if (!user) return 'Guest';
        return `${user.firstName} ${user.lastName}`;
    },

    /**
     * Get role display name
     */
    getRoleDisplayName: (role: string): string => {
        switch (role) {
            case Role.ADMIN:
                return 'Yönetici';
            case Role.USER:
                return 'Kullanıcı';
            default:
                return 'Bilinmeyen';
        }
    },

    /**
     * Check if user can access admin panel
     */
    canAccessAdminPanel: (user: User | null): boolean => {
        return roleUtils.isAdmin(user) && roleUtils.isActiveUser(user);
    },

    /**
     * Check if user can manage other users
     */
    canManageUsers: (user: User | null): boolean => {
        return roleUtils.isAdmin(user);
    },

    /**
     * Check if user can manage properties
     */
    canManageProperties: (user: User | null): boolean => {
        return roleUtils.isAdmin(user);
    },

    /**
     * Check if user can view statistics
     */
    canViewStatistics: (user: User | null): boolean => {
        return roleUtils.isAdmin(user);
    },

    /**
     * Get admin navigation items based on user role
     */
    getAdminNavItems: (user: User | null) => {
        if (!roleUtils.canAccessAdminPanel(user)) return [];

        return [
            {
                name: 'Dashboard',
                href: '/admin/dashboard',
                icon: 'LayoutDashboard',
            },
            {
                name: 'Kullanıcılar',
                href: '/admin/users',
                icon: 'Users',
                permission: roleUtils.canManageUsers(user),
            },
            {
                name: 'İlanlar',
                href: '/admin/properties',
                icon: 'Building',
                permission: roleUtils.canManageProperties(user),
            },
            {
                name: 'Şikayetler',
                href: '/admin/reports',
                icon: 'AlertTriangle',
                permission: roleUtils.canManageProperties(user),
            },
            {
                name: 'İstatistikler',
                href: '/admin/statistics',
                icon: 'BarChart3',
                permission: roleUtils.canViewStatistics(user),
            },
        ].filter(item => item.permission !== false);
    },
};