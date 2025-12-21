import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoleTheme } from '../context/RoleThemeContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import { motion } from 'framer-motion';

const SellerDashboard = () => {
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
                    <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000`}></div>
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
                                    Seller Dashboard
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Welcome back, <span className="font-bold text-gray-900 dark:text-white">{user?.first_name}</span>! Manage your listings and track performance.
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <Link
                                    to="/add-property"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-all hover:scale-105"
                                >
                                    + Add New Property
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                        <StatCard
                            label="Total Properties"
                            value={summary?.totalProperties || 0}
                            colorClass="bg-indigo-500"
                            delay={1}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                        />
                        <StatCard
                            label="Active"
                            value={summary?.activeProperties || 0}
                            colorClass="bg-green-500"
                            delay={2}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            label="Total Views"
                            value={summary?.totalViews || 0}
                            colorClass="bg-blue-500"
                            delay={3}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                        />
                        <StatCard
                            label="Contacts"
                            value={summary?.totalContacts || 0}
                            colorClass="bg-purple-500"
                            delay={4}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        />
                        <StatCard
                            label="Sold"
                            value={summary?.soldProperties || 0}
                            colorClass="bg-yellow-500"
                            delay={5}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        <Link to="/dashboard" className="group glass-card p-8 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 text-center border-t-4 border-transparent hover:border-purple-500">
                            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Manage Properties</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Add new listings, edit details, or update availability statuses.</p>
                            <span className="text-purple-600 dark:text-purple-400 font-bold text-sm uppercase tracking-wide group-hover:underline">Go to Properties</span>
                        </Link>

                        <Link to="/messages" className="group glass-card p-8 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 text-center border-t-4 border-transparent hover:border-blue-500">
                            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Messages</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Communicate with prospective buyers and answer inquiries.</p>
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide group-hover:underline">View Messages</span>
                        </Link>

                        <Link to="/offers" className="group glass-card p-8 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 text-center border-t-4 border-transparent hover:border-emerald-500">
                            <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">View Offers</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Review incoming offers, negotiate, and accept deals.</p>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide group-hover:underline">Check Offers</span>
                        </Link>
                    </motion.div>

                    {/* Top Properties */}
                    {summary?.topProperties && summary.topProperties.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Top Performing Properties</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {summary.topProperties.map((property, idx) => (
                                    <div key={property.property_id} className="glass-card flex gap-4 p-4 hover:shadow-2xl transition-all duration-300 group">
                                        <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                                            <img
                                                src={property.image_url || '/placeholder.jpg'}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center min-w-0">
                                            <Link
                                                to={`/properties/${property.property_id}`}
                                                className="font-bold text-lg text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-1 truncate"
                                            >
                                                {property.title}
                                            </Link>
                                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <span className="truncate">{property.city}</span>
                                                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                <span className="font-semibold text-purple-600 dark:text-purple-400">${parseFloat(property.price).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${property.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    property.status === 'sold' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {property.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center px-4 border-l border-gray-100 dark:border-white/5">
                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">{property.view_count}</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Views</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default SellerDashboard;
