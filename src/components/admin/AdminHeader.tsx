'use client';

// src/components/admin/AdminHeader.tsx
import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { roleUtils } from '@/utils/roleUtils';

interface AdminHeaderProps {
    title?: string;
    subtitle?: string;
    onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
                                                            title,
                                                            subtitle,
                                                            onMenuClick,
                                                        }) => {
    const { user } = useAuth();

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left section */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="lg:hidden -ml-2 p-2 text-gray-500 hover:text-gray-900"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Page title */}
                    <div className="flex flex-col">
                        {title && (
                            <h1 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="hidden md:block">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Ara..."
                                className="block w-full rounded-md border-0 bg-gray-50 py-1.5 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    {/* Notifications */}
                    <button
                        type="button"
                        className="relative p-1 text-gray-400 hover:text-gray-500"
                    >
                        <Bell className="h-6 w-6" />
                        {/* Notification badge */}
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            3
                        </span>
                    </button>

                    {/* User profile */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden sm:block text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {roleUtils.getUserDisplayName(user)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {roleUtils.getRoleDisplayName(user?.role || '')}
                            </div>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumb - Optional */}
            {(title || subtitle) && (
                <div className="bg-gray-50 px-4 py-2 sm:px-6 lg:px-8">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <div>
                                    <a href="/admin/dashboard" className="text-gray-400 hover:text-gray-500">
                                        <span className="sr-only">Dashboard</span>
                                        Admin Panel
                                    </a>
                                </div>
                            </li>
                            {title && (
                                <>
                                    <li>
                                        <div className="flex items-center">
                                            <span className="text-gray-400">/</span>
                                            <span className="ml-2 text-sm font-medium text-gray-900">
                                                {title}
                                            </span>
                                        </div>
                                    </li>
                                </>
                            )}
                        </ol>
                    </nav>
                </div>
            )}
        </div>
    );
};