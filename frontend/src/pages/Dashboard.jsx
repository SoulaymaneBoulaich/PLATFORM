import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        property_type: 'House',
        listing_type: 'Sale',
        bedrooms: '',
        bathrooms: '',
        area: '',
        has_garage: false,
        has_pool: false,
        has_garden: false,
    });
    const [imageUrl, setImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');

    useEffect(() => {
        if (user) {
            if (user.user_type === 'seller' || user.user_type === 'admin') {
                fetchMyProperties();
            } else if (user.user_type === 'buyer') {
                fetchFavorites();
            }

            // Check if editing a property
            const editId = searchParams.get('edit');
            if (editId && (user.user_type === 'seller' || user.user_type === 'admin')) {
                loadPropertyForEdit(editId);
            }
        }
    }, [user, searchParams]);

    const fetchMyProperties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/properties');
            const myProps = response.data.filter(p => p.seller_id === user.user_id);
            setProperties(myProps);
            setError('');
        } catch (err) {
            setError('Failed to load properties');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/users/${user.user_id}/favorites`);
            setFavorites(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load favorites');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPropertyForEdit = async (propertyId) => {
        try {
            const response = await api.get(`/properties/${propertyId}`);
            const prop = response.data;

            if (prop.seller_id !== user.user_id && user.user_type !== 'admin') {
                setError('You can only edit your own properties');
                return;
            }

            setEditingProperty(prop);
            setFormData({
                title: prop.title,
                description: prop.description,
                price: prop.price,
                address: prop.address,
                city: prop.city,
                property_type: prop.property_type,
                listing_type: prop.listing_type,
                bedrooms: prop.bedrooms,
                bathrooms: prop.bathrooms,
                area: prop.area,
                has_garage: prop.has_garage || false,
                has_pool: prop.has_pool || false,
                has_garden: prop.has_garden || false,
            });
            setShowPropertyForm(true);
        } catch (err) {
            setError('Failed to load property for editing');
            console.error(err);
        }
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    //uploadPropertyImage function removed - image_url now sent directly with property data


    const handlePropertySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUploadSuccess('');

        try {
            let propertyId;

            // Include image_url in the request body
            const propertyData = {
                ...formData,
                image_url: imageUrl?.trim() || null
            };

            if (editingProperty) {
                await api.put(`/properties/${editingProperty.property_id}`, propertyData);
                propertyId = editingProperty.property_id;
            } else {
                const response = await api.post('/properties', propertyData);
                propertyId = response.data.property_id;
            }

            setShowPropertyForm(false);
            setEditingProperty(null);
            setFormData({
                title: '',
                description: '',
                price: '',
                address: '',
                city: '',
                property_type: 'House',
                listing_type: 'Sale',
                bedrooms: '',
                bathrooms: '',
                area: '',
            });
            setImageUrl('');

            fetchMyProperties();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save property');
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            await api.delete(`/properties/${propertyId}`);
            fetchMyProperties();
        } catch (err) {
            setError('Failed to delete property');
            console.error(err);
        }
    };

    const handleEditProperty = (property) => {
        setEditingProperty(property);
        setFormData({
            title: property.title,
            description: property.description,
            price: property.price,
            address: property.address,
            city: property.city,
            property_type: property.property_type,
            listing_type: property.listing_type,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
        });
        setShowPropertyForm(true);
    };

    const handleRemoveFavorite = async (propertyId) => {
        try {
            await api.delete(`/users/${user.user_id}/favorites/${propertyId}`);
            fetchFavorites();
        } catch (err) {
            setError('Failed to remove favorite');
            console.error(err);
        }
    };

    const isSeller = user?.user_type === 'seller' || user?.user_type === 'admin';
    const isBuyer = user?.user_type === 'buyer';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* User Profile Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-lg font-semibold">{user?.first_name} {user?.last_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-lg font-semibold">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Account Type</p>
                            <p className="text-lg font-semibold capitalize">{user?.user_type}</p>
                        </div>
                    </div>
                </div>

                <ErrorMessage message={error} />

                {/* Seller Section */}
                {isSeller && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
                            <button
                                onClick={() => {
                                    setShowPropertyForm(!showPropertyForm);
                                    setEditingProperty(null);
                                    setFormData({
                                        title: '',
                                        description: '',
                                        price: '',
                                        address: '',
                                        city: '',
                                        property_type: 'House',
                                        listing_type: 'Sale',
                                        bedrooms: '',
                                        bathrooms: '',
                                        area: '',
                                    });
                                }}
                                className="btn-primary"
                            >
                                {showPropertyForm ? 'Cancel' : '+ Add New Property'}
                            </button>
                        </div>

                        {/* Property Form */}
                        {showPropertyForm && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h3 className="text-xl font-semibold mb-4">
                                    {editingProperty ? 'Edit Property' : 'Add New Property'}
                                </h3>
                                <form onSubmit={handlePropertySubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                                            <select
                                                name="property_type"
                                                value={formData.property_type}
                                                onChange={handleFormChange}
                                                className="input-field"
                                            >
                                                <option value="house">House</option>
                                                <option value="apartment">Apartment</option>
                                                <option value="condo">Condo</option>
                                                <option value="land">Land</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="villa">Villa</option>
                                                <option value="studio">Studio</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                                            <select
                                                name="listing_type"
                                                value={formData.listing_type}
                                                onChange={handleFormChange}
                                                className="input-field"
                                            >
                                                <option value="Sale">For Sale</option>
                                                <option value="Rent">For Rent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                            <input
                                                type="number"
                                                name="bedrooms"
                                                value={formData.bedrooms}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                            <input
                                                type="number"
                                                name="bathrooms"
                                                value={formData.bathrooms}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                                            <input
                                                type="number"
                                                name="area"
                                                value={formData.area}
                                                onChange={handleFormChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Property Features */}
                                    <div className="border-t pt-4 mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Property Features</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_garage"
                                                    name="has_garage"
                                                    checked={formData.has_garage}
                                                    onChange={(e) => setFormData({ ...formData, has_garage: e.target.checked })}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="has_garage" className="ml-2 text-sm text-gray-700">
                                                    Garage
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_pool"
                                                    name="has_pool"
                                                    checked={formData.has_pool}
                                                    onChange={(e) => setFormData({ ...formData, has_pool: e.target.checked })}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="has_pool" className="ml-2 text-sm text-gray-700">
                                                    Swimming Pool
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="has_garden"
                                                    name="has_garden"
                                                    checked={formData.has_garden}
                                                    onChange={(e) => setFormData({ ...formData, has_garden: e.target.checked })}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="has_garden" className="ml-2 text-sm text-gray-700">
                                                    Garden
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            rows={4}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    {/* Image URL Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Property Image URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com/image.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="input-field"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Paste a direct URL to an image (e.g., from Imgur, your cloud storage, etc.)
                                        </p>
                                        {imageUrl && (
                                            <p className="text-sm text-primary-600 mt-2">
                                                ✓ URL provided
                                            </p>
                                        )}
                                    </div>

                                    {uploadSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                            {uploadSuccess}
                                        </div>
                                    )}

                                    <button type="submit" className="btn-primary" disabled={uploadingImage}>
                                        {uploadingImage ? 'Uploading...' : editingProperty ? 'Update Property' : 'Create Property'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Properties List */}
                        {loading ? (
                            <Loader />
                        ) : properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <PropertyCard
                                        key={property.property_id}
                                        property={property}
                                        showActions={true}
                                        onDelete={handleDeleteProperty}
                                        onEdit={handleEditProperty}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <p className="text-gray-600">You haven't listed any properties yet.</p>
                                <p className="text-gray-500 text-sm mt-2">Click "Add New Property" to get started.</p>
                            </div>
                        )}
                    </div>
                )
                }

                {/* Buyer Section */}
                {
                    isBuyer && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Favorites</h2>

                            {loading ? (
                                <Loader />
                            ) : favorites.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favorites.map((property) => (
                                        <div key={property.property_id} className="relative">
                                            <PropertyCard property={property} />
                                            <button
                                                onClick={() => handleRemoveFavorite(property.property_id)}
                                                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                    <p className="text-gray-600">You haven't added any favorites yet.</p>
                                    <p className="text-gray-500 text-sm mt-2">Browse properties and add them to your favorites!</p>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default Dashboard;
