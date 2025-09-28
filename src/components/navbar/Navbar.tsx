// src/components/navbar/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { ChevronDown, User, Globe, MessageSquare, ArrowRight, Menu, X, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/ui/notification-bell';
import { useGetUnreadCountQuery } from '@/store/api/messageApi';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { t, language, changeLanguage, isReady } = useAppTranslation();
    const { isAuthenticated, user, isHydrated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [isHiding, setIsHiding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const languageMenuRef = useRef<HTMLDivElement>(null);

    // Okunmamış mesaj sayısını çek
    const { data: unreadData } = useGetUnreadCountQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: 30000, // 30 saniyede bir yenile
    });

    // Scroll detection - sadece ana sayfa haricinde
    useEffect(() => {
        if (pathname === '/') return; // Ana sayfada scroll hide yok

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Navbar visibility kontrolü
            if (currentScrollY < 10) {
                // Sayfa tepesindeyse her zaman göster
                setIsNavbarVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scroll down - gizle (100px threshold)
                setIsNavbarVisible(false);
            } else if (currentScrollY < lastScrollY) {
                // Scroll up - göster
                setIsNavbarVisible(true);
            }

            // Scroll-to-top buton kontrolü (ana sayfa hariç)
            if (pathname !== '/') {
                const shouldShow = currentScrollY > 300;

                if (!shouldShow && showScrollToTop && !isHiding) {
                    // Buton kaybolacaksa önce hiding animasyonunu başlat
                    setIsHiding(true);
                    setTimeout(() => {
                        setShowScrollToTop(false);
                        setIsHiding(false);
                    }, 400); // slideOutDown animasyon süresi
                } else if (shouldShow && !showScrollToTop) {
                    // Buton görünecekse direkt göster
                    setShowScrollToTop(true);
                }
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, pathname]);

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

    // Orta grup navigasyon öğeleri (şimdi arama çubuğu olacak)
    const propertyTypeItems = [
        { key: 'navbar.listings', href: '/house' },
        { key: 'navbar.jobs', href: '/commercial' },
        { key: 'navbar.land', href: '/land' },
    ];

    const handleLanguageChange = (lang: 'tr' | 'en') => {
        changeLanguage(lang);
        setIsLanguageMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        setIsUserMenuOpen(false);
        router.push('/');
        // Sayfayı yenile
        window.location.reload();
    };

    const handleCreateListing = () => {
        if (!isAuthenticated) {
            router.push('/authentication');
        } else {
            router.push('/create-listing');
        }
    };

    const toggleMobileSection = (section: string) => {
        setMobileExpandedSection(mobileExpandedSection === section ? null : section);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setMobileExpandedSection(null);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleNavbarSearch = () => {
        if (!searchQuery.trim()) return;

        console.log('🔍 Navbar search triggered:', searchQuery.trim());
        const encodedQuery = encodeURIComponent(searchQuery.trim());
        router.push(`/search?q=${encodedQuery}`);

        // Arama sonuçları sayfasına geçerken arama çubuğunu temizle ve focus'u kaldır
        setSearchQuery('');

        // Input elementinin focus'unu kaldır
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    const handleNavbarKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNavbarSearch();
        }
    };

    const brandLabel = isReady ? t('navbar.brand') : 'PAPP';

    return (
        <>
        <nav className={`unified-navbar-container ${pathname !== '/' ? 'navbar-with-extra-padding navbar-static' : 'navbar-fixed'} ${pathname !== '/' && !isNavbarVisible ? 'navbar-hidden' : ''}`}>
            {/* Main Navbar Section */}
            <div className="navbar-content">
                <div className="navbar-main-row">
                    {/* Sol grup - Logo */}
                    <div className="navbar-left-group">
                        <Link href="/" className="navbar-logo" aria-label={brandLabel}>
                            <Image
                                src="/images/logo.png"
                                alt={brandLabel}
                                width={157}
                                height={90}
                                priority
                                className="navbar-logo-image"
                            />
                        </Link>
                    </div>

                    {/* Orta grup - Arama çubuğu */}
                    <div className="navbar-center-group" style={{ maxWidth: 'none', width: '100%' }}>
                        <div className="navbar-search-wrapper" style={{ maxWidth: 'clamp(600px, 65vw, 1200px)' }}>
                            <div className="relative bg-blue-200/40 backdrop-blur-md rounded-full border border-blue-300/50 shadow-lg hover:shadow-xl transition-all duration-300 p-1">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleNavbarKeyPress}
                                        placeholder={isReady ? t('home.company-intro.cta-button') : 'Gayrimenkul Ara...'}
                                        className="w-full bg-transparent border-none outline-none px-4 py-2 text-white placeholder-white focus:placeholder-transparent font-medium text-base"
                                    />
                                    <button
                                        onClick={handleNavbarSearch}
                                        className="bg-blue-900 hover:bg-blue-800 rounded-full p-2 transition-all duration-300 transform hover:scale-105 group flex-shrink-0"
                                    >
                                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ grup - Desktop kontrolleri */}
                    <div className="navbar-right-group desktop-only">
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

                        {/* Mesaj bildirimi - Sadece giriş yapmış kullanıcılar için */}
                        {isHydrated && isAuthenticated && (
                            <Link
                                href="/messages"
                                className="navbar-language-button relative"
                                title={isReady ? 'Mesajlar' : 'Messages'}
                            >
                                <MessageSquare className="w-5 h-5" />
                                {unreadData && unreadData.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium animate-pulse">
                                        {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                                    </div>
                                )}
                            </Link>
                        )}

                        {/* Bildirim Bell'i - Sadece giriş yapmış kullanıcılar için */}
                        {isHydrated && isAuthenticated && <NotificationBell />}

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
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={user.profilePictureUrl || ''} alt={`${user.firstName} ${user.lastName}`} />
                                                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
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
                                                        className="navbar-dropdown-item flex items-center justify-between"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <span>{isReady ? t('navbar.messages') : 'Mesajlar'}</span>
                                                        {unreadData && unreadData.unreadCount > 0 && (
                                                            <div className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium ml-2">
                                                                {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                                                            </div>
                                                        )}
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

                    {/* Mobile Hamburger Button */}
                    <div className="mobile-only">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="navbar-language-button"
                            aria-label="Toggle Mobile Menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay">
                    <div className="mobile-menu-content">
                        {/* Language Section */}
                        <div className="mobile-menu-section">
                            <button
                                onClick={() => toggleMobileSection('language')}
                                className="mobile-menu-section-header"
                            >
                                <Globe className="w-5 h-5" />
                                <span>{isReady ? 'Dil' : 'Language'}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedSection === 'language' ? 'rotate-180' : ''}`} />
                            </button>
                            {mobileExpandedSection === 'language' && (
                                <div className="mobile-menu-section-content">
                                    <button
                                        onClick={() => {
                                            handleLanguageChange('tr');
                                            closeMobileMenu();
                                        }}
                                        className={`mobile-menu-item ${language === 'tr' ? 'active' : ''}`}
                                    >
                                        🇹🇷 Türkçe
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLanguageChange('en');
                                            closeMobileMenu();
                                        }}
                                        className={`mobile-menu-item ${language === 'en' ? 'active' : ''}`}
                                    >
                                        🇺🇸 English
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Messages Link */}
                        {isHydrated && isAuthenticated && (
                            <Link
                                href="/messages"
                                className="mobile-menu-link"
                                onClick={closeMobileMenu}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>{isReady ? 'Mesajlar' : 'Messages'}</span>
                                {unreadData && unreadData.unreadCount > 0 && (
                                    <div className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium ml-auto">
                                        {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                                    </div>
                                )}
                            </Link>
                        )}

                        {/* Notifications Section */}
                        {isHydrated && isAuthenticated && (
                            <div className="mobile-menu-section">
                                <button
                                    onClick={() => toggleMobileSection('notifications')}
                                    className="mobile-menu-section-header"
                                >
                                    <span className="w-5 h-5 flex items-center">🔔</span>
                                    <span>{isReady ? 'Bildirimler' : 'Notifications'}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedSection === 'notifications' ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileExpandedSection === 'notifications' && (
                                    <div className="mobile-menu-section-content">
                                        <div className="mobile-menu-item">
                                            {isReady ? 'Henüz bildirim yok' : 'No notifications yet'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Section */}
                        {isHydrated && isAuthenticated && user && (
                            <div className="mobile-menu-section">
                                <button
                                    onClick={() => toggleMobileSection('profile')}
                                    className="mobile-menu-section-header"
                                >
                                    <Avatar className="w-5 h-5">
                                        <AvatarImage src={user.profilePictureUrl || ''} alt={`${user.firstName} ${user.lastName}`} />
                                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{user.firstName} {user.lastName}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpandedSection === 'profile' ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileExpandedSection === 'profile' && (
                                    <div className="mobile-menu-section-content">
                                        <Link href="/profile" className="mobile-menu-item" onClick={closeMobileMenu}>
                                            {isReady ? t('navbar.profile') : 'Profil'}
                                        </Link>
                                        <Link href="/my-listings" className="mobile-menu-item" onClick={closeMobileMenu}>
                                            {isReady ? t('navbar.my-listings') : 'İlanlarım'}
                                        </Link>
                                        <Link href="/favorites" className="mobile-menu-item" onClick={closeMobileMenu}>
                                            {isReady ? t('navbar.favorites') : 'Favoriler'}
                                        </Link>
                                        <Link href="/settings" className="mobile-menu-item" onClick={closeMobileMenu}>
                                            {isReady ? t('navbar.settings') : 'Ayarlar'}
                                        </Link>
                                        {user?.role === 'ADMIN' && (
                                            <Link href="/admin/dashboard" className="mobile-menu-item admin-item" onClick={closeMobileMenu}>
                                                🛡️ Admin Panel
                                            </Link>
                                        )}
                                        <button className="mobile-menu-item logout-item" onClick={handleLogout}>
                                            {isReady ? t('navbar.logout') : 'Çıkış Yap'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Create Listing Button */}
                        <button
                            onClick={() => {
                                handleCreateListing();
                                closeMobileMenu();
                            }}
                            className="mobile-menu-cta-button"
                        >
                            {isReady ? t('navbar.create-listing') : 'İlan Ver'}
                        </button>

                        {/* Auth Links for non-authenticated users */}
                        {isHydrated && !isAuthenticated && (
                            <Link
                                href="/authentication"
                                className="mobile-menu-link"
                                onClick={closeMobileMenu}
                            >
                                <User className="w-5 h-5" />
                                <span>{isReady ? t('navbar.login') : 'Üye Ol / Giriş Yap'}</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Property Type Navigation Section - Sadece ana sayfada göster */}
            {pathname === '/' && (
                <div className="property-type-section">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center py-2">
                            <div className="flex items-center space-x-8">
                                {propertyTypeItems.map((item) => (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className="property-type-link"
                                    >
                                        {isReady ? t(item.key) : getStaticText(item.key)}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>

        {/* Scroll to Top Button - Ana sayfa haricinde */}
        {pathname !== '/' && showScrollToTop && (
            <button
                onClick={scrollToTop}
                className={`scroll-to-top-btn ${isHiding ? 'hiding' : ''}`}
                aria-label="Scroll to top"
            >
                <ChevronUp className="w-5 h-5" />
            </button>
        )}
    </>
    );
};

// Hydration sırasında kullanılacak static metinler (Türkçe default)
const getStaticText = (key: string): string => {
    const staticTexts: Record<string, string> = {
        'navbar.listings': 'Konut',
        'navbar.jobs': 'İş Yeri',
        'navbar.land': 'Arsa',
    };
    return staticTexts[key] || key;
};

export default Navbar;
