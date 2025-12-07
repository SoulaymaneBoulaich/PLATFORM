import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/properties');
            setProperties(response.data.slice(0, 6)); // Show only first 6 for featured
            setError('');
        } catch (err) {
            setError('Failed to load properties. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchParams) => {
        const queryString = new URLSearchParams(
            Object.entries(searchParams).filter(([_, value]) => value !== '')
        ).toString();
        navigate(`/properties?${queryString}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Find Your Dream Home
                        </h1>
                        <p className="text-xl md:text-2xl text-primary-100">
                            Discover the perfect property in your ideal location
                        </p>
                    </div>

                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            {/* Featured Properties Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Properties</h2>

                <ErrorMessage message={error} />

                {loading ? (
                    <Loader />
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.property_id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            No properties available yet. Sellers can add properties from the dashboard.
                        </p>
                    </div>
                )}

                {!loading && properties.length > 0 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={() => navigate('/properties')}
                            className="btn-primary"
                        >
                            View All Properties
                        </button>
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🏠</div>
                            <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
                            <p className="text-gray-600">
                                Browse thousands of properties across multiple cities
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                            <p className="text-gray-600">
                                Safe and secure property transactions guaranteed
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">💼</div>
                            <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                            <p className="text-gray-600">
                                Professional assistance throughout your property journey
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
