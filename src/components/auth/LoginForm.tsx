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
                // Force a complete page reload to ensure all components update with new auth state
                window.location.href = '/';
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