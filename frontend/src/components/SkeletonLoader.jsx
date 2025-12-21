// Skeleton Loader Components for loading states
import React from 'react';

export const SkeletonCard = () => (
    <div className="glass-card p-4 h-full flex flex-col">
        <div className="bg-gray-200 dark:bg-slate-700 w-full h-48 rounded-xl animate-pulse mb-4"></div>
        <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
            <div className="h-6 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
    </div>
);

export const SkeletonPropertyList = ({ count = 6 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[...Array(count)].map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export const SkeletonDetail = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Hero Skeleton */}
        <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-2xl mb-8 w-full"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Title & Price */}
                <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
                    ))}
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
            </div>
        </div>
    </div>
);

export const SkeletonText = ({ lines = 3 }) => (
    <div className="space-y-2 animate-pulse">
        {[...Array(lines)].map((_, i) => (
            <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-slate-700 rounded"
                style={{ width: i === lines - 1 ? '66%' : '100%' }}
            ></div>
        ))}
    </div>
);

export default SkeletonCard;
