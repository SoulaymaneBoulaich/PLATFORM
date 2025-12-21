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
            setProperties(response.data.slice(0, 6));
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden pt-20 lg:pt-24">
                {/* Hero Section - Aurora Design */}
                <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">

                    {/* Aurora Background */}
                    <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-teal-400/20 to-transparent blur-3xl rounded-full"></div>
                    </div>

                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">

                        {/* Floating Badge */}
                        <div className="animate-enter mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                                #1 Real Estate Platform
                            </span>
                        </div>

                        {/* Main Title - Massive & Tight */}
                        <div className="max-w-4xl mx-auto mb-12 animate-enter stagger-1">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-6 drop-shadow-sm leading-[0.9]">
                                {t('home.heroTitle')}
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                                {t('home.heroSubtitle')}
                            </p>
                        </div>

                        {/* Portal Search Bar */}
                        <div className="w-full max-w-3xl relative animate-enter stagger-2 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative glass-card p-2 md:p-3 shadow-2xl bg-white/80 dark:bg-slate-900/80 ring-1 ring-black/5 dark:ring-white/10">
                                <SearchBar onSearch={handleSearch} />
                            </div>

                            {/* Decorative Floating Chips */}
                            <div className="absolute -top-12 -left-12 hidden md:block animate-float">
                                <div className="glass-card px-4 py-2 text-xs font-bold bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-lg transform -rotate-6">
                                    🏡 100+ New Listings
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-8 hidden md:block animate-float-delayed">
                                <div className="glass-card px-4 py-2 text-xs font-bold bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-lg transform rotate-3">
                                    ⭐ Top Rated Agents
                                </div>
                            </div>
                        </div>

                        {/* Stats - Minimalist Row */}
                        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-4xl opacity-80 animate-enter stagger-3 border-t border-gray-200/50 dark:border-white/10 pt-10">
                            {[
                                { label: t('home.stats.properties'), value: '1,000+' },
                                { label: t('home.stats.cities'), value: '50+' },
                                { label: t('home.stats.clients'), value: '10k+' },
                                { label: t('home.stats.agents'), value: '100+' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group cursor-default">
                                    <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-teal-500 transition-colors">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured Properties Section - Masonry-ish feel */}
                <div className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg pt-20 pb-24 border-t border-white/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                            <div className="animate-enter">
                                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t('home.featuredTitle')}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                                    {t('home.featuredSubtitle')}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/properties')}
                                className="hidden md:flex btn-secondary group items-center gap-2 mt-4 md:mt-0"
                            >
                                {t('home.exploreAll')}
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </div>

                        <ErrorMessage message={error} />

                        {loading ? (
                            <SkeletonPropertyList count={6} />
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                                {properties.map((property, index) => (
                                    <PropertyCard
                                        key={property.property_id}
                                        property={property}
                                        delayIndex={index} // Pass index for staggered float
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 glass-card">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('home.noProperties')}</h3>
                                <Link to="/register" className="text-teal-600 hover:text-teal-700 font-semibold">{t('home.getStartedToday')}</Link>
                            </div>
                        )}

                        <div className="mt-12 text-center md:hidden">
                            <button
                                onClick={() => navigate('/properties')}
                                className="btn-primary w-full justify-center"
                            >
                                {t('home.exploreAll')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us - Floating Cards */}
                <div className="py-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-50/50 to-transparent dark:from-teal-900/10 pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('home.whyChooseUs')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                {t('home.whyChooseUsDesc')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                                    title: 'Smart Search',
                                    desc: 'Advanced AI-powered filters to find your perfect property in seconds.'
                                },
                                {
                                    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                                    title: 'Verified Listings',
                                    desc: 'Every property is rigorously verified by our expert team for your safety.'
                                },
                                {
                                    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                                    title: 'Expert Support',
                                    desc: '24/7 access to real estate professionals who guide you every step.'
                                }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="glass-card p-8 hover:-translate-y-2 transition-all duration-300 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Call to Action - Parallax Background */}
                <div className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900 z-0">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-fixed bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-slate-900/90" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-enter">
                            {t('home.ctaTitle')}
                        </h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-enter stagger-1">
                            {t('home.ctaDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-enter stagger-2">
                            <Link to="/properties" className="btn-primary text-lg px-10 py-4 shadow-neon">
                                {t('home.browseProperties')}
                            </Link>
                            <Link to="/register" className="px-10 py-4 rounded-full border-2 border-white/30 text-white font-bold hover:bg-white hover:text-slate-900 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                                {t('home.getStarted')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
