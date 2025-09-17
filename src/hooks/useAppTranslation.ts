import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import '@/lib/i18n';

export const useAppTranslation = () => {
    const { t, i18n, ready } = useTranslation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (ready) {
            // Client-side'da localStorage'dan dil tercihini oku
            if (typeof window !== 'undefined') {
                const savedLanguage = localStorage.getItem('i18nextLng');
                if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
                    i18n.changeLanguage(savedLanguage);
                } else {
                    // Tarayıcı dilini kontrol et
                    const browserLanguage = navigator.language.toLowerCase();
                    if (browserLanguage.startsWith('tr')) {
                        i18n.changeLanguage('tr');
                    } else {
                        i18n.changeLanguage('en');
                    }
                }
            }
            setIsReady(true);
        }
    }, [i18n, ready]);

    const changeLanguage = (lang: 'tr' | 'en') => {
        i18n.changeLanguage(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('i18nextLng', lang);
        }
    };

    return {
        t,
        language: i18n.language as 'tr' | 'en',
        changeLanguage,
        isReady: isReady && ready,
    };
};