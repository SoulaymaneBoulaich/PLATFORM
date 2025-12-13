import { Link } from 'react-router-dom';

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
        <div className="property-card">
            <Link to={`/properties/${property.property_id}`}>
                <div className="relative overflow-hidden rounded-t-xl">
                    <img
                        src={src}
                        alt={property.title || 'Property'}
                        className="w-full h-56 object-cover"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/property-placeholder.svg';
                        }}
                    />
                    <div className="absolute top-3 right-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                            {property.listing_type}
                        </span>
                    </div>
                </div>
            </Link>

            <div className="p-5">
                <Link to={`/properties/${property.property_id}`}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2 line-clamp-1">
                        {property.title}
                    </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{property.address}, {property.city}</span>
                </p>

                <p className="text-2xl font-bold text-gray-900 mb-4">
                    {formatPrice(property.price)}
                    {property.listing_type === 'Rent' && <span className="text-sm font-normal text-gray-500">/month</span>}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">{property.bedrooms}</span> beds
                    </div>
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <span className="font-medium">{property.bathrooms}</span> baths
                    </div>
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="font-medium">{property.area}</span> sqft
                    </div>
                </div>

                {/* Feature Badges */}
                {(property.has_garage || property.has_pool || property.has_garden) && (
                    <div className="flex flex-wrap gap-2 pt-4">
                        {property.has_garage && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                </svg>
                                Garage
                            </span>
                        )}
                        {property.has_pool && (
                            <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                </svg>
                                Pool
                            </span>
                        )}
                        {property.has_garden && (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0014.5 3h-9zM10 7a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
                                </svg>
                                Garden
                            </span>
                        )}
                    </div>
                )}

                {showActions && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(property)}
                                className="flex-1 btn-secondary text-sm py-2"
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(property.property_id)}
                                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
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
