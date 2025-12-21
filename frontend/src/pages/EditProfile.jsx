import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import Toast from '../components/Toast';
import { AnimatePresence } from 'framer-motion';

const EditProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

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
            showNotification('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
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
            showNotification('Profile photo uploaded successfully!', 'success');

            // Update user context immediately for instant navbar update
            const updatedUser = await api.get('/me');
            updateUser(updatedUser.data);

            // Reset success state after 2s
            setTimeout(() => setUploadStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to upload avatar:', err);
            showNotification(err.response?.data?.error || 'Failed to upload avatar', 'error');
            setUploadStatus('error');
            setTimeout(() => setUploadStatus('idle'), 3000);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            await api.put('/me', formData);
            showNotification('Profile updated successfully!', 'success');

            // Update user context
            const updatedUser = await api.get('/me');
            updateUser(updatedUser.data);
        } catch (err) {
            console.error('Failed to update profile:', err);
            showNotification(err.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-12 relative overflow-hidden">
                {/* Aurora Background */}
                <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute top-0 -right-10 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 animate-enter">
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-purple-600 to-blue-600 dark:from-teal-400 dark:via-purple-400 dark:to-blue-400 mb-4 drop-shadow-sm">
                            Edit Profile
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 font-light">
                            Update your personal information and profile photo
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Avatar Section */}
                        <div className="lg:col-span-1 animate-enter stagger-1">
                            <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <h2 className="text-xl font-bold dark:text-white mb-6 relative z-10">Profile Photo</h2>

                                <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-purple-500 to-blue-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview.startsWith('blob:')
                                                    ? avatarPreview
                                                    : avatarPreview.startsWith('/')
                                                        ? `http://localhost:3001${avatarPreview}`
                                                        : avatarPreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    setAvatarPreview(null);
                                                }}
                                            />
                                        ) : (
                                            <div className="text-4xl font-bold bg-gradient-to-br from-teal-400 to-blue-500 bg-clip-text text-transparent">
                                                {getInitials()}
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors border border-gray-100 dark:border-slate-600 group/icon"
                                    >
                                        <svg className="w-5 h-5 text-gray-600 dark:text-white group-hover/icon:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0010.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </label>
                                </div>

                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <div className="space-y-3 w-full relative z-10">
                                    {selectedFile && (
                                        <button
                                            onClick={handleUploadAvatar}
                                            disabled={uploadStatus === 'uploading'}
                                            className={`w-full py-2.5 rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 ${uploadStatus === 'success' ? 'bg-green-500 text-white shadow-green-500/30' :
                                                uploadStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/30' :
                                                    'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-blue-500/30 hover:shadow-blue-500/40'
                                                }`}
                                        >
                                            {uploadStatus === 'uploading' && '⏳ Uploading...'}
                                            {uploadStatus === 'success' && '✓ Uploaded!'}
                                            {uploadStatus === 'error' && '✗ Failed'}
                                            {uploadStatus === 'idle' && 'Confirm Upload'}
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        JPG, PNG or GIF. Max size 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="lg:col-span-2 animate-enter stagger-2">
                            <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                                <h2 className="text-2xl font-bold dark:text-white mb-8 border-b border-gray-100 dark:border-slate-700/50 pb-4">
                                    Personal Information
                                </h2>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={profile?.email || ''}
                                                className="w-full bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-500 dark:text-gray-400 cursor-not-allowed pl-11"
                                                disabled
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                            Bio
                                        </label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white resize-none"
                                            rows={4}
                                            placeholder="Tell us a bit about yourself..."
                                        />
                                    </div>

                                    <div className="pt-6 flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 btn-primary py-3.5 text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
                                        >
                                            {saving ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={loadProfile}
                                            className="px-8 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {toast.show && (
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast({ ...toast, show: false })}
                        />
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default EditProfile;
