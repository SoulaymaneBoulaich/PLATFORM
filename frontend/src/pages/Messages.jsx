import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import AudioPlayer from '../components/AudioPlayer';
import Toast from '../components/Toast';

const Messages = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const conversationIdParam = searchParams.get('conversationId');

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Media states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    // Handle URL parameter for conversation selection
    useEffect(() => {
        if (conversationIdParam && conversations.length > 0) {
            const linkedConv = conversations.find(c => c.conversation_id === parseInt(conversationIdParam));
            if (linkedConv) {
                setActiveConversation(linkedConv);
            }
        } else if (conversations.length > 0 && !activeConversation && !conversationIdParam) {
            // Default to first conversation only if no URL param
            setActiveConversation(conversations[0]);
        }
    }, [conversations, conversationIdParam]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.conversation_id);
            const interval = setInterval(() => fetchMessages(activeConversation.conversation_id), 5000);
            return () => clearInterval(interval);
        }
    }, [activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get('/conversations');
            setConversations(res.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const res = await api.get(`/conversations/${conversationId}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeConversation) return;

        setSending(true);
        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                if (newMessage.trim()) formData.append('caption', newMessage);

                await api.post(`/messages/${activeConversation.conversation_id}/media`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post(`/conversations/${activeConversation.conversation_id}/messages`, {
                    content: newMessage
                });
            }

            setNewMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            await fetchMessages(activeConversation.conversation_id);
            await fetchConversations(); // Refresh list to update last message
        } catch (err) {
            console.error('Failed to send message:', err);
            setToast({ message: 'Failed to send message. Please try again.', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                setToast({ message: 'File size exceeds 50MB limit', type: 'error' });
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });

                const formData = new FormData();
                formData.append('audio', file);

                try {
                    await api.post(`/messages/${activeConversation.conversation_id}/audio`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    await fetchMessages(activeConversation.conversation_id);
                } catch (err) {
                    console.error('Failed to send audio:', err);
                    setToast({ message: 'Failed to send voice message', type: 'error' });
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone access denied:', err);
            setToast({ message: 'Could not access microphone', type: 'error' });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleEditMessage = async (messageId) => {
        if (!editContent.trim()) return;

        try {
            await api.patch(`/messages/${messageId}`, { content: editContent });
            setEditingMessage(null);
            setEditContent('');
            await fetchMessages(activeConversation.conversation_id);
        } catch (err) {
            console.error('Failed to edit message:', err);
            const errorMsg = err.response?.data?.message || 'Failed to edit message';
            setToast({ message: errorMsg, type: 'error' });
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await api.delete(`/messages/${messageId}`);
            await fetchMessages(activeConversation.conversation_id);
        } catch (err) {
            console.error('Failed to delete message:', err);
            setToast({ message: 'Failed to delete message. Please try again.', type: 'error' });
        }
    };

    const startEdit = (message) => {
        setEditingMessage(message.message_id);
        setEditContent(message.content);
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setEditContent('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={fetchConversations} className="btn-primary">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 dark:bg-slate-900 flex pt-16">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 bg-white dark:bg-slate-800 border-r dark:border-slate-700 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <p className="mb-2">No conversations yet</p>
                            <p className="text-sm">Browse properties and message sellers!</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.conversation_id}
                                onClick={() => setActiveConversation(conv)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 border-b dark:border-slate-700 transition-colors ${activeConversation?.conversation_id === conv.conversation_id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-white font-bold">
                                        {conv.other_first_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                            {conv.other_first_name} {conv.other_last_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {conv.property_title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm z-10">
                            <button onClick={() => setActiveConversation(null)} className="md:hidden text-gray-600 dark:text-gray-400">
                                ← Back
                            </button>
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                {activeConversation.other_first_name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {activeConversation.other_first_name} {activeConversation.other_last_name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{activeConversation.property_title}</p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-70">
                                    <div className="text-4xl mb-2">👋</div>
                                    <p>Say hello to {activeConversation.other_first_name}!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isOwn = msg.sender_id === user.user_id;
                                    const isDeleted = msg.deleted_at;
                                    return (
                                        <div key={msg.message_id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-2'}`}>
                                                {/* Conditional Styling: No bubble for audio-only messages */}
                                                <div className={`rounded-2xl ${msg.media_type === 'AUDIO' && !msg.content
                                                    ? ''
                                                    : `px-4 py-3 shadow-sm ${isOwn ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border dark:border-slate-700 rounded-tl-none'}`
                                                    } ${isDeleted ? 'opacity-60 italic' : ''}`}>

                                                    {/* Text Content */}
                                                    {!isDeleted && msg.content && (
                                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    )}

                                                    {/* Deleted Message */}
                                                    {isDeleted && (
                                                        <p className="flex items-center gap-2 text-sm italic opacity-70">
                                                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">✕</span>
                                                            Message deleted
                                                        </p>
                                                    )}

                                                    {/* Media Content */}
                                                    {!isDeleted && msg.media_url && (
                                                        <div className={`${msg.content ? 'mt-2' : ''}`}>
                                                            {msg.media_type === 'IMAGE' && (
                                                                <img src={`http://localhost:3001${msg.media_url}`} alt="Attachment" className="max-w-full rounded-lg max-h-64 object-cover" />
                                                            )}
                                                            {msg.media_type === 'VIDEO' && (
                                                                <video controls src={`http://localhost:3001${msg.media_url}`} className="max-w-full rounded-lg max-h-64" />
                                                            )}
                                                            {msg.media_type === 'AUDIO' && (
                                                                <AudioPlayer src={`http://localhost:3001${msg.media_url}`} isOwn={isOwn} />
                                                            )}
                                                        </div>
                                                    )}

                                                </div>

                                                {/* Footer & Actions */}
                                                <div className={`flex items-center gap-2 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isOwn && !isDeleted && (
                                                        <>
                                                            {msg.media_type === 'TEXT' && (
                                                                <button onClick={() => startEdit(msg)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                                            )}
                                                            <button onClick={() => handleDeleteMessage(msg.message_id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={editingMessage ? (e) => { e.preventDefault(); handleEditMessage(editingMessage); } : handleSendMessage} className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4">
                            {/* Edit Mode Banner */}
                            {editingMessage && (
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 px-4 py-2 mb-2 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                    <span>Editing message...</span>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="text-blue-700 dark:text-blue-400 hover:text-blue-900 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {previewUrl && !editingMessage && (
                                <div className="mb-2 relative inline-block">
                                    {selectedFile?.type.startsWith('image') ? (
                                        <img src={previewUrl} alt="Preview" className="h-20 rounded-lg border dark:border-slate-700" />
                                    ) : (
                                        <div className="h-20 w-20 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border dark:border-slate-600 text-gray-500 dark:text-gray-400">
                                            File
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                {!editingMessage && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                            title="Attach text or video"
                                        >
                                            📎
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*,video/*"
                                            className="hidden"
                                        />
                                    </>
                                )}

                                <input
                                    type="text"
                                    value={editingMessage ? editContent : newMessage}
                                    onChange={(e) => editingMessage ? setEditContent(e.target.value) : setNewMessage(e.target.value)}
                                    placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                                    className="flex-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={sending || (isRecording && !editingMessage)}
                                />

                                {editingMessage ? (
                                    <button
                                        type="submit"
                                        disabled={sending || !editContent.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-sm"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    newMessage.trim() || selectedFile ? (
                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            ➤
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                            title={isRecording ? 'Stop recording' : 'Record voice message'}
                                        >
                                            🎤
                                        </button>
                                    )
                                )}
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 text-center p-8">
                        <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="text-6xl">💬</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Select a Conversation</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                            Choose a chat from the sidebar to start messaging sellers, buyers, or agents.
                        </p>
                    </div>
                )}
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Messages;
