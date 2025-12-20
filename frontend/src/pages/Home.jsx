import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyList } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import ErrorMessage from '../components/ErrorMessage';
import { useRoleTheme } from '../context/RoleThemeContext';

const Home = () => {
    const { t } = useTranslation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useRoleTheme();

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
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-slate-900">
                {/* Beautiful Hero Section with Role Theme */}
                <div className={`relative bg-gradient-to-br ${theme.heroGradient}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                        {/* Hero Content */}
                        <div className="text-center max-w-4xl mx-auto mb-12">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                Find Your Perfect Home
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                                Discover the perfect property from thousands of listings across multiple cities
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-5xl mx-auto mb-12">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-slate-700">
                                <SearchBar onSearch={handleSearch} />
                            </div>
                        </div>

                        {/* Stats with Role Theme */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {[
                                { label: 'Properties', value: '1,000+' },
                                { label: 'Cities', value: '50+' },
                                { label: 'Happy Clients', value: '10,000+' },
                                { label: 'Expert Agents', value: '100+' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-3xl md:text-4xl font-bold ${theme.text} mb-2`}>{stat.value}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured Properties Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                            Featured Properties
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Handpicked selection of the finest properties available
                        </p>
                    </div>

                    <ErrorMessage message={error} />

                    {loading ? (
                        <SkeletonPropertyList count={6} />
                    ) : properties.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {properties.map((property, index) => (
                                    <div
                                        key={property.property_id}
                                        className="animate-scale-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <PropertyCard property={property} />
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-16">
                                <button
                                    onClick={() => navigate('/properties')}
                                    className={`bg-gradient-to-r ${theme.gradient} hover:${theme.gradientHover} text-white font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2`}
                                >
                                    <span>Explore All Properties</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <div className={`w-24 h-24 ${theme.bgLight} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <svg className={`w-12 h-12 ${theme.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                No Properties Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Be the first to list your property and reach thousands of buyers!
                            </p>
                            <Link to="/register" className={`bg-gradient-to-r ${theme.gradient} hover:${theme.gradientHover} text-white font-bold px-8 py-3 rounded-full inline-flex transition-all shadow-lg hover:shadow-xl`}>
                                Get Started Today
                            </Link>
                        </div>
                    )}
                </div>

                {/* Why Choose Us Section */}
                <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Why Choose Us
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Experience the best in real estate with our comprehensive platform
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    ),
                                    title: 'Smart Search',
                                    description: 'Advanced filters to find your perfect property quickly'
                                },
                                {
                                    icon: (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    ),
                                    title: 'Verified Listings',
                                    description: 'Every property is thoroughly verified for your peace of mind'
                                },
                                {
                                    icon: (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    ),
                                    title: 'Expert Support',
                                    description: 'Professional guidance throughout your property journey'
                                }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="text-center p-6 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme.bgLight} ${theme.text} mb-4`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-teal-600 dark:bg-teal-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Find Your Perfect Home?
                            </h2>
                            <p className="text-lg text-teal-50 mb-8">
                                Join thousands of satisfied clients who found their dream properties
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/properties" className="bg-white text-teal-700 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
                                    Browse Properties
                                </Link>
                                <Link to="/register" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-700 font-semibold px-8 py-3 rounded-lg transition-all duration-200">
                                    Get Started Free
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .property-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                }
                
                @media (max-width: 768px) {
                    .property-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </PageTransition>
    );
};

export default Home;
