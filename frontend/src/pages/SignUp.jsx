import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, ShoppingBag, Home, Briefcase, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import RoleCard from '../components/RoleCard';
import { motion, AnimatePresence } from 'framer-motion';

const SignUp = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Step 2
        user_type: '',
        phone: '',
        agency_name: '',
        license_id: '',
        preferred_city: '',
        budget_range: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateStep1 = () => {
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (!/\d/.test(formData.password)) {
            setError('Password must contain at least one number');
            return false;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            setError('Password must contain at least one special character');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleNextStep = () => {
        setError('');
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate step 2
        if (!formData.user_type) {
            setError('Please select your role');
            return;
        }

        // Agent-specific validation
        if (formData.user_type === 'agent') {
            if (!formData.agency_name || !formData.license_id) {
                setError('Agency name and license ID are required for agents');
                return;
            }
        }

        setLoading(true);

        try {
            const { confirmPassword, preferred_city, budget_range, ...registerData } = formData;

            // Add preferences for buyer
            if (formData.user_type === 'buyer' && (preferred_city || budget_range)) {
                registerData.preferences = {
                    preferred_city,
                    budget_range
                };
            }

            // Register user
            await api.post('/auth/register', registerData);

            // Auto-login after registration
            const loginResponse = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            login(loginResponse.data);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const roleOptions = [
        {
            value: 'buyer',
            icon: <ShoppingBag className="w-6 h-6" />,
            title: 'Buyer',
            description: 'Find your dream property',
        },
        {
            value: 'seller',
            icon: <Home className="w-6 h-6" />,
            title: 'Seller',
            description: 'List and sell properties',
        },
        {
            value: 'agent',
            icon: <Briefcase className="w-6 h-6" />,
            title: 'Agent',
            description: 'Manage listings and clients',
        },
    ];

    return (
        <AuthLayout
            title={step === 1 ? 'Create your account' : 'Tell us more'}
            subtitle={step === 1 ? 'Join RealEstate to get started' : 'Help us personalize your experience'}
        >
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step {step} of 2</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{step === 1 ? 'Account basics' : 'Profile details'}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-600"
                        initial={{ width: '0%' }}
                        animate={{ width: step === 1 ? '50%' : '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-300"
                    >
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Name Fields */}
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
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field w-full pr-10"
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <PasswordStrengthMeter password={formData.password} />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input-field w-full pr-10"
                                        placeholder="Re-enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn-primary w-full"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                        >
                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    I am a... <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {roleOptions.map((role) => (
                                        <RoleCard
                                            key={role.value}
                                            icon={role.icon}
                                            title={role.title}
                                            description={role.description}
                                            selected={formData.user_type === role.value}
                                            onClick={() => setFormData({ ...formData, user_type: role.value })}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Fields Based on Role */}
                            {formData.user_type && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    {/* Phone (for seller and agent) */}
                                    {(formData.user_type === 'seller' || formData.user_type === 'agent') && (
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Phone Number <span className="text-red-500">*</span>
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
                                    )}

                                    {/* Agent-specific fields */}
                                    {formData.user_type === 'agent' && (
                                        <>
                                            <div>
                                                <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Agency Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="agency_name"
                                                    name="agency_name"
                                                    type="text"
                                                    required
                                                    value={formData.agency_name}
                                                    onChange={handleChange}
                                                    className="input-field w-full"
                                                    placeholder="Your Real Estate Agency"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="license_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    License ID <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="license_id"
                                                    name="license_id"
                                                    type="text"
                                                    required
                                                    value={formData.license_id}
                                                    onChange={handleChange}
                                                    className="input-field w-full"
                                                    placeholder="LIC-123456"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Seller-specific fields */}
                                    {formData.user_type === 'seller' && (
                                        <div>
                                            <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Agency Name <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                                            </label>
                                            <input
                                                id="agency_name"
                                                name="agency_name"
                                                type="text"
                                                value={formData.agency_name}
                                                onChange={handleChange}
                                                className="input-field w-full"
                                                placeholder="Your Real Estate Agency"
                                            />
                                        </div>
                                    )}

                                    {/* Buyer-specific fields */}
                                    {formData.user_type === 'buyer' && (
                                        <>
                                            <div>
                                                <label htmlFor="preferred_city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Preferred City <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                                                </label>
                                                <input
                                                    id="preferred_city"
                                                    name="preferred_city"
                                                    type="text"
                                                    value={formData.preferred_city}
                                                    onChange={handleChange}
                                                    className="input-field w-full"
                                                    placeholder="e.g., New York"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Budget Range <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                                                </label>
                                                <select
                                                    id="budget_range"
                                                    name="budget_range"
                                                    value={formData.budget_range}
                                                    onChange={handleChange}
                                                    className="input-field w-full"
                                                >
                                                    <option value="">Select budget range</option>
                                                    <option value="0-200000">Up to $200,000</option>
                                                    <option value="200000-400000">$200,000 - $400,000</option>
                                                    <option value="400000-600000">$400,000 - $600,000</option>
                                                    <option value="600000-1000000">$600,000 - $1,000,000</option>
                                                    <option value="1000000+">$1,000,000+</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.user_type}
                                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {loading ? 'Creating account...' : 'Create account'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                    onClick={() => navigate('/login')}
                    className="font-medium text-primary-600 hover:text-primary-500"
                >
                    Sign in
                </button>
            </div>
        </AuthLayout>
    );
};

export default SignUp;
