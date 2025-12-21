import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyList } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter toggle

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        property_type: searchParams.get('property_type') || '',
        listing_type: searchParams.get('listing_type') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minBedrooms: searchParams.get('minBedrooms') || '',
        minBathrooms: searchParams.get('minBathrooms') || '',
    });

    useEffect(() => {
        fetchProperties(filters);
    }, []);

    const fetchProperties = async (filterParams) => {
        try {
            setLoading(true);
            const params = new URLSearchParams(
                Object.entries(filterParams).filter(([_, value]) => value !== '')
            );
            const response = await api.get(`/properties?${params.toString()}`);
            setProperties(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load properties. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // Debounce fetching if needed, for now direct fetch
        fetchProperties(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            city: '',
            property_type: '',
            listing_type: '',
            minPrice: '',
            maxPrice: '',
            minBedrooms: '',
            minBathrooms: '',
        };
        setFilters(emptyFilters);
        setSearchParams({});
        fetchProperties(emptyFilters);
    };

    return (
        <PageTransition>
            <div className="flex min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 pt-20 lg:pt-24">
                {/* Background Decor */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay" />
                    <div className="absolute bottom-[10%] -right-[10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay" />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    className="lg:hidden fixed bottom-6 right-6 z-50 btn-primary shadow-floating rounded-full p-4"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </button>

                {/* Filters Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 transform transition-transform duration-300 ease-spring
                    lg:relative lg:translate-x-0 overflow-y-auto
                    ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Filters</h2>
                            <button
                                onClick={handleClearFilters}
                                className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700"
                            >
                                Reset All
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* City */}
                            <div>
                                <label className="label mb-2 block">City / Location</label>
                                <input
                                    type="text"
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange({ ...filters, city: e.target.value })}
                                    className="input-field w-full py-3"
                                    placeholder="e.g. New York"
                                />
                            </div>

                            {/* Listing Type - Radio Group */}
                            <div>
                                <label className="label mb-3 block">Looking For</label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                                    {['sale', 'rent'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleFilterChange({ ...filters, listing_type: filters.listing_type === type ? '' : type })}
                                            className={`py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filters.listing_type === type
                                                ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            {type || 'Any'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="label mb-2 block">Property Type</label>
                                <select
                                    value={filters.property_type}
                                    onChange={(e) => handleFilterChange({ ...filters, property_type: e.target.value })}
                                    className="input-field w-full py-3"
                                >
                                    <option value="">Any Type</option>
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="condo">Condo</option>
                                    <option value="villa">Villa</option>
                                    <option value="land">Land</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="label mb-2 block">Price Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value })}
                                        className="input-field w-full py-2 text-sm"
                                        placeholder="Min Price"
                                    />
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value })}
                                        className="input-field w-full py-2 text-sm"
                                        placeholder="Max Price"
                                    />
                                </div>
                            </div>

                            {/* Beds & Baths */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label mb-2 block">Bedrooms</label>
                                    <select
                                        value={filters.minBedrooms}
                                        onChange={(e) => handleFilterChange({ ...filters, minBedrooms: e.target.value })}
                                        className="input-field w-full py-2"
                                    >
                                        <option value="">Any</option>
                                        <option value="1">1+</option>
                                        <option value="2">2+</option>
                                        <option value="3">3+</option>
                                        <option value="4">4+</option>
                                        <option value="5">5+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label mb-2 block">Bathrooms</label>
                                    <select
                                        value={filters.minBathrooms}
                                        onChange={(e) => handleFilterChange({ ...filters, minBathrooms: e.target.value })}
                                        className="input-field w-full py-2"
                                    >
                                        <option value="">Any</option>
                                        <option value="1">1+</option>
                                        <option value="2">2+</option>
                                        <option value="3">3+</option>
                                        <option value="4">4+</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 relative z-10 overflow-y-auto h-screen scroll-smooth">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        {/* Header */}
                        <div className="mb-10 animate-enter">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Dream Home</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                                {loading ? 'Searching properties...' : `We found ${properties.length} properties matching your criteria.`}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-8 p-4 glass-card border-red-200 dark:border-red-800 text-red-600 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        {/* Properties Grid - Masonry style feel with CSS Grid */}
                        {loading ? (
                            <SkeletonPropertyList count={8} />
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pb-20">
                                {properties.map((property, index) => (
                                    <PropertyCard
                                        key={property.property_id}
                                        property={property}
                                        delayIndex={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card p-12 text-center max-w-lg mx-auto mt-20">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No properties found</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">
                                    We couldn't find any properties matching your current filters. Try relaxing your search criteria.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="btn-primary px-8"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default PropertyList;
