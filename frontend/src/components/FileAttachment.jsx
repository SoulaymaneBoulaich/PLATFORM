import { useState, useRef } from 'react';

const FileAttachment = ({ onFileSelect, disabled }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }

        onFileSelect(file);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileSelect(null);
    };

    return (
        <div className="flex items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={disabled}
            />

            <label
                htmlFor="file-upload"
                className={`p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                title="Attach file"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
            </label>

            {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                    <span className="max-w-[150px] truncate">{selectedFile.name}</span>
                    <button
                        type="button"
                        onClick={clearFile}
                        className="text-primary-600 hover:text-primary-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileAttachment;
