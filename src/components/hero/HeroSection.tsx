'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Search } from 'lucide-react';

const HeroSection: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section className="relative bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 text-white py-16">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-blue-200 bg-opacity-40"></div>

            {/* Content */}
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Main heading */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-900 font-bold mb-4 leading-tight">
                    {t('hero.title')}
                </h1>

                {/* Subtitle */}
                <p className="text-base md:text-lg mb-8 text-blue-900">
                    {t('hero.subtitle')}
                </p>

                {/* Search form */}
                <div className="flex flex-col sm:flex-row gap-0 max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={t('hero.search-placeholder')}
                            className="w-full px-6 py-4 text-gray-700 text-base bg-white border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                        />
                    </div>
                    <button className="bg-blue-900 hover:bg-blue-800 px-8 py-4 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 transform text-white border-0">
                        <Search className="w-5 h-5" />
                        {t('hero.search-button')}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;