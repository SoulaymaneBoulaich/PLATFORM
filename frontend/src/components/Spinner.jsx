// Spinner component for loading states
import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <svg
            className={`animate-spin text-teal-500 ${sizeClasses[size]} ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
};

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => (
    <div className="flex flex-col items-center justify-center p-8 animate-enter">
        <Spinner size={size} className="mb-4" />
        {message && (
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">{message}</p>
        )}
    </div>
);

export default Spinner;
