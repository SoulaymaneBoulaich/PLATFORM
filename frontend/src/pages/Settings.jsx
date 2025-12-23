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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-12 relative overflow-hidden transition-colors duration-300">
                {/* Aurora Background */}
                <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute top-0 -right-10 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center sm:text-left animate-enter">
                        <h1 className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${roleTheme.gradient} drop-shadow-sm mb-2`}>
                            {t('settings.title')}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 font-light">
                            {t('settings.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-1/4 animate-enter stagger-1">
                            <motion.div
                                className="glass-card p-4 sticky top-32 overflow-hidden"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <nav className="space-y-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeSection === section.id
                                                ? `bg-gradient-to-r ${roleTheme.bgLight} text-gray-900 dark:text-white shadow-md`
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:pl-6'
                                                }`}
                                        >
                                            {activeSection === section.id && (
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${roleTheme.gradient}`}></div>
                                            )}
                                            <span className={`text-xl me-4 relative z-10 ${activeSection === section.id ? roleTheme.text : `text-gray-400 ${roleTheme.groupHoverText}`}`}>
                                                {section.icon}
                                            </span>
                                            <div className="text-start relative z-10">
                                                <span className="block font-bold">{section.name}</span>
                                                <span className="text-xs opacity-70 hidden sm:block font-medium">{section.description}</span>
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
                        <div className="lg:w-3/4 animate-enter stagger-2">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="glass-card p-8 min-h-[500px]"
                                >
                                    {/* Profile Section */}
                                    {activeSection === 'profile' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-slate-700/50 pb-4">
                                                <h2 className="text-2xl font-bold dark:text-white">{t('settings.profileInfo')}</h2>
                                                <Link to="/account/profile" className={`flex items-center gap-2 btn-primary py-2 px-6 text-sm !shadow-md hover:!shadow-lg !transform-none hover:!scale-105`}>
                                                    <FaUser /> {t('settings.editProfile')}
                                                </Link>
                                            </div>

                                            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-8 mb-8 shadow-inner">
                                                <div className="relative group">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-75 blur transition duration-500"></div>
                                                    <div className="relative">
                                                        {user?.profile_image_url ? (
                                                            <img
                                                                src={user.profile_image_url.startsWith('http')
                                                                    ? user.profile_image_url
                                                                    : `http://localhost:3001${user.profile_image_url.startsWith('/') ? '' : '/'}${user.profile_image_url}`}
                                                                alt="Profile"
                                                                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                                                            />
                                                        ) : (
                                                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${roleTheme.gradient} flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white dark:border-slate-800`}>
                                                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
                                                    </div>
                                                </div>

                                                <div className="text-center sm:text-start flex-1">
                                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                                                        {user?.first_name} {user?.last_name}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mb-4 font-medium">
                                                        <FaEnvelope className="text-gray-400" /> {user?.email}
                                                    </p>
                                                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${roleTheme.bgLight} ${roleTheme.text} text-sm font-bold shadow-sm border ${roleTheme.border}`}>
                                                        <span className="opacity-70 font-normal mr-1">{t('settings.role')}:</span> <span className="uppercase tracking-wider">{user?.user_type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-2">{t('settings.phoneNumber')}</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <FaMobileAlt className="text-gray-400" />
                                                        {user?.phone || t('settings.notProvided')}
                                                    </p>
                                                </div>
                                                <div className="p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-2">{t('settings.location')}</p>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <FaGlobe className="text-gray-400" />
                                                        {user?.location || t('settings.notProvided')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Section */}
                                    {activeSection === 'security' && (
                                        <div>
                                            <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700/50 pb-4">{t('settings.securitySettings')}</h2>

                                            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mb-8 rounded-r-xl shadow-sm">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <FaShieldAlt className="h-5 w-5 text-amber-500" />
                                                    </div>
                                                    <div className="ms-3">
                                                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                                                            {t('settings.securityTip')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
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
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
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
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
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

                                                <button type="submit" disabled={saving} className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${roleTheme.gradient} hover:shadow-lg transition-all transform hover:-translate-y-0.5`}>
                                                    {saving ? 'Processing...' : t('settings.updatePassword')}
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {/* Notifications Section */}
                                    {activeSection === 'notifications' && (
                                        <div>
                                            <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700/50 pb-4">Notification Preferences</h2>

                                            <div className="space-y-4">
                                                {[
                                                    { id: 'notifications_email', title: t('settings.emailNotifications'), desc: t('settings.emailDesc'), icon: <FaEnvelope className="text-blue-500" /> },
                                                    { id: 'notifications_push', title: t('settings.pushNotifications'), desc: t('settings.pushDesc'), icon: <FaBell className="text-purple-500" /> },
                                                    { id: 'notifications_marketing', title: t('settings.marketingEmails'), desc: t('settings.marketingDesc'), icon: <FaGlobe className="text-green-500" /> },
                                                ].map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-700/50">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-md">
                                                                {item.icon}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleToggleSetting(item.id, !settings?.[item.id])}
                                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${settings?.[item.id] ? `bg-gradient-to-r ${roleTheme.gradient}` : 'bg-gray-300 dark:bg-gray-600'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${settings?.[item.id] ? 'translate-x-7' : 'translate-x-1'
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
                                            <h2 className="text-2xl font-bold dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700/50 pb-4">{t('settings.appearance')}</h2>

                                            <div className="grid gap-6">
                                                {/* Theme Selection */}
                                                <div className="p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                                        <FaPalette className={roleTheme.text} /> {t('settings.themeMode')}
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => handleToggleSetting('theme', 'light')}
                                                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${appTheme === 'light'
                                                                ? `border-sky-500 bg-sky-50 dark:bg-slate-800 shadow-lg scale-[1.02]`
                                                                : 'border-transparent bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'
                                                                }`}
                                                        >
                                                            <div className="p-4 rounded-full bg-yellow-100 text-yellow-500 mb-1">
                                                                <FaSun className="text-3xl" />
                                                            </div>
                                                            <span className="font-bold text-gray-900 dark:text-white">{t('settings.lightMode')}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleSetting('theme', 'dark')}
                                                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${appTheme === 'dark'
                                                                ? `border-purple-500 bg-purple-900/10 dark:bg-slate-800 shadow-lg scale-[1.02]`
                                                                : 'border-transparent bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'
                                                                }`}
                                                        >
                                                            <div className="p-4 rounded-full bg-purple-100 text-purple-500 mb-1">
                                                                <FaMoon className="text-3xl" />
                                                            </div>
                                                            <span className="font-bold text-gray-700 dark:text-white">{t('settings.darkMode')}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Language Selection */}
                                                <div className="p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                                        <FaGlobe className={roleTheme.text} /> {t('settings.language')}
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        {SUPPORTED_LANGUAGES.map(lang => (
                                                            <button
                                                                key={lang.code}
                                                                onClick={() => handleToggleSetting('language', lang.code)}
                                                                className={`p-4 rounded-xl border-2 text-start transition-all flex items-center justify-between ${settings?.language === lang.code
                                                                    ? `border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-md`
                                                                    : 'border-transparent bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600'
                                                                    }`}
                                                            >
                                                                <span className="font-bold dark:text-white">{lang.label}</span>
                                                                {settings?.language === lang.code && <FaCheck className="text-teal-500" />}
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
