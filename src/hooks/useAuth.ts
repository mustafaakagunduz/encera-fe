// src/hooks/useAuth.ts
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useAuth = () => {
    const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

    return {
        user,
        token,
        isAuthenticated,
        isAdmin: user?.role === 'ADMIN',
        isUser: user?.role === 'USER',
        hasRole: (role: string) => user?.role === role,
        hasAnyRole: (roles: string[]) => roles.some(role => user?.role === role),
    };
};