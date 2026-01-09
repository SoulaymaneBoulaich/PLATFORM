import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const AddProperty = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        property_type: 'house',
        listing_type: 'sale',
        bedrooms: '',
        bathrooms: '',
        area: '',
        has_garage: false,
        has_pool: false,
        has_garden: false,
    });
    const [imageUrl, setImageUrl] = useState('');

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePropertySubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUploadSuccess('');

        try {
            // Include image_url in the request body
            const imageList = imageUrl?.trim().split('\n').filter(url => url.trim()) || [];

            if (imageList.length < 3) {
                setError('Please provide at least 3 images');
                return;
            }

            const propertyData = {
                ...formData,
                images: imageList,
                seller_id: user.user_id
            };

            await api.post('/properties', propertyData);

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save property');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen pt-32 pb-12 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Property</h1>

                        <ErrorMessage message={error} />

                        <form onSubmit={handlePropertySubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        value={formData.zip_code}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type</label>
                                    <select
                                        name="property_type"
                                        value={formData.property_type}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing Type</label>
                                    <select
                                        name="listing_type"
                                        value={formData.listing_type}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (sqft)</label>
                                    <input
                                        type="number"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Property Features */}
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Property Features</label>
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
                                        <label htmlFor="has_garage" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
                                        <label htmlFor="has_pool" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
                                        <label htmlFor="has_garden" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            Garden
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows={4}
                                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Image URLs Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Property Image URLs (Min 3 required)
                                </label>
                                <textarea
                                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    rows={5}
                                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Enter each image URL on a new line. You must provide at least 3 images.
                                </p>
                                {imageUrl && imageUrl.trim().split('\n').filter(url => url.trim()).length >= 3 && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                        ✓ {imageUrl.trim().split('\n').filter(url => url.trim()).length} images provided
                                    </p>
                                )}
                                {imageUrl && imageUrl.trim().split('\n').filter(url => url.trim()).length < 3 && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        ⚠ {3 - imageUrl.trim().split('\n').filter(url => url.trim()).length} more image(s) required
                                    </p>
                                )}
                            </div>

                            {uploadSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                    {uploadSuccess}
                                </div>
                            )}

                            <button type="submit" className="btn-primary" disabled={uploadingImage}>
                                {uploadingImage ? 'Uploading...' : 'Create Property'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {message}
        </div>
    );
};

export default AddProperty;
