import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/buyer/summary');
            setSummary(res.data);
        } catch (err) {
            console.error('Failed to load summary:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buyer Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.first_name}!</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalFavorites || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Saved Searches</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.savedSearches || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Offers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.pendingOffers || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Views */}
                    {summary?.recentViews && summary.recentViews.length > 0 && (
                        <div className="card bg-white dark:bg-slate-800 p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recently Viewed</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {summary.recentViews.map(property => (
                                    <Link
                                        key={property.property_id}
                                        to={`/properties/${property.property_id}`}
                                        className="group"
                                    >
                                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                            <img
                                                src={property.image_url || '/placeholder.jpg'}
                                                alt={property.title}
                                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                                                    {property.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{property.city}</p>
                                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-2">
                                                    ${parseFloat(property.price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/properties" className="card bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Browse Properties</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Find your dream home</p>
                        </Link>
                        <Link to="/messages" className="card bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Messages</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Chat with sellers</p>
                        </Link>
                        <Link to="/properties" className="card bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">My Favorites</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">View saved properties</p>
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default BuyerDashboard;
