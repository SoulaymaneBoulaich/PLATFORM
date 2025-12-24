import { useState, useEffect } from 'react';

const ProfileImage = ({ src, alt, className, fallbackText, ...props }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) {
            setHasError(true);
            return;
        }

        // Handle full URLs vs relative paths
        const url = src.startsWith('http') || src.startsWith('blob:')
            ? src
            : `http://localhost:3001${src.startsWith('/') ? '' : '/'}${src}`;

        setImgSrc(url);
        setHasError(false);
    }, [src]);

    if (hasError || !imgSrc) {
        return (
            <div className={`flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase ${className}`} {...props}>
                {fallbackText || (alt ? alt.charAt(0) : '?')}
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            {...props}
        />
    );
};

export default ProfileImage;
