import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import StartChatButton from '../components/StartChatButton';
import ErrorMessage from '../components/ErrorMessage';
import { useRoleTheme } from '../context/RoleThemeContext';
import AgentHoverCard from '../components/AgentHoverCard';
import ProfileImage from '../components/ProfileImage';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 relative overflow-hidden">
            {/* Subtle Professional Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16 animate-enter">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Our Agents
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Connect with the industry's top property experts. Experienced, dedicated, and ready to help you find your dream home.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative z-20">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center p-2">
                            <span className="pl-4 text-slate-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, email, or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 text-lg h-12"
                            />
                        </div>
                    </div>
                </div>

                <ErrorMessage message={error} />

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader />
                    </div>
                ) : filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAgents.map((agent, index) => (
                            <motion.div
                                key={agent.user_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center"
                            >
                                {/* Profile Image with Hover Card */}
                                <AgentHoverCard agentId={agent.user_id}>
                                    <div className="relative mb-6 cursor-pointer">
                                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 relative z-10 transition-transform duration-500 group-hover:scale-105">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800">
                                                <ProfileImage
                                                    src={agent.profile_image_url}
                                                    alt={`${agent.first_name} ${agent.last_name}`}
                                                    className="w-full h-full object-cover"
                                                    fallbackText={<span className="text-3xl">{agent.first_name?.[0]}{agent.last_name?.[0]}</span>}
                                                />
                                            </div>
                                        </div>
                                        {/* Verification Badge */}
                                        <div className="absolute bottom-2 right-2 z-20 bg-blue-500 text-white p-1 rounded-full border-4 border-white dark:border-slate-800" title="Verified Agent">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    </div>
                                </AgentHoverCard>

                                {/* Info */}
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {agent.first_name} {agent.last_name}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center gap-1.5 uppercase tracking-wide text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {agent.location || 'Global'}
                                </p>

                                {/* Metrics */}
                                <div className="flex items-center justify-center gap-6 w-full py-6 border-t border-slate-100 dark:border-slate-700/50 mb-6">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{agent.property_count || 0}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Listings</div>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                                            {(parseFloat(agent.avg_rating) || 5.0).toFixed(1)} <span className="text-yellow-400 text-lg">★</span>
                                        </div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Rating</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                    <Link
                                        to={`/agents/${agent.user_id}`}
                                        className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex justify-center items-center"
                                    >
                                        View Details
                                    </Link>
                                    <StartChatButton
                                        targetUser={{
                                            user_id: agent.user_id,
                                            first_name: agent.first_name,
                                            last_name: agent.last_name
                                        }}
                                        className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>Message {agent.first_name}</span>
                                    </StartChatButton>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔍</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No agents found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agents;
