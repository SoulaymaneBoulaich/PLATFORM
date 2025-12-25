/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',  // Teal 500
                    600: '#0d9488',  // Teal 600 - Main
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                secondary: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',  // Amber 500
                    600: '#d97706',  // Amber 600 - Main
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                // Role-based theme colors
                buyer: {
                    light: '#3b82f6', // blue-500
                    DEFAULT: '#06b6d4', // cyan-500
                    dark: '#0891b2',
                    'gradient-from': '#06b6d4',
                    'gradient-via': '#3b82f6',
                    'gradient-to': '#2563eb',
                },
                seller: {
                    light: '#10b981', // emerald-500
                    DEFAULT: '#14b8a6', // teal-500
                    dark: '#0f766e',
                    'gradient-from': '#14b8a6',
                    'gradient-via': '#10b981',
                    'gradient-to': '#059669',
                },
                agent: {
                    light: '#ec4899', // pink-500
                    DEFAULT: '#8b5cf6', // violet-500
                    dark: '#7c3aed',
                    'gradient-from': '#8b5cf6',
                    'gradient-via': '#a855f7',
                    'gradient-to': '#ec4899',
                },
                'primary-gradient-from': '#14b8a6',
                'primary-gradient-via': '#06b6d4',
                'primary-gradient-to': '#3b82f6',

                /* Glassmorphism opacity tokens */
                'glass-white': 'rgba(255, 255, 255, 0.1)',
                'glass-white-20': 'rgba(255, 255, 255, 0.2)',
                'glass-dark': 'rgba(15, 23, 42, 0.6)',
                'glass-border': 'rgba(255, 255, 255, 0.2)',

                /* Neon accents for dark mode */
                'neon-cyan': '#06b6d4',
                'neon-teal': '#14b8a6',
                'neon-purple': '#8b5cf6',
                'neon-pink': '#ec4899',
            },
            backdropBlur: {
                '3xl': '64px',
                '4xl': '96px',
            },
            perspective: {
                '500': '500px',
                '1000': '1000px',
                '1500': '1500px',
                '2000': '2000px',
            },
            transformStyle: {
                '3d': 'preserve-3d',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'aurora': 'aurora 60s linear infinite',
                'blob': 'blob 7s infinite',
                'parallax-slow': 'parallax-slow 20s linear infinite',
                'parallax-fast': 'parallax-fast 15s linear infinite',
                'morph': 'morph 8s ease-in-out infinite',
                'tilt-3d': 'tilt-3d 0.3s ease-out forwards',
                'particle-float': 'particle-float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                aurora: {
                    '0%': { backgroundPosition: '50% 50%, 50% 50%' },
                    '100%': { backgroundPosition: '350% 50%, 350% 50%' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                tilt: {
                    '0%, 50%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(1deg)' },
                    '75%': { transform: 'rotate(-1deg)' },
                },
                'parallax-slow': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-50px)' },
                },
                'parallax-fast': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100px)' },
                },
                'morph': {
                    '0%, 100%': { 'border-radius': '60% 40% 30% 70% / 60% 30% 70% 40%' },
                    '25%': { 'border-radius': '30% 60% 70% 40% / 50% 60% 30% 60%' },
                    '50%': { 'border-radius': '50% 60% 30% 60% / 30% 60% 70% 40%' },
                    '75%': { 'border-radius': '60% 40% 60% 40% / 70% 30% 50% 60%' },
                },
                'tilt-3d': {
                    '0%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
                    '100%': { transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))' },
                },
                'particle-float': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
                    '25%': { transform: 'translate(10px, -20px) scale(1.1)', opacity: '0.8' },
                    '50%': { transform: 'translate(-5px, -40px) scale(0.9)', opacity: '1' },
                    '75%': { transform: 'translate(-15px, -20px) scale(1.05)', opacity: '0.7' },
                },
                'shimmer': {
                    '0%': { 'background-position': '-1000px 0' },
                    '100%': { 'background-position': '1000px 0' },
                },
                'glow-pulse': {
                    '0%, 100%': { 'box-shadow': '0 0 5px var(--glow-color), 0 0 10px var(--glow-color)' },
                    '50%': { 'box-shadow': '0 0 20px var(--glow-color), 0 0 30px var(--glow-color), 0 0 40px var(--glow-color)' },
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'neon': '0 0 5px theme("colors.teal.200"), 0 0 20px theme("colors.teal.700")',
                'lift': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                'lift-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                'lift-xl': '0 30px 80px -20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
                'neumorphic': '20px 20px 60px #d1d5db, -20px -20px 60px #ffffff',
                'neumorphic-dark': '20px 20px 60px #0f172a, -20px -20px 60px #1e293b',
            }
        },
    },
    plugins: [
        function({ addUtilities, theme }) {
            const neonGlows = {
                '.glow-buyer': {
                    '--glow-color': theme('colors.buyer.DEFAULT'),
                    boxShadow: `0 0 10px ${theme('colors.buyer.DEFAULT')}, 0 0 20px ${theme('colors.buyer.DEFAULT')}, 0 0 30px ${theme('colors.buyer.light')}`,
                },
                '.glow-seller': {
                    '--glow-color': theme('colors.seller.DEFAULT'),
                    boxShadow: `0 0 10px ${theme('colors.seller.DEFAULT')}, 0 0 20px ${theme('colors.seller.DEFAULT')}, 0 0 30px ${theme('colors.seller.light')}`,
                },
                '.glow-agent': {
                    '--glow-color': theme('colors.agent.DEFAULT'),
                    boxShadow: `0 0 10px ${theme('colors.agent.DEFAULT')}, 0 0 20px ${theme('colors.agent.DEFAULT')}, 0 0 30px ${theme('colors.agent.light')}`,
                },
                '.glow-cyan': {
                    '--glow-color': '#06b6d4',
                    boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 40px #06b6d4',
                },
                '.glow-purple': {
                    '--glow-color': '#8b5cf6',
                    boxShadow: '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #8b5cf6',
                },
                '.glow-pink': {
                    '--glow-color': '#ec4899',
                    boxShadow: '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 40px #ec4899',
                },
            };
            addUtilities(neonGlows);
        },
        function({ addUtilities }) {
            const premiumShadows = {
                '.shadow-lift': {
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                },
                '.shadow-lift-lg': {
                    boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                },
                '.shadow-lift-xl': {
                    boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                },
                '.shadow-inner-glow': {
                    boxShadow: 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
                },
                '.shadow-neumorphic': {
                    boxShadow: '20px 20px 60px #d1d5db, -20px -20px 60px #ffffff',
                },
                '.shadow-neumorphic-dark': {
                    boxShadow: '20px 20px 60px #0f172a, -20px -20px 60px #1e293b',
                },
            };
            addUtilities(premiumShadows);
        }
    ],
}
