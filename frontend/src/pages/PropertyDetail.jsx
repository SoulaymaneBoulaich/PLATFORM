import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MakeOfferModal from '../components/MakeOfferModal';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import StartChatButton from '../components/StartChatButton';
import useFloat from '../hooks/useFloat';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal states
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Form states
    const [scheduleData, setScheduleData] = useState({ date: '', time: '', message: '' });
    const [contactData, setContactData] = useState({
        name: user ? `${user.first_name} ${user.last_name}` : '',
        email: user?.email || '',
        phone: '',
        message: ''
    });

    const floatRef = useFloat(0, 10, 5);

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = property?.images?.length > 0
        ? property.images.map(img => img.image_url)
        : [property?.image_url || '/placeholder.jpg'];

    useEffect(() => {
        if (images.length > 1) {
            const timer = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % images.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [images.length]);

    useEffect(() => {
        fetchProperty();
        trackView();
        if (isAuthenticated) checkFavoriteStatus();
    }, [id, isAuthenticated]);

    const trackView = async () => {
        try { await api.post(`/properties/${id}/view`); } catch (err) { console.error(err); }
    };

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/properties/${id}`);
            setProperty(response.data);
        } catch (err) {
            setError(err.response?.status === 404 ? 'Property not found.' : 'Failed to load property details.');
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const response = await api.get(`/properties/${id}/favorite-status`);
            setIsFavorite(response.data.isFavorite || false);
        } catch (err) { console.error(err); }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) return navigate('/login');
        try {
            setActionLoading(true);
            const response = await api.post(`/properties/${id}/favorite`);
            setIsFavorite(response.data.favorited);
        } catch (err) {
            alert('Failed to update favorites.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleScheduleViewing = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return navigate('/login');
        try {
            setActionLoading(true);
            await api.post(`/properties/${id}/viewings`, {
                preferredDate: scheduleData.date,
                preferredTime: scheduleData.time,
                message: scheduleData.message
            });
            alert('Viewing scheduled successfully!');
            setShowScheduleModal(false);
            setScheduleData({ date: '', time: '', message: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to schedule viewing.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleContactSeller = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return navigate('/login');
        try {
            setActionLoading(true);
            const response = await api.post(`/properties/${id}/contact`, contactData);
            setShowContactModal(false);
            if (response.data.conversation_id) navigate(`/messages?conversationId=${response.data.conversation_id}`);
            else alert('Message sent successfully!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send message.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner message="Loading property..." /></div>;

    if (error || !property) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-md">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error || 'Property Not Found'}</h3>
                    <button onClick={() => navigate('/properties')} className="btn-primary mt-4">Browse Properties</button>
                </div>
            </div>
        );
    }



    // ... (rest of logic)

    const isOwner = isAuthenticated && user?.user_id === property.seller_id;
    const isUnavailable = property.property_status === 'Sold' || property.property_status === 'Under Offer';

    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 relative overflow-hidden">
                {/* Hero Carousel */}
                <div className="relative h-[75vh] 2xl:h-[80vh] overflow-hidden group">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${property.title} - ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/20" />
                        </div>
                    ))}

                    {/* Carousel Controls */}
                    {images.length > 1 && (
                        <div className="absolute inset-0 z-20 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}

                    {/* Indicators */}
                    {images.length > 1 && (
                        <div className="absolute bottom-32 left-0 w-full z-20 flex justify-center gap-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 w-full z-20 pb-24 pt-32 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent pointer-events-none">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="animate-enter max-w-4xl pointer-events-auto">
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md ${property.listing_type === 'Sale' ? 'bg-teal-500/90 text-white' : 'bg-purple-500/90 text-white'
                                        }`}>
                                        For {property.listing_type}
                                    </span>
                                    {property.property_status !== 'Available' && (
                                        <span className="px-5 py-2 rounded-full text-sm font-bold bg-yellow-500/90 text-white shadow-lg uppercase backdrop-blur-md">
                                            {property.property_status}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg leading-tight tracking-tight">{property.title}</h1>
                                <p className="text-xl md:text-2xl text-gray-200 flex items-center gap-2 mb-8 font-light">
                                    <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {property.address}, {property.city}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="glass-card px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                                        <span className="text-4xl md:text-5xl font-black text-white drop-shadow-sm">
                                            ${parseFloat(property.price).toLocaleString()}
                                            {property.listing_type === 'Rent' && <span className="text-2xl text-gray-300 font-normal">/mo</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Details Column */}
                        <div className="lg:col-span-2 space-y-8 animate-enter stagger-1">
                            {/* Key Features Grid */}
                            <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{property.bedrooms}</p>
                                    <p className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Beds</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{property.bathrooms}</p>
                                    <p className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Baths</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{property.area || property.area_sqft}</p>
                                    <p className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400">Sq Ft</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white truncate pt-1">{property.property_type}</p>
                                    <p className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mt-1">Type</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="glass-card p-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this property</h2>
                                <p className="text-gray-700 dark:text-gray-300 calling-relaxed leading-8 text-lg whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>

                            {/* Amenities */}
                            {(property.has_garage || property.has_pool || property.has_garden) && (
                                <div className="glass-card p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Amenities</h2>
                                    <div className="flex flex-wrap gap-4">
                                        {property.has_garage && (
                                            <span className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-semibold">
                                                🚗 Garage
                                            </span>
                                        )}
                                        {property.has_pool && (
                                            <span className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold">
                                                🏊 Pool
                                            </span>
                                        )}
                                        {property.has_garden && (
                                            <span className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-semibold">
                                                🌳 Garden
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div ref={floatRef} className="lg:col-span-1 space-y-6 animate-enter stagger-2">
                            {/* Action Card */}
                            {!isOwner && (
                                <div className="glass-card p-6 space-y-4 sticky top-24">
                                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Listed by</h3>
                                        <div className="flex items-center gap-4">
                                            {property.owner_image ? (
                                                <img src={property.owner_image} alt="Seller" className="w-12 h-12 rounded-full object-cover shadow-lg" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                    {property.owner_first_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-lg">{property.owner_first_name} {property.owner_last_name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Verified Seller</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="btn-primary w-full shadow-neon"
                                    >
                                        Message Seller
                                    </button>

                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="btn-secondary w-full"
                                    >
                                        Schedule Viewing
                                    </button>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={handleToggleFavorite}
                                            className={`py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${isFavorite
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <svg className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'none'}`} stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span className="text-xs font-bold">{isFavorite ? 'Saved' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={() => setShowOfferModal(true)}
                                            disabled={isUnavailable}
                                            className="bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                                        >
                                            <span className="text-xl">💰</span>
                                            <span className="text-xs font-bold">Offer</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isOwner && (
                                <div className="glass-card p-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">You own this listing</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Go to your dashboard to manage, edit, or remove this property.</p>
                                    <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">Manage in Dashboard</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showScheduleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                        <div className="glass-card w-full max-w-md p-8 relative">
                            <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">✕</button>
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Schedule Viewing</h3>
                            <form onSubmit={handleScheduleViewing} className="space-y-4">
                                <div>
                                    <label className="label">Date</label>
                                    <input type="date" required className="input-field w-full" value={scheduleData.date} onChange={e => setScheduleData({ ...scheduleData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Time</label>
                                    <input type="time" required className="input-field w-full" value={scheduleData.time} onChange={e => setScheduleData({ ...scheduleData, time: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Message</label>
                                    <textarea className="input-field w-full" rows="3" value={scheduleData.message} onChange={e => setScheduleData({ ...scheduleData, message: e.target.value })} placeholder="Any specific questions?" />
                                </div>
                                <button type="submit" className="btn-primary w-full mt-4" disabled={actionLoading}>{actionLoading ? 'Scheduling...' : 'Confirm Viewing'}</button>
                            </form>
                        </div>
                    </div>
                )}
                {showContactModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                        <div className="glass-card w-full max-w-md p-8 relative">
                            <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">✕</button>
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Contact Seller</h3>
                            <form onSubmit={handleContactSeller} className="space-y-4">
                                <div>
                                    <label className="label">Your Name</label>
                                    <input type="text" required className="input-field w-full" value={contactData.name} onChange={e => setContactData({ ...contactData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" required className="input-field w-full" value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Phone (Optional)</label>
                                    <input type="tel" className="input-field w-full" value={contactData.phone} onChange={e => setContactData({ ...contactData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Message</label>
                                    <textarea required className="input-field w-full" rows="4" value={contactData.message} onChange={e => setContactData({ ...contactData, message: e.target.value })} />
                                </div>
                                <button type="submit" className="btn-primary w-full mt-4" disabled={actionLoading}>{actionLoading ? 'Sending...' : 'Send Message'}</button>
                            </form>
                        </div>
                    </div>
                )}

                {showOfferModal && <MakeOfferModal property={property} onClose={() => setShowOfferModal(false)} onSuccess={() => { alert('Offer submitted!'); setShowOfferModal(false); }} />}

            </div>
        </PageTransition>
    );
};

export default PropertyDetail;
