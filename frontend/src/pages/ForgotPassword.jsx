import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <AuthLayout title="Check your email" subtitle="We've sent you a password reset link">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <p className="text-gray-700 mb-6">
                        If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                    </p>
                    <p className="text-sm text-gray-600 mb-8">
                        Check your email inbox and follow the instructions to reset your password.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block btn-primary"
                    >
                        Back to login
                    </Link>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Forgot password?" subtitle="Enter your email to receive a reset link">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
                    >
                        {error}
                    </motion.div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field w-full pl-10"
                            placeholder="you@example.com"
                            autoFocus
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? 'Sending...' : 'Send reset link'}
                </button>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                        Back to login
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;
