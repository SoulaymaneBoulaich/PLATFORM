import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MakeOfferModal from '../components/MakeOfferModal';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import useFloat from '../hooks/useFloat';

import ImageGrid from '../components/ImageGrid';
import ProfileHoverCard from '../components/ProfileHoverCard';
import ProfileImage from '../components/ProfileImage';

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

    const images = property?.images?.length > 0
        ? property.images.map(img => img.image_url)
        : [property?.image_url || '/placeholder.jpg'];

    const isOwner = isAuthenticated && user?.user_id === property.seller_id;
    const isUnavailable = property.property_status === 'Sold' || property.property_status === 'Under Offer';

    return (
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-slate-900">
                {/* Header Section (Title & Share/Save) */}
                <div className="hidden lg:block pt-28 pb-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h1>

                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {property.address.startsWith('http') ? (
                                    <a href={property.address} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-teal-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        View on Map
                                    </a>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {property.address}, {property.city}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleToggleFavorite} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-semibold text-sm underline">
                                    <svg className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900 dark:text-white'}`} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>
                                    {isFavorite ? 'Saved' : 'Save'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-semibold text-sm underline">
                                    <svg className="w-5 h-5 text-gray-900 dark:text-white" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><line x1="8.7" y1="10.7" x2="15.3" y2="7.3" /><line x1="8.7" y1="13.3" x2="15.3" y2="16.7" /></svg>
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image Grid */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                        <ImageGrid images={images} title={property.title} />
                    </div>

                    {/* Main Content Areas */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">

                        {/* LEFT COLUMN (Details) */}
                        <div className="lg:col-span-2">
                            {/* Host / Key Info Header */}
                            {/* Host / Key Info Header */}
                            <div className="flex justify-between items-center pb-8 border-b border-gray-200 dark:border-gray-800">
                                <div>
                                    <ProfileHoverCard
                                        owner={{
                                            first_name: property.owner_first_name,
                                            last_name: property.owner_last_name,
                                            image: property.owner_image
                                        }}
                                        propertyId={id}
                                        propertyTitle={property.title}
                                    >
                                        <div className="group cursor-pointer">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-teal-500 transition-colors">
                                                Detailed by {property.owner_first_name} {property.owner_last_name}
                                            </h2>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
                                                Click to view agent profile
                                            </p>
                                        </div>
                                    </ProfileHoverCard>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                                        {property.bedrooms} bedrooms · {property.bathrooms} baths · {property.area} sqft · {property.property_type}
                                    </p>
                                </div>
                                <ProfileHoverCard
                                    owner={{
                                        first_name: property.owner_first_name,
                                        last_name: property.owner_last_name,
                                        image: property.owner_image,
                                        user_id: property.seller_id
                                    }}
                                    propertyId={id}
                                    propertyTitle={property.title}
                                >
                                    <div className="w-14 h-14 rounded-full bg-gray-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all">
                                        <ProfileImage
                                            src={property.owner_image}
                                            alt="Host"
                                            className="w-full h-full object-cover rounded-full"
                                            fallbackText={property.owner_first_name?.[0]}
                                        />
                                    </div>
                                </ProfileHoverCard>
                            </div>

                            {/* Top Features (Highlights) */}
                            <div className="py-8 border-b border-gray-200 dark:border-gray-800 space-y-6">
                                <div className="flex gap-4 items-start">
                                    <svg className="w-6 h-6 text-gray-900 dark:text-white mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Verified Listing</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Every detail has been verified by our quality team.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <svg className="w-6 h-6 text-gray-900 dark:text-white mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Great Location</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">95% of recent guests gave the location a 5-star rating.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="py-8 border-b border-gray-200 dark:border-gray-800">
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">{property.description}</p>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="py-8 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What this place offers</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {property.has_garage && <div className="flex gap-3 items-center text-gray-700 dark:text-gray-300">🚗 Garage parking</div>}
                                    {property.has_pool && <div className="flex gap-3 items-center text-gray-700 dark:text-gray-300">🏊 Private pool</div>}
                                    {property.has_garden && <div className="flex gap-3 items-center text-gray-700 dark:text-gray-300">🌳 Spacious garden</div>}
                                    {/* Static placeholders for "Premium" feel */}
                                    <div className="flex gap-3 items-center text-gray-700 dark:text-gray-300">❄️ Central air conditioning</div>
                                    <div className="flex gap-3 items-center text-gray-700 dark:text-gray-300">🔥 Heating</div>
                                    <div className="flex gap-3 items-center text-gray-700 dark:text-gray-300 line-through opacity-50">📡 Wifi (Unavailable)</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Sticky Sidebar) */}
                        <div className="relative hidden lg:block">
                            <div className="sticky top-32 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            ${Number(property.price).toLocaleString()}
                                        </span>
                                        {property.listing_type === 'Rent' && <span className="text-gray-500 text-lg"> / month</span>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {!isOwner && (
                                        <>
                                            <button
                                                onClick={() => setShowScheduleModal(true)}
                                                className="btn-primary w-full py-3 text-lg"
                                            >
                                                Schedule Viewing
                                            </button>
                                            <button
                                                onClick={() => setShowContactModal(true)}
                                                className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-full font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Contact Seller
                                            </button>
                                            <button
                                                onClick={() => setShowOfferModal(true)}
                                                className="w-full flex items-center justify-center gap-2 py-3 text-teal-600 dark:text-teal-400 font-bold hover:underline"
                                                disabled={isUnavailable}
                                            >
                                                Make an Offer
                                            </button>
                                        </>
                                    )}
                                    {isOwner && (
                                        <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">Manage Listing</button>
                                    )}
                                </div>

                                {isUnavailable && (
                                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-center text-sm font-bold">
                                        Property is {property.property_status}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Agency fees</span>
                                        <span>Included</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Floating Action Button Placeholder (renders only on mobile via CSS but helpful to have logic) */}
                        </div>
                    </div>

                    {/* Mobile Fixed Bottom bar */}
                    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-50 flex items-center justify-between">
                        <div>
                            <span className="block font-bold text-lg text-gray-900 dark:text-white">${Number(property.price).toLocaleString()}</span>
                            <span className="text-xs text-gray-500 block underline">See fee details</span>
                        </div>
                        {!isOwner && (
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="btn-primary px-8 py-3"
                            >
                                Schedule
                            </button>
                        )}
                    </div>

                    {/* Modals reused from original */}
                    {showScheduleModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                            <div className="glass-card w-full max-w-md p-8 relative bg-white dark:bg-slate-900">
                                <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">✕</button>
                                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Schedule Viewing</h3>
                                <form onSubmit={handleScheduleViewing} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                        <input type="date" required className="input-field w-full" value={scheduleData.date} onChange={e => setScheduleData({ ...scheduleData, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                        <input type="time" required className="input-field w-full" value={scheduleData.time} onChange={e => setScheduleData({ ...scheduleData, time: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                        <textarea className="input-field w-full" rows="3" value={scheduleData.message} onChange={e => setScheduleData({ ...scheduleData, message: e.target.value })} placeholder="Any specific questions?" />
                                    </div>
                                    <button type="submit" className="btn-primary w-full mt-4" disabled={actionLoading}>{actionLoading ? 'Scheduling...' : 'Confirm Viewing'}</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {showContactModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                            <div className="glass-card w-full max-w-md p-8 relative bg-white dark:bg-slate-900">
                                <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">✕</button>
                                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Contact Seller</h3>
                                <form onSubmit={handleContactSeller} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                                        <input type="text" required className="input-field w-full" value={contactData.name} onChange={e => setContactData({ ...contactData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input type="email" required className="input-field w-full" value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                        <input type="tel" className="input-field w-full" value={contactData.phone} onChange={e => setContactData({ ...contactData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                        <textarea required className="input-field w-full" rows="4" value={contactData.message} onChange={e => setContactData({ ...contactData, message: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-primary w-full mt-4" disabled={actionLoading}>{actionLoading ? 'Sending...' : 'Send Message'}</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {showOfferModal && <MakeOfferModal property={property} onClose={() => setShowOfferModal(false)} onSuccess={() => { alert('Offer submitted!'); setShowOfferModal(false); }} />}
                </div>
            </div>
        </PageTransition>
    );
};

export default PropertyDetail;
