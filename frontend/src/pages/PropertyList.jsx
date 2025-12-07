import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Browse Properties</h1>

                    {user?.user_type === 'seller' && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOnlyMyProperties}
                                onChange={(e) => setShowOnlyMyProperties(e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Only my properties</span>
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <ErrorMessage message={error} />

                        {loading ? (
                            <Loader />
                        ) : displayedProperties.length > 0 ? (
                            <>
                                <div className="mb-4 text-gray-600">
                                    Found {displayedProperties.length} {displayedProperties.length === 1 ? 'property' : 'properties'}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {displayedProperties.map((property) => (
                                        <PropertyCard key={property.property_id} property={property} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <p className="text-gray-600 text-lg">
                                    No properties found matching your criteria.
                                </p>
                                <p className="text-gray-500 mt-2">
                                    Try adjusting your filters or search again.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PropertyList;
