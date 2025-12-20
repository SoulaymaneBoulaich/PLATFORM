import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Role-based theme colors
    const getThemeColors = () => {
        if (!isAuthenticated || !user?.user_type) {
            return {
                primary: 'teal',
                gradient: 'from-teal-600 to-emerald-600',
                light: 'teal-50',
                dark: 'teal-900',
                main: 'teal-600',
                mainDark: 'teal-400'
            };
        }

        switch (user.user_type) {
            case 'seller':
                return {
                    primary: 'purple',
                    gradient: 'from-purple-600 to-violet-600',
                    light: 'purple-50',
                    dark: 'purple-900',
                    main: 'purple-600',
                    mainDark: 'purple-400'
                };
            case 'agent':
                return {
                    primary: 'blue',
                    gradient: 'from-blue-600 to-indigo-600',
                    light: 'blue-50',
                    dark: 'blue-900',
                    main: 'blue-600',
                    mainDark: 'blue-400'
                };
            default: // buyer
                return {
                    primary: 'teal',
                    gradient: 'from-teal-600 to-emerald-600',
                    light: 'teal-50',
                    dark: 'teal-900',
                    main: 'teal-600',
                    mainDark: 'teal-400'
                };
        }
    };

    const theme = getThemeColors();

    useEffect(() => {
        if (isAuthenticated && user?.user_type === 'seller') {
            fetchNotifications();
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/count');
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowUserMenu(false);
        if (!showNotifications) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            await api.patch(`/notifications/${notification.notification_id}/read`);
            fetchUnreadCount();
            setShowNotifications(false);
            navigate(`/properties/${notification.property_id}`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className={`text-xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent hidden sm:block`}>
                            RealEstate
                        </span>
                    </Link>

                    {/* Center Navigation - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className={`text-gray-700 dark:text-gray-300 ${location.pathname === '/' ? `text-${theme.main} dark:text-${theme.mainDark} font-semibold` : 'hover:text-gray-900 dark:hover:text-white'} font-medium transition-colors`}
                        >
                            {t('navbar.home')}
                        </Link>
                        <Link
                            to="/properties"
                            className={`text-gray-700 dark:text-gray-300 ${location.pathname === '/properties' ? `text-${theme.main} dark:text-${theme.mainDark} font-semibold` : 'hover:text-gray-900 dark:hover:text-white'} font-medium transition-colors`}
                        >
                            {t('navbar.properties')}
                        </Link>
                        <Link
                            to="/agents"
                            className={`text-gray-700 dark:text-gray-300 ${location.pathname === '/agents' ? `text-${theme.main} dark:text-${theme.mainDark} font-semibold` : 'hover:text-gray-900 dark:hover:text-white'} font-medium transition-colors`}
                        >
                            {t('navbar.agents')}
                        </Link>
                        <Link
                            to="/contact"
                            className={`text-gray-700 dark:text-gray-300 ${location.pathname === '/contact' ? `text-${theme.main} dark:text-${theme.mainDark} font-semibold` : 'hover:text-gray-900 dark:hover:text-white'} font-medium transition-colors`}
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Messages */}
                                <Link
                                    to="/messages"
                                    className={`hidden md:flex p-2.5 rounded-full hover:bg-${theme.light} dark:hover:bg-${theme.dark}/20 transition-colors`}
                                    title="Messages"
                                >
                                    <svg className={`w-5 h-5 text-${theme.main} dark:text-${theme.mainDark}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </Link>

                                {/* Favorites */}
                                <Link
                                    to="/favorites"
                                    className={`hidden md:flex p-2.5 rounded-full hover:bg-${theme.light} dark:hover:bg-${theme.dark}/20 transition-colors`}
                                    title="Favorites"
                                >
                                    <svg className={`w-5 h-5 text-${theme.main} dark:text-${theme.mainDark}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </Link>

                                {/* Notifications for Sellers */}
                                {user?.user_type === 'seller' && (
                                    <div className="relative hidden md:block">
                                        <button
                                            onClick={toggleNotifications}
                                            className={`p-2.5 rounded-full hover:bg-${theme.light} dark:hover:bg-${theme.dark}/20 transition-colors relative`}
                                        >
                                            <svg className={`w-5 h-5 text-${theme.main} dark:text-${theme.mainDark}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className={`absolute top-0 right-0 bg-${theme.main} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center`}>
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {showNotifications && (
                                            <>
                                                <div className="fixed inset-0" onClick={() => setShowNotifications(false)}></div>
                                                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 max-h-96 overflow-hidden">
                                                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                                                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                                    </div>
                                                    <div className="overflow-y-auto max-h-80">
                                                        {notifications.length > 0 ? (
                                                            notifications.map(n => (
                                                                <div
                                                                    key={n.notification_id}
                                                                    className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${!n.is_read ? 'bg-gray-50 dark:bg-slate-700/30' : ''}`}
                                                                    onClick={() => handleNotificationClick(n)}
                                                                >
                                                                    <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">{n.message}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {new Date(n.created_at).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 text-center text-gray-500">
                                                                <p className="text-sm">No notifications</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(!showUserMenu);
                                            setShowNotifications(false);
                                        }}
                                        className="flex items-center gap-3 p-2 pr-3 rounded-full border border-gray-300 dark:border-slate-700 hover:shadow-md transition-shadow"
                                    >
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                        {user?.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url.startsWith('/') ? `http://localhost:3001${user.profile_image_url}` : user.profile_image_url}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                            </div>
                                        )}
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0" onClick={() => setShowUserMenu(false)}></div>
                                            <div className="absolute end-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2">
                                                <Link to="/account/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-start">
                                                    {t('settings.profile')}
                                                </Link>
                                                <Link to="/account/settings" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-start">
                                                    {t('navbar.settings')}
                                                </Link>
                                                <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-start">
                                                    {t('navbar.dashboard')}
                                                </Link>
                                                <Link to="/transactions" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-start">
                                                    Transactions
                                                </Link>
                                                <hr className="my-2 border-gray-200 dark:border-slate-800" />
                                                <button onClick={() => { logout(); setShowUserMenu(false); }} className="block w-full text-start px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    {t('navbar.logout')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hidden md:block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className={`bg-gradient-to-r ${theme.gradient} text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all`}>
                                    {t('auth.signUp')}
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                            {t('navbar.home')}
                        </Link>
                        <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                            {t('navbar.properties')}
                        </Link>
                        <Link to="/agents" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                            {t('navbar.agents')}
                        </Link>
                        <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                            Contact
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                                    {t('navbar.dashboard')}
                                </Link>
                                <Link to="/transactions" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                                    Transactions
                                </Link>
                                <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                                    {t('navbar.messages')}
                                </Link>
                                <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                                    {t('dashboard.myFavorites')}
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
