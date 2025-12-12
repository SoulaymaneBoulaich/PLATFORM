import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

const EmojiPickerComponent = ({ onEmojiSelect }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiClick = (emojiObject) => {
        onEmojiSelect(emojiObject.emoji);
        setShowPicker(false);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add emoji"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {showPicker && (
                <div className="absolute bottom-14 left-0 z-50 shadow-2xl">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={320}
                        height={400}
                        searchDisabled
                        skinTonesDisabled
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerComponent;
