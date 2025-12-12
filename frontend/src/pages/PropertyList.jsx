import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyList } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

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
        fetchProperties(newFilters);
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
        fetchProperties(emptyFilters);
    };

    return (
        <PageTransition>
            <div className="flex min-h-full bg-gray-50">
                {/* Filters Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto hidden lg:block flex-shrink-0">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* City */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                            type="text"
                            value={filters.city}
                            onChange={(e) => handleFilterChange({ ...filters, city: e.target.value })}
                            className="input-field w-full"
                            placeholder="Enter city"
                        />
                    </div>

                    {/* Property Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                        <select
                            value={filters.property_type}
                            onChange={(e) => handleFilterChange({ ...filters, property_type: e.target.value })}
                            className="input-field w-full"
                        >
                            <option value="">All Types</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="villa">Villa</option>
                            <option value="land">Land</option>
                            <option value="commercial">Commercial</option>
                        </select>
                    </div>

                    {/* Listing Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                        <select
                            value={filters.listing_type}
                            onChange={(e) => handleFilterChange({ ...filters, listing_type: e.target.value })}
                            className="input-field w-full"
                        >
                            <option value="">All</option>
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange({ ...filters, minPrice: e.target.value })}
                                className="input-field w-full"
                                placeholder="Min"
                            />
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange({ ...filters, maxPrice: e.target.value })}
                                className="input-field w-full"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Bedrooms */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Bedrooms</label>
                        <select
                            value={filters.minBedrooms}
                            onChange={(e) => handleFilterChange({ ...filters, minBedrooms: e.target.value })}
                            className="input-field w-full"
                        >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                        </select>
                    </div>

                    {/* Bathrooms */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Bathrooms</label>
                        <select
                            value={filters.minBathrooms}
                            onChange={(e) => handleFilterChange({ ...filters, minBathrooms: e.target.value })}
                            className="input-field w-full"
                        >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Properties</h1>
                            <p className="text-gray-600">
                                {loading ? 'Loading...' : `${properties.length} properties found`}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Properties Grid */}
                        {loading ? (
                            <SkeletonPropertyList count={6} />
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property, index) => (
                                    <div
                                        key={property.property_id}
                                        className="property-card-stagger"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <PropertyCard property={property} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                                <button
                                    onClick={handleClearFilters}
                                    className="btn-primary"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .property-card-stagger {
                    animation: fadeInUp 400ms ease-out backwards;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </PageTransition>
    );
};

export default PropertyList;
