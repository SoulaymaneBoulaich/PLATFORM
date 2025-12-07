import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">RealEstate</h3>
                        <p className="text-gray-400">
                            Your trusted partner in finding the perfect property.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/properties" className="text-gray-400 hover:text-white transition-colors">
                                    Browse Properties
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: info@realestate.com</li>
                            <li>Phone: (555) 123-4567</li>
                            <li>Address: 123 Main St, City, State</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} RealEstate. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
