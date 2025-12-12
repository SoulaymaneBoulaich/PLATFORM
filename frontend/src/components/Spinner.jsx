// Spinner component for loading states
import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'spinner-sm',
        md: '',
        lg: 'spinner-lg'
    };

    return (
        <div className={`spinner ${sizeClasses[size]} ${className}`}></div>
    );
};

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => (
    <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={size} />
        {message && (
            <p className="mt-4 text-gray-600 text-sm">{message}</p>
        )}
    </div>
);

export default Spinner;
