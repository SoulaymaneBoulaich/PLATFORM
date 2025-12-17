import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Offers = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
                    <div className="mb-6">
                        <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Offers Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This feature is currently under development. Soon you'll be able to view and manage offers on your properties here.
                    </p>
                    <Link to="/dashboard" className="btn-primary inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Offers;
