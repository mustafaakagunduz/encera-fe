// src/components/hero/HeroSection.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Search, Loader2 } from 'lucide-react';

const HeroSection: React.FC = () => {
    const { t } = useAppTranslation();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        console.log('🔍 Search triggered:', searchQuery.trim());
        setIsSearching(true);
        try {
            // URL'e search query'yi encode ederek yönlendir
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            console.log('📍 Navigating to:', `/search?q=${encodedQuery}`);
            router.push(`/search?q=${encodedQuery}`);
        } catch (error) {
            console.error('❌ Search navigation failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

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

                {/* Search examples */}
                <div className="mb-4">
                    <p className="text-sm text-blue-800 mb-2">
                        Örnek aramalar:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                        {['eryaman 1+1', 'kızılay dükkan', 'metroya yakın', 'polatlı arsa'].map((example) => (
                            <button
                                key={example}
                                onClick={() => setSearchQuery(example)}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search form */}
                <div className="flex flex-col sm:flex-row gap-0 max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={t('hero.search-placeholder') || 'Örn: eryaman 1+1, kızılay dükkan, metroya yakın...'}
                            className="w-full px-6 py-4 text-gray-700 text-base bg-white border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                            disabled={isSearching}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim() || isSearching}
                        className="bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed px-8 py-4 text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 transform text-white border-0"
                    >
                        {isSearching ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                        {isSearching ? 'Aranıyor...' : t('hero.search-button')}
                    </button>
                </div>

                {/* Search hint */}
                <p className="text-xs text-blue-800 mt-3">
                    💡 Kategori otomatik olarak belirlenecek: konut, iş yeri, arsa veya günlük kiralık
                </p>
            </div>
        </section>
    );
};

export default HeroSection;