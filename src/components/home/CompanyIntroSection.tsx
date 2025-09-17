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
            label: 'Emlak Sektöründe'
        },
        {
            icon: Building2,
            value: t('home.company-intro.stats.properties'),
            label: 'Başarılı İlan'
        },
        {
            icon: MapPin,
            value: t('home.company-intro.stats.cities'),
            label: 'Türkiye Geneli'
        },
        {
            icon: Users,
            value: t('home.company-intro.stats.customers'),
            label: 'Güvenen Aile'
        }
    ];

    // i18n yüklenene kadar loading göster
    if (!isReady) {
        return (
            <section className="relative py-20 bg-gradient-to-br from-stone-50 to-amber-50/30">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-800/20 border-t-amber-800"></div>
                </div>
            </section>
        );
    }

    const companyTitle = t('home.company-intro.title');
    const companySubtitle = t('home.company-intro.subtitle');
    const companyDescription = t('home.company-intro.description');

    return (
        <section className="relative bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D97706' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}
                ></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                {/* Main Hero Content */}
                <div className={`text-center mb-20 transition-all duration-800 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    {/* Premium Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-100/50 border border-amber-200/50 backdrop-blur-sm mb-8">
                        <CheckCircle className="w-4 h-4 text-amber-700" />
                        <span className="text-amber-800 font-medium text-sm">Premium Emlak Deneyimi</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                        <span className="bg-gradient-to-br from-amber-900 via-stone-800 to-amber-800 bg-clip-text text-transparent drop-shadow-sm">
                            {companyTitle}
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <div className="relative mb-10">
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-amber-700 leading-relaxed relative z-10">
                            {companySubtitle}
                        </p>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent blur-xl -z-10 scale-110"></div>
                    </div>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-stone-600 max-w-4xl mx-auto leading-relaxed mb-12">
                        {companyDescription}
                    </p>

                    {/* CTA Button */}
                    <div className="flex justify-center">
                        <Button
                            size="lg"
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
                            className="group bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <span>İlanları Keşfet</span>
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                        </Button>
                    </div>
                </div>

                {/* Elegant Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                style={{
                                    animationDelay: `${index * 150}ms`
                                }}
                            >
                                {/* Card Content */}
                                <div className="text-center">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-8 h-8 text-amber-700" />
                                    </div>

                                    {/* Value */}
                                    <h3 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">
                                        {stat.value}
                                    </h3>

                                    {/* Label */}
                                    <p className="text-stone-600 font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Indicators */}
                <div className={`text-center mt-16 transition-all duration-800 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="flex flex-wrap justify-center items-center gap-8 text-stone-500">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span>Lisanslı Emlak Uzmanı</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="w-4 h-4 text-amber-600" />
                            <span>7/24 Danışmanlık</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="w-4 h-4 text-amber-600" />
                            <span>%100 Müşteri Memnuniyeti</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompanyIntroSection;