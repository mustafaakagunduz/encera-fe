'use client';

// src/components/admin/AdminSidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { roleUtils } from '@/utils/roleUtils';
import {
    LayoutDashboard,
    Users,
    Building,
    AlertTriangle,
    BarChart3,
    X,
    Settings,
    LogOut,
    Home
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const iconMap = {
    LayoutDashboard,
    Users,
    Building,
    AlertTriangle,
    BarChart3,
    Settings,
    Home,
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
                                                              isOpen,
                                                              onClose,
                                                          }) => {
    const pathname = usePathname();
    const { user } = useAuth();
    const dispatch = useDispatch();

    const navigationItems = roleUtils.getAdminNavItems(user);

    const handleLogout = () => {
        dispatch(logout());
        onClose();
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center">
                        <Link href="/admin/dashboard" className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                <span className="text-sm font-semibold text-white">P</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">PAPP Admin</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {/* Back to Site */}
                                    <li>
                                        <Link
                                            href="/"
                                            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                                        >
                                            <Home className="h-5 w-5 shrink-0" />
                                            Siteye Dön
                                        </Link>
                                    </li>

                                    {/* Admin Navigation Items */}
                                    {navigationItems.map((item) => {
                                        const Icon = iconMap[item.icon as keyof typeof iconMap];
                                        const isActive = pathname === item.href;

                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={`${
                                                        isActive
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                                    } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors`}
                                                >
                                                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>

                            {/* Bottom Section */}
                            <li className="mt-auto">
                                <ul role="list" className="-mx-2 space-y-1">
                                    <li>
                                        <Link
                                            href="/admin/settings"
                                            className={`${
                                                pathname === '/admin/settings'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                            } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors`}
                                        >
                                            <Settings className="h-5 w-5 shrink-0" />
                                            Ayarlar
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-700 hover:text-red-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors w-full text-left"
                                        >
                                            <LogOut className="h-5 w-5 shrink-0" />
                                            Çıkış Yap
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`relative z-50 lg:hidden ${isOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 flex">
                    <div className="relative mr-16 flex w-full max-w-xs flex-1">
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                            <button
                                type="button"
                                className="-m-2.5 p-2.5"
                                onClick={onClose}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                            {/* Mobile Logo */}
                            <div className="flex h-16 shrink-0 items-center">
                                <Link href="/admin/dashboard" className="flex items-center space-x-3" onClick={onClose}>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                        <span className="text-sm font-semibold text-white">P</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">PAPP Admin</span>
                                </Link>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex flex-1 flex-col">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {/* Back to Site */}
                                            <li>
                                                <Link
                                                    href="/"
                                                    onClick={onClose}
                                                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                                                >
                                                    <Home className="h-5 w-5 shrink-0" />
                                                    Siteye Dön
                                                </Link>
                                            </li>

                                            {/* Mobile Admin Navigation Items */}
                                            {navigationItems.map((item) => {
                                                const Icon = iconMap[item.icon as keyof typeof iconMap];
                                                const isActive = pathname === item.href;

                                                return (
                                                    <li key={item.name}>
                                                        <Link
                                                            href={item.href}
                                                            onClick={onClose}
                                                            className={`${
                                                                isActive
                                                                    ? 'bg-blue-50 text-blue-700'
                                                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                                            } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors`}
                                                        >
                                                            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                                                            {item.name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>

                                    {/* Mobile Bottom Section */}
                                    <li className="mt-auto">
                                        <ul role="list" className="-mx-2 space-y-1">
                                            <li>
                                                <Link
                                                    href="/admin/settings"
                                                    onClick={onClose}
                                                    className={`${
                                                        pathname === '/admin/settings'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                                    } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors`}
                                                >
                                                    <Settings className="h-5 w-5 shrink-0" />
                                                    Ayarlar
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={handleLogout}
                                                    className="text-gray-700 hover:text-red-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors w-full text-left"
                                                >
                                                    <LogOut className="h-5 w-5 shrink-0" />
                                                    Çıkış Yap
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};