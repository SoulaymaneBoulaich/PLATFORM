import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/Spinner';
import PageTransition from '../components/PageTransition';

const Offers = () => {
    const { user } = useAuth();
    const [receivedOffers, setReceivedOffers] = useState([]);
    const [sentOffers, setSentOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
    const [processingId, setProcessingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Counter Offer State
    const [counteringId, setCounteringId] = useState(null);
    const [counterAmount, setCounterAmount] = useState('');
    const [counterMessage, setCounterMessage] = useState('');

    useEffect(() => {
        fetchOffers();
    }, []);

    useEffect(() => {
        // Auto-switch tab based on data presence and role
        if (!loading) {
            if (receivedOffers.length > 0) {
                setActiveTab('received');
            } else if (sentOffers.length > 0) {
                setActiveTab('sent');
            } else {
                // If no data, default based on role
                setActiveTab(user?.user_type === 'seller' || user?.user_type === 'agent' ? 'received' : 'sent');
            }
        }
    }, [loading]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const [receivedRes, sentRes] = await Promise.all([
                api.get('/offers/seller').catch(() => ({ data: [] })), // Ignore error if not seller
                api.get('/offers/buyer').catch(() => ({ data: [] }))   // Ignore error if not buyer
            ]);

            setReceivedOffers(receivedRes.data);
            setSentOffers(sentRes.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch offers:', err);
            setError('Failed to load offers.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (offerId, status, newAmount = null, message = null) => {
        try {
            setProcessingId(offerId);
            await api.patch(`/offers/${offerId}`, {
                status,
                counter_amount: newAmount,
                message
            });

            // Refresh logic (optimistic update is faster but refresh is safer)
            await fetchOffers();
            setCounteringId(null);
            setCounterAmount('');
            setCounterMessage('');
        } catch (err) {
            console.error('Failed to update offer:', err);
            alert('Failed to update offer status.');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Filter Logic
    const filteredReceived = receivedOffers.filter(offer =>
        offer.property_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${offer.buyer_first_name} ${offer.buyer_last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSent = sentOffers.filter(offer =>
        offer.property_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offers Management</h1>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search properties or names..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`pb-4 px-6 text-lg font-medium transition-all duration-200 ${activeTab === 'received'
                                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Received Offers
                            {receivedOffers.length > 0 && (
                                <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                                    {receivedOffers.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`pb-4 px-6 text-lg font-medium transition-all duration-200 ${activeTab === 'sent'
                                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Sent Offers
                            {sentOffers.length > 0 && (
                                <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                                    {sentOffers.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'received' && (
                        <div className="space-y-6">
                            {filteredReceived.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-lg shadow">
                                    <p className="text-xl">
                                        {searchQuery ? 'No offers match your search.' : 'No offers received yet.'}
                                    </p>
                                </div>
                            ) : (
                                filteredReceived.map((offer) => (
                                    <div key={offer.offer_id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            {/* Property & Buyer Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={offer.property_image || '/placeholder.jpg'}
                                                        alt={offer.property_title}
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <Link to={`/properties/${offer.property_id}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-500">
                                                            {offer.property_title}
                                                        </Link>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                            From: <span className="font-semibold text-gray-900 dark:text-gray-200">{offer.buyer_first_name} {offer.buyer_last_name}</span>
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                                            {formatDate(offer.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Message Bubble */}
                                                {offer.message && (
                                                    <div className="mt-4 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic">
                                                        "{offer.message}"
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex flex-col items-end justify-between min-w-[200px]">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Offer Amount</p>
                                                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                                        {formatPrice(offer.amount)}
                                                    </p>
                                                    <div className={`
                                                        inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide
                                                        ${offer.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            offer.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                offer.status === 'Countered' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
                                                    `}>
                                                        {offer.status}
                                                    </div>
                                                </div>

                                                {offer.status === 'Pending' && (
                                                    <div className="mt-4 space-y-2 w-full">
                                                        {counteringId === offer.offer_id ? (
                                                            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg mt-2 animate-in fade-in slide-in-from-top-2">
                                                                <h4 className="text-sm font-semibold mb-2 dark:text-white">Counter Offer</h4>
                                                                <input
                                                                    type="number"
                                                                    placeholder="New Amount"
                                                                    value={counterAmount}
                                                                    onChange={(e) => setCounterAmount(e.target.value)}
                                                                    className="input-field w-full mb-2 text-sm"
                                                                />
                                                                <textarea
                                                                    placeholder="Message (optional)"
                                                                    value={counterMessage}
                                                                    onChange={(e) => setCounterMessage(e.target.value)}
                                                                    className="input-field w-full mb-2 text-sm"
                                                                    rows={2}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(offer.offer_id, 'Countered', counterAmount, counterMessage)}
                                                                        disabled={!counterAmount || processingId === offer.offer_id}
                                                                        className="btn-primary py-1 text-xs flex-1"
                                                                    >
                                                                        Send
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setCounteringId(null)}
                                                                        className="btn-secondary py-1 text-xs flex-1"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleStatusUpdate(offer.offer_id, 'Accepted')}
                                                                    disabled={processingId === offer.offer_id}
                                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => setCounteringId(offer.offer_id)}
                                                                    disabled={processingId === offer.offer_id}
                                                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                                                >
                                                                    Counter
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(offer.offer_id, 'Rejected')}
                                                                    disabled={processingId === offer.offer_id}
                                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'sent' && (
                        <div className="space-y-6">
                            {filteredSent.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-lg shadow">
                                    <p className="text-xl">
                                        {searchQuery ? 'No offers match your search.' : "You haven't made any offers yet."}
                                    </p>
                                    {!searchQuery && (
                                        <Link to="/properties" className="mt-4 inline-block btn-primary">
                                            Browse Properties
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                filteredSent.map((offer) => (
                                    <div key={offer.offer_id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={offer.property_image || '/placeholder.jpg'}
                                                        alt={offer.property_title}
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <Link to={`/properties/${offer.property_id}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary-500">
                                                            {offer.property_title}
                                                        </Link>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                            {offer.city} • Listed at {formatPrice(offer.property_price)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Offer sent on {formatDate(offer.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Your Offer</p>
                                                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                                    {formatPrice(offer.amount)}
                                                </p>
                                                <div className={`
                                                    inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide
                                                    ${offer.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        offer.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            offer.status === 'Countered' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
                                                `}>
                                                    {offer.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Offers;
