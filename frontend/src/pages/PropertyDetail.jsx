import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MakeOfferModal from '../components/MakeOfferModal';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';

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

    // Schedule form
    const [scheduleData, setScheduleData] = useState({
        date: '',
        time: '',
        message: ''
    });

    // Contact form
    const [contactData, setContactData] = useState({
        name: user?.first_name + ' ' + user?.last_name || '',
        email: user?.email || '',
        phone: '',
        message: ''
    });

    useEffect(() => {
        fetchProperty();
        trackView();
        if (isAuthenticated) {
            checkFavoriteStatus();
        }
    }, [id, isAuthenticated]);

    const trackView = async () => {
        try {
            await api.post(`/properties/${id}/view`);
        } catch (err) {
            console.error('Failed to track view:', err);
        }
    };

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/properties/${id}`);
            setProperty(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.status === 404 ? 'Property not found.' : 'Failed to load property details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const response = await api.get(`/properties/${id}/favorite-status`);
            setIsFavorite(response.data.isFavorite || false);
        } catch (err) {
            // Ignore error - user might not have any favorites yet
            console.error('Failed to check favorite status:', err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setActionLoading(true);
            const response = await api.post(`/properties/${id}/favorite`);
            setIsFavorite(response.data.favorited);
        } catch (err) {
            alert('Failed to update favorites. Please try again.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleScheduleViewing = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setActionLoading(true);
            await api.post(`/properties/${id}/viewings`, {
                preferredDate: scheduleData.date,
                preferredTime: scheduleData.time,
                message: scheduleData.message
            });

            alert('Viewing scheduled successfully! The seller will contact you soon.');
            setShowScheduleModal(false);
            setScheduleData({ date: '', time: '', message: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to schedule viewing. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleContactSeller = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setActionLoading(true);
            const response = await api.post(`/properties/${id}/contact`, {
                name: contactData.name,
                email: contactData.email,
                phone: contactData.phone,
                message: contactData.message
            });

            setShowContactModal(false);

            // Navigate to messages with conversation
            if (response.data.conversation_id) {
                navigate(`/messages?conversationId=${response.data.conversation_id}`);
            } else {
                alert('Message sent successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send message. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Skeleton Loader */}
                    <div className="animate-pulse">
                        <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-32 bg-gray-300 rounded"></div>
                            </div>
                            <div className="h-64 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                    <div className="text-center max-w-md">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{error}</h3>
                        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => navigate('/properties')}
                            className="btn-primary"
                        >
                            ← Back to Properties
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    const isOwner = isAuthenticated && user?.user_id === property.seller_id;
    const propertyStatus = property.property_status || 'Available';
    const isUnavailable = propertyStatus === 'Sold' || propertyStatus === 'Under Offer';

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Main Image */}
                    <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg">
                        <img
                            src={property.image_url || '/placeholder.jpg'}
                            alt={property.title}
                            className="w-full h-96 object-cover"
                        />
                        {/* Status Badge */}
                        {propertyStatus !== 'Available' && (
                            <div className="absolute top-4 right-4 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow">
                                {propertyStatus}
                            </div>
                        )}
                        {/* Listing Type Badge */}
                        <div className="absolute top-4 left-4 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow">
                            For {property.listing_type === 'rent' ? 'Rent' : 'Sale'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title and Price */}
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{property.address_line1 || property.address}, {property.city}</span>
                                </div>
                                <div className="text-5xl font-bold text-primary-600 mb-6">
                                    {formatPrice(property.price)}
                                    {property.listing_type === 'rent' && <span className="text-2xl text-gray-600">/month</span>}
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="card bg-white p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {property.bedrooms && (
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                                                <p className="text-sm text-gray-600">Bedrooms</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.bathrooms && (
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                            </svg>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                                                <p className="text-sm text-gray-600">Bathrooms</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.area_sqft && (
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">{property.area_sqft}</p>
                                                <p className="text-sm text-gray-600">Sq Ft</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.property_type && (
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 capitalize">{property.property_type}</p>
                                                <p className="text-sm text-gray-600">Type</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="card bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                                </div>
                            )}

                            {/* Amenities */}
                            {(property.has_garage || property.has_pool || property.has_garden) && (
                                <div className="card bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {property.has_garage && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Garage
                                            </div>
                                        )}
                                        {property.has_pool && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Swimming Pool
                                            </div>
                                        )}
                                        {property.has_garden && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Garden
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Action Buttons */}
                            {!isOwner && (
                                <div className="card bg-white p-6 space-y-3">
                                    <button
                                        onClick={handleToggleFavorite}
                                        disabled={actionLoading}
                                        className={`w-full btn-secondary flex items-center justify-center gap-2 ${isFavorite ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100' : ''
                                            }`}
                                    >
                                        <svg
                                            className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
                                            fill={isFavorite ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                    </button>

                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="w-full btn-secondary"
                                    >
                                        📅 Schedule Viewing
                                    </button>

                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="w-full btn-primary"
                                    >
                                        📧 Contact Seller
                                    </button>

                                    <button
                                        onClick={() => setShowOfferModal(true)}
                                        disabled={isUnavailable}
                                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        💰 {isUnavailable ? `Property ${propertyStatus}` : 'Make an Offer'}
                                    </button>
                                </div>
                            )}

                            {/* Owner Info */}
                            <div className="card bg-white p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Property Owner</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {property.seller_first_name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg">
                                            {property.seller_first_name} {property.seller_last_name}
                                        </p>
                                        <p className="text-sm text-gray-600">{property.seller_email}</p>
                                    </div>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Listed:</span> {formatDate(property.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Viewing Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Schedule a Viewing</h3>
                        <form onSubmit={handleScheduleViewing} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                <input
                                    type="date"
                                    value={scheduleData.date}
                                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                                    className="input-field w-full"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                <input
                                    type="time"
                                    value={scheduleData.time}
                                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                                    className="input-field w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                <textarea
                                    value={scheduleData.message}
                                    onChange={(e) => setScheduleData({ ...scheduleData, message: e.target.value })}
                                    className="input-field w-full"
                                    rows={3}
                                    placeholder="Any special requests or questions..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
                                    {actionLoading ? 'Scheduling...' : 'Schedule'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Contact Seller Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Seller</h3>
                        <form onSubmit={handleContactSeller} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={contactData.name}
                                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                    className="input-field w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={contactData.email}
                                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                    className="input-field w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={contactData.phone}
                                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={contactData.message}
                                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                                    className="input-field w-full"
                                    rows={4}
                                    placeholder="I'm interested in this property..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
                                    {actionLoading ? 'Sending...' : 'Send Message'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowContactModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Make Offer Modal */}
            {showOfferModal && (
                <MakeOfferModal
                    property={property}
                    onClose={() => setShowOfferModal(false)}
                    onSuccess={() => {
                        alert('Offer submitted successfully! The seller will review it shortly.');
                        setShowOfferModal(false);
                    }}
                />
            )}
        </PageTransition>
    );
};

export default PropertyDetail;
