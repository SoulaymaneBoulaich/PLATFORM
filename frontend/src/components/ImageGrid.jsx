import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGrid = ({ images, title }) => {
    const [showAll, setShowAll] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleOpen = (index = 0) => {
        setCurrentIndex(index);
        setShowAll(true);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    if (showAll) {
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
                    <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm absolute top-0 w-full z-10">
                        <h2 className="text-lg font-bold">{title}</h2>
                        <button
                            onClick={() => setShowAll(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-10"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <motion.img
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            src={images[currentIndex]}
                            alt={`${title} - View ${currentIndex + 1}`}
                            className="max-h-full max-w-full object-contain cursor-zoom-in"
                        />

                        <button
                            onClick={handleNext}
                            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-10"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Filmstrip */}
                    <div className="h-20 bg-black/90 p-2 flex gap-2 overflow-x-auto justify-center">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-full aspect-video rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </AnimatePresence>
        );
    }

    // Mobile Carousel / Simple View
    if (window.innerWidth < 1024) {
        return (
            <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden rounded-2xl group cursor-pointer" onClick={() => handleOpen(0)}>
                <img
                    src={images[0]}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpen(0); }}
                        className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                    >
                        View Photos ({images.length})
                    </button>
                </div>
            </div>
        );
    }

    // Desktop Premium Grid (1 Large, 4 Small)
    if (images.length >= 5) {
        return (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] rounded-2xl overflow-hidden relative">
                {/* Main Large Image */}
                <div className="col-span-2 row-span-2 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleOpen(0)}>
                    <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                </div>

                {/* Side Images */}
                <div className="col-span-1 row-span-1 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleOpen(1)}>
                    <img src={images[1]} alt={`${title} 2`} className="w-full h-full object-cover" />
                </div>
                <div className="col-span-1 row-span-1 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleOpen(2)}>
                    <img src={images[2]} alt={`${title} 3`} className="w-full h-full object-cover" />
                </div>
                <div className="col-span-1 row-span-1 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleOpen(3)}>
                    <img src={images[3]} alt={`${title} 4`} className="w-full h-full object-cover" />
                </div>
                <div className="col-span-1 row-span-1 cursor-pointer hover:opacity-95 transition-opacity relative" onClick={() => handleOpen(4)}>
                    <img src={images[4]} alt={`${title} 5`} className="w-full h-full object-cover" />
                    {images.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg hover:bg-black/40 transition-colors">
                            +{images.length - 5} photos
                        </div>
                    )}
                </div>

                <button
                    onClick={() => handleOpen(0)}
                    className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    Show all photos
                </button>
            </div>
        );
    }

    // Single Image Desktop View (Full Width)
    if (images.length === 1) {
        return (
            <div
                className="h-[60vh] rounded-2xl overflow-hidden relative cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleOpen(0)}
            >
                <img src={images[0]} alt={title} className="w-full h-full object-cover" />
                <button
                    onClick={(e) => { e.stopPropagation(); handleOpen(0); }}
                    className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                >
                    View Photos
                </button>
            </div>
        );
    }

    // Fallback Grid for fewer images (1 Large + Strip)
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-[60vh] rounded-2xl overflow-hidden relative">
            <div className="cursor-pointer hover:opacity-95 transition-opacity h-full" onClick={() => handleOpen(0)}>
                <img src={images[0]} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-2 h-full">
                {images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative h-full cursor-pointer hover:opacity-90" onClick={() => handleOpen(idx + 1)}>
                        <img src={img} alt={`${title} ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
            <button
                onClick={() => handleOpen(0)}
                className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
            >
                Show all photos
            </button>
        </div>
    );
};

export default ImageGrid;
