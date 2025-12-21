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
                },
                seller: {
                    light: '#10b981', // emerald-500
                    DEFAULT: '#14b8a6', // teal-500
                    dark: '#0f766e',
                },
                agent: {
                    light: '#ec4899', // pink-500
                    DEFAULT: '#8b5cf6', // violet-500
                    dark: '#7c3aed',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'aurora': 'aurora 60s linear infinite',
                'blob': 'blob 7s infinite',
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
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'neon': '0 0 5px theme("colors.teal.200"), 0 0 20px theme("colors.teal.700")',
            }
        },
    },
    plugins: [],
}
