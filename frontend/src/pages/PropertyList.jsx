import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyList } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import ErrorMessage from '../components/ErrorMessage';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [showOnlyMyProperties, setShowOnlyMyProperties] = useState(false);

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

    const displayedProperties = showOnlyMyProperties && user
        ? properties.filter(p => p.seller_id === user.user_id)
        : properties;

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Properties</h1>
                            <p className="text-gray-600">Discover your dream home from our curated listings</p>
                        </div>

                        {user?.user_type === 'seller' && (
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <input
                                    type="checkbox"
                                    checked={showOnlyMyProperties}
                                    onChange={(e) => setShowOnlyMyProperties(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Only my properties</span>
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-4">
                                <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="lg:col-span-3">
                            <ErrorMessage message={error} />

                            {loading ? (
                                <SkeletonPropertyList count={9} />
                            ) : displayedProperties.length > 0 ? (
                                <>
                                    <div className="mb-6 flex items-center justify-between">
                                        <p className="text-gray-600">
                                            <span className="font-semibold text-gray-900">{displayedProperties.length}</span>
                                            {' '}{displayedProperties.length === 1 ? 'property' : 'properties'} found
                                        </p>
                                    </div>
                                    <div className="property-grid">
                                        {displayedProperties.map((property, index) => (
                                            <div key={property.property_id} className="stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
                                                <PropertyCard property={property} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                                    <p className="text-gray-600 mb-6">
                                        Try adjusting your filters to see more results
                                    </p>
                                    <button
                                        onClick={() => handleFilterChange({
                                            city: '', property_type: '', listing_type: '', minPrice: '', maxPrice: '', minBedrooms: '', minBathrooms: ''
                                        })}
                                        className="btn-primary"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default PropertyList;
