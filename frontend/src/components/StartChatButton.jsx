import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StartChatButton = ({ targetUser, propertyId = null, className = '', variant = 'default' }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!currentUser || !targetUser || currentUser.user_id === targetUser.user_id) {
        return null; // Don't show if not logged in or chatting with self
    }

    const handleStartChat = async () => {
        try {
            setLoading(true);

            const response = await api.post('/conversations/start', {
                otherUserId: targetUser.user_id,
                propertyId: propertyId
            });

            const { conversationId } = response.data;

            // Navigate to messages with conversation pre-selected
            navigate(`/messages?conversationId=${conversationId}`);
        } catch (err) {
            console.error('Failed to start conversation:', err);
            alert('Could not start conversation, please try again');
        } finally {
            setLoading(false);
        }
    };

    // Variant styles
    const variantStyles = {
        default: 'btn-primary flex items-center gap-2',
        icon: 'p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-all duration-200',
        secondary: 'btn-secondary flex items-center gap-2'
    };

    const buttonClass = `${variantStyles[variant]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <button
            onClick={handleStartChat}
            disabled={loading}
            className={buttonClass}
            title={`Message ${targetUser.first_name} ${targetUser.last_name}`}
        >
            {loading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {variant !== 'icon' && <span>Connecting...</span>}
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {variant !== 'icon' && <span>Message {targetUser.first_name}</span>}
                </>
            )}
        </button>
    );
};

export default StartChatButton;
