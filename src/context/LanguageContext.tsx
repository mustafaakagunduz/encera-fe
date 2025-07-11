'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('tr');
    const [translations, setTranslations] = useState<Record<string, string>>({});

    useEffect(() => {
        // Tarayıcıdan dil tercihi al
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
            setLanguage(savedLanguage);
        } else {
            // Tarayıcı dilini kontrol et
            const browserLanguage = navigator.language.toLowerCase();
            if (browserLanguage.startsWith('tr')) {
                setLanguage('tr');
            } else {
                setLanguage('en');
            }
        }
    }, []);

    useEffect(() => {
        // Dil değiştiğinde localStorage'a kaydet ve çeviri dosyasını yükle
        localStorage.setItem('language', language);
        loadTranslations(language);
    }, [language]);

    const loadTranslations = async (lang: Language) => {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            const data = await response.json();
            setTranslations(data);
        } catch (error) {
            console.error('Error loading translations:', error);
            setTranslations({});
        }
    };

    const t = (key: string): string => {
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};