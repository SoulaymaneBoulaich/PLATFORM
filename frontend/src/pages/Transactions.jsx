import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Transactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [properties, setProperties] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        property_id: '',
        seller_id: '',
        amount: '',
        type: 'payment',
        status: 'pending'
    });

    useEffect(() => {
        fetchTransactions();
        fetchProperties();
        fetchSellers();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/transactions');
            setTransactions(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load transactions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties');
            setProperties(response.data);
        } catch (err) {
            console.error('Failed to load properties:', err);
        }
    };

    const fetchSellers = async () => {
        try {
            const response = await api.get('/agents');
            setSellers(response.data);
        } catch (err) {
            console.error('Failed to load sellers:', err);
        }
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/transactions', formData);
            setShowForm(false);
            setFormData({
                property_id: '',
                seller_id: '',
                amount: '',
                type: 'payment',
                status: 'pending'
            });
            fetchTransactions();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create transaction');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transactions</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage property transactions and payments</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn-primary"
                        >
                            {showForm ? 'Cancel' : '+ Add Transaction'}
                        </button>
                    </div>
                </div>

                <ErrorMessage message={error} />

                {/* Transaction Form */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Transaction</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Property
                                    </label>
                                    <select
                                        name="property_id"
                                        value={formData.property_id}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Property</option>
                                        {properties.map(prop => (
                                            <option key={prop.property_id} value={prop.property_id}>
                                                {prop.title} - {prop.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Seller
                                    </label>
                                    <select
                                        name="seller_id"
                                        value={formData.seller_id}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Seller</option>
                                        {sellers.map(seller => (
                                            <option key={seller.user_id} value={seller.user_id}>
                                                {seller.first_name} {seller.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleFormChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="payment">Payment</option>
                                        <option value="commission">Commission</option>
                                        <option value="deposit">Deposit</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary">
                                Create Transaction
                            </button>
                        </form>
                    </div>
                )}

                {/* Transactions List */}
                {loading ? (
                    <Loader />
                ) : transactions.length > 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Seller
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.transaction_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {transaction.property_title || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.property_city}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {transaction.seller_first_name} {transaction.seller_last_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    ${parseFloat(transaction.amount).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-white capitalize">
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                        <p className="text-gray-600 dark:text-gray-400">No transactions yet.</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Click "Add Transaction" to create your first transaction.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
