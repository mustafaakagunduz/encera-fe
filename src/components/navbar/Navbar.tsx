// src/components/navbar/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { ChevronDown, User, Globe } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { t, language, changeLanguage, isReady } = useAppTranslation();
    const { isAuthenticated, user, isHydrated } = useAppSelector((state) => state.auth);
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
        changeLanguage(lang);
        setIsLanguageMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
        router.push('/');
    };

    const handleCreateListing = () => {
        if (!isAuthenticated) {
            router.push('/authentication');
        } else {
            router.push('/create-listing');
        }
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-main-row">
                    {/* Sol grup - Logo */}
                    <div className="navbar-left-group">
                        <Link href="/" className="navbar-logo">
                            {isReady ? t('navbar.brand') : 'PAPP'}
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
                                {isReady ? t(item.key) : getStaticText(item.key)}
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

                        {!isHydrated ? (
                            // Redux store henüz hydrate olmadı - static rendering
                            <>
                                <Link
                                    href="/authentication"
                                    className="navbar-auth-link"
                                >
                                    Üye Ol / Giriş Yap
                                </Link>
                                <Link
                                    href="/create-listing"
                                    className="navbar-create-listing-button"
                                >
                                    İlan Ver
                                </Link>
                            </>
                        ) : (
                            // Redux store hydrate oldu - dynamic rendering
                            <>
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
                                                        {isReady ? t('navbar.profile') : 'Profil'}
                                                    </Link>
                                                    <Link
                                                        href="/my-listings"
                                                        className="navbar-dropdown-item"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        {isReady ? t('navbar.my-listings') : 'İlanlarım'}
                                                    </Link>
                                                    <Link
                                                        href="/favorites"
                                                        className="navbar-dropdown-item"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        {isReady ? t('navbar.favorites') : 'Favoriler'}
                                                    </Link>
                                                    <Link
                                                        href="/messages"
                                                        className="navbar-dropdown-item"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        {isReady ? t('navbar.messages') : 'Mesajlar'}
                                                    </Link>
                                                    <Link
                                                        href="/settings"
                                                        className="navbar-dropdown-item"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        {isReady ? t('navbar.settings') : 'Ayarlar'}
                                                    </Link>

                                                    {/* Admin Panel Link - Sadece admin kullanıcılar için */}
                                                    {user?.role === 'ADMIN' && (
                                                        <>
                                                            <div className="navbar-dropdown-divider" />
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="navbar-dropdown-item"
                                                                onClick={() => setIsUserMenuOpen(false)}
                                                                style={{
                                                                    backgroundColor: '#dbeafe',
                                                                    color: '#1d4ed8',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                🛡️ Admin Panel
                                                            </Link>
                                                        </>
                                                    )}

                                                    <div className="navbar-dropdown-divider" />
                                                    <button
                                                        className="navbar-dropdown-item"
                                                        onClick={handleLogout}
                                                    >
                                                        {isReady ? t('navbar.logout') : 'Çıkış Yap'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* İlan ver butonu */}
                                        <button
                                            onClick={handleCreateListing}
                                            className="navbar-create-listing-button"
                                        >
                                            {isReady ? t('navbar.create-listing') : 'İlan Ver'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Giriş ve Kayıt butonları */}
                                        <Link
                                            href="/authentication"
                                            className="navbar-auth-link"
                                        >
                                            {isReady ? t('navbar.login') : 'Üye Ol / Giriş Yap'}
                                        </Link>

                                        <button
                                            onClick={handleCreateListing}
                                            className="navbar-create-listing-button"
                                        >
                                            {isReady ? t('navbar.create-listing') : 'İlan Ver'}
                                        </button>
                                    </>
                                )}
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

// Hydration sırasında kullanılacak static metinler (Türkçe default)
const getStaticText = (key: string): string => {
    const staticTexts: Record<string, string> = {
        'navbar.listings': 'Konut',
        'navbar.jobs': 'İş Yeri',
        'navbar.land': 'Arsa',
        'navbar.rental': 'Günlük Kiralık',
    };
    return staticTexts[key] || key;
};

export default Navbar;