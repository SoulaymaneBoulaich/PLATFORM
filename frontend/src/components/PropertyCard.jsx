import { Link } from 'react-router-dom';

const PropertyCard = ({ property, onDelete, onEdit, showActions = false }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const primaryImage = property.images && property.images.length > 0
        ? property.images[0].image_url
        : 'https://via.placeholder.com/400x300?text=No+Image';

    return (
        <div className="card overflow-hidden">
            <Link to={`/properties/${property.property_id}`}>
                <img
                    src={primaryImage}
                    alt={property.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                />
            </Link>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Link to={`/properties/${property.property_id}`}>
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                            {property.title}
                        </h3>
                    </Link>
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-semibold">
                        {property.listing_type}
                    </span>
                </div>

                <p className="text-2xl font-bold text-primary-600 mb-2">
                    {formatPrice(property.price)}
                </p>

                <p className="text-gray-600 text-sm mb-3">
                    {property.address}, {property.city}
                </p>

                <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>🛏️ {property.bedrooms} beds</span>
                    <span>🛁 {property.bathrooms} baths</span>
                    <span>📏 {property.area} sqft</span>
                </div>

                {/* Feature Badges */}
                {(property.has_garage || property.has_pool || property.has_garden) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {property.has_garage && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                🚗 Garage
                            </span>
                        )}
                        {property.has_pool && (
                            <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded">
                                🏊 Pool
                            </span>
                        )}
                        {property.has_garden && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                                🌳 Garden
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {property.property_type}
                    </span>

                    {showActions && (
                        <div className="flex space-x-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(property)}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(property.property_id)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
