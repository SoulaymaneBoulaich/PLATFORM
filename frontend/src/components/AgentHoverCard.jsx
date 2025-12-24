import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AgentHoverCard = ({ agentId, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (isHovered && !loaded && !loading) {
            fetchAgentProperties();
        }
    }, [isHovered]);

    const fetchAgentProperties = async () => {
        try {
            setLoading(true);
            // Fetch top 3 properties for this agent/seller
            const res = await api.get(`/properties?seller_id=${agentId}&limit=3`);
            setProperties(res.data);
            setLoaded(true);
        } catch (err) {
            console.error('Failed to fetch agent properties:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-72 z-50 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden p-3 pointer-events-auto">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                                Recent Listings
                            </h4>

                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : properties.length > 0 ? (
                                <div className="space-y-2">
                                    {properties.map(property => (
                                        <Link
                                            key={property.property_id}
                                            to={`/properties/${property.property_id}`}
                                            className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                                                {property.image_url ? (
                                                    <img
                                                        src={`http://localhost:3001${property.image_url.startsWith('/') ? '' : '/'}${property.image_url}`}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">🏠</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {property.title}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {property.city} • ${parseInt(property.price).toLocaleString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link to={`/properties?agent=${agentId}`} className="block text-center text-xs font-bold text-blue-500 hover:text-blue-600 mt-2 py-1">
                                        View All Listings →
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-sm text-slate-400">
                                    No active listings
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgentHoverCard;
