import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageTransition from '../components/PageTransition';
import { LoadingSpinner } from '../components/Spinner';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../i18n/languages';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser, FaLock, FaBell, FaPalette, FaGlobe, FaShieldAlt,
    FaCheck, FaChevronRight, FaMoon, FaSun, FaEnvelope, FaMobileAlt
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useRoleTheme } from '../context/RoleThemeContext';

const Settings = () => {
    const { user } = useAuth();
    const { theme: appTheme, setTheme: setAppTheme } = useTheme();
    const roleTheme = useRoleTheme(); // Renamed to avoid partial name conflict with appTheme, though fields are simpler to just use theme.
    // Actually, let's call it 'theme' for simplicity and rename the global one to 'globalTheme' or just keep existing 'theme' as 'appTheme'

    // RE-DO:
    // const { theme: mode, setTheme: setMode } = useTheme(); 
    // const theme = useRoleTheme();

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

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings');
            setSettings(res.data);

            // Apply saved language
            if (res.data.language) {
                i18n.changeLanguage(res.data.language);
            }
            // Sync theme from backend to context if valid - REMOVED to prevent conflict/flash
            // ThemeContext manages local preference explicitly
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSetting = async (key, value) => {
        try {
            setSaving(true);
            const payload = { [key]: value };

            // Optimistic update
            setSettings(prev => ({ ...prev, [key]: value }));

            await api.put('/settings', payload);

            // Handle language change
            if (key === 'language') {
                i18n.changeLanguage(value);
                document.documentElement.lang = value;
                const langConfig = getLanguageConfig(value);
                document.documentElement.dir = langConfig.dir;
            }

            // Handle theme change
            if (key === 'theme') {
                setAppTheme(value);
            }
        } catch (err) {
            console.error('Failed to update setting:', err);
            // Revert optimistic update
            loadSettings();
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
            await api.post('/auth/change-password', {
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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <LoadingSpinner message="Loading settings..." />
            </div>
        );
    }

    const sections = [
        { id: 'profile', name: t('settings.profile'), icon: <FaUser />, description: t('settings.descProfile') },
        { id: 'security', name: t('settings.security'), icon: <FaLock />, description: t('settings.descSecurity') },
        { id: 'notifications', name: t('settings.notifications'), icon: <FaBell />, description: t('settings.descNotifications') },
        { id: 'appearance', name: t('settings.appearance'), icon: <FaPalette />, description: t('settings.descAppearance') }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-stone-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 text-center sm:text-left">
                        <h1 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${roleTheme.gradient} animate-slideIn`}>
                            {t('settings.title')}
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            {t('settings.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-1/4">
                            <motion.div
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden sticky top-24 border border-stone-100 dark:border-slate-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <nav className="p-3 space-y-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 group ${activeSection === section.id
                                                ? `bg-gradient-to-r ${roleTheme.bgLight} ${roleTheme.text} shadow-sm border-s-4 ${roleTheme.border}`
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-stone-50 dark:hover:bg-slate-700 hover:ps-5'
                                                }`}
                                        >
                                            <span className={`text-xl me-4 ${activeSection === section.id ? roleTheme.text : `text-gray-400 group-hover:${roleTheme.text}`}`}>
                                                {section.icon}
                                            </span>
                                            <div className="text-start">
                                                <span className="block font-semibold">{section.name}</span>
                                                <span className="text-xs text-gray-400 hidden sm:block">{section.description}</span>
                                            </div>
                                            {activeSection === section.id && (
                                                <FaChevronRight className={`ms-auto rtl:rotate-180 ${roleTheme.text}`} />
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </motion.div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:w-3/4">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-stone-100 dark:border-slate-800 p-8 min-h-[500px]"
                                >
                                    {/* Profile Section */}
                                    {activeSection === 'profile' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-8">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.profileInfo')}</h2>
                                                <Link to="/account/profile" className={`flex items-center gap-2 bg-gradient-to-r ${roleTheme.gradient} text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all`}>
                                                    <FaUser /> {t('settings.editProfile')}
                                                </Link>
                                            </div>

                                            <div className="bg-gradient-to-br from-stone-50 to-white dark:from-slate-700 dark:to-slate-800 p-8 rounded-2xl border border-stone-200 dark:border-slate-600 flex flex-col sm:flex-row items-center gap-8 mb-8">
                                                <div className="relative">
                                                    {user?.profile_image_url ? (
                                                        <img
                                                            src={user.profile_image_url.startsWith('/')
                                                                ? `http://localhost:3001${user.profile_image_url}`
                                                                : user.profile_image_url}
                                                            alt="Profile"
                                                            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-600 shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${roleTheme.gradient} flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white dark:border-slate-600`}>
                                                            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                                </div>

                                                <div className="text-center sm:text-start flex-1">
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                                        {user?.first_name} {user?.last_name}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mb-4">
                                                        <FaEnvelope className="text-gray-400" /> {user?.email}
                                                    </p>
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${roleTheme.bgLight} ${roleTheme.text} text-sm font-medium`}>
                                                        <span>{t('settings.role')}:</span> <span className="uppercase ms-1">{user?.role}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-4 bg-stone-50 dark:bg-slate-700/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('settings.phoneNumber')}</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{user?.phone || t('settings.notProvided')}</p>
                                                </div>
                                                <div className="p-4 bg-stone-50 dark:bg-slate-700/50 rounded-xl">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('settings.location')}</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{user?.location || t('settings.notProvided')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Section */}
                                    {activeSection === 'security' && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.securitySettings')}</h2>

                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-s-4 border-yellow-400 p-4 mb-8 rounded-e-lg">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <FaShieldAlt className="h-5 w-5 text-yellow-400" />
                                                    </div>
                                                    <div className="ms-3">
                                                        <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                                            {t('settings.securityTip')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {t('settings.currentPassword')}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="input-field"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {t('settings.newPassword')}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="input-field"
                                                        required
                                                        minLength={6}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {t('settings.confirmPassword')}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="input-field"
                                                        required
                                                    />
                                                </div>

                                                <button type="submit" disabled={saving} className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r ${roleTheme.gradient} hover:shadow-lg transition-all`}>
                                                    {saving ? 'Processing...' : t('settings.updatePassword')}
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {/* Notifications Section */}
                                    {activeSection === 'notifications' && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>

                                            <div className="space-y-4">
                                                {[
                                                    { id: 'notifications_email', title: t('settings.emailNotifications'), desc: t('settings.emailDesc'), icon: <FaEnvelope className="text-blue-500" /> },
                                                    { id: 'notifications_push', title: t('settings.pushNotifications'), desc: t('settings.pushDesc'), icon: <FaBell className="text-purple-500" /> },
                                                    { id: 'notifications_marketing', title: t('settings.marketingEmails'), desc: t('settings.marketingDesc'), icon: <FaGlobe className="text-green-500" /> },
                                                ].map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-5 bg-stone-50 dark:bg-slate-700/50 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                                                {item.icon}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleToggleSetting(item.id, !settings?.[item.id])}
                                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${settings?.[item.id] ? roleTheme.bg : 'bg-gray-300 dark:bg-gray-600'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${settings?.[item.id] ? 'translate-x-7' : 'translate-x-1'
                                                                    }`}
                                                            />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Appearance Section */}
                                    {activeSection === 'appearance' && (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.appearance')}</h2>

                                            <div className="grid gap-6">
                                                {/* Theme Selection */}
                                                <div className="p-6 bg-stone-50 dark:bg-slate-800/50 rounded-2xl">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                        <FaPalette className={roleTheme.text} /> {t('settings.themeMode')}
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => handleToggleSetting('theme', 'light')}
                                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${appTheme === 'light'
                                                                ? `border-current ${roleTheme.text} bg-white shadow-md`
                                                                : 'border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            <FaSun className={`text-3xl ${appTheme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
                                                            <span className="font-medium text-gray-900 dark:text-white">{t('settings.lightMode')}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleSetting('theme', 'dark')}
                                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${appTheme === 'dark'
                                                                ? `border-current ${roleTheme.text} bg-slate-800 shadow-md`
                                                                : 'border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            <FaMoon className={`text-3xl ${appTheme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
                                                            <span className="font-medium text-gray-700 dark:text-white">{t('settings.darkMode')}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Language Selection */}
                                                <div className="p-6 bg-stone-50 dark:bg-slate-800/50 rounded-2xl">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                        <FaGlobe className={roleTheme.text} /> {t('settings.language')}
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        {SUPPORTED_LANGUAGES.map(lang => (
                                                            <button
                                                                key={lang.code}
                                                                onClick={() => handleToggleSetting('language', lang.code)}
                                                                className={`p-3 rounded-lg border text-start transition-all flex items-center justify-between ${settings?.language === lang.code
                                                                    ? `border-current ${roleTheme.text} ${roleTheme.bgLight}`
                                                                    : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                <span className="dark:text-white">{lang.label}</span>
                                                                {settings?.language === lang.code && <FaCheck className={roleTheme.text} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Settings;
