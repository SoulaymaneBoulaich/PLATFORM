import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import AudioPlayer from '../components/AudioPlayer';
import Toast from '../components/Toast';
import { useRoleTheme } from '../context/RoleThemeContext';


const Messages = () => {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
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
        <div className="h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-6 relative overflow-hidden transition-colors duration-300">
            {/* Clean Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
                <div className="flex-1 glass-card overflow-hidden flex shadow-2xl ring-1 ring-white/20 dark:ring-white/5">
                    {/* Conversations Sidebar */}
                    <div className={`w-full md:w-80 border-r border-gray-100 dark:border-slate-700/50 flex flex-col bg-white/40 dark:bg-slate-800/40 backdrop-blur-md ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-5 border-b border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Messages</h2>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-bold text-gray-500 dark:text-gray-400">{conversations.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center text-3xl opacity-50">📭</div>
                                    <p className="mb-2 font-medium">No conversations yet</p>
                                    <p className="text-xs opacity-70">Start a chat from a property listing!</p>
                                </div>
                            ) : (
                                <div className="space-y-1 p-2">
                                    {conversations.map((conv) => (
                                        <div
                                            key={conv.conversation_id}
                                            onClick={() => setActiveConversation(conv)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all duration-300 group ${activeConversation?.conversation_id === conv.conversation_id
                                                ? `bg-gradient-to-r ${roleTheme.bgLight} border border-transparent shadow-sm`
                                                : 'hover:bg-white/50 dark:hover:bg-slate-700/50 border border-transparent hover:border-gray-100 dark:hover:border-slate-700/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition-transform group-hover:scale-105 ${activeConversation?.conversation_id === conv.conversation_id
                                                    ? `bg-gradient-to-br ${roleTheme.gradient} text-white`
                                                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-200'
                                                    }`}>
                                                    {conv.other_first_name?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold truncate transition-colors ${activeConversation?.conversation_id === conv.conversation_id
                                                        ? 'text-gray-900 dark:text-gray-900'
                                                        : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                        {conv.other_first_name} {conv.other_last_name}
                                                    </p>
                                                    <p className={`text-xs truncate font-medium ${activeConversation?.conversation_id === conv.conversation_id
                                                        ? 'text-gray-600 dark:text-gray-800'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                        {conv.property_title}
                                                    </p>
                                                </div>
                                                {activeConversation?.conversation_id === conv.conversation_id && (
                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${roleTheme.gradient}`}></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                        {activeConversation ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm z-20">
                                    <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md bg-gradient-to-br ${roleTheme.gradient}`}>
                                        {activeConversation.other_first_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                            {activeConversation.other_first_name} {activeConversation.other_last_name}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                            {activeConversation.property_title}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar relative">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                            <div className="text-6xl mb-4">👋</div>
                                            <p className="text-xl font-light">Say hello to <span className="font-bold">{activeConversation.other_first_name}</span>!</p>
                                            <p className="text-sm mt-2">Start the conversation regarding {activeConversation.property_title}</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isOwn = msg.sender_id === user.user_id;
                                            const isDeleted = msg.deleted_at;
                                            return (
                                                <div
                                                    key={msg.message_id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
                                                        {/* Message Bubble */}
                                                        <div className={`rounded-2xl relative group transition-all duration-300 ${msg.media_type === 'AUDIO' && !msg.content
                                                            ? ''
                                                            : `px-5 py-3 shadow-md ${isOwn
                                                                ? `bg-gradient-to-br ${roleTheme.gradient} text-white rounded-tr-none`
                                                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-700/50 rounded-tl-none'}`
                                                            } ${isDeleted ? 'opacity-60 italic ring-1 ring-gray-300 dark:ring-gray-600' : ''}`}>

                                                            {/* Text Content */}
                                                            {!isDeleted && msg.content && (
                                                                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
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
                                                                <div className={`${msg.content ? 'mt-3 pt-3 border-t border-white/20' : ''}`}>
                                                                    {msg.media_type === 'IMAGE' && (
                                                                        <img src={`http://localhost:3001${msg.media_url}`} alt="Attachment" className="max-w-full rounded-xl max-h-72 object-cover shadow-sm hover:shadow-md transition-shadow cursor-pointer" />
                                                                    )}
                                                                    {msg.media_type === 'VIDEO' && (
                                                                        <video controls src={`http://localhost:3001${msg.media_url}`} className="max-w-full rounded-xl max-h-72 shadow-sm" />
                                                                    )}
                                                                    {msg.media_type === 'AUDIO' && (
                                                                        <div className={`p-1 ${isOwn ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                                                                            <AudioPlayer src={`http://localhost:3001${msg.media_url}`} isOwn={isOwn} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Footer & Actions */}
                                                        <div className={`flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isOwn && !isDeleted && (
                                                                <>
                                                                    {msg.media_type === 'TEXT' && (
                                                                        <button onClick={() => startEdit(msg)} className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">EDIT</button>
                                                                    )}
                                                                    <button onClick={() => handleDeleteMessage(msg.message_id)} className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors">DELETE</button>
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
                                <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-t border-gray-100 dark:border-slate-700/50 z-20">
                                    {/* Edit Mode Banner */}
                                    {editingMessage && (
                                        <div
                                            className="flex items-center justify-between bg-blue-50/80 dark:bg-blue-900/40 px-4 py-2 mb-3 rounded-xl text-sm border border-blue-100 dark:border-blue-800"
                                        >
                                            <span className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                Editing message...
                                            </span>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="text-xs font-bold bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                                            >
                                                CANCEL
                                            </button>
                                        </div>
                                    )}

                                    {previewUrl && !editingMessage && (
                                        <div className="mb-3 relative inline-block group">
                                            {selectedFile?.type.startsWith('image') ? (
                                                <img src={previewUrl} alt="Preview" className="h-24 rounded-xl border-2 border-white dark:border-slate-700 shadow-lg object-cover" />
                                            ) : (
                                                <div className="h-24 w-24 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center border-2 border-white dark:border-slate-600 text-gray-500 dark:text-gray-400 shadow-lg">
                                                    <span className="text-3xl">📎</span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={editingMessage ? (e) => { e.preventDefault(); handleEditMessage(editingMessage); } : handleSendMessage} className="flex items-center gap-3">
                                        {!editingMessage && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-3 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all hover:shadow-md hover:scale-105"
                                                    title="Attach text or video"
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

                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={editingMessage ? editContent : newMessage}
                                                onChange={(e) => editingMessage ? setEditContent(e.target.value) : setNewMessage(e.target.value)}
                                                placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                                                className="w-full input-field !py-3 !px-5 !rounded-full shadow-inner"
                                                disabled={sending || (isRecording && !editingMessage)}
                                            />
                                        </div>

                                        {editingMessage ? (
                                            <button
                                                type="submit"
                                                disabled={sending || !editContent.trim()}
                                                className={`px-6 py-3 rounded-full font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-600`}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            newMessage.trim() || selectedFile ? (
                                                <button
                                                    type="submit"
                                                    disabled={sending}
                                                    className={`p-3 rounded-full text-white shadow-lg transition-all transform hover:-translate-y-0.5 hover:scale-105 bg-gradient-to-r ${roleTheme.gradient}`}
                                                >
                                                    <svg className="w-6 h-6 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={isRecording ? stopRecording : startRecording}
                                                    className={`p-3 rounded-full transition-all hover:scale-105 shadow-md ${isRecording
                                                        ? 'bg-red-500 text-white animate-pulse shadow-red-500/50'
                                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                        }`}
                                                    title={isRecording ? 'Stop recording' : 'Record voice message'}
                                                >
                                                    {isRecording ? (
                                                        <div className="w-6 h-6 flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-sm"></div></div>
                                                    ) : (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-slate-800/20 dark:to-slate-900/20" />
                                <div className="relative z-10">
                                    <div className="w-32 h-32 bg-white/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-8 shadow-xl backdrop-blur-md border border-white/50 dark:border-slate-700">
                                        <span className="text-6xl filter drop-shadow-sm">💬</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Select a Conversation</h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md font-light">
                                        Choose a chat from the sidebar to start messaging sellers, buyers, or agents.
                                    </p>
                                </div>
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
        </div>
    );
};

export default Messages;
