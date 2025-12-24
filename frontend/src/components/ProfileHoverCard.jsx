import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfileImage from './ProfileImage';

const ProfileHoverCard = ({ owner, propertyId, propertyTitle, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
    const [showRateModal, setShowRateModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (isHovered && owner?.user_id) {
            fetchStats();
        }
    }, [isHovered, owner]);

    const fetchStats = async () => {
        try {
            const res = await api.get(`/users/${owner.user_id}/reviews/stats`);
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleMessage = async (e) => {
        e.stopPropagation();
        try {
            const res = await api.post('/conversations/start', {
                targetUserId: owner.user_id,
                propertyId: propertyId
            });
            // Backend returns snake_case conversation_id
            navigate(`/messages?conversationId=${res.data.conversation_id}`);
        } catch (err) {
            console.error('Failed to start conversation:', err);
            api.get('/conversations').then(res => {
                const existing = res.data.find(c => c.other_user_id === owner.user_id);
                if (existing) navigate(`/messages?conversationId=${existing.conversation_id}`);
                else navigate('/messages');
            }).catch(() => navigate('/messages'));
        }
    };

    const handleRate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/users/${owner.user_id}/reviews`, { rating, comment });
            await fetchStats();
            setShowRateModal(false);
            setComment('');
        } catch (err) {
            console.error('Failed to submit review:', err);
            // alert(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div
                className="relative inline-block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}

                <AnimatePresence>
                    {isHovered && !showRateModal && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full pt-2 w-80 z-50"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <div className="glass-card p-6 rounded-2xl shadow-xl border border-white/20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative w-16 h-16 shrink-0">
                                        <ProfileImage
                                            src={owner.image}
                                            alt={owner.first_name}
                                            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
                                            fallbackText={owner.first_name?.[0]}
                                        />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{owner.first_name} {owner.last_name}</h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Verified Agent
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                        <div className="flex items-center justify-center gap-1">
                                            <p className="font-bold text-teal-600 dark:text-teal-400 text-lg">{stats.average_rating || 'N/A'}</p>
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{stats.total_reviews} Reviews</p>
                                    </div>
                                    <div
                                        onClick={() => setShowRateModal(true)}
                                        className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex flex-col items-center justify-center"
                                    >
                                        <span className="text-2xl">⭐</span>
                                        <p className="text-[10px] text-blue-500 font-bold mt-1">RATE AGENT</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleMessage}
                                    className="w-full btn-primary py-2 flex items-center justify-center gap-2 group"
                                >
                                    <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    Chat about property
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Rating Modal */}
            <AnimatePresence>
                {showRateModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowRateModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-4 text-center dark:text-white">Rate {owner.first_name}</h3>
                            <form onSubmit={handleRate}>
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience (optional)..."
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border-none focus:ring-2 focus:ring-blue-500 mb-4 dark:text-white"
                                    rows="3"
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRateModal(false)}
                                        className="flex-1 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                    >
                                        {submitting ? 'Sending...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProfileHoverCard;
