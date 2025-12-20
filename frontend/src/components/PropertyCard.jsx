import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const PropertyCard = ({ property, onDelete, onEdit, showActions = false }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    };

    const hasValidImageUrl = property.image_url &&
        (property.image_url.startsWith('http') ||
            property.image_url.startsWith('/uploads'));

    const src = hasValidImageUrl ? property.image_url : '/images/property-placeholder.svg';

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-premium transition-all duration-500 border border-gray-100 dark:border-slate-700 hover:-translate-y-2">
            {/* Image Container with Overlay */}
            <Link to={`/properties/${property.property_id}`} className="block relative overflow-hidden h-72">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <img
                    src={src}
                    alt={property.title || 'Property'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/property-placeholder.svg';
                    }}
                />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                    <span className="inline-block bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                        {property.listing_type}
                    </span>
                    <FavoriteButton propertyId={property.property_id} size="sm" />
                </div>

                {/* Quick View Button - appears on hover */}
                <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm flex items-center gap-2 hover:bg-teal-600 hover:text-white transition-colors duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-6">
                <Link to={`/properties/${property.property_id}`}>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-3 line-clamp-1">
                        {property.title}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                    <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1 text-sm font-medium">{property.address}, {property.city}</span>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(property.price)}
                    </span>
                    {property.listing_type === 'Rent' && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/month</span>}
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300 mb-5 pb-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">{property.bedrooms}</div>
                            <div className="text-xs text-gray-500">Beds</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">{property.bathrooms}</div>
                            <div className="text-xs text-gray-500">Baths</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">{property.area}</div>
                            <div className="text-xs text-gray-500">sqft</div>
                        </div>
                    </div>
                </div>

                {/* Amenities Badges */}
                {(property.has_garage || property.has_pool || property.has_garden) && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {property.has_garage && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 text-xs px-3 py-1.5 rounded-full font-medium border border-blue-200 dark:border-blue-800">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                </svg>
                                Garage
                            </span>
                        )}
                        {property.has_pool && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 text-cyan-700 dark:text-cyan-300 text-xs px-3 py-1.5 rounded-full font-medium border border-cyan-200 dark:border-cyan-800">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                </svg>
                                Pool
                            </span>
                        )}
                        {property.has_garden && (
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300 text-xs px-3 py-1.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0014.5 3h-9zM10 7a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
                                </svg>
                                Garden
                            </span>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(property)}
                                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(property.property_id)}
                                className="flex-1 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/50 dark:hover:to-red-800/50 font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-red-200 dark:border-red-800"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;
