// src/components/ui/toast.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    duration?: number;
    onClose: () => void;
    show: boolean;
}

export const Toast: React.FC<ToastProps> = ({
                                                message,
                                                type,
                                                duration = 4000,
                                                onClose,
                                                show
                                            }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
            <div className={`rounded-lg shadow-lg p-4 flex items-start space-x-3 transform transition-all duration-300 ${
                type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
            }`}>
                <div className="flex-shrink-0">
                    {type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                        type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {message}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            type === 'success'
                                ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                                : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                        }`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};