import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileImage from './ProfileImage';

const ForwardModal = ({ isOpen, onClose, conversations, onForward, currentConversationId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSelectedId(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredConversations = conversations.filter(c => {
        const name = `${c.other_first_name} ${c.other_last_name}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const handleSend = () => {
        if (selectedId) {
            onForward(selectedId);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
                >
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg dark:text-white">Forward Message</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white mb-4"
                            autoFocus
                        />

                        <div className="overflow-y-auto max-h-[300px] space-y-2">
                            {filteredConversations.length > 0 ? (
                                filteredConversations.map(c => (
                                    <button
                                        key={c.conversation_id}
                                        onClick={() => setSelectedId(c.conversation_id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedId === c.conversation_id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                                            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent'
                                            }`}
                                    >
                                        <div className="relative w-10 h-10 shrink-0">
                                            <ProfileImage
                                                src={c.other_profile_picture}
                                                alt="Profile"
                                                className="w-full h-full object-cover rounded-full"
                                                fallbackText={c.other_first_name?.[0]}
                                            />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-white truncate">
                                                {c.other_first_name} {c.other_last_name}
                                            </p>
                                        </div>
                                        {selectedId === c.conversation_id && (
                                            <div className="text-blue-500">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))

                            ) : (
                                <p className="text-center text-gray-500 py-8">No matching conversations</p>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!selectedId}
                            className={`px-6 py-2 rounded-xl font-bold text-white transition-all ${selectedId
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                                : 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed'
                                }`}
                        >
                            Send
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ForwardModal;
