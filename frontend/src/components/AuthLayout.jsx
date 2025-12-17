import { motion } from 'framer-motion';
import { Home, MessageSquare, Star, TrendingUp } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    const features = [
        {
            icon: <Home className="w-5 h-5" />,
            text: 'Browse 10,000+ properties nationwide'
        },
        {
            icon: <MessageSquare className="w-5 h-5" />,
            text: 'Chat directly with agents and sellers'
        },
        {
            icon: <Star className="w-5 h-5" />,
            text: 'Save favorites and track your offers'
        },
        {
            icon: <TrendingUp className="w-5 h-5" />,
            text: 'Get real-time market insights'
        }
    ];

    const valueProp = [
        "Find your dream home with RealEstate",
        "List properties and reach thousands of buyers",
        "Connect with expert agents in your area"
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Panel - Hero Section */}
            <div className="relative w-full md:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-8 md:p-12">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-lg text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Welcome to
                            <span className="block text-secondary-400">RealEstate</span>
                        </h1>

                        {/* Animated value propositions */}
                        <div className="mb-8 space-y-3">
                            {valueProp.map((text, index) => (
                                <motion.p
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                    className="text-lg text-primary-100"
                                >
                                    {text}
                                </motion.p>
                            ))}
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 gap-4 mt-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3 text-primary-100"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <span className="text-sm">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gray-50 dark:bg-slate-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-10">
                        {title && (
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
