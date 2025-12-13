import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';

const EditProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        location: '',
        bio: ''
    });
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/me');
            setProfile(res.data);
            setFormData({
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                phone: res.data.phone || '',
                location: res.data.location || '',
                bio: res.data.bio || ''
            });
            setAvatarPreview(res.data.profile_image_url);
        } catch (err) {
            console.error('Failed to load profile:', err);
            alert('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile) return;

        try {
            setUploadStatus('uploading');
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            const res = await api.post('/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAvatarPreview(res.data.profile_image_url);
            setSelectedFile(null);
            setUploadStatus('success');

            // Update user context immediately for instant navbar update
            const updatedUser = await api.get('/me');
            updateUser(updatedUser.data);

            // Reset success state after 2s
            setTimeout(() => setUploadStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to upload avatar:', err);
            alert(err.response?.data?.error || 'Failed to upload avatar');
            setUploadStatus('error');
            setTimeout(() => setUploadStatus('idle'), 3000);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            await api.put('/me', formData);
            alert('Profile updated successfully!');

            // Update user context
            const updatedUser = await api.get('/me');
            updateUser(updatedUser.data);
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner message="Loading profile..." />
            </div>
        );
    }

    const getInitials = () => {
        const first = formData.first_name?.charAt(0) || '';
        const last = formData.last_name?.charAt(0) || '';
        return (first + last).toUpperCase() || 'U';
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-gray-600 mt-2">Update your personal information and profile photo</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Avatar Section */}
                        <div className="lg:col-span-1">
                            <div className="card bg-white p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>

                                <div className="flex flex-col items-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview.startsWith('blob:')
                                                ? avatarPreview
                                                : avatarPreview.startsWith('/')
                                                    ? `http://localhost:3001${avatarPreview}`
                                                    : avatarPreview}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
                                            onError={(e) => {
                                                console.log('Image failed to load:', avatarPreview);
                                                e.target.onerror = null;
                                                setAvatarPreview(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200 mb-4">
                                            {getInitials()}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    <label
                                        htmlFor="avatar-upload"
                                        className="btn-secondary cursor-pointer mb-2"
                                    >
                                        Choose Photo
                                    </label>

                                    {selectedFile && (
                                        <button
                                            onClick={handleUploadAvatar}
                                            disabled={uploadStatus === 'uploading'}
                                            className={`btn-primary w-full transition-all duration-300 ${uploadStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                                                    uploadStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : ''
                                                } ${uploadStatus === 'error' ? 'animate-shake' : ''}`}
                                        >
                                            {uploadStatus === 'uploading' && '⏳ Uploading...'}
                                            {uploadStatus === 'success' && '✓ Uploaded!'}
                                            {uploadStatus === 'error' && '✗ Failed'}
                                            {uploadStatus === 'idle' && 'Upload Photo'}
                                        </button>
                                    )}

                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        JPG, PNG or GIF. Max size 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="lg:col-span-2">
                            <div className="card bg-white p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email (Read-only)
                                        </label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            className="input-field w-full bg-gray-100 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="input-field w-full"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="input-field w-full"
                                            placeholder="City, Country"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="input-field w-full"
                                            rows={4}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-primary"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={loadProfile}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default EditProfile;
