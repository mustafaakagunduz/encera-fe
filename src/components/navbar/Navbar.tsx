// src/components/navbar/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from "@/context/LanguageContext";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { ChevronDown, User, Globe } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

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

    // Orta grup navigasyon öğeleri (Anasayfa kaldırıldı)
    const centerNavItems = [
        { key: 'navbar.listings', href: '/house' },
        { key: 'navbar.jobs', href: '/commercial' },
        { key: 'navbar.land', href: '/land' },
        { key: 'navbar.rental', href: '/daily-rental' },
    ];

    const handleLanguageChange = (lang: 'tr' | 'en') => {
        setLanguage(lang);
        setIsLanguageMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
        router.push('/');
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-main-row">
                    {/* Sol grup - Logo */}
                    <div className="navbar-left-group">
                        <Link href="/" className="navbar-logo">
                            {t('navbar.brand')}
                        </Link>
                    </div>

                    {/* Orta grup - Ana navigasyon (Desktop'ta ortalanmış) */}
                    <div className="navbar-center-group">
                        {centerNavItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="navbar-nav-link"
                            >
                                {t(item.key)}
                            </Link>
                        ))}
                    </div>

                    {/* Sağ grup - Kullanıcı kontrolleri */}
                    <div className="navbar-right-group">
                        {/* Dil seçici */}
                        <div className="relative" ref={languageMenuRef}>
                            <button
                                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                                className="navbar-language-button"
                                aria-label="Select Language"
                            >
                                <Globe className="w-5 h-5" />
                            </button>

                            {isLanguageMenuOpen && (
                                <div className="navbar-dropdown">
                                    <button
                                        onClick={() => handleLanguageChange('tr')}
                                        className={`navbar-dropdown-item ${
                                            language === 'tr' ? 'active' : ''
                                        }`}
                                    >
                                        🇹🇷 Türkçe
                                    </button>
                                    <button
                                        onClick={() => handleLanguageChange('en')}
                                        className={`navbar-dropdown-item ${
                                            language === 'en' ? 'active' : ''
                                        }`}
                                    >
                                        🇺🇸 English
                                    </button>
                                </div>
                            )}
                        </div>

                        {isAuthenticated && user ? (
                            <>
                                {/* Kullanıcı menüsü */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="navbar-user-button"
                                    >
                                        <div className="navbar-user-avatar">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {user.firstName} {user.lastName}
                                        </span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="navbar-dropdown user-dropdown">
                                            <Link
                                                href="/profile"
                                                className="navbar-dropdown-item"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.profile')}
                                            </Link>
                                            <Link
                                                href="/my-listings"
                                                className="navbar-dropdown-item"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.my-listings')}
                                            </Link>
                                            <Link
                                                href="/favorites"
                                                className="navbar-dropdown-item"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.favorites')}
                                            </Link>
                                            <Link
                                                href="/messages"
                                                className="navbar-dropdown-item"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.messages')}
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="navbar-dropdown-item"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                {t('navbar.settings')}
                                            </Link>
                                            <div className="navbar-dropdown-divider" />
                                            <button
                                                className="navbar-dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                {t('navbar.logout')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* İlan ver butonu */}
                                <Link
                                    href="/create-listing"
                                    className="navbar-create-listing-button"
                                >
                                    {t('navbar.create-listing')}
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Giriş ve Kayıt butonları */}
                                <Link
                                    href="/authentication"
                                    className="navbar-auth-link"
                                >
                                    {t('navbar.login')}
                                </Link>

                                <Link
                                    href="/create-listing"
                                    className="navbar-create-listing-button"
                                >
                                    {t('navbar.create-listing')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobil menü placeholder */}
            <div className="navbar-mobile-placeholder">
                {/* Mobil navigasyon buraya eklenebilir */}
            </div>
        </nav>
    );
};

export default Navbar;