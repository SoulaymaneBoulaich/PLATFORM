import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import EmojiPickerComponent from '../components/EmojiPicker';
import FileAttachment from '../components/FileAttachment';
import AudioRecorder from '../components/AudioRecorder';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Handle conversation ID from URL params
    useEffect(() => {
        const convId = searchParams.get('conversationId');
        if (convId && conversations.length > 0) {
            const conv = conversations.find(c => c.conversation_id === parseInt(convId));
            if (conv) {
                openConversation(conv);
            }
        }
    }, [searchParams, conversations]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/conversations');
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const openConversation = async (conversation) => {
        try {
            setActiveConversationId(conversation.conversation_id);
            setActiveConversation(conversation);

            // Load messages
            const res = await api.get(`/conversations/${conversation.conversation_id}/messages`);
            setMessages(res.data.messages || []);

            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if ((!newMessage.trim() && !selectedFile) || !activeConversationId) return;

        try {
            setSending(true);
            setUploadProgress(0);

            let response;

            if (selectedFile) {
                // Send with file attachment
                const formData = new FormData();
                if (newMessage.trim()) {
                    formData.append('content', newMessage.trim());
                }
                formData.append('file', selectedFile);

                response = await api.post(`/conversations/${activeConversationId}/messages`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                });
            } else {
                // Send text-only message
                response = await api.post(`/conversations/${activeConversationId}/messages`, {
                    content: newMessage.trim()
                });
            }

            // Add new message to the list
            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            setSelectedFile(null);
            setUploadProgress(0);

            // Update last message in conversations list
            setConversations(prev => prev.map(conv =>
                conv.conversation_id === activeConversationId
                    ? { ...conv, last_message: newMessage || '📎 Attachment', last_message_at: new Date() }
                    : conv
            ));

            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
        } catch (err) {
            console.error('Failed to send message:', err);
            alert(err.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = newMessage;
        const before = text.substring(0, start);
        const after = text.substring(end);

        setNewMessage(before + emoji + after);

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const renderAttachment = (message) => {
        if (!message.attachment_url || !message.attachment_type) return null;

        const baseUrl = 'http://localhost:3001';

        switch (message.attachment_type) {
            case 'image':
                return (
                    <div className="mt-2">
                        <img
                            src={`${baseUrl}${message.attachment_url}`}
                            alt="Shared image"
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(`${baseUrl}${message.attachment_url}`, '_blank')}
                        />
                    </div>
                );

            case 'audio':
                return (
                    <div className="mt-2">
                        <audio controls className="max-w-full">
                            <source src={`${baseUrl}${message.attachment_url}`} />
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                );

            case 'video':
                if (message.attachment_url.includes('youtube.com') || message.attachment_url.includes('youtu.be')) {
                    // Extract YouTube video ID
                    let videoId;
                    if (message.attachment_url.includes('youtu.be/')) {
                        videoId = message.attachment_url.split('youtu.be/')[1].split('?')[0];
                    } else {
                        const urlParams = new URLSearchParams(new URL(message.attachment_url).search);
                        videoId = urlParams.get('v');
                    }

                    if (videoId) {
                        return (
                            <div className="mt-2">
                                <iframe
                                    width="320"
                                    height="180"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                        );
                    }
                }
                return (
                    <div className="mt-2">
                        <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watch Video
                        </a>
                    </div>
                );

            case 'file':
                const fileName = message.attachment_url.split('/').pop();
                return (
                    <div className="mt-2">
                        <a
                            href={`${baseUrl}${message.attachment_url}`}
                            download
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{fileName}</span>
                        </a>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner message="Loading messages..." />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 max-w-7xl mx-auto w-full flex overflow-hidden shadow-lg">
                    {/* Conversation List Sidebar */}
                    <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                            <h2 className="text-xl font-bold">Messages</h2>
                            <p className="text-sm text-white/90">Your conversations</p>
                        </div>

                        {/* Conversations list */}
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length > 0 ? (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.conversation_id}
                                        onClick={() => openConversation(conv)}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${activeConversationId === conv.conversation_id ? 'bg-primary-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {conv.other_user.first_name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {conv.other_user.first_name} {conv.other_user.last_name}
                                                    </h3>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(conv.last_message_at || conv.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">{conv.last_message || 'No messages yet'}</p>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    📍 {conv.property_title}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                                    <p className="text-gray-600 text-sm">
                                        Contact a property seller to start chatting
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                                            {activeConversation.other_user.first_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {activeConversation.other_user.first_name} {activeConversation.other_user.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 truncate">
                                                About: {activeConversation.property_title}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length > 0 ? (
                                        messages.map((msg, index) => {
                                            const isMine = msg.sender_id === user.user_id;

                                            return (
                                                <div
                                                    key={msg.message_id}
                                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} message-fade-in`}
                                                    style={{ animationDelay: `${index * 30}ms` }}
                                                >
                                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg`}>
                                                        <div
                                                            className={`rounded-2xl px-4 py-2.5 shadow-sm ${isMine
                                                                ? 'bg-primary-600 text-white rounded-br-none'
                                                                : 'bg-white text-gray-900 rounded-bl-none'
                                                                }`}
                                                        >
                                                            {msg.content && (
                                                                <p className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.content}</p>
                                                            )}
                                                            {renderAttachment(msg)}
                                                        </div>
                                                        <p className={`text-xs text-gray-500 mt-1 px-2 ${isMine ? 'text-right' : 'text-left'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Upload Progress */}
                                {sending && uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="px-4 py-2 bg-primary-50 border-t border-primary-200">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-primary-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-primary-700">{uploadProgress}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Message Input */}
                                <div className="bg-white border-t border-gray-200 p-4">
                                    {isRecording ? (
                                        <AudioRecorder
                                            onRecordingComplete={(audioFile) => {
                                                setSelectedFile(audioFile);
                                                setIsRecording(false);
                                            }}
                                            onCancel={() => setIsRecording(false)}
                                        />
                                    ) : (
                                        <form onSubmit={sendMessage} className="flex items-end gap-2">
                                            {/* Emoji, File, and Audio buttons */}
                                            <div className="flex items-center gap-1">
                                                <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
                                                <FileAttachment onFileSelect={setSelectedFile} disabled={sending} />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsRecording(true)}
                                                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Record audio"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Selected file indicator */}
                                            {selectedFile && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
                                                    <span className="text-sm text-primary-700">
                                                        📎 {selectedFile.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedFile(null)}
                                                        className="text-primary-600 hover:text-primary-800"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}

                                            {/* Text input */}
                                            <div className="flex-1">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            sendMessage(e);
                                                        }
                                                    }}
                                                    placeholder={selectedFile ? `Add a caption (optional)...` : `Type a message...`}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                                    rows={1}
                                                    disabled={sending}
                                                />
                                            </div>

                                            {/* Send button */}
                                            <button
                                                type="submit"
                                                disabled={sending || (!newMessage.trim() && !selectedFile)}
                                                className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {sending ? (
                                                    <div className="spinner-sm border-white border-t-transparent"></div>
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        Press Enter to send, Shift+Enter for new line
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <svg className="mx-auto w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                                    <p className="text-gray-600">Choose a chat from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
                .message-fade-in {
                    animation: messageFadeIn 300ms ease-out backwards;
                }
                
                @keyframes messageFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </PageTransition>
    );
};

export default Messages;
