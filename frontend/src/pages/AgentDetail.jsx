import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
import StartChatButton from '../components/StartChatButton';
import ErrorMessage from '../components/ErrorMessage';

const AgentDetail = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAgentDetail();
    }, [id]);

    const fetchAgentDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/agents/${id}`);
            setAgent(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load agent details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <ErrorMessage message={error} />;
    if (!agent) return <div className="text-center py-12">Agent not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Agent Profile Section */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            <div className="w-40 h-40 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                {agent.profile_image ? (
                                    <img
                                        src={agent.profile_image}
                                        alt={`${agent.first_name} ${agent.last_name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold text-primary-600">
                                        {agent.first_name?.[0]}{agent.last_name?.[0]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Agent Information */}
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {agent.first_name} {agent.last_name}
                            </h1>

                            {agent.license_number && (
                                <p className="text-sm text-gray-500 mb-4">
                                    License Number: {agent.license_number}
                                </p>
                            )}

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {agent.phone && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">📞</span>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-semibold">{agent.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {agent.email && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">✉️</span>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-semibold">{agent.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            {agent.bio && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                                    <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
                                </div>
                            )}

                            {/* Chat Button */}
                            <StartChatButton
                                targetUser={{ user_id: agent.user_id, first_name: agent.first_name, last_name: agent.last_name }}
                                className="mt-4"
                            />
                        </div>
                    </div>
                </div>

                {/* Agent's Properties Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {agent.first_name}'s Properties
                        </h2>
                        <span className="text-gray-600">
                            {agent.properties?.length || 0} {agent.properties?.length === 1 ? 'property' : 'properties'}
                        </span>
                    </div>

                    {agent.properties && agent.properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agent.properties.map((property) => (
                                <PropertyCard
                                    key={property.property_id}
                                    property={property}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <p className="text-gray-600">
                                This agent currently has no active properties listed.
                            </p>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-8">
                    <Link to="/agents" className="text-primary-600 hover:text-primary-700 font-medium">
                        ← Back to All Agents
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AgentDetail;
