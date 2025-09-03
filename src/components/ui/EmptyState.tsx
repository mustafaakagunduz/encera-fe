// src/components/ui/EmptyState.tsx
'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          icon: Icon,
                                                          title,
                                                          description,
                                                          action
                                                      }) => {
    return (
        <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                {Icon && <Icon className="h-6 w-6 text-gray-400" />}
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {action && (
                <Button
                    onClick={action.onClick}
                    variant="outline"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
};