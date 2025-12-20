import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const RoleThemeContext = createContext();

export const RoleThemeProvider = ({ children }) => {
    const auth = useAuth();

    // Memoize getTheme to avoid recreating it (or just define it outside/inside appropriately)
    // defined below, hoisting works or we move it up.

    const getTheme = () => {
        if (!auth.isAuthenticated || !auth.user?.user_type) {
            // Default theme for guests (Teal)
            return {
                name: 'teal',
                gradient: 'from-teal-600 to-emerald-600',
                gradientHover: 'from-teal-700 to-emerald-700',
                text: 'text-teal-600 dark:text-teal-400',
                bg: 'bg-teal-600',
                bgHover: 'bg-teal-700',
                bgLight: 'bg-teal-50 dark:bg-teal-900/20',
                border: 'border-teal-600',
                heroGradient: 'from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900',
            };
        }

        switch (auth.user.user_type) {
            case 'seller':
                return {
                    name: 'purple',
                    gradient: 'from-purple-600 to-violet-600',
                    gradientHover: 'from-purple-700 to-violet-700',
                    text: 'text-purple-600 dark:text-purple-400',
                    bg: 'bg-purple-600',
                    bgHover: 'bg-purple-700',
                    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
                    border: 'border-purple-600',
                    heroGradient: 'from-purple-50 to-violet-50 dark:from-slate-800 dark:to-slate-900',
                };

            case 'agent':
                return {
                    name: 'blue',
                    gradient: 'from-blue-600 to-indigo-600',
                    gradientHover: 'from-blue-700 to-indigo-700',
                    text: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-600',
                    bgHover: 'bg-blue-700',
                    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-600',
                    heroGradient: 'from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900',
                };

            default: // buyer
                return {
                    name: 'teal',
                    gradient: 'from-teal-600 to-emerald-600',
                    gradientHover: 'from-teal-700 to-emerald-700',
                    text: 'text-teal-600 dark:text-teal-400',
                    bg: 'bg-teal-600',
                    bgHover: 'bg-teal-700',
                    bgLight: 'bg-teal-50 dark:bg-teal-900/20',
                    border: 'border-teal-600',
                    heroGradient: 'from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900',
                };
        }
    };

    const [theme, setTheme] = useState(() => getTheme());

    useEffect(() => {
        setTheme(getTheme());
    }, [auth.user, auth.isAuthenticated]);

    return (
        <RoleThemeContext.Provider value={theme}>
            {children}
        </RoleThemeContext.Provider>
    );
};

export const useRoleTheme = () => {
    const context = useContext(RoleThemeContext);
    if (!context) {
        throw new Error('useRoleTheme must be used within RoleThemeProvider');
    }
    return context;
};
