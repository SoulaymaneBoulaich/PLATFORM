import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Agents</h1>
                    <p className="text-gray-600">Connect with experienced real estate professionals</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search agents by name or email..."
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
                            <div key={agent.agent_id} className="card p-6 hover:shadow-lg transition-shadow">
                                {/* Profile Image */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                        {agent.profile_image ? (
                                            <img
                                                src={agent.profile_image}
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
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {agent.first_name} {agent.last_name}
                                    </h3>

                                    {agent.license_number && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            License: {agent.license_number}
                                        </p>
                                    )}

                                    {agent.bio && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                            {agent.bio}
                                        </p>
                                    )}

                                    {/* Contact Info */}
                                    <div className="space-y-2 mb-4">
                                        {agent.phone && (
                                            <p className="text-sm text-gray-700">
                                                📞 {agent.phone}
                                            </p>
                                        )}
                                        {agent.email && (
                                            <p className="text-sm text-gray-700">
                                                ✉️ {agent.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* View Profile Button */}
                                    <Link
                                        to={`/agents/${agent.agent_id}`}
                                        className="btn-primary w-full block text-center"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-600">
                            {searchTerm ? 'No agents found matching your search.' : 'No agents available at the moment.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Agents;
