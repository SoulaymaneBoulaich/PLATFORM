import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/seller/summary');
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.first_name}!</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalProperties || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.activeProperties || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalViews || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Contacts</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalContacts || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Sold</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.soldProperties || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Properties */}
                    {summary?.topProperties && summary.topProperties.length > 0 && (
                        <div className="card bg-white dark:bg-slate-800 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Performing Properties</h2>
                            <div className="space-y-4">
                                {summary.topProperties.map(property => (
                                    <div key={property.property_id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                        <img
                                            src={property.image_url || '/placeholder.jpg'}
                                            alt={property.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <Link
                                                to={`/properties/${property.property_id}`}
                                                className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                                            >
                                                {property.title}
                                            </Link>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{property.city}</p>
                                            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                ${parseFloat(property.price).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{property.view_count}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">views</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/dashboard" className="card bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Manage Properties</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Add, edit, or remove your listings</p>
                        </Link>
                        <Link to="/messages" className="card bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Messages</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Chat with potential buyers</p>
                        </Link>
                        <Link to="/dashboard" className="card bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">View Offers</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Review and respond to offers</p>
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SellerDashboard;
