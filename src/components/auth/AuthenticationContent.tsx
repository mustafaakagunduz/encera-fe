// src/components/auth/AuthenticationContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import EmailVerificationForm from '@/components/auth/EmailVerificationForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useAppSelector } from '@/store/hooks';
import { useAppTranslation } from "@/hooks/useAppTranslation";

type AuthMode = 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password';

const AuthenticationContent: React.FC = () => {
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, pendingVerificationEmail } = useAppSelector((state) => state.auth);

    const [mode, setMode] = useState<AuthMode>('login');
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Redirect if authenticated
        if (isAuthenticated) {
            router.push('/');
            return;
        }

        // Check URL parameters
        const modeParam = searchParams.get('mode') as AuthMode;
        const tokenParam = searchParams.get('token');

        if (modeParam === 'reset-password' && tokenParam) {
            setMode('reset-password');
            setResetToken(tokenParam);
        } else if (modeParam && ['login', 'register', 'forgot-password'].includes(modeParam)) {
            setMode(modeParam);
        } else if (pendingVerificationEmail && modeParam === 'verify') {
            setMode('verify');
        }
    }, [searchParams, isAuthenticated, router, pendingVerificationEmail]);

    const handleModeChange = (newMode: AuthMode) => {
        setMode(newMode);
        // Update URL without token for security
        if (newMode !== 'reset-password') {
            router.push(`/authentication?mode=${newMode}`);
        }
    };

    const getTitle = () => {
        // Hydration güvenli fallback değerleri
        if (!isMounted || !isReady) {
            switch (mode) {
                case 'register':
                    return 'Kayıt Ol';
                case 'verify':
                    return 'Email Doğrulama';
                case 'forgot-password':
                    return 'Şifremi Unuttum';
                case 'reset-password':
                    return 'Şifre Sıfırla';
                default:
                    return 'Giriş Yap';
            }
        }

        switch (mode) {
            case 'register':
                return t('auth.register');
            case 'verify':
                return 'Email Doğrulama';
            case 'forgot-password':
                return t('auth.forgot-password.title');
            case 'reset-password':
                return t('auth.reset-password.title');
            default:
                return t('auth.login');
        }
    };

    const renderForm = () => {
        switch (mode) {
            case 'register':
                return <RegisterForm onSuccess={() => setMode('verify')} onModeChange={handleModeChange} />;
            case 'verify':
                return <EmailVerificationForm onSuccess={() => router.push('/')} onModeChange={handleModeChange} />;
            case 'forgot-password':
                return <ForgotPasswordForm onModeChange={handleModeChange} />;
            case 'reset-password':
                return <ResetPasswordForm token={resetToken} onSuccess={() => setMode('login')} />;
            default:
                return <LoginForm onModeChange={handleModeChange} />;
        }
    };

    return (
        <>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-blue-900">
                    {getTitle()}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {renderForm()}
            </CardContent>
        </>
    );
};

export default AuthenticationContent;