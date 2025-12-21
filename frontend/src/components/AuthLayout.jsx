import { Link } from 'react-router-dom';
import { Home, MessageSquare, Star, TrendingUp } from 'lucide-react';
import useFloat from '../hooks/useFloat';

const AuthLayout = ({ children, title, subtitle }) => {
    const floatRef1 = useFloat(0, 10, 5);
    const floatRef2 = useFloat(2, 15, 7);

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

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Left Panel - Hero Section */}
            <div className="relative w-full md:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-800 dark:from-slate-900 dark:to-teal-900 flex items-center justify-center p-8 md:p-12 overflow-hidden">
                {/* Floating Orbs */}
                <div
                    ref={floatRef1}
                    className="absolute top-20 left-[10%] w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"
                />
                <div
                    ref={floatRef2}
                    className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-400/20 rounded-full blur-3xl mix-blend-overlay"
                />

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />

                {/* Content */}
                <div className="relative z-10 max-w-lg text-white">
                    <div className="animate-enter">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 glass-card px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="text-sm font-medium">Back to Home</span>
                        </Link>

                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
                            Welcome to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-200">RealEstate</span>
                        </h1>

                        <p className="text-xl text-teal-100 mb-12 font-light leading-relaxed">
                            Join thousands of users finding their dream homes and connecting with top agents today.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 text-white/90 animate-enter"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white">
                                        {feature.icon}
                                    </div>
                                    <span className="text-lg font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
                {/* Decorative Background for Form Side */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md animate-enter stagger-1 relative z-10">
                    <div className="glass-card p-8 md:p-10 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl">
                        {title && (
                            <div className="mb-8 text-center">
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
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
