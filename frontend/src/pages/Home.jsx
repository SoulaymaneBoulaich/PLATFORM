import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { SkeletonPropertyList } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
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
        <PageTransition>
            <div className="min-h-screen">
                {/* Hero Section with high-contrast white text */}
                <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-28 overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 animate-pattern" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            animation: 'pattern-move 20s linear infinite'
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Hero text with text-shadow for extra readability */}
                        <div className="text-center mb-12">
                            <h1 className="hero-headline text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                                Find Your Dream Home
                            </h1>
                            <p className="hero-subheadline text-xl md:text-2xl text-white max-w-3xl mx-auto drop-shadow-md opacity-95">
                                Discover the perfect property in your ideal location with thousands of listings
                            </p>
                        </div>

                        {/* Filter bar with white background and dark text */}
                        <div className="filter-bar-animate max-w-5xl mx-auto">
                            <SearchBar onSearch={handleSearch} />
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto stats-fade-in">
                            {[
                                { label: 'Properties', value: '1000+' },
                                { label: 'Cities', value: '50+' },
                                { label: 'Happy Clients', value: '10K+' },
                                { label: 'Expert Agents', value: '100+' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center text-white" style={{ animationDelay: `${600 + index * 100}ms` }}>
                                    <div className="text-3xl md:text-4xl font-bold mb-1 drop-shadow-md">{stat.value}</div>
                                    <div className="text-white/90 text-sm md:text-base">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured Properties Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Properties</h2>
                            <p className="text-gray-600">Handpicked properties just for you</p>
                        </div>
                        {!loading && properties.length > 0 && (
                            <Link to="/properties" className="hidden md:block btn-ghost">
                                View All →
                            </Link>
                        )}
                    </div>

                    <ErrorMessage message={error} />

                    {loading ? (
                        <SkeletonPropertyList count={6} />
                    ) : properties.length > 0 ? (
                        <>
                            <div className="property-grid">
                                {properties.map((property, index) => (
                                    <div key={property.property_id} className="stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
                                        <PropertyCard property={property} />
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-12">
                                <button
                                    onClick={() => navigate('/properties')}
                                    className="btn-primary"
                                >
                                    Explore All Properties
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <p className="text-gray-600 text-lg mb-4">
                                No properties available yet.
                            </p>
                            <p className="text-gray-500">
                                Sellers can add properties from the dashboard.
                            </p>
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="bg-white border-t border-gray-200 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Experience the best in real estate with our comprehensive platform
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                {
                                    icon: (
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    ),
                                    title: 'Wide Selection',
                                    description: 'Browse thousands of properties across multiple cities and find your perfect match'
                                },
                                {
                                    icon: (
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    ),
                                    title: 'Secure Transactions',
                                    description: 'Safe and secure property transactions with verified sellers and transparent processes'
                                },
                                {
                                    icon: (
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    ),
                                    title: 'Expert Support',
                                    description: 'Professional assistance throughout your property journey from search to closing'
                                }
                            ].map((feature, index) => (
                                <div key={index} className="text-center group">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom animation styles */}
            <style>{`
                .hero-headline {
                    animation: fadeInUp 600ms ease-out;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .hero-subheadline {
                    animation: fadeInUp 600ms ease-out 200ms backwards;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.15);
                }
                
                .filter-bar-animate {
                    animation: fadeInUp 600ms ease-out 400ms backwards;
                }
                
                .stats-fade-in > div {
                    animation: fadeInUp 600ms ease-out backwards;
                }
                
                @keyframes pattern-move {
                    0% { transform: translateX(0) translateY(0); }
                    100% { transform: translateX(30px) translateY(30px); }
                }
            `}</style>
        </PageTransition>
    );
};

export default Home;
