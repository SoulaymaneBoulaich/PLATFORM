import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [settings, setSettings] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        // Apply dark mode to document
        if (settings?.dark_mode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings?.dark_mode]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/me/settings');
            setSettings(res.data);
            // Apply saved language
            if (res.data.language) {
                i18n.changeLanguage(res.data.language);
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSetting = async (key, value) => {
        try {
            setSaving(true);
            await api.put('/me/settings', { [key]: value });
            setSettings({ ...settings, [key]: value });

            // Handle language change
            if (key === 'language') {
                i18n.changeLanguage(value);
            }
        } catch (err) {
            console.error('Failed to update setting:', err);
            alert('Failed to update setting');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            setSaving(true);
            await api.post('/me/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner message="Loading settings..." />
            </div>
        );
    }

    const sections = [
        { id: 'profile', name: t('settings.profile'), icon: '👤' },
        { id: 'security', name: t('settings.security'), icon: '🔒' },
        { id: 'notifications', name: t('settings.notifications'), icon: '🔔' },
        { id: 'appearance', name: t('settings.appearance'), icon: '🎨' }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
                        <p className="text-gray-600 mt-2">{t('settings.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card bg-white p-4 sticky top-4">
                                <nav className="space-y-1">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeSection === section.id
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="mr-3">{section.icon}</span>
                                            {section.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            {/* Profile Section */}
                            {activeSection === 'profile' && (
                                <div className="card bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

                                    <div className="flex items-center gap-6 mb-8">
                                        {user?.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {user?.first_name} {user?.last_name}
                                            </h3>
                                            <p className="text-gray-600">{user?.email}</p>
                                        </div>
                                    </div>

                                    <Link to="/account/profile" className="btn-primary inline-block">
                                        Edit Profile
                                    </Link>

                                    <div className="mt-8 pt-8 border-t">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Role</p>
                                                <p className="font-medium capitalize">{user?.role}</p>
                                            </div>
                                            {user?.location && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Location</p>
                                                    <p className="font-medium">{user.location}</p>
                                                </div>
                                            )}
                                            {user?.phone && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Phone</p>
                                                    <p className="font-medium">{user.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            {activeSection === 'security' && (
                                <div className="card bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Login & Security</h2>

                                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="input-field w-full"
                                                required
                                                minLength={6}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>

                                        <button type="submit" disabled={saving} className="btn-primary">
                                            {saving ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Notifications Section */}
                            {activeSection === 'notifications' && (
                                <div className="card bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between py-4 border-b">
                                            <div>
                                                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                                                <p className="text-sm text-gray-600">Receive email updates about messages and offers</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleSetting('email_notifications', !settings?.email_notifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings?.email_notifications ? 'bg-primary-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between py-4 border-b">
                                            <div>
                                                <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                                                <p className="text-sm text-gray-600">Receive text message alerts</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleSetting('sms_notifications', !settings?.sms_notifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings?.sms_notifications ? 'bg-primary-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Section */}
                            {activeSection === 'appearance' && (
                                <div className="card bg-white p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('settings.appearance')}</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between py-4 border-b">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{t('appearance.darkMode')}</h3>
                                                <p className="text-sm text-gray-600">{t('appearance.darkModeDesc')}</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleSetting('dark_mode', !settings?.dark_mode)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings?.dark_mode ? 'bg-primary-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings?.dark_mode ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="py-4">
                                            <label className=" block text-sm font-medium text-gray-700 mb-2">
                                                {t('appearance.language')}
                                            </label>
                                            <select
                                                value={settings?.language || 'en'}
                                                onChange={(e) => handleToggleSetting('language', e.target.value)}
                                                className="input-field w-full max-w-xs"
                                            >
                                                <option value="en">English</option>
                                                <option value="fr">Français</option>
                                                <option value="ar">العربية</option>
                                                <option value="es">Español</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Settings;
