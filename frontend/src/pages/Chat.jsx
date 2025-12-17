import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const Chat = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const propertyId = searchParams.get('propertyId');
    const otherUserId = searchParams.get('userId');

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [property, setProperty] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!propertyId || !otherUserId) {
            navigate('/');
            return;
        }

        fetchData();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [propertyId, otherUserId]);

    const fetchData = async () => {
        await Promise.all([fetchProperty(), fetchMessages()]);
        setLoading(false);
    };

    const fetchProperty = async () => {
        try {
            const res = await api.get(`/properties/${propertyId}`);
            setProperty(res.data);
        } catch (err) {
            console.error('Failed to fetch property:', err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/properties/${propertyId}/chat?otherUserId=${otherUserId}`);
            setMessages(res.data.messages);

            // Get other user info from first message
            if (res.data.messages.length > 0) {
                const firstMsg = res.data.messages[0];
                const otherUserName = firstMsg.sender_id == otherUserId
                    ? `${firstMsg.sender_first_name} ${firstMsg.sender_last_name}`
                    : `${firstMsg.receiver_first_name} ${firstMsg.receiver_last_name}`;
                setOtherUser(otherUserName);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        try {
            setSending(true);
            await api.post(`/properties/${propertyId}/chat`, {
                receiverId: otherUserId,
                content: newMessage
            });

            setNewMessage('');
            await fetchMessages();
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-slate-900 max-w-none">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white">Chat about: {property?.title}</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Chatting with: {otherUser || 'Loading...'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Back
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
                    {/* Messages List */}
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {messages.length > 0 ? (
                            messages.map((msg) => {
                                const isSentByMe = msg.sender_id === user.user_id;

                                return (
                                    <div
                                        key={msg.message_id}
                                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isSentByMe
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'
                                                }`}
                                        >
                                            <p className="text-sm font-semibold mb-1">
                                                {isSentByMe ? 'You' : `${msg.sender_first_name} ${msg.sender_last_name}`}
                                            </p>
                                            <p className="break-words">{msg.content}</p>
                                            <p className={`text-xs mt-2 ${isSentByMe ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                No messages yet. Start the conversation!
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-slate-700 p-4">
                        <div className="flex gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                                rows={2}
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="btn-primary px-6"
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Refresh Button */}
                <div className="mt-4 text-center">
                    <button
                        onClick={fetchMessages}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        🔄 Refresh Messages
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
