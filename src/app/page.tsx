'use client';

import { useLanguage} from "@/context/LanguageContext";

export default function Home() {
    const { t } = useLanguage();

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">
                {t('home.welcome')}
            </h1>

        </main>
    );
}