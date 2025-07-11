'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {useLanguage} from "@/context/LanguageContext";
import { ChevronDown, User, Globe } from 'lucide-react';

interface NavbarProps {
    isLoggedIn?: boolean;
    user?: {
        firstName: string;
        lastName: string;
    };
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, user }) => {
    const { language, setLanguage, t } = useLanguage();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const languageMenuRef = useRef<HTMLDivElement>(null);

    // Menüleri dışarı tıklayınca kapatma
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
                setIsLanguageMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navItems = [
        { key: 'navbar.home', href: '/' },
        { key: 'navbar.listings', href: '/house' },
        { key: 'navbar.jobs', href: '/commercial' },
        { key: 'navbar.land', href: '/land' },
        { key: 'navbar.rental', href: '/daily-rental' },
    ];

    const handleLanguageChange = (lang: 'tr' | 'en') => {
        setLanguage(lang);
        setIsLanguageMenuOpen(false);
    };

    return (
        <nav className="bg-blue-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold hover:text-blue-200 hover:scale-110 transition-all duration-300 transform inline-block">
                            {t('navbar.brand')}
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="px-4 py-2 rounded-md text-m  font-medium hover:bg-blue-200 hover:text-blue-800 hover:scale-105 transition-all duration-200 transform inline-block"
                            >
                                {t(item.key)}
                            </Link>
                        ))}
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-3">
                        {/* Language Selector */}
                        <div className="relative" ref={languageMenuRef}>
                            <button
                                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                                className="px-4 py-2 rounded-md text-sm font-medium hover:scale-105 transition-all duration-200 transform inline-block hover:bg-blue-200 hover:cursor-pointer hover:text-blue-800 transition-colors duration-200"
                                aria-label="Select Language"
                            >
                                <Globe className="w-5 h-5" />
                            </button>

                            {isLanguageMenuOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50">
                                    <button
                                        onClick={() => handleLanguageChange('tr')}
                                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                                            language === 'tr' ? 'bg-blue-50 text-blue-700' : ''
                                        }`}
                                    >
                                        🇹🇷 Türkçe
                                    </button>
                                    <button
                                        onClick={() => handleLanguageChange('en')}
                                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                                            language === 'en' ? 'bg-blue-50 text-blue-700' : ''
                                        }`}
                                    >
                                        🇺🇸 English
                                    </button>
                                </div>
                            )}
                        </div>

                        {isLoggedIn && user ? (
                            <>
                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.profile')}
                                            </Link>
                                            <Link
                                                href="/my-listings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.my-listings')}
                                            </Link>
                                            <Link
                                                href="/favorites"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.favorites')}
                                            </Link>
                                            <Link
                                                href="/messages"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.messages')}
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.settings')}
                                            </Link>
                                            <hr className="my-1" />
                                            <button
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => {
                                                    setIsUserMenuOpen(false);
                                                    // Logout logic here
                                                }}
                                            >
                                                {t('navbar.logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Create Listing Button */}
                                <Link
                                    href="/create-listing"
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:scale-105 transform inline-block duration-200 "
                                >
                                    {t('navbar.create-listing')}
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Login and Register buttons */}
                                <Link
                                    href="/authentication"
                                    className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200 hover:scale-105 transition-all duration-200 transform inline-block hover:text-blue-800  "
                                >
                                    {t('navbar.login')}
                                </Link>

                                <Link
                                    href="/create-listing"
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    {t('navbar.create-listing')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu (optional - can be added later) */}
            <div className="md:hidden">
                {/* Mobile navigation would go here */}
            </div>
        </nav>
    );
};

export default Navbar;