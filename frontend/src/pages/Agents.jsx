import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import StartChatButton from '../components/StartChatButton';
import ErrorMessage from '../components/ErrorMessage';
import { useRoleTheme } from '../context/RoleThemeContext';

const Agents = () => {
    const theme = useRoleTheme();
    const [agents, setAgents] = useState([]);
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        // Filter agents based on search term
        if (searchTerm) {
            const filtered = agents.filter(agent => {
                const fullName = `${agent.first_name || ''} ${agent.last_name || ''}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) ||
                    (agent.email && agent.email.toLowerCase().includes(searchTerm.toLowerCase()));
            });
            setFilteredAgents(filtered);
        } else {
            setFilteredAgents(agents);
        }
    }, [searchTerm, agents]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/agents');
            setAgents(response.data);
            setFilteredAgents(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load agents');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden pt-24 relative">
            {/* Aurora Background */}
            <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -right-10 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-enter">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-600 dark:from-blue-400 dark:via-indigo-400 dark:to-slate-400 mb-4 drop-shadow-sm">
                        Elite Agents
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Connect with the top-tier property experts who make dreams happen.
                    </p>
                </div>

                {/* Glass Portal Search */}
                <div className="mb-16 flex justify-center animate-enter stagger-1">
                    <div className="relative group w-full max-w-xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative glass-card p-1">
                            <input
                                type="text"
                                placeholder="Search experts by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-none text-gray-900 dark:text-white placeholder-gray-500 px-6 py-4 rounded-xl focus:ring-0 text-lg transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <ErrorMessage message={error} />

                {loading ? (
                    <Loader />
                ) : filteredAgents.length > 0 ? (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
                    >
                        {filteredAgents.map((agent) => (
                            <motion.div
                                key={agent.user_id}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
                                }}
                                className="group relative"
                            >
                                {/* Holographic Card */}
                                <div className="h-full glass-card p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-neon border-white/40 dark:border-white/5 hover:border-blue-500/30 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-2xl">

                                    {/* Neon Glow Hover Effect */}
                                    {/* Neon Glow Hover Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-slate-500/0 group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-slate-500/5 transition-all duration-500"></div>

                                    {/* Profile Image with Story Ring */}
                                    <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-400 via-indigo-500 to-slate-500 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative p-[3px] rounded-full bg-white dark:bg-slate-900">
                                            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
                                                {agent.profile_image_url ? (
                                                    <img
                                                        src={agent.profile_image_url.startsWith('http')
                                                            ? agent.profile_image_url
                                                            : `http://localhost:3001${agent.profile_image_url.startsWith('/') ? '' : '/'}${agent.profile_image_url}`}
                                                        alt={`${agent.first_name} ${agent.last_name}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className={`w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400`}>
                                                        {agent.first_name?.[0]}{agent.last_name?.[0]}
                                                    </span>
                                                )}
                                                {/* Fallback Initials Div if image fails */}
                                                <div className="hidden w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500 bg-gray-200 dark:bg-slate-700">
                                                    {agent.first_name?.[0]}{agent.last_name?.[0]}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Status Dot */}
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full z-10"></div>
                                    </div>

                                    {/* Info */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-500 transition-all duration-300">
                                        {agent.first_name} {agent.last_name}
                                    </h3>

                                    {agent.location && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium uppercase tracking-wide">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {agent.location}
                                        </div>
                                    )}

                                    {/* Stats Badge */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                                            {agent.property_count || 0} Listings
                                        </span>
                                        {agent.avg_rating > 0 && (
                                            <span className="px-3 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                ⭐ {parseFloat(agent.avg_rating).toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="w-full flex gap-3 mt-auto transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <Link
                                            to={`/agents/${agent.user_id}`}
                                            className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-105 transition-transform shadow-lg"
                                        >
                                            Profile
                                        </Link>
                                        <div className="flex-none">
                                            <StartChatButton
                                                targetUser={{ user_id: agent.user_id, first_name: agent.first_name, last_name: agent.last_name }}
                                                variant="icon"
                                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center hover:scale-110 shadow-lg hover:shadow-blue-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Default "View Profile" Hint (Hidden on Hover) */}
                                    <div className="absolute bottom-6 w-full text-center text-sm font-medium text-gray-400 group-hover:opacity-0 transition-opacity duration-300">
                                        Hover to connect &rarr;
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="glass-card flex flex-col items-center justify-center py-20 text-center animate-enter">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No agents found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agents;
