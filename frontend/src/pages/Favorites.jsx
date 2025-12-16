import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaMapMarkerAlt, FaBed, FaBath, FaRuler, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Favorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await api.get('/favorites');
            setFavorites(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (propertyId) => {
        try {
            await api.delete(`/favorites/${propertyId}`);
            setFavorites(favorites.filter(fav => fav.property_id !== propertyId));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
            alert('Failed to remove from favorites');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 pt-20 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 mb-8">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <FaHeart className="text-6xl mx-auto mb-4 animate-pulse" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            My Favorites
                        </h1>
                        <p className="text-xl text-purple-100">
                            {favorites.length} {favorites.length === 1 ? 'Property' : 'Properties'} Saved
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {favorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <div className="card-glass max-w-md mx-auto p-12">
                            <FaHeart className="text-6xl text-gray-300 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-700 mb-3">
                                No Favorites Yet
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Start adding properties to your favorites by clicking the heart icon!
                            </p>
                            <Link
                                to="/properties"
                                className="btn-gradient inline-block"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {favorites.map((property, index) => (
                                <motion.div
                                    key={property.property_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="card-glass overflow-hidden group relative"
                                >
                                    {/* Property Image */}
                                    <Link to={`/properties/${property.property_id}`} className="block relative h-56 overflow-hidden">
                                        <img
                                            src={property.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt={property.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                            }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.status === 'FOR_SALE' ? 'bg-green-500 text-white' :
                                                    property.status === 'FOR_RENT' ? 'bg-blue-500 text-white' :
                                                        'bg-gray-500 text-white'
                                                }`}>
                                                {property.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Property Details */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                                                    {property.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 flex items-center">
                                                    <FaMapMarkerAlt className="mr-1 text-indigo-600" />
                                                    {property.city}, {property.country}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFavorite(property.property_id)}
                                                className="p-2 hover:bg-red-50 rounded-full transition-colors group/btn"
                                                title="Remove from favorites"
                                            >
                                                <FaTrash className="text-red-500 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </div>

                                        <p className="text-2xl font-bold text-gradient mb-4">
                                            ${property.price?.toLocaleString()}
                                        </p>

                                        {/* Property Features */}
                                        <div className="flex gap-4 text-sm text-gray-600 mb-4">
                                            {property.bedrooms && (
                                                <div className="flex items-center gap-1">
                                                    <FaBed className="text-indigo-600" />
                                                    <span>{property.bedrooms}</span>
                                                </div>
                                            )}
                                            {property.bathrooms && (
                                                <div className="flex items-center gap-1">
                                                    <FaBath className="text-indigo-600" />
                                                    <span>{property.bathrooms}</span>
                                                </div>
                                            )}
                                            {property.area && (
                                                <div className="flex items-center gap-1">
                                                    <FaRuler className="text-indigo-600" />
                                                    <span>{property.area}m²</span>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            to={`/properties/${property.property_id}`}
                                            className="block w-full text-center btn-gradient py-2 text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
