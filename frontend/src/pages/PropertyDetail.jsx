import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ImageGallery from '../components/ImageGallery';
import AppointmentForm from '../components/AppointmentForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewFormData, setReviewFormData] = useState({ rating: 5 });
    const [userReview, setUserReview] = useState(null);

    // Appointment state
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    useEffect(() => {
        fetchProperty();
        fetchReviews();
        if (isAuthenticated && user) {
            checkFavoriteStatus();
        }
    }, [id, user]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/properties/${id}`);
            setProperty(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load property details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const response = await api.get(`/users/${user.user_id}/favorites`);
            setIsFavorite(response.data.some(fav => fav.property_id === parseInt(id)));
        } catch (err) {
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
            if (isFavorite) {
                await api.delete(`/users/${user.user_id}/favorites/${id}`);
                setIsFavorite(false);
            } else {
                await api.post(`/users/${user.user_id}/favorites`, { property_id: parseInt(id) });
                setIsFavorite(true);
            }
        } catch (err) {
            setError('Failed to update favorites. Please try again.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            setActionLoading(true);
            await api.delete(`/properties/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to delete property. ' + (err.response?.data?.error || ''));
            setActionLoading(false);
        }
    };

    // Reviews functions
    const fetchReviews = async () => {
        try {
            const response = await api.get(`/properties/${id}/reviews`);
            setReviews(response.data.reviews);
            setAverageRating(response.data.average_rating);
            setReviewCount(response.data.review_count);

            // Check if current user has a review
            if (user) {
                const userRev = response.data.reviews.find(r => r.user_id === user.user_id);
                setUserReview(userRev);
                if (userRev) {
                    setReviewFormData({ rating: userRev.rating });
                }
            }
        } catch (err) {
            console.error('Failed to load reviews:', err);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setActionLoading(true);
            if (userReview) {
                // Update existing review
                await api.put(`/reviews/${userReview.review_id}`, reviewFormData);
            } else {
                // Create new review
                await api.post(`/properties/${id}/reviews`, reviewFormData);
            }

            await fetchReviews();
            setShowReviewForm(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReviewDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;

        try {
            setActionLoading(true);
            await api.delete(`/reviews/${userReview.review_id}`);
            await fetchReviews();
            setReviewFormData({ rating: 5 });
            setShowReviewForm(false);
        } catch (err) {
            setError('Failed to delete review');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAppointmentSuccess = () => {
        setShowAppointmentModal(false);
        alert('Appointment scheduled successfully! Check your dashboard for details.');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) return <Loader />;
    if (error && !property) return <div className="min-h-screen flex items-center justify-center"><ErrorMessage message={error} /></div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center"><p>Property not found</p></div>;

    const isOwner = user && property.seller_id === user.user_id;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-primary-600 hover:text-primary-700 flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <ErrorMessage message={error} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <ImageGallery images={property.images || []} />

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
                                    <p className="text-gray-600">{property.address}, {property.city}</p>
                                </div>
                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg font-semibold">
                                    {property.listing_type}
                                </span>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <p className="text-gray-500 text-sm">Bedrooms</p>
                                        <p className="text-xl font-semibold">{property.bedrooms}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Bathrooms</p>
                                        <p className="text-xl font-semibold">{property.bathrooms}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Area</p>
                                        <p className="text-xl font-semibold">{property.area} sqft</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Type</p>
                                        <p className="text-xl font-semibold">{property.property_type}</p>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <p className="text-3xl font-bold text-primary-600 mb-6">
                                {formatPrice(property.price)}
                            </p>

                            {isAuthenticated && !isOwner && (
                                <>
                                    <button
                                        onClick={handleToggleFavorite}
                                        disabled={actionLoading}
                                        className={`w-full mb-3 py-2 px-4 rounded-lg font-semibold transition-colors ${isFavorite
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                            } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                                    </button>

                                    <button
                                        onClick={() => setShowAppointmentModal(true)}
                                        className="w-full btn-primary mb-3"
                                    >
                                        📅 Schedule Viewing
                                    </button>
                                </>
                            )}

                            {isOwner && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 mb-3">You own this property</p>
                                    <button
                                        onClick={() => navigate(`/dashboard?edit=${id}`)}
                                        className="w-full btn-primary"
                                    >
                                        Edit Property
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={actionLoading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Deleting...' : 'Delete Property'}
                                    </button>
                                </div>
                            )}

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h3 className="font-semibold mb-3">Property Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Property ID:</span>
                                        <span className="font-medium">{property.property_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Listed:</span>
                                        <span className="font-medium">
                                            {new Date(property.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Reviews</h2>
                                {reviewCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400 text-xl">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star}>
                                                    {star <= Math.round(averageRating) ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-gray-600">
                                            {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                )}
                            </div>

                            {isAuthenticated && !isOwner && user?.user_type === 'buyer' && (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="btn-primary mb-4"
                                >
                                    {userReview ? 'Edit Your Review' : 'Write a Review'}
                                </button>
                            )}

                            {showReviewForm && (
                                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewFormData({ rating: star })}
                                                    className="text-3xl"
                                                >
                                                    <span className={star <= reviewFormData.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="submit" disabled={actionLoading} className="btn-primary">
                                            {actionLoading ? 'Submitting...' : (userReview ? 'Update' : 'Submit')}
                                        </button>
                                        {userReview && (
                                            <button type="button" onClick={handleReviewDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">
                                                Delete
                                            </button>
                                        )}
                                        <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">Cancel</button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-4">
                                {reviews.length > 0 ? reviews.map((review) => (
                                    <div key={review.review_id} className="border-b pb-4">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <p className="font-semibold">{review.first_name} {review.last_name}</p>
                                                <div className="flex text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map((star) => <span key={star}>{star <= review.rating ? '★' : '☆'}</span>)}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {review.comment && <p className="text-gray-700">{review.comment}</p>}
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-center py-4">No reviews yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointment Modal */}
                {showAppointmentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">Schedule Viewing</h3>
                            <AppointmentForm
                                propertyId={parseInt(id)}
                                onSuccess={handleAppointmentSuccess}
                                onCancel={() => setShowAppointmentModal(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyDetail;
