import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyList } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Advanced Filter States
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        city: searchParams.get('city') || '',
        property_type: searchParams.get('property_type') || '',
        listing_type: searchParams.get('listing_type') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minBedrooms: searchParams.get('minBedrooms') || '',
        minBathrooms: searchParams.get('minBathrooms') || '',
        sortBy: searchParams.get('sortBy') || 'newest'
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        applyClientSideFilters();
    }, [properties, filters]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            // Ideally backend handles all, but for keyword/sort we might do client-side if backend is limited
            // For now, let's fetch all matching basic criteria and refine client-side if needed
            // Construct basic query
            const backendParams = new URLSearchParams();
            if (filters.city) backendParams.set('city', filters.city);
            if (filters.property_type) backendParams.set('property_type', filters.property_type);
            if (filters.listing_type) backendParams.set('listing_type', filters.listing_type);
            if (filters.minPrice) backendParams.set('minPrice', filters.minPrice);
            if (filters.maxPrice) backendParams.set('maxPrice', filters.maxPrice);
            if (filters.minBedrooms) backendParams.set('minBedrooms', filters.minBedrooms);
            if (filters.minBathrooms) backendParams.set('minBathrooms', filters.minBathrooms);

            const response = await api.get(`/properties?${backendParams.toString()}`);
            setProperties(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load properties. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyClientSideFilters = () => {
        let result = [...properties];

        // Keyword Search (Title or Description)
        if (filters.keyword) {
            const lowerKeyword = filters.keyword.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(lowerKeyword) ||
                p.description?.toLowerCase().includes(lowerKeyword) ||
                p.address?.toLowerCase().includes(lowerKeyword)
            );
        }

        // Sorting
        switch (filters.sortBy) {
            case 'price_asc':
                result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price_desc':
                result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredProperties(result);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);

        // If it's a backend-dependent filter, refetch
        if (['city', 'property_type', 'listing_type', 'minPrice', 'maxPrice', 'minBedrooms', 'minBathrooms'].includes(key)) {
            fetchPropertiesWithParams(newFilters);
        }
    };

    const fetchPropertiesWithParams = async (currentFilters) => {
        try {
            setLoading(true);
            const backendParams = new URLSearchParams();
            if (currentFilters.city) backendParams.set('city', currentFilters.city);
            if (currentFilters.property_type) backendParams.set('property_type', currentFilters.property_type);
            if (currentFilters.listing_type) backendParams.set('listing_type', currentFilters.listing_type);
            if (currentFilters.minPrice) backendParams.set('minPrice', currentFilters.minPrice);
            if (currentFilters.maxPrice) backendParams.set('maxPrice', currentFilters.maxPrice);
            if (currentFilters.minBedrooms) backendParams.set('minBedrooms', currentFilters.minBedrooms);
            if (currentFilters.minBathrooms) backendParams.set('minBathrooms', currentFilters.minBathrooms);

            const response = await api.get(`/properties?${backendParams.toString()}`);
            setProperties(response.data);
            setError('');
        } catch (err) {
            setError('Failed to update results.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            keyword: '',
            city: '',
            property_type: '',
            listing_type: '',
            minPrice: '',
            maxPrice: '',
            minBedrooms: '',
            minBathrooms: '',
            sortBy: 'newest'
        };
        setFilters(emptyFilters);
        setSearchParams({});
        fetchPropertiesWithParams(emptyFilters);
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 pt-20 lg:pt-24 font-sans">
                {/* Background Decor */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay" />
                    <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay" />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    className="lg:hidden fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl rounded-full p-4 hover:scale-110 transition-transform active:scale-95"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </button>

                {/* Filters Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-80 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                    lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar
                    ${isFilterOpen ? 'translate-x-0 px-6 py-4 shadow-2xl' : '-translate-x-full lg:px-0 lg:shadow-none'}
                `}>
                    <div className="lg:p-6 p-2 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-inherit py-2 z-10">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Filters</h2>
                            <button
                                onClick={handleClearFilters}
                                className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline"
                            >
                                Reset All
                            </button>
                        </div>

                        <div className="space-y-8 flex-1">
                            {/* Keyword Search */}
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Keyword</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.keyword}
                                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 transition-shadow font-medium"
                                        placeholder="Search address, title..."
                                    />
                                    <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Location</label>
                                <input
                                    type="text"
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                                    placeholder="City or Neighborhood"
                                />
                            </div>

                            {/* Listing Type */}
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Looking For</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                                    {['sale', 'rent'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleFilterChange('listing_type', filters.listing_type === type ? '' : type)}
                                            className={`py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${filters.listing_type === type
                                                ? 'bg-white dark:bg-slate-700 shadow-md text-teal-600 dark:text-teal-400 transform scale-100'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            {type || 'Any'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Property Type</label>
                                <div className="relative">
                                    <select
                                        value={filters.property_type}
                                        onChange={(e) => handleFilterChange('property_type', e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                                    >
                                        <option value="">Any Type</option>
                                        <option value="house">House</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="condo">Condo</option>
                                        <option value="villa">Villa</option>
                                        <option value="land">Land</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                    <svg className="w-5 h-5 absolute right-4 top-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Price Range</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                                        placeholder="Min"
                                    />
                                    <span className="text-slate-400 font-bold">-</span>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            {/* Beds & Baths */}
                            <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Bedrooms</label>
                                    <div className="relative">
                                        <select
                                            value={filters.minBedrooms}
                                            onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                                        >
                                            <option value="">Any</option>
                                            <option value="1">1+</option>
                                            <option value="2">2+</option>
                                            <option value="3">3+</option>
                                            <option value="4">4+</option>
                                            <option value="5">5+</option>
                                        </select>
                                        <svg className="w-5 h-5 absolute right-3 top-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Bathrooms</label>
                                    <div className="relative">
                                        <select
                                            value={filters.minBathrooms}
                                            onChange={(e) => handleFilterChange('minBathrooms', e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                                        >
                                            <option value="">Any</option>
                                            <option value="1">1+</option>
                                            <option value="2">2+</option>
                                            <option value="3">3+</option>
                                            <option value="4">4+</option>
                                        </select>
                                        <svg className="w-5 h-5 absolute right-3 top-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 relative z-10 overflow-y-auto h-screen scroll-smooth">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24">
                        {/* Header & Sort */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight"
                                >
                                    Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Dream Home</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg text-slate-600 dark:text-slate-400 font-medium"
                                >
                                    {loading ? 'Searching...' : `Showing ${filteredProperties.length} properties`}
                                </motion.p>
                            </div>

                            {/* Sort Dropdown */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-full md:w-auto"
                            >
                                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold pl-2">Sort by:</span>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </motion.div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 font-bold">
                                {error}
                            </div>
                        )}

                        {/* Properties Grid */}
                        {loading ? (
                            <SkeletonPropertyList count={6} />
                        ) : filteredProperties.length > 0 ? (
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                            >
                                <AnimatePresence>
                                    {filteredProperties.map((property, index) => (
                                        <motion.div
                                            key={property.property_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            layout
                                        >
                                            <PropertyCard
                                                property={property}
                                                // Remove delayIndex if we use framer-motion here directly, or keep for internal card anims
                                                delayIndex={0}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-12 rounded-3xl text-center max-w-lg mx-auto mt-12 border border-white/20 dark:border-slate-700 shadow-2xl"
                            >
                                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl opacity-50">🔍</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No matches found</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
                                    We couldn't find any properties matching "{filters.keyword}" with your current filters.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                                >
                                    Clear All Filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default PropertyList;
