import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import AuthLayout from '../components/AuthLayout';
import { Loader2 } from 'lucide-react';

const Register = () => {
    const [activeTab, setActiveTab] = useState('signup');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone: '',
        user_type: 'buyer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await api.post('/auth/register', registerData);
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join our community today">
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-8 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'login'
                        ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Log In
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${activeTab === 'signup'
                        ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Sign Up
                </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <ErrorMessage message={error} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                        </label>
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            className="input-field w-full"
                            placeholder="John"
                        />
                    </div>

                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            className="input-field w-full"
                            placeholder="Doe"
                        />
                    </div>
                </div>

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
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>

                <div>
                    <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.user_type === 'buyer'
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="user_type"
                                value="buyer"
                                checked={formData.user_type === 'buyer'}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="font-bold">Buyer</span>
                            <span className="text-xs text-center mt-1 opacity-75">Looking for property</span>
                        </label>

                        <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.user_type === 'seller'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="user_type"
                                value="seller"
                                checked={formData.user_type === 'seller'}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="font-bold">Agent / Seller</span>
                            <span className="text-xs text-center mt-1 opacity-75">Listing properties</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field w-full"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input-field w-full"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'Creating account...' : 'Create account'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                By signing up, you agree to our{' '}
                <a href="#" className="font-medium text-teal-600 hover:text-teal-500">Terms</a>
                {' '}and{' '}
                <a href="#" className="font-medium text-teal-600 hover:text-teal-500">Privacy Policy</a>
            </div>
        </AuthLayout>
    );
};

export default Register;
