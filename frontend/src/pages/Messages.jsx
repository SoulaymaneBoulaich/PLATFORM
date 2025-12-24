import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import AudioPlayer from '../components/AudioPlayer';
import Toast from '../components/Toast';
import { useRoleTheme } from '../context/RoleThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import LinkPreview from '../components/LinkPreview';
import ProfileImage from '../components/ProfileImage';
import ForwardModal from '../components/ForwardModal';

const Messages = () => {
    // Force refresh
    const { user } = useAuth();
    const roleTheme = useRoleTheme();
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
    const { socket, onlineUsers } = useSocket();
    const [toast, setToast] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [forwardMessage, setForwardMessage] = useState(null);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);

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
            // Join room
            socket?.emit('join_conversation', activeConversation.conversation_id);

            // Mark visible messages as read (simple version: mark all unread from other)
            // In production, use IntersectionObserver to only mark visible ones
            markMessagesAsRead(activeConversation.conversation_id);
        }

        return () => {
            if (activeConversation) {
                socket?.emit('leave_conversation', activeConversation.conversation_id);
            }
        };
    }, [activeConversation, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageReceived = (msg) => {
            if (activeConversation && msg.conversation_id === activeConversation.conversation_id) {
                // Prevent duplicate: if I sent it, I already have it via optimistic UI (which gets updated by handleMessageSent)
                if (String(msg.sender_id) === String(user.user_id)) return;

                setMessages(prev => {
                    // Double check for duplicates based on ID just in case
                    if (prev.some(m => m.message_id === msg.message_id)) return prev;
                    if (prev.some(m => m.tempId && m.content === msg.content && String(m.sender_id) === String(msg.sender_id))) return prev; // Dedupe against optimistic
                    return [...prev, msg];
                });
                scrollToBottom();

                // Mark as read immediately if window is focused
                if (document.hasFocus()) {
                    socket.emit('mark_read', {
                        conversationId: msg.conversation_id,
                        messageIds: [msg.message_id]
                    });
                }
            } else {
                // Look into updating the conversation list preview here if needed
            }
        };

        const handleMessageSent = ({ tempId, message_id, status }) => {
            // Update temp message with real ID and status
            setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, message_id, status } : m));
        };

        const handleMessagesRead = ({ userId, messageIds }) => {
            // Update status of my messages to 'read'
            if (userId !== user.user_id) { // If someone else read MY messages
                setMessages(prev => prev.map(m =>
                    messageIds.includes(m.message_id) ? { ...m, status: 'read', read_at: new Date() } : m
                ));
            }
        };

        const handleTypingStart = ({ userId }) => {
            if (userId !== user.user_id) {
                setTypingUsers(prev => new Set(prev).add(userId));
            }
        };

        const handleTypingStop = ({ userId }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        };

        socket.on('message_received', handleMessageReceived);
        socket.on('message_sent', handleMessageSent);
        socket.on('messages_read', handleMessagesRead);
        socket.on('typing_start', handleTypingStart);
        socket.on('typing_stop', handleTypingStop);

        return () => {
            socket.off('message_received', handleMessageReceived);
            socket.off('message_sent', handleMessageSent);
            socket.off('messages_read', handleMessagesRead);
            socket.off('typing_start', handleTypingStart);
            socket.off('typing_stop', handleTypingStop);
        };
    }, [socket, activeConversation, user]);

    const markMessagesAsRead = async (conversationId) => {
        try {
            // Find unread messages from API or local state
            const unread = messages.filter(m => m.sender_id !== user.user_id && m.status !== 'read');
            if (unread.length > 0) {
                const ids = unread.map(m => m.message_id);
                await api.post(`/messages/mark-read`, { messageIds: ids }); // You might need this endpoint or use socket
                socket?.emit('mark_read', { conversationId, messageIds: ids });
            }
            // Also simple socket emit for safety
            // socket?.emit('mark_read_all', conversationId);
        } catch (err) { console.error(err); }
    };

    // Typing Handler
    const handleTyping = () => {
        if (!socket || !activeConversation) return;
        socket.emit('typing_start', activeConversation.conversation_id);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing_stop', activeConversation.conversation_id);
        }, 2000);
    };

    // Auto-scroll removed as requested
    // useLayoutEffect(() => {
    //     scrollToBottom();
    // }, [messages, activeConversation]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });

            // Fallback for immediate scroll on initial load (avoids smooth scroll lag)
            if (loading) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
        }
    };

    const handleDeleteConversation = (e, conversationId) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: 'Delete Conversation',
            message: 'Are you sure you want to delete this conversation? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/conversations/${conversationId}`);
                    setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
                    if (activeConversation?.conversation_id === conversationId) {
                        setActiveConversation(null);
                    }
                    setToast({ message: 'Conversation deleted', type: 'success' });
                } catch (err) {
                    console.error('Failed to delete conversation:', err);
                    setToast({ message: 'Failed to delete conversation', type: 'error' });
                }
            }
        });
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

                // Optimistic UI
                const tempId = Date.now();
                const optimisticMsg = {
                    message_id: tempId,
                    conversation_id: activeConversation.conversation_id,
                    sender_id: user.user_id,
                    content: newMessage,
                    status: 'sending', // distinct status
                    created_at: new Date().toISOString(),
                    tempId
                };
                setMessages(prev => [...prev, optimisticMsg]);

                // 1. Call API FIRST to persist and get ID
                const res = await api.post(`/conversations/${activeConversation.conversation_id}/messages`, {
                    content: newMessage
                });

                const realMessageId = res.data.message_id;

                // 2. Emit via socket with the REAL ID
                socket?.emit('send_message', {
                    conversationId: activeConversation.conversation_id,
                    content: newMessage,
                    tempId,
                    message_id: realMessageId // Pass the ID to the socket
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

    const handleDeleteMessage = (messageId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Message',
            message: 'Are you sure you want to delete this message?',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/messages/${messageId}`);
                    await fetchMessages(activeConversation.conversation_id);
                } catch (err) {
                    console.error('Failed to delete message:', err);
                    setToast({ message: 'Failed to delete message. Please try again.', type: 'error' });
                }
            }
        });
    };

    const executeForward = async (targetConversationId) => {
        if (!forwardMessage) return;

        try {
            const contentToForward = forwardMessage.content;
            // Handle both snake_case (DB) and camelCase (API/Socket)
            const mediaUrl = forwardMessage.media_url || forwardMessage.mediaUrl;
            const mediaType = forwardMessage.media_type || forwardMessage.mediaType || 'TEXT';

            // Send via API
            await api.post(`/messages`, {
                conversationId: targetConversationId,
                content: contentToForward,
                mediaUrl,
                mediaType
            });

            setToast({ message: 'Message forwarded', type: 'success' });
        } catch (err) {
            console.error('Failed to forward', err);
            setToast({ message: 'Failed to forward message', type: 'error' });
        }
    };

    const handleForwardAction = (msg) => {
        setForwardMessage(msg);
        setIsForwardModalOpen(true);
        setActiveMenuId(null);
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
                    <p className="text-red-500 mb-6 font-medium">{error}</p>
                    <button onClick={fetchConversations} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:scale-105 transition-transform">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-1px)] bg-slate-50 dark:bg-slate-900 pt-24 pb-4 relative overflow-hidden"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
                <div className="flex-1 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-white/20 dark:ring-white/5 overflow-hidden flex flex-col md:flex-row">

                    {/* Conversations Sidebar */}
                    <div className={`w-full md:w-80 border-r border-gray-100 dark:border-slate-700/50 flex flex-col bg-white/50 dark:bg-slate-800/50 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700/50 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">Chats</h2>
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50 shadow-inner">{conversations.length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {conversations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="mb-4 text-4xl"
                                    >
                                        📭
                                    </motion.div>
                                    <p className="font-medium text-sm">No messages yet</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {conversations.map((conv, i) => (
                                        <motion.div
                                            key={conv.conversation_id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setActiveConversation(conv)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${activeConversation?.conversation_id === conv.conversation_id
                                                ? 'bg-white dark:bg-slate-700 shadow-lg ring-1 ring-black/5 dark:ring-white/10'
                                                : 'hover:bg-white/60 dark:hover:bg-slate-700/40 hover:shadow-md'
                                                }`}
                                        >
                                            {activeConversation?.conversation_id === conv.conversation_id && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${roleTheme.gradient}`}
                                                />
                                            )}

                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center text-lg font-bold transition-transform duration-300 overflow-hidden ${activeConversation?.conversation_id === conv.conversation_id
                                                    ? `bg-gradient-to-br ${roleTheme.gradient} text-white scale-105`
                                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-200 group-hover:scale-105'
                                                    }`}>
                                                    <ProfileImage
                                                        src={conv.other_profile_picture}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        fallbackText={conv.other_first_name?.charAt(0)}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <p className={`font-bold truncate text-sm transition-colors ${activeConversation?.conversation_id === conv.conversation_id
                                                            ? 'text-slate-900 dark:text-white'
                                                            : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                                                            }`}>
                                                            {conv.other_first_name} {conv.other_last_name}
                                                        </p>
                                                        {activeConversation?.conversation_id !== conv.conversation_id && (
                                                            <button
                                                                onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-500 rounded text-slate-400 transition-all"
                                                                title="Delete conversation"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs truncate font-medium transition-colors ${activeConversation?.conversation_id === conv.conversation_id
                                                        ? `text-${roleTheme.primary}-600 dark:text-${roleTheme.primary}-400`
                                                        : 'text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                        {conv.property_title}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col relative bg-white/30 dark:bg-slate-900/30 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm z-20">
                                    <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white font-bold bg-gradient-to-br ${roleTheme.gradient} overflow-hidden`}>
                                            <ProfileImage
                                                src={activeConversation.other_profile_picture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                fallbackText={activeConversation.other_first_name?.charAt(0)}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight flex items-center gap-2">
                                                {activeConversation.other_first_name} {activeConversation.other_last_name}
                                            </h3>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(activeConversation.other_user_id) ? 'bg-green-500' : 'bg-slate-400'} animate-pulse`}></span>
                                                {typingUsers.size > 0 ? (
                                                    <span className="text-blue-500 animate-pulse">Typing...</span>
                                                ) : onlineUsers.has(activeConversation.other_user_id) ? 'Online' : activeConversation.property_title}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar scroll-smooth">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-70">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -20 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                className="text-6xl mb-4"
                                            >👋</motion.div>
                                            <p className="text-xl font-medium text-slate-600 dark:text-slate-300">Say hello!</p>
                                            <p className="text-sm mt-1">Start chatting with <span className="font-bold">{activeConversation.other_first_name}</span></p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isOwn = msg.sender_id === user.user_id;
                                            const isDeleted = msg.deleted_at;
                                            return (
                                                <motion.div
                                                    key={msg.message_id}
                                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'order-1' : 'order-2'} relative group`}>
                                                        <div className={`rounded-2xl relative transition-all duration-300 overflow-hidden ${msg.media_type === 'AUDIO' && !msg.content
                                                            ? ''
                                                            : `px-5 py-3.5 shadow-sm ${isOwn
                                                                ? `bg-gradient-to-br ${roleTheme.gradient} text-white rounded-tr-sm shadow-blue-500/10`
                                                                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-600/50'}`
                                                            } ${isDeleted ? 'opacity-60 grayscale' : ''}`}>

                                                            {/* Text Content */}
                                                            {!isDeleted && msg.content && (
                                                                <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">{msg.content}</p>
                                                            )}

                                                            {/* Deleted Message */}
                                                            {isDeleted && (
                                                                <p className="flex items-center gap-2 text-sm italic opacity-80">
                                                                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">✕</span>
                                                                    Message deleted
                                                                </p>
                                                            )}

                                                            {/* Media Content */}
                                                            {!isDeleted && msg.media_url && (
                                                                <div className={`${msg.content ? 'mt-3 pt-3 border-t border-white/20 dark:border-slate-500/30' : ''}`}>
                                                                    {msg.media_type === 'IMAGE' && (
                                                                        <img src={`http://localhost:3001${msg.media_url}`} alt="Attachment" className="max-w-full rounded-lg max-h-72 object-cover shadow-sm cursor-zoom-in" />
                                                                    )}
                                                                    {msg.media_type === 'VIDEO' && (
                                                                        <video controls src={`http://localhost:3001${msg.media_url}`} className="max-w-full rounded-lg max-h-72 shadow-sm" />
                                                                    )}
                                                                    {msg.media_type === 'AUDIO' && (
                                                                        <div className="p-1 min-w-[200px]">
                                                                            <AudioPlayer src={`http://localhost:3001${msg.media_url}`} isOwn={isOwn} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Message Menu Trigger */}
                                                        <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} h-full flex items-start pt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveMenuId(activeMenuId === msg.message_id ? null : msg.message_id);
                                                                    }}
                                                                    className="p-1.5 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                </button>

                                                                {/* Dropdown Menu */}
                                                                <AnimatePresence>
                                                                    {activeMenuId === msg.message_id && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                            className={`absolute top-8 ${isOwn ? 'right-0' : 'left-0'} w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50`}
                                                                        >
                                                                            <div className="py-1">
                                                                                <button onClick={() => { navigator.clipboard.writeText(msg.content); setActiveMenuId(null); setToast({ message: 'Copied', type: 'success' }); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                                                                    <span>📋</span> Copy
                                                                                </button>
                                                                                <button onClick={() => { handleForwardAction(msg); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                                                                    <span>➡️</span> Forward
                                                                                </button>
                                                                                {isOwn && !isDeleted && (
                                                                                    <>
                                                                                        {msg.media_type === 'TEXT' && (
                                                                                            <button onClick={() => { startEdit(msg); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                                                                                <span>✏️</span> Edit
                                                                                            </button>
                                                                                        )}
                                                                                        <button onClick={() => { handleDeleteMessage(msg.message_id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                                                            <span>🗑️</span> Delete
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>

                                                        {/* Footer Timestamp */}
                                                        <div className={`flex items-center gap-2 mt-1 px-1 opacity-70 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {isOwn && (
                                                                    <span className="ml-1" title={msg.status}>
                                                                        {msg.status === 'read' ? (
                                                                            <span className="text-blue-500">✓✓</span>
                                                                        ) : msg.status === 'delivered' ? (
                                                                            <span className="text-slate-400">✓✓</span>
                                                                        ) : (
                                                                            <span className="text-slate-300">✓</span>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-gray-100 dark:border-slate-700/50 z-20">
                                    <div className="max-w-4xl mx-auto w-full">
                                        {/* Edit Mode Banner */}
                                        <AnimatePresence>
                                            {editingMessage && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 mb-3 rounded-lg text-sm border border-blue-100 dark:border-blue-800/50">
                                                        <span className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                            Editing mode
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 transition-colors"
                                                        >
                                                            CANCEL
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {previewUrl && !editingMessage && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="mb-3 relative inline-block group"
                                            >
                                                {selectedFile?.type.startsWith('image') ? (
                                                    <img src={previewUrl} alt="Preview" className="h-24 rounded-lg border-2 border-white dark:border-slate-700 shadow-lg object-cover" />
                                                ) : (
                                                    <div className="h-24 w-24 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-lg">
                                                        <span className="text-3xl">📎</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:scale-110 transition-transform"
                                                >
                                                    ×
                                                </button>
                                            </motion.div>
                                        )}

                                        <form onSubmit={editingMessage ? (e) => { e.preventDefault(); handleEditMessage(editingMessage); } : handleSendMessage} className="flex items-end gap-2">
                                            {!editingMessage && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="p-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                                                        title="Attach file"
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
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

                                            <div className="flex-1 relative bg-slate-100 dark:bg-slate-700/50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-600 transition-all">
                                                <input
                                                    type="text"
                                                    value={editingMessage ? editContent : newMessage}
                                                    onChange={(e) => {
                                                        editingMessage ? setEditContent(e.target.value) : setNewMessage(e.target.value);
                                                        if (!editingMessage) handleTyping();
                                                    }}
                                                    placeholder={editingMessage ? "Update your message..." : "Type your message..."}
                                                    className="w-full bg-transparent border-none py-3 px-4 focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100"
                                                    disabled={sending || (isRecording && !editingMessage)}
                                                />
                                            </div>

                                            {editingMessage ? (
                                                <button
                                                    type="submit"
                                                    disabled={sending || !editContent.trim()}
                                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-bold text-sm tracking-wide"
                                                >
                                                    SAVE
                                                </button>
                                            ) : (
                                                newMessage.trim() || selectedFile ? (
                                                    <button
                                                        type="submit"
                                                        disabled={sending}
                                                        className={`p-3 text-white rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-tr ${roleTheme.gradient}`}
                                                    >
                                                        <svg className="w-6 h-6 translate-x-0.5 translate-y-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={isRecording ? stopRecording : startRecording}
                                                        className={`p-3 rounded-xl transition-all duration-300 ${isRecording
                                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                                                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            }`}
                                                    >
                                                        {isRecording ? (
                                                            <div className="w-6 h-6 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-white rounded-[2px]"></div></div>
                                                        ) : (
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                        )}
                                                    </button>
                                                )
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                                <motion.div
                                    className="relative z-10"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="w-32 h-32 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/50 dark:ring-white/5 mx-auto">
                                        <span className="text-6xl filter drop-shadow-sm grayscale opacity-80">💬</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Your Messages</h2>
                                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                        Select a conversation from the sidebar to continue your chat.
                                    </p>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
            />
            <ForwardModal
                isOpen={isForwardModalOpen}
                onClose={() => setIsForwardModalOpen(false)}
                conversations={conversations}
                onForward={executeForward}
                currentConversationId={activeConversation?.conversation_id}
            />
        </motion.div>
    );
};

export default Messages;
