import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom property marker icon
const propertyIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M20 0C11.7 0 5 6.7 5 15c0 10 15 35 15 35s15-25 15-35c0-8.3-6.7-15-15-15z" fill="url(#grad)"/>
            <circle cx="20" cy="15" r="6" fill="white"/>
        </svg>
    `),
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
});

// Component to handle map bounds updates
function MapBoundsUpdater({ properties }) {
    const map = useMap();

    useEffect(() => {
        if (properties.length > 0) {
            const validProperties = properties.filter(p => p.lat && p.lng);
            if (validProperties.length > 0) {
                const bounds = L.latLngBounds(validProperties.map(p => [p.lat, p.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
            }
        }
    }, [properties, map]);

    return null;
}

const PropertyMap = ({ properties = [], selectedProperty = null, onPropertyClick = null }) => {
    const [mapCenter] = useState([31.7917, -7.0926]); // Morocco center as default
    const [mapZoom] = useState(6);

    // City coordinates mapping (Morocco cities)
    const cityCoordinates = {
        'Casablanca': [33.5731, -7.5898],
        'Rabat': [34.0209, -6.8416],
        'Marrakech': [31.6295, -7.9811],
        'Fes': [34.0181, -5.0078],
        'Tangier': [35.7595, -5.8340],
        'Agadir': [30.4278, -9.5981],
        'Meknes': [33.8935, -5.5473],
        'Oujda': [34.6814, -1.9086],
        'Kenitra': [34.2610, -6.5802],
        'Tetouan': [35.5785, -5.3684],
        'Safi': [32.2994, -9.2372],
        'El Jadida': [33.2316, -8.5007],
        'Nador': [35.1681, -2.9332],
        'Beni Mellal': [32.3373, -6.3498],
        'Taza': [34.2130, -4.0100],
        'Mohammedia': [33.6866, -7.3833],
    };

    // Enhance properties with coordinates
    const propertiesWithCoords = properties.map(property => {
        const city = property.city || property.location;
        const coords = cityCoordinates[city];

        if (coords) {
            // Add slight random offset to avoid exact overlap
            const latOffset = (Math.random() - 0.5) * 0.02;
            const lngOffset = (Math.random() - 0.5) * 0.02;

            return {
                ...property,
                lat: coords[0] + latOffset,
                lng: coords[1] + lngOffset
            };
        }
        return property;
    }).filter(p => p.lat && p.lng);

    return (
        <div className="h-full w-full relative rounded-xl overflow-hidden shadow-xl">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="h-full w-full z-0"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBoundsUpdater properties={propertiesWithCoords} />

                {propertiesWithCoords.map((property) => (
                    <Marker
                        key={property.property_id}
                        position={[property.lat, property.lng]}
                        icon={propertyIcon}
                        eventHandlers={{
                            click: () => onPropertyClick && onPropertyClick(property)
                        }}
                    >
                        <Popup className="custom-popup" maxWidth={300}>
                            <div className="p-2">
                                {property.image_url && (
                                    <img
                                        src={property.image_url}
                                        alt={property.title}
                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }}
                                    />
                                )}
                                <h3 className="font-bold text-gray-900 text-sm mb-1">
                                    {property.title}
                                </h3>
                                <p className="text-lg font-bold text-gradient mb-1">
                                    ${property.price?.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 mb-2">
                                    📍 {property.city}, {property.country}
                                </p>
                                <div className="flex gap-2 text-xs text-gray-600 mb-2">
                                    {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                                    {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                                    {property.area && <span>📐 {property.area}m²</span>}
                                </div>
                                <Link
                                    to={`/properties/${property.property_id}`}
                                    className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:shadow-lg transition-all"
                                >
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">
                        {propertiesWithCoords.length} Properties
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PropertyMap;
