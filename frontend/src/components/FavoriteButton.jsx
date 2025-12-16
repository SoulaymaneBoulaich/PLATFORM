import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FavoriteButton = ({ propertyId, className = '', size = 'md', showCount = false }) => {
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(0);

    const sizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    useEffect(() => {
        if (user) {
            checkFavoriteStatus();
        }
        if (showCount) {
            fetchFavoriteCount();
        }
    }, [propertyId, user]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await api.get(`/favorites/check/${propertyId}`);
            setIsFavorited(response.data.is_favorited);
        } catch (err) {
            console.error('Failed to check favorite status:', err);
        }
    };

    const fetchFavoriteCount = async () => {
        try {
            const response = await api.get(`/favorites/count/${propertyId}`);
            setCount(response.data.count);
        } catch (err) {
            console.error('Failed to fetch favorite count:', err);
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please login to add favorites');
            return;
        }

        setIsLoading(true);
        try {
            if (isFavorited) {
                await api.delete(`/favorites/${propertyId}`);
                setIsFavorited(false);
                if (showCount) setCount(prev => Math.max(0, prev - 1));
            } else {
                await api.post('/favorites', { property_id: propertyId });
                setIsFavorited(true);
                if (showCount) setCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            alert(err.response?.data?.message || 'Failed to update favorite');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`relative group ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <div className="relative">
                {/* Glow effect when favorited */}
                {isFavorited && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-pink-500 rounded-full blur-lg opacity-50"
                    />
                )}

                {/* Heart icon */}
                <div className="relative">
                    {isFavorited ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                            <FaHeart
                                className={`${sizes[size]} text-pink-500 drop-shadow-lg ${isLoading ? 'opacity-50' : ''}`}
                            />
                        </motion.div>
                    ) : (
                        <FaRegHeart
                            className={`${sizes[size]} text-white drop-shadow-lg group-hover:text-pink-300 transition-colors ${isLoading ? 'opacity-50' : ''}`}
                        />
                    )}
                </div>
            </div>

            {/* Favorite count */}
            {showCount && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {count}
                </span>
            )}
        </motion.button>
    );
};

export default FavoriteButton;
