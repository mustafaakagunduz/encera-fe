'use client';

import React, { useEffect, useState } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Building2, Users, MapPin, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompanyIntroSection: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isReady) {
            setIsVisible(true);
        }
    }, [isReady]);

    const stats = [
        {
            icon: Award,
            value: t('home.company-intro.stats.experience'),
            label: t('home.company-intro.stats.experience-label')
        },
        {
            icon: Building2,
            value: t('home.company-intro.stats.properties'),
            label: t('home.company-intro.stats.properties-label')
        },
        {
            icon: MapPin,
            value: t('home.company-intro.stats.cities'),
            label: t('home.company-intro.stats.cities-label')
        },
        {
            icon: Users,
            value: t('home.company-intro.stats.customers'),
            label: t('home.company-intro.stats.customers-label')
        }
    ];

    // i18n yüklenene kadar loading göster
    if (!isReady) {
        return (
            <section className="relative h-screen bg-cover bg-center bg-no-repeat -mt-16" style={{ backgroundImage: 'url(/images/company-intro-bg.webp)' }}>
                <div className="flex items-center justify-center w-full h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-800/20 border-t-blue-800"></div>
                </div>
            </section>
        );
    }

    const companyTitle = t('home.company-intro.title');
    const companySubtitle = t('home.company-intro.subtitle');
    const companyDescription = t('home.company-intro.description');

    return (
        <section className="relative h-screen bg-cover bg-center bg-no-repeat -mt-16" style={{ backgroundImage: 'url(/images/company-intro-bg.webp)' }}>
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}
                ></div>
            </div>

            <div className="relative h-full flex flex-col">
                {/* ========== SECTION 1: PREMIUM BADGE ========== */}
                <div className="relative z-10 pt-16 lg:pt-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 md:px-6 lg:px-8 py-1.5 md:py-3 lg:py-4 rounded-full bg-blue-100/50 border border-blue-200/50 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-blue-700" />
                        <span className="text-blue-800 font-semibold text-xs md:text-base">{t('home.company-intro.badge')}</span>
                    </div>
                </div>

                {/* ========== SECTION 2: MAIN CONTENT (Title, Subtitle, Description, Stats) ========== */}
                <div className="absolute inset-0 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style={{ paddingTop: 'clamp(120px, 15vh, 180px)' }}>
                    <div className={`text-center transition-all duration-800 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                        {/* Main Title */}
                        <h1 className="font-bold leading-tight mb-[1.5vh] lg:mb-[2vh]" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 4rem)' }}>
                            <span className="text-white drop-shadow-lg">
                                {companyTitle}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <div className="relative mb-[1.5vh] lg:mb-[2vh]">
                            <p className="font-bold text-white drop-shadow-lg leading-relaxed relative z-10" style={{ fontSize: 'clamp(0.8rem, 2.2vw, 2.2rem)' }}>
                                {companySubtitle}
                            </p>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent blur-xl -z-10 scale-110"></div>
                        </div>

                        {/* Description */}
                        <p className="text-white drop-shadow-md max-w-4xl mx-auto leading-relaxed mb-[2vh] lg:mb-[3vh]" style={{ fontSize: 'clamp(0.7rem, 1.3vw, 1.4rem)' }}>
                            {companyDescription}
                        </p>

                        {/* Elegant Statistics Cards */}
                        <div className="grid grid-cols-4 mb-[2vh] lg:mb-[3vh]" style={{ gap: 'clamp(0.3rem, 0.8vw, 1.5rem)' }}>
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group relative bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                        style={{ 
                                            borderRadius: 'clamp(0.4rem, 1.2vw, 1.5rem)',
                                            padding: 'clamp(0.4rem, 1.2vw, 2rem)',
                                            animationDelay: `${index * 150}ms`
                                        }}
                                    >
                                        {/* Card Content */}
                                        <div className="text-center flex flex-col items-center justify-center h-full">
                                            {/* Value */}
                                            <h3 className="font-bold text-blue-900 mb-1" style={{ fontSize: 'clamp(0.7rem, 1.8vw, 2rem)' }}>
                                                {stat.value}
                                            </h3>

                                            {/* Label */}
                                            <p className="text-blue-800 font-semibold leading-tight" style={{ fontSize: 'clamp(0.5rem, 1vw, 1.2rem)' }}>
                                                {stat.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ========== SECTION 3: SEARCH BAR ========== */}
                <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style={{ paddingTop: 'clamp(380px, 45vh, 500px)' }}>
                    <div className="flex justify-center px-4">
                        <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
                            <div className="relative bg-blue-200/40 backdrop-blur-md rounded-full border border-blue-300/50 shadow-lg hover:shadow-xl transition-all duration-300 p-1 sm:p-1.5">
                                <div className="flex items-center">
                                    {/* Search Input */}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder={t('home.company-intro.cta-button')}
                                            className="w-full bg-transparent border-none outline-none px-4 sm:px-6 py-2 sm:py-2.5 text-blue-900 placeholder-blue-700/60 font-medium text-sm sm:text-base"
                                            onClick={() => {
                                                // Future: implement search functionality
                                                console.log('Search clicked - future feature');
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Search Button */}
                                    <button
                                        onClick={() => {
                                            const propertiesSection = document.querySelector('[data-section="properties"]') ||
                                                                     document.querySelector('#properties') ||
                                                                     document.querySelector('.properties-section');
                                            if (propertiesSection) {
                                                propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            } else {
                                                // Fallback: scroll down by a reasonable amount
                                                window.scrollBy({ top: 800, behavior: 'smooth' });
                                            }
                                        }}
                                        className="bg-blue-900 hover:bg-blue-800 rounded-full p-2 sm:p-2.5 transition-all duration-300 transform hover:scale-105 group"
                                    >
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== SECTION 4: TRUST INDICATORS ========== */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <div className={`transition-all duration-800 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8 text-blue-900">
                            <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold">
                                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-800" />
                                <span>{t('home.company-intro.trust-indicators.licensed')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold">
                                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-800" />
                                <span>{t('home.company-intro.trust-indicators.support')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-800" />
                                <span>{t('home.company-intro.trust-indicators.satisfaction')}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CompanyIntroSection;