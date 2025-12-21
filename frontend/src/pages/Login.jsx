import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    // Load remembered email on mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            // Handle remember me
            if (formData.rememberMe) {
                localStorage.setItem('rememberedEmail', formData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Login and let AuthContext handle redirect
            login(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to continue to your dashboard">
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-8 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
                <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'login'
                        ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Log In
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'signup'
                        ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <ErrorMessage message={error} />

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Enter your email address"
                    />
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-teal-600 hover:text-teal-500"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field w-full pr-10"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                    <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 text-teal-600 border-gray-300 dark:border-slate-600 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
                    Create one now
                </Link>
            </div>
        </AuthLayout >
    );
};

export default Login;
