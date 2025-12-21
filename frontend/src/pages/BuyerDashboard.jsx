import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoleTheme } from '../context/RoleThemeContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import { motion } from 'framer-motion';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const roleTheme = useRoleTheme();
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
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    const StatCard = ({ label, value, icon, colorClass, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="glass-card p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                <div className="transform scale-150 rotate-12">{icon}</div>
            </div>

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorClass} bg-opacity-10 text-white shadow-sm`}>
                    {icon}
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</h3>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
            </div>
        </motion.div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen pt-32 pb-12 relative overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                {/* Aurora Background */}
                <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${roleTheme.blob} rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob`}></div>
                    <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000`}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header */}
                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                        >
                            <div>
                                <h1 className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${roleTheme.gradient} mb-2`}>
                                    Dashboard
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Welcome back, <span className="font-bold text-gray-900 dark:text-white">{user?.first_name}</span>!
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <StatCard
                            label="Favorites"
                            value={summary?.totalFavorites || 0}
                            colorClass="bg-red-500"
                            delay={1}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Saved Searches"
                            value={summary?.savedSearches || 0}
                            colorClass="bg-blue-500"
                            delay={2}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Pending Offers"
                            value={summary?.pendingOffers || 0}
                            colorClass="bg-amber-500"
                            delay={3}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        <Link to="/properties" className="group glass-card p-8 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 text-center border-t-4 border-transparent hover:border-teal-500">
                            <div className="w-16 h-16 mx-auto bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Browse Properties</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Discover your next dream home from our extensive listings.</p>
                            <span className="text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wide group-hover:underline">Start Browsing</span>
                        </Link>

                        <Link to="/messages" className="group glass-card p-8 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 text-center border-t-4 border-transparent hover:border-blue-500">
                            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Messages</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Check for updates from sellers and agents regarding your interests.</p>
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide group-hover:underline">View Messages</span>
                        </Link>

                        <Link to="/favorites" className="group glass-card p-8 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 text-center border-t-4 border-transparent hover:border-red-500">
                            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">My Favorites</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Review your shortlisted properties and compare them.</p>
                            <span className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide group-hover:underline">View Favorites</span>
                        </Link>
                    </motion.div>

                    {/* Recent Views */}
                    {summary?.recentViews && summary.recentViews.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recently Viewed</h2>
                                <Link to="/properties" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                                    View All History &rarr;
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {summary.recentViews.map((property, idx) => (
                                    <Link
                                        key={property.property_id}
                                        to={`/properties/${property.property_id}`}
                                        className="group glass-card p-3 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                                            <img
                                                src={property.image_url || '/placeholder.jpg'}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="inline-block px-2 py-1 bg-white/90 dark:bg-slate-900/90 rounded-md text-xs font-bold shadow-sm">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate px-1">
                                            {property.title}
                                        </h3>
                                        <div className="flex justify-between items-center mt-2 px-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {property.city}
                                            </p>
                                            <p className="text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-lg">
                                                ${parseFloat(property.price).toLocaleString()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default BuyerDashboard;
