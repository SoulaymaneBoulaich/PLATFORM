import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import StartChatButton from '../components/StartChatButton';
import ErrorMessage from '../components/ErrorMessage';

const Agents = () => {
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Property Sellers</h1>
                    <p className="text-gray-600 dark:text-gray-400">Connect with experienced property sellers</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search sellers by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field w-full max-w-md"
                    />
                </div>

                <ErrorMessage message={error} />

                {loading ? (
                    <Loader />
                ) : filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map((agent) => (
                            <div key={agent.user_id} className="card p-6 hover:shadow-lg transition-shadow bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                                {/* Profile Image */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                        {agent.profile_image_url ? (
                                            <img
                                                src={agent.profile_image_url.startsWith('/')
                                                    ? `http://localhost:5000${agent.profile_image_url}`
                                                    : agent.profile_image_url}
                                                alt={`${agent.first_name} ${agent.last_name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-primary-600">
                                                {agent.first_name?.[0]}{agent.last_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Agent Info */}
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                        {agent.first_name} {agent.last_name}
                                    </h3>

                                    {agent.location && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            📍 {agent.location}
                                        </p>
                                    )}

                                    {/* Property Count & Rating Badge */}
                                    <div className="mb-3 space-y-1">
                                        <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                                            {agent.property_count || 0} {(agent.property_count || 0) === 1 ? 'Property' : 'Properties'}
                                        </span>
                                        {agent.avg_rating > 0 && (
                                            <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium ml-2">
                                                ⭐ {parseFloat(agent.avg_rating).toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    {agent.bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                            {agent.bio}
                                        </p>
                                    )}

                                    {/* Contact Info */}
                                    <div className="space-y-2 mb-4">
                                        {agent.phone && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                📞 {agent.phone}
                                            </p>
                                        )}
                                        {agent.email && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                ✉️ {agent.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/agents/${agent.user_id}`}
                                            className="btn-primary flex-1 text-center"
                                        >
                                            View Profile
                                        </Link>
                                        <StartChatButton
                                            targetUser={{ user_id: agent.user_id, first_name: agent.first_name, last_name: agent.last_name }}
                                            variant="icon"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm ? 'No sellers found matching your search.' : 'No sellers available at the moment.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agents;
