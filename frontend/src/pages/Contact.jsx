import { useState } from 'react';
import ErrorMessage from '../components/ErrorMessage';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            setError('Please fill in all fields');
            return;
        }

        // Simulate submission
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setFormData({ name: '', email: '', message: '' });
            setSubmitted(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden pt-28 relative">
            {/* Aurora Background */}
            <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -right-10 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-enter">
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-purple-600 to-blue-600 dark:from-teal-400 dark:via-purple-400 dark:to-blue-400 mb-6 drop-shadow-sm">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light">
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 align-start">
                    {/* Contact Information */}
                    <div className="glass-card p-10 h-full animate-enter stagger-1 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold dark:text-white mb-8">Contact Information</h2>

                        <div className="space-y-8">
                            <div className="flex items-start group">
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mr-6 group-hover:scale-110 transition-transform shadow-sm">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white mb-1">Email</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">info@realestate.com</p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-6 group-hover:scale-110 transition-transform shadow-sm">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white mb-1">Phone</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">(555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-6 group-hover:scale-110 transition-transform shadow-sm">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white mb-1">Address</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">123 Main Street<br />City, State 12345</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass-card p-10 animate-enter stagger-2">
                        <h2 className="text-3xl font-bold dark:text-white mb-8">Send us a Message</h2>

                        {submitted && (
                            <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <div>
                                    <p className="font-bold">Message sent!</p>
                                    <p className="text-sm">We'll get back to you shortly.</p>
                                </div>
                            </div>
                        )}

                        <ErrorMessage message={error} />

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-5 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all backdrop-blur-sm dark:text-white resize-none"
                                    placeholder="How can we help you?"
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full btn-primary py-4 text-lg shadow-lg hover:shadow-teal-500/30 transition-all transform hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
