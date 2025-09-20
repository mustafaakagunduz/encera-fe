// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    center?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    center = false
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const content = (
        <div className="flex flex-col items-center space-y-3">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
            {message && (
                <div className={`text-gray-600 ${textSizeClasses[size]}`}>
                    {message}
                </div>
            )}
        </div>
    );

    if (center) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingSpinner;