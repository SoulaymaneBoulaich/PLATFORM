import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LinkPreview = ({ url }) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url) return;

        const fetchPreview = async () => {
            try {
                // In a real app, you would call a backend endpoint to fetch metadata
                // const res = await api.get(\`/preview?url=\${encodeURIComponent(url)}\`);
                // setPreview(res.data);

                // For now, we'll just mock it or rely on valid URL detection
                setLoading(false);
            } catch (err) {
                setError(true);
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url]);

    if (error || !url) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 mb-1 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 hover:opacity-90 transition-opacity max-w-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">🔗</span>
                    <p className="text-xs text-slate-500 truncate">{new URL(url).hostname}</p>
                </div>
                <p className="text-sm text-blue-500 hover:underline truncate">{url}</p>
            </div>
        </a>
    );
};

// Force HMR update
export default LinkPreview;
