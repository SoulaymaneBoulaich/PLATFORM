import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Fetch unread notification count for sellers
    useEffect(() => {
        if (isAuthenticated && user?.user_type === 'seller') {
            fetchUnreadCount();

            // Poll every 30 seconds for new notifications
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/count');
            setUnreadCount(res.data.unread_count);
        } catch (err) {
            console.error('Failed to fetch notification count:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        try {
            await api.patch(`/notifications/${notification.notification_id}/read`);
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }

        // Navigate to messages page with context
        navigate(`/messages?propertyId=${notification.property_id}&userId=${notification.user_from}`);
        setShowNotifications(false);
    };

    const toggleNotifications = () => {
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo with high contrast */}
                    <Link to="/" className="flex items-center gap-3 group animate-slideIn">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white hidden sm:block tracking-tight animate-fadeIn">
                            RealEstate
                        </span>
                    </Link>

                    {/* Desktop Navigation - White text for contrast */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link to="/" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                            Home
                        </Link>
                        <Link to="/properties" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                            Properties
                        </Link>
                        <Link to="/agents" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                            Agents
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {/* Messages/Chat Icon - Visible to ALL authenticated users */}
                                <Link to="/messages" className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200 ms-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </Link>

                                {user?.user_type === 'seller' && (
                                    <Link to="/dashboard" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                                        {t('navbar.dashboard')}
                                    </Link>
                                )}

                                {/* Favorites Icon */}
                                <Link to="/favorites" className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200" title="My Favorites">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </Link>

                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={toggleNotifications}
                                        className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-subtle">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {showNotifications && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                                            <div className="absolute end-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-20 max-h-96 overflow-hidden">
                                                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                                </div>
                                                <div className="overflow-y-auto max-h-80">
                                                    {notifications.length > 0 ? (
                                                        notifications.map(n => (
                                                            <div
                                                                key={n.notification_id}
                                                                className={`p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                                onClick={() => handleNotificationClick(n)}
                                                            >
                                                                <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">{n.message}</p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                    From: {n.first_name} {n.last_name}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {new Date(n.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                            </svg>
                                                            <p className="text-sm">No notifications yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg ms-2 transition-all duration-200">
                                    {t('navbar.getStarted')}
                                </Link>
                            </>
                        )}

                        {/* User Avatar/Menu */}
                        {isAuthenticated && (
                            <div className="relative ms-3">
                                <button
                                    onClick={() => {
                                        setShowUserMenu(!showUserMenu);
                                        setShowNotifications(false);
                                    }}
                                    className="flex items-center gap-2 hover:bg-white/20 rounded-lg p-1 pe-3 transition-colors"
                                >
                                    {user?.profile_image_url ? (
                                        <img
                                            src={user.profile_image_url.startsWith('/')
                                                ? `http://localhost:3001${user.profile_image_url}`
                                                : user.profile_image_url}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white text-primary-600 flex items-center justify-center text-sm font-bold border-2 border-white">
                                            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                                        <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                                            <Link
                                                to="/account/profile"
                                                onClick={() => setShowUserMenu(false)}
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                👤 {t('navbar.editProfile')}
                                            </Link>
                                            <Link
                                                to="/account/settings"
                                                onClick={() => setShowUserMenu(false)}
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                ⚙️ {t('navbar.settings')}
                                            </Link>
                                            <Link
                                                to="/favorites"
                                                onClick={() => setShowUserMenu(false)}
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                ❤️ {t('dashboard.myFavorites')}
                                            </Link>
                                            <hr className="my-2 border-gray-200 dark:border-slate-700" />
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    logout();
                                                }}
                                                className="block w-full text-start px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                🚪 {t('navbar.logout')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {
                    mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-white/20 space-y-2">
                            <Link to="/" onClick={closeMobileMenu} className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                Home
                            </Link>
                            <Link to="/properties" onClick={closeMobileMenu} className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                Properties
                            </Link>
                            <Link to="/agents" onClick={closeMobileMenu} className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                Agents
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    {/* Messages - Visible to ALL authenticated users */}
                                    <Link to="/messages" onClick={closeMobileMenu} className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                        Messages
                                    </Link>

                                    {user?.user_type === 'seller' && (
                                        <Link to="/dashboard" onClick={closeMobileMenu} className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                            Dashboard
                                        </Link>
                                    )}
                                    <button onClick={() => { logout(); closeMobileMenu(); }} className="w-full text-start px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={closeMobileMenu} className="block px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors font-medium">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={closeMobileMenu} className="block px-4 py-2 bg-white text-primary-600 hover:bg-gray-100 rounded-lg transition-colors text-center font-semibold">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    )
                }
            </div >
        </nav >
    );
};

export default Navbar;
