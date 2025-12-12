import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ContactForm = ({ propertyId, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user ? `${user.first_name} ${user.last_name}` : '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setLoading(true);
            const response = await api.post(`/properties/${propertyId}/contact`, formData);

            setSuccess('Your message has been sent successfully! Redirecting to messages...');

            // Redirect to messages page with the conversation
            setTimeout(() => {
                if (response.data.conversation_id) {
                    navigate(`/messages?conversationId=${response.data.conversation_id}`);
                }
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send message');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field w-full"
                    required
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full"
                    required
                />
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field w-full"
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Please let us know your questions or requirements..."
                    className="input-field w-full"
                    required
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                >
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default ContactForm;
