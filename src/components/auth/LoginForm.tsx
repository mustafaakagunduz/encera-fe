// src/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button } from '@/components/ui/button';
import { authApi } from '@/store/api/authApi';
import { setCredentials, setError, setPendingVerificationEmail } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
    onModeChange: (mode: 'register' | 'verify' | 'forgot-password') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onModeChange }) => {
    const { t, isReady } = useAppTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [login] = authApi.useLoginMutation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = isReady ? t('auth.errors.email-required') : 'Email adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = isReady ? t('auth.errors.email-invalid') : 'Geçerli bir email adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = isReady ? t('auth.errors.password-required') : 'Şifre gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await login({
                email: formData.email,
                password: formData.password,
            }).unwrap();

            if (result.token && result.user) {
                dispatch(setCredentials({
                    user: result.user,
                    token: result.token,
                    refreshToken: result.refreshToken,
                }));
                router.push('/');
            }
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.data?.message?.includes('Email doğrulaması yapılmamış')) {
                dispatch(setPendingVerificationEmail(formData.email));
                onModeChange('verify');
            } else {
                const errorMessage = error.data?.message || (isReady ? t('auth.errors.invalid-verification-code') : 'Giriş yapılırken hata oluştu');
                dispatch(setError(errorMessage));
                setErrors({ general: errorMessage });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                </div>
            )}

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.email') : 'E-posta'}
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ornek@email.com"
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {isReady ? t('auth.password') : 'Şifre'}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
                <button
                    type="button"
                    onClick={() => onModeChange('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    {isReady ? t('auth.forgot-password-link') : 'Şifremi Unuttum'}
                </button>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={isLoading}
            >
                {isLoading ?
                    (isReady ? 'Giriş yapılıyor...' : 'Giriş yapılıyor...') :
                    (isReady ? t('auth.login') : 'Giriş Yap')
                }
            </Button>

            {/* Social Login Buttons */}
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Veya</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => alert('Google ile giriş yakında!')}
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => alert('Facebook ile giriş yakında!')}
                    >
                        <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                    </Button>
                </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
                <span className="text-sm text-gray-600">
                    {isReady ? t('auth.dont-have-account') : 'Hesabınız yok mu?'}{' '}
                    <button
                        type="button"
                        onClick={() => onModeChange('register')}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        {isReady ? t('auth.register') : 'Kayıt Ol'}
                    </button>
                </span>
            </div>
        </form>
    );
};

export default LoginForm;