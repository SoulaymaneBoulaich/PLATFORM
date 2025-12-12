import { useState } from 'react';
import api from '../services/api';

const MakeOfferModal = ({ property, onClose, onSuccess }) => {
    const [amount, setAmount] = useState(property?.price || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!amount || amount <= 0) {
            setError('Please enter a valid offer amount');
            return;
        }

        try {
            setLoading(true);
            await api.post(`/properties/${property.property_id}/offers`, {
                amount: parseFloat(amount),
                message: message.trim() || null
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Property</p>
                    <p className="font-semibold text-gray-900">{property?.title}</p>
                    <p className="text-sm text-gray-600">
                        Listed at: <span className="font-semibold text-primary-600">
                            ${parseFloat(property?.price).toLocaleString()}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Offer Amount *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="input-field w-full pl-8"
                                placeholder="250000"
                                step="1000"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message (Optional)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="input-field w-full"
                            rows={3}
                            placeholder="Add any details about your offer..."
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading ? 'Submitting...' : 'Submit Offer'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MakeOfferModal;
