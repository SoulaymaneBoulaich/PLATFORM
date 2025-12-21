import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useMagnetic from '../hooks/useMagnetic';
import useFloat from '../hooks/useFloat';

const MagneticNavItem = ({ children, to, className, active }) => {
    const itemRef = useRef(null);
    const contentRef = useRef(null);
    useMagnetic(contentRef);

    return (
        <Link
            to={to}
            ref={itemRef}
            className={`relative group px-4 py-2 flex items-center justify-center ${className}`}
        >
            <span ref={contentRef} className={`relative z-10 transition-colors duration-300 ${active ? 'font-bold' : ''}`}>
                {children}
            </span>
            {active && (
                <span className="absolute inset-0 bg-gray-100 dark:bg-white/10 rounded-full scale-90 group-hover:scale-100 transition-transform duration-300 -z-0" />
            )}
        </Link>
    );
};

const Navbar = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const logoRef = useFloat(0, 5, 4);

    // Role-based theme colors
    const getThemeColors = () => {
        if (!isAuthenticated || !user?.user_type) {
            return {
                primary: 'teal',
                gradient: 'from-teal-600 to-emerald-600',
                textGradient: 'text-gradient-seller', // Default to generic/seller like
                main: 'teal-600',
                mainDark: 'teal-400'
            };
        }

        switch (user.user_type) {
            case 'seller':
                return {
                    primary: 'purple',
                    gradient: 'from-purple-600 to-violet-600',
                    textGradient: 'text-gradient-seller',
                    main: 'purple-600',
                    mainDark: 'purple-400'
                };
            case 'agent':
                return {
                    primary: 'blue',
                    gradient: 'from-blue-600 to-indigo-600',
                    textGradient: 'text-gradient-agent',
                    main: 'blue-600',
                    mainDark: 'blue-400'
                };
            default: // buyer
                return {
                    primary: 'teal',
                    gradient: 'from-teal-600 to-emerald-600',
                    textGradient: 'text-gradient-buyer',
                    main: 'teal-600',
                    mainDark: 'teal-400'
                };
        }
    };

    const theme = getThemeColors();

    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // Determine scroll direction and threshold
        if (currentScrollY > 100) {
            setScrolled(true);
            if (currentScrollY > lastScrollY.current) {
                // Scrolling down -> Hide
                setVisible(false);
            } else {
                // Scrolling up -> Show
                setVisible(true);
            }
        } else {
            setScrolled(false);
            setVisible(true);
        }

        lastScrollY.current = currentScrollY;
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform ${visible ? 'translate-y-0' : '-translate-y-full'
        } ${scrolled ? 'py-2 mx-4 mt-4 glass-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-xl' : 'py-4 bg-transparent'}`;

    return (
        <nav className={navClasses}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo - Floating & Pulsing */}
                    <Link to="/" className="flex items-center gap-2 group" ref={logoRef}>
                        <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-neon transition-all duration-500`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className={`text-xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent hidden sm:block tracking-wide`}>
                            RealEstate
                        </span>
                    </Link>

                    {/* Center Navigation - Magnetic & Glass */}
                    <div className={`hidden md:flex items-center gap-2 px-6 py-2 rounded-full ${scrolled ? 'bg-transparent' : 'glass-card'}`}>
                        <MagneticNavItem
                            to="/"
                            active={location.pathname === '/'}
                            className={`text-gray-700 dark:text-gray-200 hover:text-${theme.main}`}
                        >
                            {t('navbar.home')}
                        </MagneticNavItem>
                        <MagneticNavItem
                            to="/properties"
                            active={location.pathname === '/properties'}
                            className={`text-gray-700 dark:text-gray-200 hover:text-${theme.main}`}
                        >
                            {t('navbar.properties')}
                        </MagneticNavItem>
                        <MagneticNavItem
                            to="/agents"
                            active={location.pathname === '/agents'}
                            className={`text-gray-700 dark:text-gray-200 hover:text-${theme.main}`}
                        >
                            {t('navbar.agents')}
                        </MagneticNavItem>
                        <MagneticNavItem
                            to="/contact"
                            active={location.pathname === '/contact'}
                            className={`text-gray-700 dark:text-gray-200 hover:text-${theme.main}`}
                        >
                            Contact
                        </MagneticNavItem>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Messages & Favorites */}
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        to="/messages"
                                        className={`p-2.5 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-all hover:scale-110`}
                                        title="Messages"
                                    >
                                        <svg className={`w-5 h-5 text-${theme.main} dark:text-${theme.mainDark}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </Link>
                                    <Link
                                        to="/favorites"
                                        className={`p-2.5 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-all hover:scale-110`}
                                        title="Favorites"
                                    >
                                        <svg className={`w-5 h-5 text-${theme.main} dark:text-${theme.mainDark}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </Link>
                                </div>

                                {/* Notifications */}
                                {user?.user_type === 'seller' && (
                                    <div className="relative hidden md:block">
                                        <button
                                            onClick={toggleNotifications}
                                            className={`p-2.5 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-all hover:scale-110 relative`}
                                        >
                                            <svg className={`w-5 h-5 text-${theme.main} dark:text-${theme.mainDark}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className={`absolute -top-1 -right-1 bg-${theme.main} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse`}>
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {showNotifications && (
                                            <>
                                                <div className="fixed inset-0" onClick={() => setShowNotifications(false)}></div>
                                                <div className="absolute right-0 mt-4 w-96 glass-card p-0 overflow-hidden z-50 animate-enter">
                                                    <div className="p-4 border-b border-gray-200/30">
                                                        <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                                    </div>
                                                    <div className="overflow-y-auto max-h-80">
                                                        {notifications.length > 0 ? (
                                                            notifications.map((n, i) => (
                                                                <div
                                                                    key={n.notification_id}
                                                                    className={`p-4 border-b border-gray-100/30 hover:bg-white/30 cursor-pointer animate-enter ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                                                                    style={{ animationDelay: `${i * 0.05}s` }}
                                                                    onClick={() => handleNotificationClick(n)}
                                                                >
                                                                    <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">{n.message}</p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {new Date(n.created_at).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 text-center text-gray-500">No notifications</div>
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
                                        className="flex items-center gap-3 p-1.5 pr-4 rounded-full glass-card hover:bg-white/80 transition-all hover:scale-105"
                                    >
                                        {user?.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url.startsWith('/') ? `http://localhost:3001${user.profile_image_url}` : user.profile_image_url}
                                                alt="Profile"
                                                className="w-9 h-9 rounded-full object-cover border-2 border-white"
                                            />
                                        ) : (
                                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                            </div>
                                        )}
                                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showUserMenu ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0" onClick={() => setShowUserMenu(false)}></div>
                                            <div className="absolute right-0 mt-4 w-72 glass-card py-3 z-50 animate-enter origin-top-right shadow-2xl border border-gray-100 dark:border-gray-700">
                                                <div className="px-5 py-4 border-b border-gray-100/20 mb-2 bg-gray-50/50 dark:bg-white/5">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                                                </div>
                                                <Link to="/account/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
                                                    {t('settings.profile')}
                                                </Link>
                                                <Link to="/account/settings" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
                                                    {t('navbar.settings')}
                                                </Link>
                                                <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
                                                    {t('navbar.dashboard')}
                                                </Link>
                                                <Link to="/transactions" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm">
                                                    Transactions
                                                </Link>
                                                <hr className="my-2 border-gray-100/20" />
                                                <button onClick={() => { logout(); setShowUserMenu(false); }} className="block w-full text-start px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
                                                    {t('navbar.logout')}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hidden md:block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors hover:scale-105">
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className={`btn-primary shadow-lg hover:shadow-xl hover:scale-105 text-sm`}>
                                    {t('auth.signUp')}
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {mobileMenuOpen && (
                    <div className="md:hidden glass-card mt-2 py-4 animate-enter">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
                            {t('navbar.home')}
                        </Link>
                        <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
                            {t('navbar.properties')}
                        </Link>
                        <Link to="/agents" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
                            {t('navbar.agents')}
                        </Link>
                        <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
                            Contact
                        </Link>
                        {/* ... other mobile links ... */}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
