// src/components/auth/ResetPasswordForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/store/api/authApi';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
    token: string | null;
    onSuccess: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess }) => {
    const { t } = useAppTranslation();
    const [validateResetToken] = authApi.useLazyValidateResetTokenQuery();
    const [resetPassword] = authApi.useResetPasswordMutation();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [tokenValidating, setTokenValidating] = useState(true);

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenValid(false);
                setTokenValidating(false);
                return;
            }

            try {
                const result = await validateResetToken(token).unwrap();
                setTokenValid(result.success);
            } catch (error) {
                setTokenValid(false);
            } finally {
                setTokenValidating(false);
            }
        };

        validateToken();
    }, [token, validateResetToken]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.newPassword) {
            newErrors.newPassword = t('auth.errors.password-required');
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = t('auth.errors.password-min-length');
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.errors.password-confirm-required');
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.errors.passwords-not-match');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !token) return;

        setIsLoading(true);

        try {
            const result = await resetPassword({
                token: token,
                newPassword: formData.newPassword,
            }).unwrap();

            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 3000);
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            const errorMessage = error.data?.message || t('auth.errors.password-required');
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Loading state while validating token
    if (tokenValidating) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center w-12 h-12">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <p className="text-sm text-gray-600">
                    {t('auth.reset-password.validating-token')}
                </p>
            </div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-red-600 mb-2">
                        {t('auth.reset-password.invalid-token-title')}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {t('auth.reset-password.invalid-token-description')}
                    </p>
                    <p className="text-xs text-gray-500 mb-6">
                        {t('auth.reset-password.invalid-token-help')}
                    </p>
                    <Button onClick={() => window.location.href = '/authentication?mode=forgot-password'}>
                        {t('auth.reset-password.create-new-request')}
                    </Button>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-green-600 mb-2">
                        {t('auth.reset-password.success-title')}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {t('auth.reset-password.success-description')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('auth.reset-password.title')}
                </h3>
                <p className="text-sm text-gray-600">
                    {t('auth.reset-password.description')}
                </p>
            </div>

            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                </div>
            )}

            {/* New Password */}
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.new-password')}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.newPassword ? 'border-red-300' : 'border-gray-300'
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
                {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.reset-password.password-repeat')}
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={isLoading}
            >
                {isLoading ? t('auth.reset-password.updating-password') : t('auth.reset-password.update-password')}
            </Button>
        </form>
    );
};

export default ResetPasswordForm;