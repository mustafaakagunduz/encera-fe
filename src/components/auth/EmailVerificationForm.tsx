// src/components/auth/EmailVerificationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/store/api/authApi';
import { setCredentials, setPendingVerificationEmail } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AlertCircle, CheckCircle, Mail, RefreshCw } from 'lucide-react';

interface EmailVerificationFormProps {
    onSuccess: () => void;
    onModeChange: (mode: 'login' | 'register') => void;
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({ onSuccess, onModeChange }) => {
    const dispatch = useAppDispatch();
    const { pendingVerificationEmail } = useAppSelector((state) => state.auth);
    const [verifyEmail] = authApi.useVerifyEmailMutation();
    const [resendCode] = authApi.useResendVerificationCodeMutation();

    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Cooldown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }

        // Clear errors when user starts typing
        if (errors.verificationCode) {
            setErrors(prev => ({ ...prev, verificationCode: '' }));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = Array(6).fill('');

        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }

        setVerificationCode(newCode);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newCode.findIndex(code => !code);
        const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
        const inputToFocus = document.getElementById(`code-${focusIndex}`);
        inputToFocus?.focus();
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const code = verificationCode.join('');

        if (!pendingVerificationEmail) {
            newErrors.general = 'Email adresi bulunamadı. Lütfen tekrar kayıt olun.';
        }

        if (code.length !== 6) {
            newErrors.verificationCode = 'Doğrulama kodu 6 haneli olmalıdır';
        } else if (!/^\d{6}$/.test(code)) {
            newErrors.verificationCode = 'Doğrulama kodu sadece rakamlardan oluşmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !pendingVerificationEmail) return;

        setIsLoading(true);

        try {
            const result = await verifyEmail({
                email: pendingVerificationEmail,
                verificationCode: verificationCode.join(''),
            }).unwrap();

            if (result.success && result.token && result.user) {
                dispatch(setCredentials({
                    user: result.user,
                    token: result.token,
                }));
                dispatch(setPendingVerificationEmail(null));
                onSuccess();
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            const errorMessage = error.data?.message || 'Doğrulama kodunu kontrol ederken hata oluştu';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!pendingVerificationEmail || resendCooldown > 0) return;

        setResendLoading(true);
        setResendSuccess(false);

        try {
            await resendCode({
                email: pendingVerificationEmail,
            }).unwrap();

            setResendSuccess(true);
            setResendCooldown(60); // 60 seconds cooldown
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (error: any) {
            console.error('Resend error:', error);
            const errorMessage = error.data?.message || 'Kod gönderilirken hata oluştu';
            setErrors({ general: errorMessage });
        } finally {
            setResendLoading(false);
        }
    };

    if (!pendingVerificationEmail) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-red-600 mb-2">
                        Email Adresi Bulunamadı
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Doğrulama yapabilmek için önce kayıt olmanız gerekiyor.
                    </p>
                    <Button onClick={() => onModeChange('register')}>
                        Kayıt Ol
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email Doğrulama
                </h3>
                <p className="text-sm text-gray-600">
                    <span className="font-medium">{pendingVerificationEmail}</span> adresine
                    gönderilen 6 haneli doğrulama kodunu giriniz.
                </p>
            </div>

            {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                </div>
            )}

            {resendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Yeni doğrulama kodu gönderildi!</span>
                </div>
            )}

            {/* Verification Code Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Doğrulama Kodu
                </label>
                <div className="flex justify-center space-x-2">
                    {verificationCode.map((digit, index) => (
                        <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className={`w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.verificationCode ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                    ))}
                </div>
                {errors.verificationCode && (
                    <p className="mt-2 text-sm text-red-600 text-center">{errors.verificationCode}</p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                disabled={isLoading}
            >
                {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                    Kod gelmedi mi?
                </p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-sm"
                >
                    {resendLoading ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Gönderiliyor...
                        </>
                    ) : resendCooldown > 0 ? (
                        `Tekrar gönder (${resendCooldown}s)`
                    ) : (
                        'Kodu Tekrar Gönder'
                    )}
                </Button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={() => onModeChange('login')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    Giriş sayfasına dön
                </button>
            </div>
        </form>
    );
};

export default EmailVerificationForm;