import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { getLanguageConfig } from '../i18n/languages';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for existing auth on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Load user language
            loadUserLanguage();
        }
        setLoading(false);
    }, []);

    const loadUserLanguage = async () => {
        try {
            const res = await api.get('/me/settings');
            const userLang = res.data.language || 'en';

            i18n.changeLanguage(userLang);
            document.documentElement.lang = userLang;

            const langConfig = getLanguageConfig(userLang);
            document.documentElement.dir = langConfig.dir;
        } catch (err) {
            console.error('Failed to load user language:', err);
        }
    };

    const login = (apiResponse) => {
        const { token: newToken, user: newUser } = apiResponse;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);

        // Load user's saved language in background (non-blocking)
        loadUserLanguage().catch(err => console.error('Language load failed:', err));

        navigate('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);

        navigate('/login');
    };

    const updateUser = (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value = {
        user,
        token,
        login,
        logout,
        updateUser,
        setUser: updateUser,
        loading,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
