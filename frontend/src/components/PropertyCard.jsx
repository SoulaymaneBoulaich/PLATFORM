import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import FavoriteButton from './FavoriteButton';
import useFloat from '../hooks/useFloat';


const PropertyCard = ({ property, onDelete, onEdit, showActions = false, delayIndex = 0 }) => {
    const cardRef = useRef(null);
    const floatRef = useFloat(delayIndex * 0.2); // Staggered floating

    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Prepare images array
    const images = property.images && property.images.length > 0
        ? property.images
        : [property.image_url || '/images/property-placeholder.svg'];

    // Carousel on hover
    useEffect(() => {
        let interval;
        if (isHovered && images.length > 1) {
            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
            }, 1200); // 1.2s per slide
        } else {
            setCurrentImgIndex(0); // Reset on mouse leave
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        // Tilt Effect: Rotate based on mouse position
        setTilt({
            x: y * -10,
            y: x * 10
        });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    const currentSrc = images[currentImgIndex];
    const hasValidImageUrl = currentSrc && (currentSrc.startsWith('http') || currentSrc.startsWith('/uploads') || currentSrc.startsWith('/images'));
    const src = hasValidImageUrl ? currentSrc : '/images/property-placeholder.svg';

    return (
        <div
            className="group perspective-1000 h-full"
            style={{
                animationDelay: `${delayIndex * 100}ms`
            }}
        >
            <div
                ref={(node) => {
                    cardRef.current = node;
                }}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="h-full overflow-hidden relative shadow-xl hover:shadow-2xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col transition-shadow duration-300"
                style={{}}
            >
                <div ref={floatRef} className="h-full flex flex-col">

                    {/* Image Container */}
                    <Link to={`/properties/${property.property_id}`} className="block relative h-72 overflow-hidden rounded-t-2xl">
                        {/* Removed Overlay */}

                        <img
                            src={src}
                            alt={property.title || 'Property'}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            style={{ transform: `scale(${1 + Math.abs(tilt.x) / 20})` }} /* Subtle zoom on tilt */
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/property-placeholder.svg';
                                // Avoid infinite loop if placeholder fails?
                            }}
                        />

                        {/* Carousel Indicators (Dots) - Only show on hover if multiple images */}
                        {isHovered && images.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
                                {images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImgIndex ? 'bg-white w-3' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Floating Badges */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                            <span className="glass-card px-3 py-1 text-xs font-bold text-teal-800 dark:text-teal-200 bg-white/80 dark:bg-black/50 backdrop-blur-md border-none shadow-sm">
                                {property.listing_type}
                            </span>
                            <div className="transform transition-transform hover:scale-110">
                                <FavoriteButton propertyId={property.property_id} size="sm" />
                            </div>
                        </div>

                        {/* Quick View - Slides up */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                            <button className="w-full py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg rounded-xl flex items-center justify-center gap-2 transition-colors">
                                View Details
                            </button>
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col relative z-0 bg-transparent">
                        <Link to={`/properties/${property.property_id}`}>
                            <h3 className="text-xl font-bold text-black dark:text-white mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
                                {property.title}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-4 text-sm font-medium">
                            <span className="line-clamp-1">{property.address}, {property.city}</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                                {formatPrice(property.price)}
                            </span>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100/50 dark:border-gray-700/50 mt-auto">
                            <div className="text-center">
                                <span className="block font-bold text-slate-900 dark:text-white">{property.bedrooms}</span>
                                <span className="text-xs text-gray-500">Beds</span>
                            </div>
                            <div className="text-center border-l border-gray-100 dark:border-gray-700">
                                <span className="block font-bold text-slate-900 dark:text-white">{property.bathrooms}</span>
                                <span className="text-xs text-gray-500">Baths</span>
                            </div>
                            <div className="text-center border-l border-gray-100 dark:border-gray-700">
                                <span className="block font-bold text-slate-900 dark:text-white">{property.area}</span>
                                <span className="text-xs text-gray-500">Sqft</span>
                            </div>
                        </div>

                        {/* Actions */}
                        {showActions && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100/50 dark:border-gray-700/50">
                                {onEdit && (
                                    <button onClick={() => onEdit(property)} className="flex-1 btn-secondary py-2 text-sm">
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button onClick={() => onDelete(property.property_id)} className="flex-1 py-2 rounded-full border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
