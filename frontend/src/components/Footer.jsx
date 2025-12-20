import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold">RealEstate</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Your trusted partner in finding the perfect property. Making real estate dreams a reality.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3 pt-2">
                            <a href="#" className="w-10 h-10 bg-slate-700/50 hover:bg-teal-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1" aria-label="Facebook">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-700/50 hover:bg-teal-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1" aria-label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-700/50 hover:bg-teal-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path fill="white" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-700/50 hover:bg-teal-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1" aria-label="LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/properties" className="text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"></span>
                                    Browse Properties
                                </Link>
                            </li>
                            <li>
                                <Link to="/agents" className="text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"></span>
                                    Find an Agent
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"></span>
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-gray-400 hover:text-teal-400 transition-colors duration-200 flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"></span>
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white">Contact Info</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>info@realestate.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>(555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>123 Main Street<br />City, State 12345</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white">Newsletter</h4>
                        <p className="text-gray-400 mb-4 text-sm">
                            Subscribe to get the latest properties and updates.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200"
                            />
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-700 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
                        <p>&copy; {currentYear} RealEstate. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-teal-400 transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-teal-400 transition-colors duration-200">
                                Terms of Service
                            </Link>
                            <Link to="/cookies" className="hover:text-teal-400 transition-colors duration-200">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
