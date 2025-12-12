// Page transition wrapper for smooth page animations
import React from 'react';

const PageTransition = ({ children, className = '' }) => {
    return (
        <div className={`page-fade-in ${className}`}>
            {children}
        </div>
    );
};

export default PageTransition;
