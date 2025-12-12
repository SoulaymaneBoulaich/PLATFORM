// Skeleton Loader Components for loading states
import React from 'react';

export const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-image shimmer"></div>
        <div className="space-y-2">
            <div className="skeleton-title shimmer"></div>
            <div className="skeleton-text shimmer"></div>
            <div className="skeleton-text shimmer short"></div>
        </div>
    </div>
);

export const SkeletonPropertyList = ({ count = 8 }) => (
    <div className="property-grid">
        {[...Array(count)].map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export const SkeletonDetail = () => (
    <div className="space-y-6">
        <div className="skeleton w-full h-96 rounded-2xl shimmer"></div>
        <div className="space-y-4">
            <div className="skeleton h-10 w-3/4 shimmer"></div>
            <div className="skeleton h-6 w-1/2 shimmer"></div>
            <div className="skeleton h-4 w-full shimmer"></div>
            <div className="skeleton h-4 w-full shimmer"></div>
            <div className="skeleton h-4 w-2/3 shimmer"></div>
        </div>
    </div>
);

export const SkeletonText = ({ lines = 3 }) => (
    <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
            <div
                key={i}
                className="skeleton h-4 shimmer"
                style={{ width: i === lines - 1 ? '66%' : '100%' }}
            ></div>
        ))}
    </div>
);

export default SkeletonCard;
